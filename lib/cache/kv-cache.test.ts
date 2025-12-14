/**
 * Tests for Vercel KV Cache Utility
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mocks
const mockKvGet = vi.hoisted(() => vi.fn())
const mockKvSet = vi.hoisted(() => vi.fn())
const mockKvDel = vi.hoisted(() => vi.fn())

vi.mock('@vercel/kv', () => ({
  kv: {
    get: mockKvGet,
    set: mockKvSet,
    del: mockKvDel,
  },
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

import {
  getFromCache,
  setInCache,
  deleteFromCache,
  getOrSet,
  invalidatePattern,
  generateCacheKey,
  withCache,
  Cached,
} from './kv-cache'

describe('KV Cache', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv, KV_REST_API_URL: 'https://kv.example.com' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getFromCache', () => {
    it('should return null when KV not configured', async () => {
      delete process.env.KV_REST_API_URL

      const result = await getFromCache('test-key')

      expect(result).toBeNull()
      expect(mockKvGet).not.toHaveBeenCalled()
    })

    it('should return cached value on hit', async () => {
      mockKvGet.mockResolvedValueOnce({ data: 'cached-value' })

      const result = await getFromCache('test-key')

      expect(result).toEqual({ data: 'cached-value' })
      expect(mockKvGet).toHaveBeenCalledWith('test-key')
    })

    it('should return null on cache miss', async () => {
      mockKvGet.mockResolvedValueOnce(null)

      const result = await getFromCache('test-key')

      expect(result).toBeNull()
    })

    it('should return null on KV error', async () => {
      mockKvGet.mockRejectedValueOnce(new Error('KV Error'))

      const result = await getFromCache('test-key')

      expect(result).toBeNull()
    })
  })

  describe('setInCache', () => {
    it('should not call KV when not configured', async () => {
      delete process.env.KV_REST_API_URL

      await setInCache('test-key', { data: 'value' })

      expect(mockKvSet).not.toHaveBeenCalled()
    })

    it('should set value with default TTL', async () => {
      await setInCache('test-key', { data: 'value' })

      expect(mockKvSet).toHaveBeenCalledWith('test-key', { data: 'value' }, { ex: 3600 })
    })

    it('should set value with custom TTL', async () => {
      await setInCache('test-key', { data: 'value' }, { ttl: 600 })

      expect(mockKvSet).toHaveBeenCalledWith('test-key', { data: 'value' }, { ex: 600 })
    })

    it('should handle KV errors gracefully', async () => {
      mockKvSet.mockRejectedValueOnce(new Error('KV Error'))

      await expect(setInCache('test-key', { data: 'value' })).resolves.not.toThrow()
    })
  })

  describe('deleteFromCache', () => {
    it('should not call KV when not configured', async () => {
      delete process.env.KV_REST_API_URL

      await deleteFromCache('test-key')

      expect(mockKvDel).not.toHaveBeenCalled()
    })

    it('should delete value from cache', async () => {
      await deleteFromCache('test-key')

      expect(mockKvDel).toHaveBeenCalledWith('test-key')
    })

    it('should handle KV errors gracefully', async () => {
      mockKvDel.mockRejectedValueOnce(new Error('KV Error'))

      await expect(deleteFromCache('test-key')).resolves.not.toThrow()
    })
  })

  describe('getOrSet', () => {
    it('should return cached value if available', async () => {
      mockKvGet.mockResolvedValueOnce({ cached: true })
      const fetchFn = vi.fn()

      const result = await getOrSet('test-key', fetchFn)

      expect(result).toEqual({ cached: true })
      expect(fetchFn).not.toHaveBeenCalled()
    })

    it('should fetch and cache value on miss', async () => {
      mockKvGet.mockResolvedValueOnce(null)
      const fetchFn = vi.fn().mockResolvedValueOnce({ fresh: true })

      const result = await getOrSet('test-key', fetchFn)

      expect(result).toEqual({ fresh: true })
      expect(fetchFn).toHaveBeenCalled()
      expect(mockKvSet).toHaveBeenCalledWith('test-key', { fresh: true }, { ex: 3600 })
    })

    it('should skip cache when option is set', async () => {
      const fetchFn = vi.fn().mockResolvedValueOnce({ fresh: true })

      const result = await getOrSet('test-key', fetchFn, { skipCache: true })

      expect(result).toEqual({ fresh: true })
      expect(mockKvGet).not.toHaveBeenCalled()
    })
  })

  describe('invalidatePattern', () => {
    it('should not call KV when not configured', async () => {
      delete process.env.KV_REST_API_URL

      await invalidatePattern('user:*')

      // Should not throw
    })

    it('should handle pattern invalidation', async () => {
      await expect(invalidatePattern('user:*')).resolves.not.toThrow()
    })
  })

  describe('generateCacheKey', () => {
    it('should return prefix alone when no params', () => {
      expect(generateCacheKey('api:users')).toBe('api:users')
    })

    it('should return prefix alone when params is empty', () => {
      expect(generateCacheKey('api:users', {})).toBe('api:users')
    })

    it('should generate key with sorted params', () => {
      const key = generateCacheKey('api:users', { id: 123, role: 'admin' })

      expect(key).toBe('api:users:id=123:role=admin')
    })

    it('should sort params alphabetically', () => {
      const key = generateCacheKey('api', { z: 1, a: 2, m: 3 })

      expect(key).toBe('api:a=2:m=3:z=1')
    })
  })

  describe('withCache', () => {
    it('should wrap function with caching', async () => {
      const originalFn = vi.fn().mockResolvedValue({ result: 'data' })
      const keyGenerator = (id: number) => `user:${id}`

      const cachedFn = withCache(originalFn, keyGenerator)

      // First call - cache miss
      mockKvGet.mockResolvedValueOnce(null)
      const result1 = await cachedFn(123)

      expect(result1).toEqual({ result: 'data' })
      expect(originalFn).toHaveBeenCalledWith(123)
      expect(mockKvSet).toHaveBeenCalled()

      // Second call - cache hit
      mockKvGet.mockResolvedValueOnce({ result: 'data' })
      originalFn.mockClear()
      const result2 = await cachedFn(123)

      expect(result2).toEqual({ result: 'data' })
      expect(originalFn).not.toHaveBeenCalled()
    })

    it('should use custom key generator', async () => {
      const originalFn = vi.fn().mockResolvedValue('data')
      const keyGenerator = (a: string, b: number) => `custom:${a}:${b}`

      mockKvGet.mockResolvedValueOnce(null)

      const cachedFn = withCache(originalFn, keyGenerator)
      await cachedFn('test', 42)

      expect(mockKvGet).toHaveBeenCalledWith('custom:test:42')
    })
  })

  describe('Cached decorator', () => {
    it('should be a function', () => {
      expect(typeof Cached).toBe('function')
    })

    it('should return a decorator function', () => {
      const decorator = Cached('test-prefix')
      expect(typeof decorator).toBe('function')
    })

    it('should work as a method decorator', () => {
      const decorator = Cached('user', { ttl: 600 })

      const descriptor = {
        value: async (id: number) => ({ id, name: 'Test' }),
      }

      const result = decorator({}, 'getUser', descriptor)

      expect(result.value).toBeDefined()
      expect(typeof result.value).toBe('function')
    })
  })
})
