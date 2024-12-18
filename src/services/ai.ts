import axios from 'axios';
import { useVersionStore } from '@/store';
import {
  ModelRequestOptions,
  ModelResponse,
  StreamResponse,
  getModelAdapter,
} from './ai/models';
import { promptManager } from './ai/prompts';
import { contextManager } from './ai/context';
import { handleAIError } from './ai/errors';
import { retry } from '@/utils/retry';

const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

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
  retryOptions?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  };
}

let currentController: AbortController | null = null;

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
    // 如果有正在进行的请求，先中断它
    if (currentController) {
      currentController.abort();
    }
    
    // 创建新的中断控制器
    currentController = new AbortController();
    
    const store = useVersionStore.getState();
    const { aiConfig } = store;

    const adapter = getModelAdapter(aiConfig.model);
    if (!adapter) {
      return {
        text: '',
        error: `不支持的模型: ${aiConfig.model}`,
      };
    }

    if (!aiConfig.apiKey) {
      return {
        text: '',
        error: `请配置 ${adapter.displayName} API 密钥`,
      };
    }

    // 获取当前会话的消息历史
    const messages = contextManager.getMessages(aiConfig.model);

    // 根据上下文构建完整提示词
    let fullPrompt = options.prompt;
    if (options.context) {
      if (options.context.selection) {
        fullPrompt = `以下是当前选中的文本：\n${options.context.selection.text}\n\n${options.prompt}`;
      } else {
        fullPrompt = `以下是当前文档内容：\n${options.context.content}\n\n${options.prompt}`;
      }
    }

    // 添加用户消息到历史
    contextManager.addMessage(aiConfig.model, 'user', fullPrompt);

    const response = await retry(
      () => adapter.getCompletion(
        {
          ...options,
          prompt: fullPrompt,
          messages,
          signal: currentController!.signal,
        },
        aiConfig
      ),
      options.retryOptions
    );

    // 如果请求成功，添加助手回复到历史
    if (!response.error) {
      contextManager.addMessage(aiConfig.model, 'assistant', response.text);
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

// 为了保持向后兼容，继续导出 AI_PROMPTS
export const AI_PROMPTS = {
  CONTINUE: '继续写作',
  POLISH: '润色文本',
  EXPLAIN: '解释内容',
  OUTLINE: '生成大纲',
  SUMMARIZE: '总结内容',
};
