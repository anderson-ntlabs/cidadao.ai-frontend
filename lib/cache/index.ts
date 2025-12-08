/**
 * Unified Cache Module
 *
 * Three-layer caching strategy:
 * 1. Memory Cache - Fastest, limited to 10MB, 5-minute TTL
 * 2. Vercel KV - Distributed Redis, 1-hour default TTL
 * 3. Multi-Layer - Automatic promotion/demotion between layers
 *
 * Usage:
 * - For chat responses: Use multi-layer cache (hot data gets promoted)
 * - For rate limiting: Use KV cache directly (distributed state required)
 * - For user sessions: Use KV cache with longer TTL
 *
 * @module lib/cache
 */

// Main multi-layer cache (recommended for most use cases)
export {
  multiLayerCache,
  MultiLayerCacheService,
  cacheChat,
  getCachedChat,
  cacheSuggestionsML,
  getCachedSuggestionsML,
} from './multi-layer-cache.service'

// KV cache service (for distributed state)
export {
  kvCache,
  KVCacheService,
  TTL_STRATEGIES,
  CACHE_PREFIXES,
  cacheChatResponse,
  getCachedChatResponse,
  cacheSuggestions,
  getCachedSuggestions,
  checkRateLimit,
  type CacheEntry,
  type CacheStats,
} from './kv-cache.service'

// Low-level KV utilities (for advanced use cases)
export {
  getFromCache,
  setInCache,
  deleteFromCache,
  getOrSet,
  invalidatePattern,
  generateCacheKey,
  withCache,
  Cached,
  type CacheOptions,
} from './kv-cache'

/**
 * Cache Strategy Guide
 *
 * | Data Type          | Cache Layer      | TTL Strategy  | Example                    |
 * |--------------------|------------------|---------------|----------------------------|
 * | Chat responses     | Multi-layer      | SHORT (5m)    | cacheChat()                |
 * | Suggestions        | Multi-layer      | MEDIUM (1h)   | cacheSuggestionsML()       |
 * | User profiles      | KV only          | MEDIUM (1h)   | kvCache.set()              |
 * | Rate limits        | KV only          | VERY_SHORT    | checkRateLimit()           |
 * | Static content     | KV only          | LONG (24h)    | kvCache.set(key, val, TTL) |
 * | Agent metadata     | KV only          | VERY_LONG     | kvCache.set(key, val, TTL) |
 */
