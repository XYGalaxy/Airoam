interface CacheItem {
  data: any;
  timestamp: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem>;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if cache is expired
    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const cacheService = CacheService.getInstance(); 