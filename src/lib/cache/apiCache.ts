/**
 * API caching strategy optimized for cPanel hosting with static builds
 * Uses in-memory cache with configurable TTL and localStorage fallback
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  url: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useLocalStorage?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupe?: boolean; // Deduplicate identical requests
}

class APICache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxMemoryCacheSize = 100;
  private storagePrefix = 'insights_cache_';

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.cleanupExpiredEntries();
      // Cleanup every 5 minutes
      setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
    }
  }

  private setupEventListeners() {
    // Clear cache on browser back/forward
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.clearMemoryCache();
      }
    });

    // Revalidate on focus (optional)
    window.addEventListener('focus', () => {
      this.revalidateStaleEntries();
    });

    // Revalidate on network reconnection
    window.addEventListener('online', () => {
      this.revalidateStaleEntries();
    });
  }

  private generateCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private shouldUseCache(cacheKey: string, options: CacheOptions): boolean {
    const entry = this.memoryCache.get(cacheKey);
    if (!entry) return false;

    // Always use cache if not expired
    if (!this.isExpired(entry)) return true;

    // For expired entries, decide based on options
    return false;
  }

  private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const item = localStorage.getItem(this.storagePrefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      if (this.isExpired(entry)) {
        localStorage.removeItem(this.storagePrefix + key);
        return null;
      }

      return entry;
    } catch (error) {
      return null;
    }
  }

  private saveToLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      // Don't save large responses to localStorage
      const serialized = JSON.stringify(entry);
      if (serialized.length > 100000) return; // 100KB limit

      localStorage.setItem(this.storagePrefix + key, serialized);

      // Cleanup old entries if storage is getting full
      this.cleanupLocalStorage();
    } catch (error) {
      // localStorage might be full or disabled
    }
  }

  private cleanupLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.storagePrefix));

      if (cacheKeys.length > 50) {
        // Remove oldest entries
        const entries = cacheKeys.map(key => ({
          key,
          timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0
        }));

        entries
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, 10) // Remove oldest 10
          .forEach(entry => localStorage.removeItem(entry.key));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  private cleanupExpiredEntries(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Enforce size limit
    if (this.memoryCache.size > this.maxMemoryCacheSize) {
      const entries = Array.from(this.memoryCache.entries());
      const oldestEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 20); // Remove 20 oldest

      oldestEntries.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  private revalidateStaleEntries(): void {
    // Mark stale entries for revalidation on next request
    // This is a simple implementation - in a more complex system,
    // you might trigger background revalidation
  }

  public async get<T>(
    url: string,
    fetchOptions?: RequestInit,
    cacheOptions: CacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(url, fetchOptions);
    const { ttl = this.defaultTTL, useLocalStorage = true, dedupe = true } = cacheOptions;

    // Check for pending request (deduplication)
    if (dedupe && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check memory cache first
    if (this.shouldUseCache(cacheKey, cacheOptions)) {
      const entry = this.memoryCache.get(cacheKey)!;
      return entry.data;
    }

    // Check localStorage cache
    if (useLocalStorage && typeof window !== 'undefined') {
      const localEntry = this.getFromLocalStorage<T>(cacheKey);
      if (localEntry) {
        // Copy to memory cache
        this.memoryCache.set(cacheKey, localEntry);
        return localEntry.data;
      }
    }

    // Fetch fresh data
    const fetchPromise = this.fetchAndCache<T>(url, fetchOptions, cacheKey, ttl, useLocalStorage);

    if (dedupe) {
      this.pendingRequests.set(cacheKey, fetchPromise);
    }

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      if (dedupe) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  private async fetchAndCache<T>(
    url: string,
    fetchOptions: RequestInit | undefined,
    cacheKey: string,
    ttl: number,
    useLocalStorage: boolean
  ): Promise<T> {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: T = await response.json();
    const etag = response.headers.get('etag') || undefined;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      etag,
      url
    };

    // Save to memory cache
    this.memoryCache.set(cacheKey, entry);

    // Save to localStorage if enabled
    if (useLocalStorage && typeof window !== 'undefined') {
      this.saveToLocalStorage(cacheKey, entry);
    }

    return data;
  }

  public invalidate(urlPattern?: string | RegExp): void {
    if (!urlPattern) {
      // Clear all caches
      this.memoryCache.clear();
      this.pendingRequests.clear();
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys
          .filter(key => key.startsWith(this.storagePrefix))
          .forEach(key => localStorage.removeItem(key));
      }
      return;
    }

    const pattern = typeof urlPattern === 'string'
      ? new RegExp(urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : urlPattern;

    // Clear matching entries from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (pattern.test(entry.url)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear matching entries from localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys
        .filter(key => key.startsWith(this.storagePrefix))
        .forEach(key => {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');
            if (entry.url && pattern.test(entry.url)) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        });
    }
  }

  public clearMemoryCache(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
  }

  public getCacheStats() {
    const memorySize = this.memoryCache.size;
    const memoryKeys = Array.from(this.memoryCache.keys());

    let localStorageSize = 0;
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith(this.storagePrefix)).length;
    }

    return {
      memoryCache: {
        size: memorySize,
        maxSize: this.maxMemoryCacheSize,
        keys: memoryKeys
      },
      localStorage: {
        size: localStorageSize
      },
      pendingRequests: this.pendingRequests.size
    };
  }

  // Pre-populate cache with static data (useful for frequently accessed APIs)
  public preload<T>(url: string, data: T, ttl?: number): void {
    const cacheKey = this.generateCacheKey(url);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      url
    };

    this.memoryCache.set(cacheKey, entry);
  }
}

// Create singleton instance
const apiCache = new APICache();

// Convenient wrapper functions
export const cachedFetch = <T>(
  url: string,
  fetchOptions?: RequestInit,
  cacheOptions?: CacheOptions
): Promise<T> => {
  return apiCache.get<T>(url, fetchOptions, cacheOptions);
};

export const invalidateCache = (urlPattern?: string | RegExp) => {
  apiCache.invalidate(urlPattern);
};

export const clearCache = () => {
  apiCache.invalidate();
};

export const getCacheStats = () => {
  return apiCache.getCacheStats();
};

export const preloadCache = <T>(url: string, data: T, ttl?: number) => {
  apiCache.preload(url, data, ttl);
};

export default apiCache;