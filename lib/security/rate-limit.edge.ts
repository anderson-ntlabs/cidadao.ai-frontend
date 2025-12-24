/**
 * Edge-Safe Rate Limiting
 *
 * Lightweight rate limiting for Edge Functions (middleware).
 * Uses in-memory storage only - no @vercel/kv or Sentry imports.
 *
 * For distributed rate limiting across serverless instances,
 * use the regular rate-limit.ts in API routes.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-24
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in milliseconds */
  window: number
  /** Message to return when rate limit is exceeded */
  message?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory rate limit store
 * Note: This resets on each serverless cold start
 * For distributed rate limiting, use @vercel/kv in API routes
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Periodic cleanup of expired entries (every 60 seconds)
 */
let cleanupScheduled = false
function scheduleCleanup(): void {
  if (cleanupScheduled || typeof setInterval === 'undefined') return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 60 * 1000)
}

/**
 * Extract client identifier from request
 */
function getClientId(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const userId = request.headers.get('x-user-id')
  return userId || ip
}

/**
 * Check if request should be rate limited (synchronous, in-memory)
 */
function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  scheduleCleanup()

  const clientId = getClientId(request)
  const now = Date.now()
  const key = `${clientId}:${request.nextUrl.pathname}`

  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.window,
    }
    rateLimitStore.set(key, entry)
  }

  entry.count++

  const allowed = entry.count <= config.limit
  const remaining = Math.max(0, config.limit - entry.count)

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit middleware wrapper
 * Returns null if allowed, NextResponse if blocked
 */
export function rateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const { allowed, remaining, resetTime } = checkRateLimit(request, config)

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

      return new NextResponse(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
          },
        }
      )
    }

    return null
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  /** API endpoints: 100 requests per minute */
  api: {
    limit: 100,
    window: 60 * 1000,
    message: 'API rate limit exceeded. Please try again later.',
  },

  /** Chat endpoint: 20 messages per minute */
  chat: {
    limit: 20,
    window: 60 * 1000,
    message: 'Too many chat messages. Please wait before sending more.',
  },

  /** Authentication: 5 attempts per 15 minutes */
  auth: {
    limit: 5,
    window: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again later.',
  },

  /** Export: 10 exports per hour */
  export: {
    limit: 10,
    window: 60 * 60 * 1000,
    message: 'Export limit exceeded. Please try again later.',
  },
}
