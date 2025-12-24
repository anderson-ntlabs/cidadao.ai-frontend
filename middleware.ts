import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { detectRegion } from '@/lib/edge/geo-detector'
import { buildCSP, getCSPConfig } from '@/lib/security/csp.config'
// Edge-safe rate limiting (no @vercel/kv or Sentry imports)
import { rateLimit, rateLimitConfigs } from '@/lib/security/rate-limit.edge'

/**
 * Static landing pages that bypass middleware processing
 * These pages have all headers configured in vercel.json
 * Skipping middleware reduces TTFB by ~200-500ms
 */
const STATIC_LANDING_PAGES = new Set([
  '/pt',
  '/en',
  '/pt/about',
  '/pt/agents',
  '/pt/manifesto',
  '/pt/cookies',
  '/pt/privacy',
  '/pt/terms',
  '/en/about',
  '/en/agents',
  '/en/manifesto',
  '/en/cookies',
  '/en/privacy',
  '/en/terms',
])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PERFORMANCE: Fast path for static landing pages
  // These pages have CSP and security headers in vercel.json
  if (STATIC_LANDING_PAGES.has(pathname)) {
    return NextResponse.next()
  }

  // Rate limiting for specific endpoints
  if (pathname.startsWith('/api/chat')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.chat)(request)
    if (rateLimitResponse) return rateLimitResponse
  } else if (pathname.startsWith('/api/auth')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.auth)(request)
    if (rateLimitResponse) return rateLimitResponse
  } else if (pathname.startsWith('/api/export')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.export)(request)
    if (rateLimitResponse) return rateLimitResponse
  } else if (pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.api)(request)
    if (rateLimitResponse) return rateLimitResponse
  }

  // Edge optimization: Add geo headers
  const geoLocation = detectRegion(request)

  // Update session (Supabase auth)
  const response = await updateSession(request)

  // Add custom geo headers to response
  response.headers.set('X-User-Region', geoLocation.region)
  if (geoLocation.country) {
    response.headers.set('X-User-Country', geoLocation.country)
  }

  // Security Headers

  /**
   * Content Security Policy
   *
   * Uses environment-aware CSP configuration from csp.config.ts
   *
   * Note on 'unsafe-eval':
   * - Required by Next.js for webpack hot module replacement (HMR) in dev
   * - Required by Next.js dynamic imports and code splitting in production
   * - Cannot be removed without breaking core Next.js functionality
   *
   * Note on 'unsafe-inline':
   * - Required by Next.js for inline styles and scripts
   * - Future improvement: Use nonce-based CSP when Next.js fully supports it
   *
   * VLibras exception:
   * - Brazilian government accessibility tool (LIBRAS translation)
   * - Requires script-src, frame-src, img-src, and connect-src permissions
   * - Official service: vlibras.gov.br
   */
  const cspConfig = getCSPConfig()
  const cspHeader = buildCSP(cspConfig)
  response.headers.set('Content-Security-Policy', cspHeader)

  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // HTTPS enforcement (already in vercel.json, but adding here for redundancy)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // Referrer policy for privacy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  // Allow microphone for voice chat feature
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(self), interest-cohort=()'
  )

  // Remove server header for security
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *
     * Static assets:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, manifest.json, sw.js (PWA files)
     * - images (.svg, .png, .jpg, .jpeg, .gif, .webp)
     * - agents/ directory (agent avatars)
     *
     * PERFORMANCE OPTIMIZATION - Landing pages bypass middleware:
     * These pages have CSP headers configured in vercel.json
     * Bypassing middleware reduces TTFB by ~200-500ms
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|agents/|forum-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
  /*
   * Note: Landing pages (/pt, /en) still pass through middleware
   * but updateSession() returns early for non-protected routes.
   * For even faster TTFB, consider Edge Config or ISR.
   */
}
