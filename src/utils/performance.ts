export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  } else {
    fn();
  }
};

export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T => {
  if (process.env.NODE_ENV === 'development') {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      console.log(`${name} took ${end - start}ms`);
      return result;
    }) as T;
  }
  return fn;
};
