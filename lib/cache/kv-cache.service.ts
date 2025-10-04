/**
 * Vercel KV Cache Service
 *
 * Distributed Redis-based caching for edge functions
 * Provides multi-layer caching with smart TTL strategies
 */

import { kv } from '@vercel/kv';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
}

/**
 * TTL strategies (in seconds)
 */
export const TTL_STRATEGIES = {
  VERY_SHORT: 60,          // 1 minute - real-time data
  SHORT: 300,              // 5 minutes - chat responses
  MEDIUM: 3600,            // 1 hour - user profiles
  LONG: 86400,             // 24 hours - static content
  VERY_LONG: 604800,       // 7 days - rarely changing data
} as const;

/**
 * Cache key prefixes for organization
 */
export const CACHE_PREFIXES = {
  CHAT: 'chat:',
  SUGGESTIONS: 'suggestions:',
  USER: 'user:',
  AGENT: 'agent:',
  INVESTIGATION: 'investigation:',
  GEO: 'geo:',
  RATE_LIMIT: 'ratelimit:',
} as const;

/**
 * KV Cache Service
 */
export class KVCacheService {
  private stats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await kv.get<CacheEntry<T>>(key);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Check if expired (safety check, KV handles this but good to verify)
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.stats.misses++;
        await this.delete(key);
        return null;
      }

      // Increment hit counter
      this.stats.hits++;
      entry.hits++;
      await kv.set(key, entry, { ex: entry.ttl });

      return entry.data;
    } catch (error) {
      console.error('[KV Cache] Get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = TTL_STRATEGIES.SHORT
  ): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        hits: 0,
      };

      await kv.set(key, entry, { ex: ttl });
      return true;
    } catch (error) {
      console.error('[KV Cache] Set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await kv.del(key);
      return true;
    } catch (error) {
      console.error('[KV Cache] Delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await kv.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[KV Cache] Exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const entries = await kv.mget<CacheEntry<T>[]>(...keys);

      return entries.map((entry, index) => {
        if (!entry) {
          this.stats.misses++;
          return null;
        }

        // Check expiration
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.stats.misses++;
          this.delete(keys[index]);
          return null;
        }

        this.stats.hits++;
        return entry.data;
      });
    } catch (error) {
      console.error('[KV Cache] Mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await kv.keys(pattern);
      return keys;
    } catch (error) {
      console.error('[KV Cache] Keys error:', error);
      return [];
    }
  }

  /**
   * Increment counter (for rate limiting)
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await kv.incr(key);

      if (ttl && value === 1) {
        await kv.expire(key, ttl);
      }

      return value;
    } catch (error) {
      console.error('[KV Cache] Increment error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalKeys: 0, // Would need separate query
      memoryUsage: 0, // KV doesn't expose this
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
    };
  }

  /**
   * Clear all keys with prefix
   */
  async clearPrefix(prefix: string): Promise<number> {
    try {
      const keys = await this.keys(`${prefix}*`);

      if (keys.length === 0) {
        return 0;
      }

      await kv.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('[KV Cache] Clear prefix error:', error);
      return 0;
    }
  }

  /**
   * Get TTL for key (remaining time in seconds)
   */
  async getTTL(key: string): Promise<number> {
    try {
      const ttl = await kv.ttl(key);
      return ttl;
    } catch (error) {
      console.error('[KV Cache] Get TTL error:', error);
      return -1;
    }
  }

  /**
   * Set expiration for existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await kv.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('[KV Cache] Expire error:', error);
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const kvCache = new KVCacheService();

/**
 * Helper functions for common cache operations
 */

/**
 * Cache chat response
 */
export async function cacheChatResponse(
  message: string,
  response: string,
  ttl: number = TTL_STRATEGIES.SHORT
): Promise<boolean> {
  const key = `${CACHE_PREFIXES.CHAT}${hashMessage(message)}`;
  return kvCache.set(key, response, ttl);
}

/**
 * Get cached chat response
 */
export async function getCachedChatResponse(
  message: string
): Promise<string | null> {
  const key = `${CACHE_PREFIXES.CHAT}${hashMessage(message)}`;
  return kvCache.get<string>(key);
}

/**
 * Cache suggestions
 */
export async function cacheSuggestions(
  context: string,
  suggestions: string[],
  ttl: number = TTL_STRATEGIES.MEDIUM
): Promise<boolean> {
  const key = `${CACHE_PREFIXES.SUGGESTIONS}${hashMessage(context)}`;
  return kvCache.set(key, suggestions, ttl);
}

/**
 * Get cached suggestions
 */
export async function getCachedSuggestions(
  context: string
): Promise<string[] | null> {
  const key = `${CACHE_PREFIXES.SUGGESTIONS}${hashMessage(context)}`;
  return kvCache.get<string[]>(key);
}

/**
 * Rate limiting with KV
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  window: number // seconds
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const key = `${CACHE_PREFIXES.RATE_LIMIT}${identifier}`;

  try {
    const count = await kvCache.increment(key, window);
    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;

    const ttl = await kvCache.getTTL(key);
    const resetTime = Date.now() + (ttl * 1000);

    return {
      allowed,
      remaining,
      resetTime,
    };
  } catch (error) {
    console.error('[KV Cache] Rate limit error:', error);
    // Fail open - allow request if cache error
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now() + window * 1000,
    };
  }
}

/**
 * Simple hash function for cache keys
 */
function hashMessage(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
