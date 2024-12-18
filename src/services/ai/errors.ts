import { ModelResponse } from './models';

export class AIError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AIError';
  }
}

export function handleAIError(error: any): ModelResponse {
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
