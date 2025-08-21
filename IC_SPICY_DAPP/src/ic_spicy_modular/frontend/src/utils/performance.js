// Performance optimization utilities

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for search inputs and API calls
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Memoized actor creation to prevent unnecessary re-renders
export const useOptimizedActor = (Actor, idlFactory, agent, canisterId, dependencies = []) => {
  return useMemo(() => {
    if (!agent || !canisterId) return null;
    try {
      return Actor.createActor(idlFactory, { agent, canisterId });
    } catch (error) {
      console.warn('Failed to create actor:', error);
      return null;
    }
  }, [Actor, idlFactory, agent, canisterId, ...dependencies]);
};

// Optimized state updater that prevents unnecessary re-renders
export const useOptimizedState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  
  const setOptimizedState = useCallback((newValue) => {
    setState(prevState => {
      // Only update if the value actually changed
      if (JSON.stringify(prevState) !== JSON.stringify(newValue)) {
        return newValue;
      }
      return prevState;
    });
  }, []);
  
  return [state, setOptimizedState];
};

// Image optimization utility
export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, `image/${format}`, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Lazy loading hook for images and components
export const useLazyLoad = (ref, rootMargin = '50px') => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, rootMargin, hasLoaded]);

  return isIntersecting;
};

// Cache management for API responses
class CacheManager {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const item = {
      value,
      expiry: Date.now() + ttl
    };

    this.cache.set(key, item);
  }

  isValid(key) {
    const item = this.cache.get(key);
    return item && Date.now() < item.expiry;
  }

  clear() {
    this.cache.clear();
  }
}

export const cacheManager = new CacheManager();

// Optimized API call hook with caching
export const useOptimizedApi = (apiFunction, dependencies = [], options = {}) => {
  const { cache = true, ttl = 300000 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheKey = useMemo(() => 
    JSON.stringify({ fn: apiFunction.name, deps: dependencies }), 
    [apiFunction.name, ...dependencies]
  );

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cache && cacheManager.isValid(cacheKey)) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        setData(cached.value);
        return cached.value;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
      
      // Cache the result
      if (cache) {
        cacheManager.set(cacheKey, result, ttl);
      }
      
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, cache, ttl]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Performance monitoring
export const performanceMonitor = {
  measure: (name, fn) => {
    return async (...args) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();
        console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
        throw error;
      }
    };
  },

  markStart: (name) => {
    performance.mark(`${name}-start`);
  },

  markEnd: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`⚡ ${name}: ${measure.duration.toFixed(2)}ms`);
  }
};

// Batch operations for better performance
export const batchOperations = (operations, batchSize = 5) => {
  return new Promise(async (resolve, reject) => {
    const results = [];
    
    try {
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming
        if (i + batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  useDebounce,
  useThrottle,
  useOptimizedActor,
  useOptimizedState,
  useLazyLoad,
  useOptimizedApi,
  optimizeImage,
  cacheManager,
  performanceMonitor,
  batchOperations
};
