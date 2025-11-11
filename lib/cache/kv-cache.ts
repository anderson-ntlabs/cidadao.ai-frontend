/**
 * Vercel KV Cache Utility
 *
 * High-performance caching layer using Vercel KV (Redis)
 * Reduces backend API calls and improves TTFB
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-11
 */

import { kv } from '@vercel/kv'
import { createLogger } from '@/lib/logger'

const logger = createLogger('KVCache')

export interface CacheOptions {
  /**
   * Time to live in seconds
   * @default 3600 (1 hour)
   */
  ttl?: number

  /**
   * Whether to skip cache and force fetch
   * @default false
   */
  skipCache?: boolean
}

/**
 * Get value from KV cache
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!process.env.KV_REST_API_URL) {
    logger.warn('KV not configured, skipping cache')
    return null
  }

  try {
    const cached = await kv.get<T>(key)
    if (cached) {
      logger.debug(`Cache HIT: ${key}`)
      return cached
    }
    logger.debug(`Cache MISS: ${key}`)
    return null
  } catch (error) {
    logger.error('KV get failed', error, { key })
    return null
  }
}

/**
 * Set value in KV cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param options - Cache options
 */
export async function setInCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  if (!process.env.KV_REST_API_URL) {
    return
  }

  const { ttl = 3600 } = options

  try {
    await kv.set(key, value, { ex: ttl })
    logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`)
  } catch (error) {
    logger.error('KV set failed', error, { key })
  }
}

/**
 * Delete value from KV cache
 * @param key - Cache key or pattern
 */
export async function deleteFromCache(key: string): Promise<void> {
  if (!process.env.KV_REST_API_URL) {
    return
  }

  try {
    await kv.del(key)
    logger.debug(`Cache DELETE: ${key}`)
  } catch (error) {
    logger.error('KV delete failed', error, { key })
  }
}

/**
 * Get or set cached value (fetch if not cached)
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not cached
 * @param options - Cache options
 * @returns Cached or freshly fetched value
 *
 * @example
 * ```ts
 * const user = await getOrSet(
 *   'user:123',
 *   () => fetchUserFromDB(123),
 *   { ttl: 600 } // 10 minutes
 * )
 * ```
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { skipCache = false } = options

  // Skip cache if requested
  if (skipCache) {
    logger.debug(`Cache SKIP: ${key}`)
    return await fetchFn()
  }

  // Try to get from cache
  const cached = await getFromCache<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  logger.debug(`Fetching fresh data for: ${key}`)
  const data = await fetchFn()

  // Cache the result
  await setInCache(key, data, options)

  return data
}

/**
 * Invalidate multiple cache keys matching a pattern
 * @param pattern - Pattern to match (e.g., 'user:*')
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  if (!process.env.KV_REST_API_URL) {
    return
  }

  try {
    // Note: KV doesn't support pattern deletion directly
    // You'd need to track keys or use a different strategy
    logger.warn(`Pattern invalidation not implemented: ${pattern}`)
  } catch (error) {
    logger.error('Pattern invalidation failed', error, { pattern })
  }
}

/**
 * Generate cache key from request parameters
 * @param prefix - Key prefix (e.g., 'api:users')
 * @param params - Parameters to include in key
 * @returns Cache key string
 *
 * @example
 * ```ts
 * const key = generateCacheKey('api:users', { id: 123, role: 'admin' })
 * // Result: "api:users:id=123:role=admin"
 * ```
 */
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return prefix
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join(':')

  return `${prefix}:${sortedParams}`
}

/**
 * Wrap an API function with caching
 *
 * @param fn - API function to wrap
 * @param keyGenerator - Function to generate cache key from arguments
 * @param options - Cache options
 * @returns Wrapped function with caching
 *
 * @example
 * ```ts
 * const getCachedUser = withCache(
 *   getUserFromAPI,
 *   (id) => `user:${id}`,
 *   { ttl: 600 }
 * )
 *
 * const user = await getCachedUser(123)
 * ```
 */
export function withCache<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyGenerator: (...args: TArgs) => string,
  options: CacheOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const key = keyGenerator(...args)
    return await getOrSet(key, () => fn(...args), options)
  }
}

/**
 * Cache decorator for class methods
 *
 * @example
 * ```ts
 * class UserService {
 *   @Cached('user', { ttl: 600 })
 *   async getUser(id: number) {
 *     return await fetchUser(id)
 *   }
 * }
 * ```
 */
export function Cached(keyPrefix: string, options: CacheOptions = {}) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = generateCacheKey(keyPrefix, { args: JSON.stringify(args) })
      return await getOrSet(key, () => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}
