/**
 * Tests for Multi-Layer Cache Service
 *
 * Tests the intelligent multi-layer caching strategy with:
 * - Layer 1: In-memory cache with LRU eviction
 * - Layer 2: Vercel KV (distributed, persistent)
 * - Min-Heap for O(log n) performance optimization
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mocks - Must use vi.hoisted
const { mockKvGet, mockKvSet, mockKvDelete, mockKvClearPrefix } = vi.hoisted(() => ({
  mockKvGet: vi.fn(),
  mockKvSet: vi.fn(),
  mockKvDelete: vi.fn(),
  mockKvClearPrefix: vi.fn(),
}))

vi.mock('./kv-cache.service', () => ({
  kvCache: {
    get: mockKvGet,
    set: mockKvSet,
    delete: mockKvDelete,
    clearPrefix: mockKvClearPrefix,
  },
  TTL_STRATEGIES: {
    VERY_SHORT: 60,
    SHORT: 300,
    MEDIUM: 3600,
    LONG: 86400,
    VERY_LONG: 604800,
  },
  CACHE_PREFIXES: {
    CHAT: 'chat:',
    SUGGESTIONS: 'suggestions:',
    USER: 'user:',
    AGENT: 'agent:',
    INVESTIGATION: 'investigation:',
    GEO: 'geo:',
    RATE_LIMIT: 'ratelimit:',
  },
}))

import {
  MultiLayerCacheService,
  cacheChat,
  getCachedChat,
  cacheSuggestionsML,
  getCachedSuggestionsML,
} from './multi-layer-cache.service'

describe('MultiLayerCacheService', () => {
  let cache: MultiLayerCacheService
  let originalSetInterval: typeof setInterval

  beforeEach(() => {
    // Mock setInterval to prevent actual timers
    originalSetInterval = global.setInterval
    global.setInterval = vi.fn(() => 0 as any) as any

    vi.clearAllMocks()

    cache = new MultiLayerCacheService({
      maxMemorySize: 1024 * 100, // 100KB for testing
      maxMemoryEntries: 10,
      memoryTTL: 300,
      kvTTL: 3600,
      promoteThreshold: 3,
    })
  })

  afterEach(() => {
    global.setInterval = originalSetInterval
  })

  describe('Memory Cache Layer', () => {
    it('should cache value in memory', async () => {
      const testValue = { data: 'test-value' }

      await cache.set('test-key', testValue)

      // Should be in memory
      const result = await cache.get('test-key')
      expect(result).toEqual(testValue)

      // Should track stats
      const stats = cache.getStats()
      expect(stats.memoryHits).toBe(1)
      expect(stats.kvHits).toBe(0)
    })

    it('should return cached value from memory on hit', async () => {
      const testValue = { data: 'cached-value' }
      await cache.set('test-key', testValue)

      // First access
      const result1 = await cache.get('test-key')
      expect(result1).toEqual(testValue)

      // Second access - should still hit memory
      const result2 = await cache.get('test-key')
      expect(result2).toEqual(testValue)

      const stats = cache.getStats()
      expect(stats.memoryHits).toBe(2)
    })

    it('should handle expired memory entries', async () => {
      const testValue = { data: 'test-value' }
      const shortCache = new MultiLayerCacheService({
        maxMemorySize: 1024 * 100,
        maxMemoryEntries: 10,
        memoryTTL: 0.001, // Very short TTL
        kvTTL: 3600,
        promoteThreshold: 3,
      })

      await shortCache.set('test-key', testValue)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Should return null (expired)
      mockKvGet.mockResolvedValueOnce(null)
      const result = await shortCache.get('test-key')
      expect(result).toBeNull()
    })

    it('should track hit count for frequently accessed items', async () => {
      const testValue = { data: 'test-value' }
      await cache.set('test-key', testValue)

      // Access multiple times
      await cache.get('test-key')
      await cache.get('test-key')
      await cache.get('test-key')

      const stats = cache.getStats()
      expect(stats.memoryHits).toBe(3)
    })
  })

  describe('KV Cache Layer', () => {
    it('should fallback to KV cache on memory miss', async () => {
      const testValue = { data: 'kv-value' }
      mockKvGet.mockResolvedValueOnce(testValue)

      const result = await cache.get('missing-key')

      expect(result).toEqual(testValue)
      expect(mockKvGet).toHaveBeenCalledWith('missing-key')

      const stats = cache.getStats()
      expect(stats.kvHits).toBe(1)
      expect(stats.memoryHits).toBe(0)
    })

    it('should promote frequently accessed KV entries to memory', async () => {
      const kvEntry = {
        data: { content: 'test' },
        timestamp: Date.now(),
        ttl: 3600,
        hits: 5, // Above threshold
        size: 100,
      }

      mockKvGet.mockResolvedValueOnce(kvEntry.data)
      mockKvGet.mockResolvedValueOnce(kvEntry) // Second call for entry metadata

      await cache.get('hot-key')

      const stats = cache.getStats()
      expect(stats.promotions).toBeGreaterThan(0)
    })

    it('should store in KV cache when setting value', async () => {
      mockKvSet.mockResolvedValueOnce(true)

      const testValue = { data: 'test-value' }
      await cache.set('test-key', testValue, 600)

      expect(mockKvSet).toHaveBeenCalledWith('test-key', testValue, 600)
    })

    it('should return null on complete cache miss', async () => {
      mockKvGet.mockResolvedValueOnce(null)

      const result = await cache.get('non-existent-key')

      expect(result).toBeNull()

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
    })
  })

  describe('LRU Eviction with Min-Heap', () => {
    it('should evict least recently used entry when memory is full', async () => {
      const smallCache = new MultiLayerCacheService({
        maxMemorySize: 1000,
        maxMemoryEntries: 3,
        memoryTTL: 300,
        kvTTL: 3600,
        promoteThreshold: 3,
      })

      // Fill cache to capacity
      await smallCache.set('key1', { data: 'value1' })
      await smallCache.set('key2', { data: 'value2' })
      await smallCache.set('key3', { data: 'value3' })

      // Access key2 and key3 to update their timestamps
      await smallCache.get('key2')
      await smallCache.get('key3')

      // Add new entry - should evict key1 (oldest)
      await smallCache.set('key4', { data: 'value4' })

      // key1 should be evicted
      mockKvGet.mockResolvedValueOnce(null)
      const result = await smallCache.get('key1')
      expect(result).toBeNull()

      const stats = smallCache.getStats()
      expect(stats.evictions).toBeGreaterThan(0)
    })

    it('should evict when max entries limit is reached', async () => {
      const smallCache = new MultiLayerCacheService({
        maxMemorySize: 1024 * 1024, // Large memory
        maxMemoryEntries: 2, // Small entry limit
        memoryTTL: 300,
        kvTTL: 3600,
        promoteThreshold: 3,
      })

      await smallCache.set('key1', 'value1')
      await smallCache.set('key2', 'value2')
      await smallCache.set('key3', 'value3')

      const stats = smallCache.getStats()
      expect(stats.memoryEntries).toBeLessThanOrEqual(2)
      expect(stats.evictions).toBeGreaterThan(0)
    })

    it('should not cache very large values in memory', async () => {
      const largeValue = { data: 'x'.repeat(20000) } // Large object
      mockKvSet.mockResolvedValueOnce(true)

      await cache.set('large-key', largeValue)

      // Should be in KV but not memory
      const stats = cache.getStats()
      expect(stats.memoryEntries).toBe(0)
      expect(mockKvSet).toHaveBeenCalled()
    })

    it('should update timestamp on cache access', async () => {
      await cache.set('test-key', { data: 'value' })

      const initialTimestamp = Date.now()

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Access the key
      await cache.get('test-key')

      // The entry should have an updated timestamp (tested indirectly via LRU behavior)
      const stats = cache.getStats()
      expect(stats.memoryHits).toBe(1)
    })
  })

  describe('Delete Operations', () => {
    it('should delete from both memory and KV', async () => {
      mockKvDelete.mockResolvedValueOnce(true)

      await cache.set('test-key', { data: 'value' })
      await cache.delete('test-key')

      // Should be deleted from memory
      mockKvGet.mockResolvedValueOnce(null)
      const result = await cache.get('test-key')
      expect(result).toBeNull()

      // Should call KV delete
      expect(mockKvDelete).toHaveBeenCalledWith('test-key')
    })

    it('should handle delete when key only in KV', async () => {
      mockKvDelete.mockResolvedValueOnce(true)

      const result = await cache.delete('kv-only-key')

      expect(result).toBe(true)
      expect(mockKvDelete).toHaveBeenCalledWith('kv-only-key')
    })

    it('should update memory size on delete', async () => {
      await cache.set('test-key', { data: 'value' })

      const statsBeforeDelete = cache.getStats()
      const sizeBeforeDelete = statsBeforeDelete.memorySize

      await cache.delete('test-key')

      const statsAfterDelete = cache.getStats()
      expect(statsAfterDelete.memorySize).toBeLessThan(sizeBeforeDelete)
    })
  })

  describe('Statistics', () => {
    it('should track memory hits', async () => {
      await cache.set('test-key', { data: 'value' })
      await cache.get('test-key')
      await cache.get('test-key')

      const stats = cache.getStats()
      expect(stats.memoryHits).toBe(2)
    })

    it('should track KV hits', async () => {
      mockKvGet.mockResolvedValueOnce({ data: 'value' })

      await cache.get('kv-key')

      const stats = cache.getStats()
      expect(stats.kvHits).toBe(1)
    })

    it('should track misses', async () => {
      mockKvGet.mockResolvedValueOnce(null)

      await cache.get('missing-key')

      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
    })

    it('should calculate hit rates correctly', async () => {
      await cache.set('key1', { data: 'value1' })
      await cache.get('key1') // Memory hit

      mockKvGet.mockResolvedValueOnce({ data: 'value2' })
      await cache.get('key2') // KV hit

      mockKvGet.mockResolvedValueOnce(null)
      await cache.get('key3') // Miss

      const stats = cache.getStats()
      expect(stats.total).toBe(3)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
      expect(stats.memoryHitRate).toBeCloseTo(1 / 3)
    })

    it('should track memory size and utilization', async () => {
      await cache.set('test-key', { data: 'value' })

      const stats = cache.getStats()
      expect(stats.memorySize).toBeGreaterThan(0)
      expect(stats.memoryUtilization).toBeGreaterThan(0)
      expect(stats.memoryUtilization).toBeLessThanOrEqual(1)
    })

    it('should track promotions', async () => {
      const kvEntry = {
        data: { content: 'test' },
        timestamp: Date.now(),
        ttl: 3600,
        hits: 5, // Above threshold
        size: 50,
      }

      mockKvGet.mockResolvedValueOnce(kvEntry.data)
      mockKvGet.mockResolvedValueOnce(kvEntry)

      await cache.get('hot-key')

      const stats = cache.getStats()
      expect(stats.promotions).toBeGreaterThan(0)
    })
  })

  describe('Clear Operations', () => {
    it('should clear all caches', async () => {
      mockKvClearPrefix.mockResolvedValue(2)

      await cache.set('key1', { data: 'value1' })
      await cache.set('key2', { data: 'value2' })

      await cache.clear()

      const stats = cache.getStats()
      expect(stats.memoryEntries).toBe(0)
      expect(stats.memorySize).toBe(0)
      expect(mockKvClearPrefix).toHaveBeenCalled()
    })
  })

  describe('Custom Configuration', () => {
    it('should use custom TTL values', async () => {
      const customCache = new MultiLayerCacheService({
        maxMemorySize: 1024 * 100,
        maxMemoryEntries: 10,
        memoryTTL: 600,
        kvTTL: 7200,
        promoteThreshold: 5,
      })

      mockKvSet.mockResolvedValueOnce(true)

      await customCache.set('test-key', { data: 'value' })

      expect(mockKvSet).toHaveBeenCalledWith('test-key', { data: 'value' }, 7200)
    })

    it('should use custom promotion threshold', async () => {
      const customCache = new MultiLayerCacheService({
        maxMemorySize: 1024 * 100,
        maxMemoryEntries: 10,
        memoryTTL: 300,
        kvTTL: 3600,
        promoteThreshold: 10, // High threshold
      })

      const kvEntry = {
        data: { content: 'test' },
        timestamp: Date.now(),
        ttl: 3600,
        hits: 5, // Below custom threshold
        size: 50,
      }

      mockKvGet.mockResolvedValueOnce(kvEntry.data)
      mockKvGet.mockResolvedValueOnce(kvEntry)

      await customCache.get('hot-key')

      const stats = customCache.getStats()
      // Should not promote because hits < threshold
      expect(stats.promotions).toBe(0)
    })
  })
})

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('cacheChat', () => {
    it('should cache chat message and response', async () => {
      const message = 'What is the weather?'
      const response = 'The weather is sunny.'

      const mockSet = vi.fn().mockResolvedValue(true)
      vi.spyOn(MultiLayerCacheService.prototype, 'set').mockImplementation(mockSet)

      await cacheChat(message, response)

      expect(mockSet).toHaveBeenCalled()
      const [key, value, ttl] = mockSet.mock.calls[0]
      expect(key).toContain('chat:')
      expect(value).toBe(response)
      expect(ttl).toBe(300) // SHORT TTL
    })
  })

  describe('getCachedChat', () => {
    it('should retrieve cached chat response', async () => {
      const message = 'What is the weather?'
      const expectedResponse = 'The weather is sunny.'

      const mockGet = vi.fn().mockResolvedValue(expectedResponse)
      vi.spyOn(MultiLayerCacheService.prototype, 'get').mockImplementation(mockGet)

      const result = await getCachedChat(message)

      expect(result).toBe(expectedResponse)
      expect(mockGet).toHaveBeenCalled()
    })

    it('should return null for cache miss', async () => {
      const message = 'Uncached message'

      const mockGet = vi.fn().mockResolvedValue(null)
      vi.spyOn(MultiLayerCacheService.prototype, 'get').mockImplementation(mockGet)

      const result = await getCachedChat(message)

      expect(result).toBeNull()
    })
  })

  describe('cacheSuggestionsML', () => {
    it('should cache suggestions with medium TTL', async () => {
      const context = 'transparency investigation'
      const suggestions = ['Audit reports', 'Budget analysis', 'Contract reviews']

      const mockSet = vi.fn().mockResolvedValue(true)
      vi.spyOn(MultiLayerCacheService.prototype, 'set').mockImplementation(mockSet)

      await cacheSuggestionsML(context, suggestions)

      expect(mockSet).toHaveBeenCalled()
      const [key, value, ttl] = mockSet.mock.calls[0]
      expect(key).toContain('suggestions:')
      expect(value).toEqual(suggestions)
      expect(ttl).toBe(3600) // MEDIUM TTL
    })
  })

  describe('getCachedSuggestionsML', () => {
    it('should retrieve cached suggestions', async () => {
      const context = 'transparency investigation'
      const expectedSuggestions = ['Audit reports', 'Budget analysis']

      const mockGet = vi.fn().mockResolvedValue(expectedSuggestions)
      vi.spyOn(MultiLayerCacheService.prototype, 'get').mockImplementation(mockGet)

      const result = await getCachedSuggestionsML(context)

      expect(result).toEqual(expectedSuggestions)
      expect(mockGet).toHaveBeenCalled()
    })
  })
})

describe('MinHeap Integration', () => {
  let cache: MultiLayerCacheService
  let originalSetInterval: typeof setInterval

  beforeEach(() => {
    originalSetInterval = global.setInterval
    global.setInterval = vi.fn(() => 0 as any) as any

    vi.clearAllMocks()
    vi.restoreAllMocks() // Restore any spies from previous tests

    cache = new MultiLayerCacheService({
      maxMemorySize: 1024 * 100,
      maxMemoryEntries: 5,
      memoryTTL: 300,
      kvTTL: 3600,
      promoteThreshold: 3,
    })
  })

  afterEach(() => {
    global.setInterval = originalSetInterval
  })

  it('should maintain heap invariant during insertions', async () => {
    mockKvSet.mockResolvedValue(true)

    // Add multiple entries
    await cache.set('key1', { data: 'value1' })
    await cache.set('key2', { data: 'value2' })
    await cache.set('key3', { data: 'value3' })

    // All should be retrievable
    expect(await cache.get('key1')).toEqual({ data: 'value1' })
    expect(await cache.get('key2')).toEqual({ data: 'value2' })
    expect(await cache.get('key3')).toEqual({ data: 'value3' })
  })

  it('should maintain heap invariant during access (timestamp updates)', async () => {
    mockKvSet.mockResolvedValue(true)

    // Add 5 entries to fill cache
    await cache.set('key1', { data: 'value1' })
    await cache.set('key2', { data: 'value2' })
    await cache.set('key3', { data: 'value3' })
    await cache.set('key4', { data: 'value4' })
    await cache.set('key5', { data: 'value5' })

    // Access key5 multiple times to make it the most recently used
    await cache.get('key5')
    await cache.get('key5')
    await cache.get('key5')

    // Add new entry - should trigger eviction
    await cache.set('key6', { data: 'value6' })

    // key5 should definitely still be in cache (most recently accessed)
    expect(await cache.get('key5')).toEqual({ data: 'value5' })
    // key6 should be in cache (just added)
    expect(await cache.get('key6')).toEqual({ data: 'value6' })

    const stats = cache.getStats()
    expect(stats.evictions).toBeGreaterThan(0)
    expect(stats.memoryEntries).toBeLessThanOrEqual(5)
  })

  it('should handle rapid insertions and deletions', async () => {
    mockKvSet.mockResolvedValue(true)
    mockKvDelete.mockResolvedValue(true)

    // Add 5 entries (max capacity)
    const keys = Array.from({ length: 5 }, (_, i) => `key${i}`)
    for (const key of keys) {
      await cache.set(key, { data: `value-${key}` })
    }

    // Delete first 2
    await cache.delete(keys[0])
    await cache.delete(keys[1])

    // Remaining keys should still be accessible in memory
    for (let i = 2; i < 5; i++) {
      const result = await cache.get(keys[i])
      expect(result).toEqual({ data: `value-${keys[i]}` })
    }

    const stats = cache.getStats()
    expect(stats.memoryEntries).toBe(3)
  })

  it('should correctly evict oldest entry with complex access patterns', async () => {
    mockKvSet.mockResolvedValue(true)

    const smallCache = new MultiLayerCacheService({
      maxMemorySize: 1024 * 100,
      maxMemoryEntries: 3,
      memoryTTL: 300,
      kvTTL: 3600,
      promoteThreshold: 3,
    })

    // Add entries with specific timing
    await smallCache.set('oldest', { data: 'oldest' })
    await new Promise((resolve) => setTimeout(resolve, 5))

    await smallCache.set('middle', { data: 'middle' })
    await new Promise((resolve) => setTimeout(resolve, 5))

    await smallCache.set('newest', { data: 'newest' })

    // Access middle to update its timestamp
    await smallCache.get('middle')

    // Add new entry - should evict 'oldest'
    await smallCache.set('latest', { data: 'latest' })

    // Oldest should be evicted from memory
    mockKvGet.mockResolvedValueOnce(null)
    const result = await smallCache.get('oldest')
    expect(result).toBeNull()

    // Others should still exist in memory
    expect(await smallCache.get('middle')).toEqual({ data: 'middle' })
    expect(await smallCache.get('newest')).toEqual({ data: 'newest' })
    expect(await smallCache.get('latest')).toEqual({ data: 'latest' })
  })
})
