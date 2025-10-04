/**
 * Rate Limiting Middleware
 *
 * Implements token bucket algorithm for API rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  window: number;

  /**
   * Message to return when rate limit is exceeded
   */
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limit store
 * In production, use Redis or Vercel KV for distributed rate limiting
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  60 * 1000
); // Clean every minute

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from headers (Vercel provides these)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // For authenticated requests, use user ID if available
  const userId = request.headers.get('x-user-id');

  return userId || ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `${clientId}:${request.nextUrl.pathname}`;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + config.window,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= config.limit;
  const remaining = Math.max(0, config.limit - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 */
export function rateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(
    request: NextRequest
  ): NextResponse | null {
    const { allowed, remaining, resetTime } = checkRateLimit(request, config);

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

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
      );
    }

    // Request allowed - return null to continue
    return null;
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  /**
   * API endpoints: 100 requests per minute
   */
  api: {
    limit: 100,
    window: 60 * 1000,
    message: 'API rate limit exceeded. Please try again later.',
  },

  /**
   * Chat endpoint: 20 messages per minute
   */
  chat: {
    limit: 20,
    window: 60 * 1000,
    message: 'Too many chat messages. Please wait before sending more.',
  },

  /**
   * Authentication: 5 attempts per 15 minutes
   */
  auth: {
    limit: 5,
    window: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again later.',
  },

  /**
   * Export: 10 exports per hour
   */
  export: {
    limit: 10,
    window: 60 * 60 * 1000,
    message: 'Export limit exceeded. Please try again later.',
  },

  /**
   * General: 1000 requests per hour
   */
  general: {
    limit: 1000,
    window: 60 * 60 * 1000,
    message: 'Rate limit exceeded. Please try again later.',
  },
};

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  config: RateLimitConfig
): NextResponse {
  const { remaining, resetTime } = checkRateLimit(request, config);

  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());

  return response;
}
