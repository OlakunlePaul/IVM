import { useEffect } from 'react';

/**
 * Custom hook to monitor and log performance metrics
 * Useful for development and debugging
 */
export const usePerformanceMonitor = (componentName: string, enabled: boolean = false) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Log if render takes longer than one frame (16ms)
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }, [componentName, enabled]);
};

/**
 * Measure component render performance
 */
export const measurePerformance = (componentName: string, fn: () => void) => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) {
    console.warn(`[Performance] ${componentName} operation took ${duration.toFixed(2)}ms`);
  }
};

