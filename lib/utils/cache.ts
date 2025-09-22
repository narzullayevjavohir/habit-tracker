// Advanced caching system for performance optimization
import React from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items in cache

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (typeof oldestKey === "string") {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize,
    };
  }
}

// Singleton instance
export const cache = new CacheManager();

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `${fn.name}_${JSON.stringify(args)}`;

    const cached = cache.get<ReturnType<T>>(key);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);

    // Handle promises
    if (result instanceof Promise) {
      return result.then((resolved) => {
        cache.set(key, resolved, ttl);
        return resolved;
      });
    }

    cache.set(key, result, ttl);
    return result;
  }) as T;
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) {
  const [data, setData] = React.useState<T | null>(cache.get<T>(key));
  const [loading, setLoading] = React.useState(!cache.has(key));
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (cache.has(key)) {
      setData(cache.get<T>(key));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        cache.set(key, result, ttl);
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [key, ttl]);

  const refetch = React.useCallback(() => {
    cache.delete(key);
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        cache.set(key, result, ttl);
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [key, fetcher, ttl]);

  return { data, loading, error, refetch };
}

// Cache invalidation utilities
export const cacheKeys = {
  habits: (userId: string) => `habits_${userId}`,
  habitEntries: (userId: string, date?: string) =>
    `habit_entries_${userId}${date ? `_${date}` : ""}`,
  userProfile: (userId: string) => `profile_${userId}`,
  analytics: (userId: string, period: string) =>
    `analytics_${userId}_${period}`,
};

export function invalidateUserCache(userId: string) {
  const keysToDelete = [
    cacheKeys.habits(userId),
    cacheKeys.habitEntries(userId),
    cacheKeys.userProfile(userId),
  ];

  keysToDelete.forEach((key) => cache.delete(key));
}

export function invalidateAnalyticsCache(userId: string) {
  const periods = ["week", "month", "year"];
  periods.forEach((period) => {
    cache.delete(cacheKeys.analytics(userId, period));
  });
}
