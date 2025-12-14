/**
 * Cache Module Index Tests
 */

import { describe, it, expect, vi } from 'vitest'

// Mock multi-layer cache service
vi.mock('./multi-layer-cache.service', () => ({
  multiLayerCache: { get: vi.fn(), set: vi.fn() },
  MultiLayerCacheService: class MockMultiLayerCacheService {},
  cacheChat: vi.fn(),
  getCachedChat: vi.fn(),
  cacheSuggestionsML: vi.fn(),
  getCachedSuggestionsML: vi.fn(),
}))

// Mock kv-cache.service
vi.mock('./kv-cache.service', () => ({
  kvCache: { get: vi.fn(), set: vi.fn() },
  KVCacheService: class MockKVCacheService {},
  TTL_STRATEGIES: { SHORT: 300, MEDIUM: 3600, LONG: 86400 },
  CACHE_PREFIXES: { CHAT: 'chat:', USER: 'user:' },
  cacheChatResponse: vi.fn(),
  getCachedChatResponse: vi.fn(),
  cacheSuggestions: vi.fn(),
  getCachedSuggestions: vi.fn(),
  checkRateLimit: vi.fn(),
}))

// Mock kv-cache
vi.mock('./kv-cache', () => ({
  getFromCache: vi.fn(),
  setInCache: vi.fn(),
  deleteFromCache: vi.fn(),
  getOrSet: vi.fn(),
  invalidatePattern: vi.fn(),
  generateCacheKey: vi.fn(),
  withCache: vi.fn(),
  Cached: vi.fn(),
}))

describe('Cache Module Index', () => {
  describe('Multi-layer cache exports', () => {
    it('should export multiLayerCache', async () => {
      const { multiLayerCache } = await import('./index')
      expect(multiLayerCache).toBeDefined()
    })

    it('should export MultiLayerCacheService', async () => {
      const { MultiLayerCacheService } = await import('./index')
      expect(MultiLayerCacheService).toBeDefined()
    })

    it('should export cacheChat', async () => {
      const { cacheChat } = await import('./index')
      expect(typeof cacheChat).toBe('function')
    })

    it('should export getCachedChat', async () => {
      const { getCachedChat } = await import('./index')
      expect(typeof getCachedChat).toBe('function')
    })

    it('should export cacheSuggestionsML', async () => {
      const { cacheSuggestionsML } = await import('./index')
      expect(typeof cacheSuggestionsML).toBe('function')
    })

    it('should export getCachedSuggestionsML', async () => {
      const { getCachedSuggestionsML } = await import('./index')
      expect(typeof getCachedSuggestionsML).toBe('function')
    })
  })

  describe('KV cache exports', () => {
    it('should export kvCache', async () => {
      const { kvCache } = await import('./index')
      expect(kvCache).toBeDefined()
    })

    it('should export KVCacheService', async () => {
      const { KVCacheService } = await import('./index')
      expect(KVCacheService).toBeDefined()
    })

    it('should export TTL_STRATEGIES', async () => {
      const { TTL_STRATEGIES } = await import('./index')
      expect(TTL_STRATEGIES).toBeDefined()
    })

    it('should export CACHE_PREFIXES', async () => {
      const { CACHE_PREFIXES } = await import('./index')
      expect(CACHE_PREFIXES).toBeDefined()
    })

    it('should export cacheChatResponse', async () => {
      const { cacheChatResponse } = await import('./index')
      expect(typeof cacheChatResponse).toBe('function')
    })

    it('should export getCachedChatResponse', async () => {
      const { getCachedChatResponse } = await import('./index')
      expect(typeof getCachedChatResponse).toBe('function')
    })

    it('should export cacheSuggestions', async () => {
      const { cacheSuggestions } = await import('./index')
      expect(typeof cacheSuggestions).toBe('function')
    })

    it('should export getCachedSuggestions', async () => {
      const { getCachedSuggestions } = await import('./index')
      expect(typeof getCachedSuggestions).toBe('function')
    })

    it('should export checkRateLimit', async () => {
      const { checkRateLimit } = await import('./index')
      expect(typeof checkRateLimit).toBe('function')
    })
  })

  describe('Low-level KV utilities', () => {
    it('should export getFromCache', async () => {
      const { getFromCache } = await import('./index')
      expect(typeof getFromCache).toBe('function')
    })

    it('should export setInCache', async () => {
      const { setInCache } = await import('./index')
      expect(typeof setInCache).toBe('function')
    })

    it('should export deleteFromCache', async () => {
      const { deleteFromCache } = await import('./index')
      expect(typeof deleteFromCache).toBe('function')
    })

    it('should export getOrSet', async () => {
      const { getOrSet } = await import('./index')
      expect(typeof getOrSet).toBe('function')
    })

    it('should export invalidatePattern', async () => {
      const { invalidatePattern } = await import('./index')
      expect(typeof invalidatePattern).toBe('function')
    })

    it('should export generateCacheKey', async () => {
      const { generateCacheKey } = await import('./index')
      expect(typeof generateCacheKey).toBe('function')
    })

    it('should export withCache', async () => {
      const { withCache } = await import('./index')
      expect(typeof withCache).toBe('function')
    })

    it('should export Cached decorator', async () => {
      const { Cached } = await import('./index')
      expect(typeof Cached).toBe('function')
    })
  })
})
