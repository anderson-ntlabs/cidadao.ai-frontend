import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { detectRegion } from '@/lib/edge/geo-detector'
import { buildCSP, generateNonce, getCSPConfig } from '@/lib/security/csp.config'
import { rateLimit, rateLimitConfigs } from '@/lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for specific endpoints
  if (pathname.startsWith('/api/chat')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.chat)(request);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (pathname.startsWith('/api/auth')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.auth)(request);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (pathname.startsWith('/api/export')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.export)(request);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.api)(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Edge optimization: Add geo headers
  const geoLocation = detectRegion(request);

  // Update session (Supabase auth)
  const response = await updateSession(request);

  // Add custom geo headers to response
  response.headers.set('X-User-Region', geoLocation.region);
  if (geoLocation.country) {
    response.headers.set('X-User-Country', geoLocation.country);
  }

  // Security Headers

  // CSP that allows VLibras, Spotify embeds, and other third-party services
  const simpleCsp = "default-src 'self' https:; frame-src 'self' https://open.spotify.com https://vlibras.gov.br; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self' https: blob:;";
  response.headers.set('Content-Security-Policy', simpleCsp);

  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // HTTPS enforcement (already in vercel.json, but adding here for redundancy)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Referrer policy for privacy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );

  // Remove server header for security
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}