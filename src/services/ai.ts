import { AIContext } from './ai/context';
import { generatePrompt } from './ai/prompts/manager';

interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIContext {
  text: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

export async function getAICompletion(promptId: string, context: AIContext, options: AICompletionOptions = {}): Promise<string> {
  try {
    const prompt = generatePrompt(promptId, context);
    // TODO: 实现 AI 补全逻辑
    return '这是一个测试回复';
  } catch (error) {
    console.error('AI 补全失败:', error);
    throw error;
  }
}

export function stopAICompletion() {
  // 实现中断AI请求的逻辑
}

export const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries - 1)));
    }
  }
};
