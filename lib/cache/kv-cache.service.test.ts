/**
 * Tests for KV Cache Service
 *
 * Note: These tests require Vercel KV to be configured
 * In CI/CD, mock the @vercel/kv module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  KVCacheService,
  TTL_STRATEGIES,
  CACHE_PREFIXES,
  checkRateLimit,
} from './kv-cache.service';

// Mock @vercel/kv
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    mget: vi.fn(),
    keys: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}));

import { kv } from '@vercel/kv';

describe('KVCacheService', () => {
  let cache: KVCacheService;

  beforeEach(() => {
    cache = new KVCacheService();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return value from cache', async () => {
      const mockEntry = {
        data: 'test-value',
        timestamp: Date.now(),
        ttl: 300,
        hits: 0,
      };

      vi.mocked(kv.get).mockResolvedValue(mockEntry);
      vi.mocked(kv.set).mockResolvedValue('OK');

      const result = await cache.get('test-key');

      expect(result).toBe('test-value');
      expect(kv.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for missing key', async () => {
      vi.mocked(kv.get).mockResolvedValue(null);

      const result = await cache.get('missing-key');

      expect(result).toBeNull();
    });

    it('should return null for expired entry', async () => {
      const mockEntry = {
        data: 'test-value',
        timestamp: Date.now() - 400000, // 400 seconds ago
        ttl: 300, // 5 minutes TTL
        hits: 0,
      };

      vi.mocked(kv.get).mockResolvedValue(mockEntry);
      vi.mocked(kv.del).mockResolvedValue(1);

      const result = await cache.get('expired-key');

      expect(result).toBeNull();
      expect(kv.del).toHaveBeenCalledWith('expired-key');
    });

    it('should increment hit counter on access', async () => {
      const mockEntry = {
        data: 'test-value',
        timestamp: Date.now(),
        ttl: 300,
        hits: 5,
      };

      vi.mocked(kv.get).mockResolvedValue(mockEntry);
      vi.mocked(kv.set).mockResolvedValue('OK');

      await cache.get('test-key');

      expect(kv.set).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({ hits: 6 }),
        { ex: 300 }
      );
    });
  });

  describe('set', () => {
    it('should set value with TTL', async () => {
      vi.mocked(kv.set).mockResolvedValue('OK');

      const result = await cache.set('test-key', 'test-value', TTL_STRATEGIES.SHORT);

      expect(result).toBe(true);
      expect(kv.set).toHaveBeenCalledWith(
        'test-key',
        expect.objectContaining({
          data: 'test-value',
          ttl: TTL_STRATEGIES.SHORT,
        }),
        { ex: TTL_STRATEGIES.SHORT }
      );
    });

    it('should use default TTL if not provided', async () => {
      vi.mocked(kv.set).mockResolvedValue('OK');

      await cache.set('test-key', 'test-value');

      expect(kv.set).toHaveBeenCalledWith(
        'test-key',
        expect.any(Object),
        { ex: TTL_STRATEGIES.SHORT }
      );
    });

    it('should handle set errors gracefully', async () => {
      vi.mocked(kv.set).mockRejectedValue(new Error('KV error'));

      const result = await cache.set('test-key', 'test-value');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      vi.mocked(kv.del).mockResolvedValue(1);

      const result = await cache.delete('test-key');

      expect(result).toBe(true);
      expect(kv.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      vi.mocked(kv.exists).mockResolvedValue(1);

      const result = await cache.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      vi.mocked(kv.exists).mockResolvedValue(0);

      const result = await cache.exists('missing-key');

      expect(result).toBe(false);
    });
  });

  describe('increment', () => {
    it('should increment counter', async () => {
      vi.mocked(kv.incr).mockResolvedValue(5);

      const result = await cache.increment('counter-key');

      expect(result).toBe(5);
      expect(kv.incr).toHaveBeenCalledWith('counter-key');
    });

    it('should set TTL for new counter', async () => {
      vi.mocked(kv.incr).mockResolvedValue(1);
      vi.mocked(kv.expire).mockResolvedValue(1);

      await cache.increment('counter-key', 60);

      expect(kv.expire).toHaveBeenCalledWith('counter-key', 60);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      const stats = cache.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
    });
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request within limit', async () => {
    vi.mocked(kv.incr).mockResolvedValue(1);
    vi.mocked(kv.expire).mockResolvedValue(1);
    vi.mocked(kv.ttl).mockResolvedValue(60);

    const result = await checkRateLimit('test-user', 60, 60);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('should block request exceeding limit', async () => {
    vi.mocked(kv.incr).mockResolvedValue(61);
    vi.mocked(kv.ttl).mockResolvedValue(30);

    const result = await checkRateLimit('test-user', 60, 60);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should fail open on cache error', async () => {
    vi.mocked(kv.incr).mockRejectedValue(new Error('KV error'));

    const result = await checkRateLimit('test-user', 60, 60);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(60);
  });
});
