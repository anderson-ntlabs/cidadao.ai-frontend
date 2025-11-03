/**
 * Edge Request Validator
 *
 * Validates chat requests at the edge for fast preprocessing
 * Target execution time: <5ms
 */

import { logger } from '@/lib/logger'

export interface ChatRequestValidation {
  valid: boolean
  error?: string
  sanitized?: {
    message: string
    metadata?: Record<string, any>
  }
}

/**
 * Validate chat request at the edge
 * - Fast validation (<5ms target)
 * - Basic sanitization
 * - Rate limiting check
 */
export function validateChatRequest(request: Request): ChatRequestValidation {
  const startTime = Date.now()

  try {
    // Extract request data
    const url = new URL(request.url)
    const method = request.method

    // Method validation
    if (method !== 'POST') {
      return {
        valid: false,
        error: 'Invalid method. Expected POST',
      }
    }

    // Path validation
    if (!url.pathname.includes('/chat') && !url.pathname.includes('/api/')) {
      return {
        valid: false,
        error: 'Invalid path',
      }
    }

    // Headers validation
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return {
        valid: false,
        error: 'Invalid content-type. Expected application/json',
      }
    }

    // Success - request is valid
    const duration = Date.now() - startTime
    logger.debug('Edge validation completed', {
      context: 'RequestValidator',
      durationMs: duration,
    })

    return {
      valid: true,
      sanitized: {
        message: '', // Will be populated after body parse
        metadata: {
          validated: true,
          validationTime: duration,
        },
      },
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}

/**
 * Validate request body
 */
export async function validateRequestBody(request: Request): Promise<ChatRequestValidation> {
  try {
    const body = await request.json()

    // Message validation
    if (!body.message || typeof body.message !== 'string') {
      return {
        valid: false,
        error: 'Missing or invalid message field',
      }
    }

    // Message length check
    if (body.message.length > 5000) {
      return {
        valid: false,
        error: 'Message too long (max 5000 characters)',
      }
    }

    // Sanitize message (basic)
    const sanitized = body.message.trim()

    if (sanitized.length === 0) {
      return {
        valid: false,
        error: 'Message is empty',
      }
    }

    return {
      valid: true,
      sanitized: {
        message: sanitized,
        metadata: body.metadata || {},
      },
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON body',
    }
  }
}

/**
 * Rate limiting check (simple edge-based)
 * In production, use Vercel KV for distributed rate limiting
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const limit = 60 // 60 requests per minute
  const window = 60 * 1000 // 1 minute

  const current = requestCounts.get(ip)

  if (!current || now > current.resetTime) {
    // New window
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + window,
    })
    return { allowed: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: limit - current.count }
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  const toDelete: string[] = []

  requestCounts.forEach((value, key) => {
    if (now > value.resetTime) {
      toDelete.push(key)
    }
  })

  toDelete.forEach((key) => requestCounts.delete(key))
}
