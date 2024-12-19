export interface AIContext {
  text: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
}

export async function getAICompletion(promptId: string, context: AIContext): Promise<string> {
  // 简化为同步返回，后续实现真实的AI调用
  return '示例回复';
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
