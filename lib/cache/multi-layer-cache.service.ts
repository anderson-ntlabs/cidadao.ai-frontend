/**
 * Multi-Layer Cache Service
 *
 * Implements intelligent caching strategy:
 * Layer 1: In-memory cache (fastest, limited size)
 * Layer 2: Vercel KV (distributed, persistent)
 *
 * Provides automatic promotion/demotion of hot/cold data
 */

import { kvCache, TTL_STRATEGIES, CACHE_PREFIXES } from './kv-cache.service';

interface MemoryCacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

interface CacheConfig {
  maxMemorySize: number; // bytes
  maxMemoryEntries: number;
  memoryTTL: number; // seconds
  kvTTL: number; // seconds
  promoteThreshold: number; // hits before promoting to memory
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxMemorySize: 10 * 1024 * 1024, // 10MB
  maxMemoryEntries: 1000,
  memoryTTL: 300, // 5 minutes
  kvTTL: 3600, // 1 hour
  promoteThreshold: 3,
};

/**
 * Multi-Layer Cache Service
 */
export class MultiLayerCacheService {
  private memoryCache = new Map<string, MemoryCacheEntry<any>>();
  private memorySize = 0;
  private config: CacheConfig;

  private stats = {
    memoryHits: 0,
    kvHits: 0,
    misses: 0,
    promotions: 0,
    evictions: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache (checks memory first, then KV)
   */
  async get<T>(key: string): Promise<T | null> {
    // Layer 1: Check memory cache
    const memoryEntry = this.memoryCache.get(key);

    if (memoryEntry) {
      // Check if expired
      const now = Date.now();
      if (now - memoryEntry.timestamp > memoryEntry.ttl * 1000) {
        this.memoryCache.delete(key);
        this.memorySize -= memoryEntry.size;
      } else {
        this.stats.memoryHits++;
        memoryEntry.hits++;
        return memoryEntry.data;
      }
    }

    // Layer 2: Check KV cache
    const kvValue = await kvCache.get<T>(key);

    if (kvValue !== null) {
      this.stats.kvHits++;

      // Consider promoting to memory if frequently accessed
      const kvEntry = await kvCache.get<MemoryCacheEntry<T>>(key);
      if (kvEntry && kvEntry.hits >= this.config.promoteThreshold) {
        this.promoteToMemory(key, kvValue);
      }

      return kvValue;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in both caches
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<boolean> {
    const memoryTTL = ttl || this.config.memoryTTL;
    const kvTTL = ttl || this.config.kvTTL;

    // Estimate size
    const size = this.estimateSize(value);

    // Set in memory if within limits
    if (this.shouldCacheInMemory(size)) {
      this.setInMemory(key, value, memoryTTL, size);
    }

    // Always set in KV for persistence
    return await kvCache.set(key, value, kvTTL);
  }

  /**
   * Delete from both caches
   */
  async delete(key: string): Promise<boolean> {
    // Delete from memory
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      this.memoryCache.delete(key);
      this.memorySize -= memoryEntry.size;
    }

    // Delete from KV
    return await kvCache.delete(key);
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.stats.memoryHits + this.stats.kvHits + this.stats.misses;
    const hitRate = total > 0
      ? (this.stats.memoryHits + this.stats.kvHits) / total
      : 0;
    const memoryHitRate = total > 0 ? this.stats.memoryHits / total : 0;

    return {
      ...this.stats,
      total,
      hitRate,
      memoryHitRate,
      memoryEntries: this.memoryCache.size,
      memorySize: this.memorySize,
      memoryUtilization: this.memorySize / this.config.maxMemorySize,
    };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    // Clear memory
    this.memoryCache.clear();
    this.memorySize = 0;

    // Clear KV (specific prefixes only)
    await Promise.all([
      kvCache.clearPrefix(CACHE_PREFIXES.CHAT),
      kvCache.clearPrefix(CACHE_PREFIXES.SUGGESTIONS),
    ]);
  }

  /**
   * Promote value to memory cache
   */
  private promoteToMemory<T>(key: string, value: T): void {
    const size = this.estimateSize(value);

    if (this.shouldCacheInMemory(size)) {
      this.setInMemory(key, value, this.config.memoryTTL, size);
      this.stats.promotions++;
    }
  }

  /**
   * Set value in memory cache
   */
  private setInMemory<T>(
    key: string,
    value: T,
    ttl: number,
    size: number
  ): void {
    // Evict if necessary
    while (
      this.memorySize + size > this.config.maxMemorySize ||
      this.memoryCache.size >= this.config.maxMemoryEntries
    ) {
      this.evictLRU();
    }

    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size,
    });

    this.memorySize += size;
  }

  /**
   * Check if value should be cached in memory
   */
  private shouldCacheInMemory(size: number): boolean {
    // Don't cache if too large
    if (size > this.config.maxMemorySize * 0.1) {
      return false;
    }

    return true;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey)!;
      this.memoryCache.delete(oldestKey);
      this.memorySize -= entry.size;
      this.stats.evictions++;
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      const entry = this.memoryCache.get(key)!;
      this.memoryCache.delete(key);
      this.memorySize -= entry.size;
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    const json = JSON.stringify(value);
    return json.length * 2; // UTF-16 encoding
  }
}

/**
 * Singleton instance
 */
export const multiLayerCache = new MultiLayerCacheService();

/**
 * Helper functions for common operations
 */

/**
 * Cache chat response with multi-layer strategy
 */
export async function cacheChat(
  message: string,
  response: string
): Promise<boolean> {
  const key = `${CACHE_PREFIXES.CHAT}${hashString(message)}`;
  return multiLayerCache.set(key, response, TTL_STRATEGIES.SHORT);
}

/**
 * Get cached chat response
 */
export async function getCachedChat(
  message: string
): Promise<string | null> {
  const key = `${CACHE_PREFIXES.CHAT}${hashString(message)}`;
  return multiLayerCache.get<string>(key);
}

/**
 * Cache suggestions with longer TTL
 */
export async function cacheSuggestionsML(
  context: string,
  suggestions: string[]
): Promise<boolean> {
  const key = `${CACHE_PREFIXES.SUGGESTIONS}${hashString(context)}`;
  return multiLayerCache.set(key, suggestions, TTL_STRATEGIES.MEDIUM);
}

/**
 * Get cached suggestions
 */
export async function getCachedSuggestionsML(
  context: string
): Promise<string[] | null> {
  const key = `${CACHE_PREFIXES.SUGGESTIONS}${hashString(context)}`;
  return multiLayerCache.get<string[]>(key);
}

/**
 * Simple hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
