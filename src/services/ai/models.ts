import { AIConfig } from '@/types';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelResponse {
  text: string;
  error?: string;
}

export interface StreamResponse extends ModelResponse {
  isPartial: boolean;
}

export interface ModelRequestOptions {
  model: string;
  prompt: string;
  messages?: Message[];
  stream?: boolean;
  onPartialResponse?: (response: StreamResponse) => void;
  signal?: AbortSignal;
}

export interface ModelAdapter {
  name: string;
  displayName: string;
  description: string;
  maxTokens: number;
  defaultTemperature: number;
  supportedFeatures: {
    streaming: boolean;
    contextWindow: boolean;
    functionCalling: boolean;
  };
  getCompletion(options: ModelRequestOptions, config: AIConfig): Promise<ModelResponse>;
}

// 基础模型适配器
export abstract class BaseModelAdapter implements ModelAdapter {
  abstract name: string;
  abstract displayName: string;
  abstract description: string;
  abstract maxTokens: number;
  defaultTemperature = 0.7;
  abstract supportedFeatures: {
    streaming: boolean;
    contextWindow: boolean;
    functionCalling: boolean;
  };

  protected abstract makeRequest(
    options: ModelRequestOptions,
    config: AIConfig,
    isStream: boolean
  ): Promise<any>;

  protected async handleStreamResponse(
    response: Response,
    options: ModelRequestOptions
  ): Promise<ModelResponse> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法创建流式读取器');
    }

    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一个不完整的行

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
        
        const data = trimmedLine.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = this.extractStreamContent(parsed);
          if (content) {
            // 处理特殊字符和换行
            const formattedContent = content
              .replace(/\\n/g, '\n')  // 替换转义的换行符
              .replace(/\n\n+/g, '\n\n'); // 合并多个连续换行
            
            accumulatedText += formattedContent;
            options.onPartialResponse?.({
              text: accumulatedText,
              isPartial: true,
            });
          }
        } catch (e) {
          console.error('解析流式响应失败:', e, data);
        }
      }
    }

    // 处理最后可能剩余的数据
    if (buffer.trim()) {
      try {
        const data = buffer.trim().replace(/^data: /, '');
        if (data !== '[DONE]') {
          const parsed = JSON.parse(data);
          const content = this.extractStreamContent(parsed);
          if (content) {
            const formattedContent = content
              .replace(/\\n/g, '\n')
              .replace(/\n\n+/g, '\n\n');
            accumulatedText += formattedContent;
          }
        }
      } catch (e) {
        console.error('解析最后的数据失败:', e);
      }
    }

    return { text: accumulatedText };
  }

  protected abstract extractStreamContent(parsed: any): string;

  async getCompletion(
    options: ModelRequestOptions,
    config: AIConfig
  ): Promise<ModelResponse> {
    try {
      if (options.stream && options.onPartialResponse) {
        const response = await this.makeRequest(options, config, true);
        return await this.handleStreamResponse(response, options);
      } else {
        const response = await this.makeRequest(options, config, false);
        return {
          text: this.extractContent(response),
        };
      }
    } catch (error) {
      console.error('AI请求失败:', error);
      
      // 处理常见的错误类型
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            text: '',
            error: '网络连接失败，请检查您的网络连接并重试。',
          };
        }
        
        if (error.message.includes('aborted')) {
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

        return {
          text: '',
          error: error.message,
        };
      }

      return {
        text: '',
        error: '发生未知错误，请重试。',
      };
    }
  }

  protected abstract extractContent(response: any): string;
}

// DeepSeek 模型适配器
export class DeepSeekAdapter extends BaseModelAdapter {
  name = 'deepseek';
  displayName = 'DeepSeek';
  description = '由DeepSeek开发的强大语言模型';
  maxTokens = 4096;
  supportedFeatures = {
    streaming: true,
    contextWindow: true,
    functionCalling: true,
  };

  protected async makeRequest(
    options: ModelRequestOptions,
    config: AIConfig,
    isStream: boolean
  ) {
    const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    
    if (!config.apiKey) {
      throw new Error('请配置API密钥');
    }

    const messages = options.messages || [
      {
        role: 'user',
        content: options.prompt
      }
    ];

    try {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: config.temperature || this.defaultTemperature,
          stream: isStream,
          max_tokens: 2000
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `请求失败 (${response.status})`);
      }

      return isStream ? response : response.json();
    } catch (error) {
      // 重新抛出错误，让上层统一处理
      throw error;
    }
  }

  protected extractStreamContent(parsed: any): string {
    return parsed.choices[0]?.delta?.content || '';
  }

  protected extractContent(response: any): string {
    return response.choices[0]?.message?.content || '';
  }
}

// OpenAI 模型适配器
export class OpenAIAdapter extends BaseModelAdapter {
  name = 'openai';
  displayName = 'OpenAI';
  description = 'OpenAI的GPT系列模型';
  maxTokens = 4096;
  supportedFeatures = {
    streaming: true,
    contextWindow: true,
    functionCalling: true,
  };

  protected async makeRequest(
    options: ModelRequestOptions,
    config: AIConfig,
    isStream: boolean
  ) {
    const API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1';
    
    if (!config.apiKey) {
      throw new Error('请配置API密钥');
    }

    const messages = options.messages || [
      {
        role: 'user',
        content: options.prompt
      }
    ];

    try {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages,
          temperature: config.temperature || this.defaultTemperature,
          stream: isStream,
          max_tokens: 2000
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `请求失败 (${response.status})`);
      }

      return isStream ? response : response.json();
    } catch (error) {
      // 重新抛出错误，让上层统一处理
      throw error;
    }
  }

  protected extractStreamContent(parsed: any): string {
    return parsed.choices[0]?.delta?.content || '';
  }

  protected extractContent(response: any): string {
    return response.choices[0]?.message?.content || '';
  }
}

// Claude 模型适配器
export class ClaudeAdapter extends BaseModelAdapter {
  name = 'claude';
  displayName = 'Claude';
  description = 'Anthropic的Claude模型';
  maxTokens = 100000;
  supportedFeatures = {
    streaming: true,
    contextWindow: true,
    functionCalling: true,
  };

  protected async makeRequest(
    options: ModelRequestOptions,
    config: AIConfig,
    isStream: boolean
  ) {
    const API_URL = import.meta.env.VITE_CLAUDE_API_URL || 'https://api.anthropic.com/v1';
    
    if (!config.apiKey) {
      throw new Error('请配置API密钥');
    }

    const messages = options.messages || [
      {
        role: 'user',
        content: options.prompt
      }
    ];

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || 'claude-2',
          messages,
          temperature: config.temperature || this.defaultTemperature,
          stream: isStream,
          max_tokens: 2000
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `请求失败 (${response.status})`);
      }

      return isStream ? response : response.json();
    } catch (error) {
      // 重新抛出错误，让上层统一处理
      throw error;
    }
  }

  protected extractStreamContent(parsed: any): string {
    return parsed.delta?.text || '';
  }

  protected extractContent(response: any): string {
    return response.content[0]?.text || '';
  }
}

const modelAdapters = new Map<string, ModelAdapter>();

export function registerModelAdapter(model: string, adapter: ModelAdapter) {
  modelAdapters.set(model, adapter);
}

export function getModelAdapter(model: string): ModelAdapter | undefined {
  return modelAdapters.get(model);
}

export const availableModels = ['deepseek', 'openai', 'claude'] as const;
export type ModelType = typeof availableModels[number];

registerModelAdapter('deepseek', new DeepSeekAdapter());
registerModelAdapter('openai', new OpenAIAdapter());
registerModelAdapter('claude', new ClaudeAdapter());
