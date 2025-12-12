/**
 * Rate Limiting Tests
 *
 * Tests for rate limiting middleware and utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock KV cache service
vi.mock('@/lib/cache/kv-cache.service', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 99,
    resetTime: Date.now() + 60000,
  }),
}))

import {
  checkRateLimit,
  checkRateLimitAsync,
  rateLimit,
  rateLimitConfigs,
  addRateLimitHeaders,
} from './rate-limit'

// Helper to create mock NextRequest
function createMockRequest(
  options: {
    pathname?: string
    ip?: string
    userId?: string
  } = {}
): NextRequest {
  const { pathname = '/api/test', ip = '127.0.0.1', userId } = options

  const headers = new Headers()
  headers.set('x-forwarded-for', ip)
  if (userId) {
    headers.set('x-user-id', userId)
  }

  return {
    headers,
    nextUrl: {
      pathname,
    },
  } as unknown as NextRequest
}

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment
    delete process.env.KV_REST_API_URL
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const request = createMockRequest()
      const config = { limit: 10, window: 60000 }

      const result = checkRateLimit(request, config)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('should block requests exceeding limit', () => {
      const request = createMockRequest()
      const config = { limit: 3, window: 60000 }

      // Make requests up to and past the limit
      checkRateLimit(request, config)
      checkRateLimit(request, config)
      checkRateLimit(request, config)
      const result = checkRateLimit(request, config)

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track different clients separately', () => {
      const request1 = createMockRequest({ ip: '192.168.1.1' })
      const request2 = createMockRequest({ ip: '192.168.1.2' })
      const config = { limit: 2, window: 60000 }

      // First client uses both requests
      checkRateLimit(request1, config)
      checkRateLimit(request1, config)
      const result1 = checkRateLimit(request1, config)

      // Second client should still have quota
      const result2 = checkRateLimit(request2, config)

      expect(result1.allowed).toBe(false)
      expect(result2.allowed).toBe(true)
    })

    it('should track different paths separately', () => {
      const request1 = createMockRequest({ pathname: '/api/chat' })
      const request2 = createMockRequest({ pathname: '/api/users' })
      const config = { limit: 2, window: 60000 }

      // Exhaust limit on first path
      checkRateLimit(request1, config)
      checkRateLimit(request1, config)
      const result1 = checkRateLimit(request1, config)

      // Second path should still have quota
      const result2 = checkRateLimit(request2, config)

      expect(result1.allowed).toBe(false)
      expect(result2.allowed).toBe(true)
    })

    it('should use user ID when available', () => {
      const request1 = createMockRequest({ ip: '192.168.1.1', userId: 'user-123' })
      const request2 = createMockRequest({ ip: '192.168.1.2', userId: 'user-123' })
      const config = { limit: 2, window: 60000 }

      // Same user, different IPs - should share quota
      checkRateLimit(request1, config)
      checkRateLimit(request2, config)
      const result = checkRateLimit(request1, config)

      expect(result.allowed).toBe(false)
    })

    it('should return correct reset time', () => {
      const request = createMockRequest()
      const config = { limit: 10, window: 60000 }
      const now = Date.now()

      const result = checkRateLimit(request, config)

      expect(result.resetTime).toBeGreaterThan(now)
      expect(result.resetTime).toBeLessThanOrEqual(now + config.window + 100)
    })
  })

  describe('checkRateLimitAsync', () => {
    it('should use in-memory when KV is not available', async () => {
      const request = createMockRequest()
      const config = { limit: 10, window: 60000 }

      const result = await checkRateLimitAsync(request, config)

      expect(result.allowed).toBe(true)
    })

    it('should use KV when available', async () => {
      process.env.KV_REST_API_URL = 'https://kv.example.com'

      const { checkRateLimit: kvCheckRateLimit } = await import('@/lib/cache/kv-cache.service')
      vi.mocked(kvCheckRateLimit).mockResolvedValue({
        allowed: true,
        remaining: 50,
        resetTime: Date.now() + 60000,
      })

      const request = createMockRequest()
      const config = { limit: 100, window: 60000 }

      const result = await checkRateLimitAsync(request, config)

      expect(result.allowed).toBe(true)
      expect(kvCheckRateLimit).toHaveBeenCalled()
    })
  })

  describe('rateLimit middleware', () => {
    it('should return null when request is allowed', () => {
      const middleware = rateLimit({ limit: 10, window: 60000 })
      const request = createMockRequest()

      const result = middleware(request)

      expect(result).toBeNull()
    })

    it('should return 429 response when rate limited', () => {
      const middleware = rateLimit({ limit: 1, window: 60000 })
      const request = createMockRequest()

      // First request allowed
      middleware(request)

      // Second request blocked
      const result = middleware(request)

      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(429)
    })

    it('should include custom message in response', () => {
      const middleware = rateLimit({
        limit: 1,
        window: 60000,
        message: 'Custom rate limit message',
      })
      const request = createMockRequest()

      middleware(request) // First request
      const result = middleware(request) // Second request blocked

      expect(result).toBeInstanceOf(NextResponse)
    })

    it('should include rate limit headers in 429 response', async () => {
      const middleware = rateLimit({ limit: 1, window: 60000 })
      const request = createMockRequest()

      middleware(request) // First request
      const result = middleware(request) // Second request blocked

      expect(result?.headers.get('X-RateLimit-Limit')).toBe('1')
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(result?.headers.get('Retry-After')).toBeDefined()
    })
  })

  describe('rateLimitConfigs', () => {
    it('should have api config', () => {
      expect(rateLimitConfigs.api).toBeDefined()
      expect(rateLimitConfigs.api.limit).toBe(100)
      expect(rateLimitConfigs.api.window).toBe(60000)
    })

    it('should have chat config', () => {
      expect(rateLimitConfigs.chat).toBeDefined()
      expect(rateLimitConfigs.chat.limit).toBe(20)
    })

    it('should have auth config with stricter limits', () => {
      expect(rateLimitConfigs.auth).toBeDefined()
      expect(rateLimitConfigs.auth.limit).toBe(5)
      expect(rateLimitConfigs.auth.window).toBe(15 * 60 * 1000) // 15 minutes
    })

    it('should have export config', () => {
      expect(rateLimitConfigs.export).toBeDefined()
      expect(rateLimitConfigs.export.limit).toBe(10)
    })

    it('should have general config', () => {
      expect(rateLimitConfigs.general).toBeDefined()
      expect(rateLimitConfigs.general.limit).toBe(1000)
    })
  })

  describe('addRateLimitHeaders', () => {
    it('should add rate limit headers to response', () => {
      const request = createMockRequest()
      const response = NextResponse.next()
      const config = { limit: 100, window: 60000 }

      const result = addRateLimitHeaders(response, request, config)

      expect(result.headers.get('X-RateLimit-Limit')).toBe('100')
      expect(result.headers.get('X-RateLimit-Remaining')).toBeDefined()
      expect(result.headers.get('X-RateLimit-Reset')).toBeDefined()
    })
  })
})
