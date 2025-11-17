// Performance monitoring utilities

export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
}

// Report Web Vitals
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
  
  // In production, you could send this to an analytics service
  // Example: analytics.track(metric.name, { value: metric.value });
}

