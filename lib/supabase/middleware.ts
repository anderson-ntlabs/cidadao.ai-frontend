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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth check in E2E test mode (development only)
  if (
    process.env.NODE_ENV === 'development' &&
    (process.env.PLAYWRIGHT_TEST_BASE_URL || request.headers.get('x-playwright-test'))
  ) {
    return supabaseResponse
  }

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
  await supabase.auth.getUser()

  return supabaseResponse
}
