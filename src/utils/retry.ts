interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
  shouldRetry: (error: any) => {
    // 默认只在网络错误或 429 错误时重试
    if (error instanceof Error) {
      return error.message.includes('Failed to fetch') ||
             error.name === 'NetworkError' ||
             error.message.includes('429');
    }
    return false;
  },
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;
  let delay = opts.delay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      console.log(`重试请求 (${attempt}/${opts.maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= opts.backoff;
    }
  }

  throw lastError;
}
