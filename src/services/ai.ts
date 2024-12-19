import { ModelRequestOptions, ModelResponse, getModelAdapter } from './ai/models';
import { promptManager } from './ai/prompts/manager';
import { contextManager } from './ai/context';
import { PromptContext } from './ai/prompts/types';
import { useVersionStore } from '@/store';

export interface AIContext {
  content: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

export interface AIRequestOptions extends ModelRequestOptions {
  context?: AIContext;
  signal?: AbortSignal;
  stream?: boolean;
  onPartialResponse?: (partial: ModelResponse) => void;
}

let currentController: AbortController | null = null;

/**
 * 处理AI请求错误
 */
function handleAIError(error: any): ModelResponse {
  console.error('AI请求失败:', error);

  // 如果是 ModelResponse 类型的错误，直接返回
  if (error && typeof error === 'object' && 'text' in error && 'error' in error) {
    return error as ModelResponse;
  }

  // 网络错误
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.name === 'NetworkError') {
      return {
        text: '',
        error: '网络连接失败，请检查您的网络连接并重试。',
      };
    }
    
    if (error.name === 'AbortError') {
      return {
        text: '',
        error: '请求已取消。',
      };
    }

    // API相关错误
    if (error.message.includes('401')) {
      return {
        text: '',
        error: 'API密钥无效或已过期，请检查您的API密钥设置。',
      };
    }

    if (error.message.includes('429')) {
      return {
        text: '',
        error: '已达到API请求限制，请稍后重试。',
      };
    }

    if (error.message.includes('insufficient_quota')) {
      return {
        text: '',
        error: 'API配额不足，请检查您的账户余额。',
      };
    }

    // 如果错误消息看起来是用户友好的，直接使用它
    if (error.message.startsWith('请') || error.message.includes('失败') || error.message.includes('错误')) {
      return {
        text: '',
        error: error.message,
      };
    }
  }

  // 默认错误
  return {
    text: '',
    error: '处理请求时发生错误，请重试。',
  };
}

export function stopAICompletion() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

export async function getAICompletion(
  options: AIRequestOptions
): Promise<ModelResponse> {
  try {
    // 如果有正在进行的请求，先中止它
    if (currentController) {
      currentController.abort();
    }

    // 创建新的中断控制器
    currentController = new AbortController();
    
    const adapter = getModelAdapter(options.model);
    if (!adapter) {
      return {
        text: '',
        error: `不支持的模型: ${options.model}`,
      };
    }

    // 获取 AI 配置
    const { aiConfig } = useVersionStore.getState();

    // 根据上下文构建完整提示词
    let fullPrompt = options.prompt;
    if (options.context) {
      const context: PromptContext = {
        content: options.context.content,
        selection: options.context.selection,
      };
      fullPrompt = promptManager.generatePrompt('context', context, { format: 'text' });
    }

    // 添加用户消息到历史
    contextManager.addMessage(options.model, 'user', fullPrompt);

    const response = await adapter.getCompletion({
      ...options,
      prompt: fullPrompt,
      signal: currentController.signal,
    }, aiConfig);

    // 如果请求成功，添加助手回复到历史
    if (!response.error) {
      contextManager.addMessage(options.model, 'assistant', response.text);
    }

    return response;
  } catch (error) {
    return handleAIError(error);
  } finally {
    currentController = null;
  }
}

// 导出提示词管理器实例
export const { generatePrompt } = promptManager;
