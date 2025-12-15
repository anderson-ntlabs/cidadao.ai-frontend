import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Secure cookie options for auth tokens
 *
 * Security features:
 * - httpOnly: Prevents XSS attacks from accessing tokens via JavaScript
 * - secure: Only sends cookies over HTTPS in production
 * - sameSite: 'lax' prevents CSRF while allowing navigation requests
 * - path: '/' ensures cookies are available for all routes
 */
function getSecureCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    // Max age is set by Supabase based on token expiration
  }
}

/**
 * Routes that require authentication
 * Users without valid session will be redirected to login
 */
const PROTECTED_ROUTES = ['/pt/app', '/pt/agora']

/**
 * Routes that should redirect authenticated users
 * (e.g., login pages when already logged in)
 */
const AUTH_ROUTES = ['/pt/login', '/en/login', '/pt/agora/login']

/**
 * Public routes that bypass auth checks entirely
 */
const PUBLIC_ROUTES = [
  '/auth/callback',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/pt/agora/verificar', // Public certificate verification page
  '/en/agora/verificar',
]

/**
 * Check if pathname matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth check for public routes (static assets)
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return supabaseResponse
  }

  // Skip auth check in E2E test mode (development only)
  if (
    process.env.NODE_ENV === 'development' &&
    (process.env.PLAYWRIGHT_TEST_BASE_URL || request.headers.get('x-playwright-test'))
  ) {
    return supabaseResponse
  }

  // PERFORMANCE OPTIMIZATION: Check if route needs auth BEFORE calling Supabase
  // This avoids network calls to Supabase for public pages like /pt, /about, etc.
  // AUTH_ROUTES must be checked FIRST to avoid loop
  // (e.g., /pt/agora/login would match /pt/agora in PROTECTED_ROUTES)
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES)
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES)

  // If route doesn't need auth verification, skip Supabase entirely
  // This is the key TTFB optimization - no network call for public pages
  if (!isAuthRoute && !isProtectedRoute) {
    return supabaseResponse
  }

  // Only routes that NEED auth verification reach this point
  const secureCookieOptions = getSecureCookieOptions()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Merge Supabase options with our secure defaults
          cookiesToSet.forEach(({ name, value, options }) => {
            const mergedOptions = {
              ...secureCookieOptions,
              ...options, // Allow Supabase to override maxAge, etc.
            }
            supabaseResponse.cookies.set(name, value, mergedOptions)
          })
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If it's an auth route, only check if user is authenticated (redirect away)
  if (isAuthRoute) {
    if (user) {
      // Redirect authenticated users from auth routes to their dashboard
      const dashboardUrl = pathname.includes('/agora')
        ? new URL('/pt/agora', request.url)
        : new URL('/pt/app', request.url)

      return NextResponse.redirect(dashboardUrl)
    }
    // Not authenticated on auth route = OK, let them see login page
    return supabaseResponse
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !user) {
    // Determine the appropriate login page
    const loginUrl = pathname.startsWith('/pt/agora')
      ? new URL('/pt/agora/login', request.url)
      : new URL('/pt/login', request.url)

    // Store the original URL for redirect after login (except login pages themselves)
    if (!pathname.includes('/login')) {
      loginUrl.searchParams.set('redirect', pathname)
    }

    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
