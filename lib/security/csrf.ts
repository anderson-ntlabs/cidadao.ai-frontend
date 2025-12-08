/**
 * CSRF Protection
 *
 * Implements double-submit cookie pattern for CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * CSRF token cookie name
 */
const CSRF_COOKIE_NAME = 'csrf_token'

/**
 * CSRF token header name
 */
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generate CSRF token using cryptographically secure random values
 */
export function generateCSRFToken(): string {
  // Prefer crypto.randomUUID() - available in modern browsers and Node.js 19+
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback to crypto.getRandomValues() - more widely available than randomUUID
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  // Last resort fallback for very old environments (should never happen in practice)
  // This is NOT cryptographically secure but prevents runtime errors
  console.warn('CSRF: Using insecure Math.random() fallback - upgrade your environment')
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

/**
 * Set CSRF token in cookie
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value
}

/**
 * Get CSRF token from header
 */
export function getCSRFTokenFromHeader(request: NextRequest): string | undefined {
  return request.headers.get(CSRF_HEADER_NAME) || undefined
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFTokenFromCookie(request)
  const headerToken = getCSRFTokenFromHeader(request)

  // Both tokens must exist and match
  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const { method, nextUrl } = request

  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null
  }

  // Skip CSRF check for specific paths (e.g., webhooks, public APIs)
  const skipPaths = ['/api/webhooks', '/api/security/csp-report']

  if (skipPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    return null
  }

  // Verify CSRF token
  if (!verifyCSRFToken(request)) {
    logger.warn('CSRF token verification failed', {
      context: 'CSRF',
      path: nextUrl.pathname,
      method,
      hasCookie: !!getCSRFTokenFromCookie(request),
      hasHeader: !!getCSRFTokenFromHeader(request),
    })

    return new NextResponse(
      JSON.stringify({
        error: 'CSRF token verification failed',
        message: 'Invalid or missing CSRF token',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Token verified - continue
  return null
}

/**
 * Initialize CSRF token for new sessions
 */
export function initializeCSRFToken(request: NextRequest, response: NextResponse): NextResponse {
  const existingToken = getCSRFTokenFromCookie(request)

  if (!existingToken) {
    const newToken = generateCSRFToken()
    setCSRFCookie(response, newToken)

    // Also send token in header for client-side access
    response.headers.set(CSRF_HEADER_NAME, newToken)

    logger.info('CSRF token generated', { context: 'CSRF' })
  }

  return response
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFToken(request: NextRequest): string {
  const token = getCSRFTokenFromCookie(request)

  if (!token) {
    // Generate new token if not exists
    return generateCSRFToken()
  }

  return token
}
