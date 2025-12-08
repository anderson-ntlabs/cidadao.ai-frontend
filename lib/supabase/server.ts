import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const secureCookieOptions = getSecureCookieOptions()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // Merge Supabase options with our secure defaults
            cookiesToSet.forEach(({ name, value, options }) => {
              const mergedOptions = {
                ...secureCookieOptions,
                ...options, // Allow Supabase to override maxAge, etc.
              }
              cookieStore.set(name, value, mergedOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
