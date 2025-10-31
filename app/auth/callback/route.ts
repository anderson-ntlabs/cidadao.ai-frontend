import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/pt/app'

  console.log('[OAuth Callback] Request URL:', requestUrl.href)
  console.log('[OAuth Callback] Code present:', !!code)
  console.log('[OAuth Callback] Next parameter:', next)

  if (code) {
    try {
      const cookieStore = await cookies()

      // Create Supabase client with proper cookie handling for route handlers
      // This is required for OAuth callbacks to persist session cookies
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch (error) {
                console.error('OAuth callback cookie error:', error)
              }
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[OAuth Callback] Exchange error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      console.log('[OAuth Callback] Session created successfully:', {
        userId: data.session?.user.id,
        email: data.session?.user.email,
        expiresAt: data.session?.expires_at
      })

      // Determine correct redirect URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const redirectUrl = isLocalEnv
        ? `${requestUrl.origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${requestUrl.origin}${next}`

      console.log('[OAuth Callback] Redirecting to:', redirectUrl)

      // Create response with redirect
      const response = NextResponse.redirect(redirectUrl)

      // Set a cookie to indicate OAuth is in progress
      // This prevents AuthLayout from immediately redirecting to login
      response.cookies.set('oauth_in_progress', 'true', {
        path: '/',
        maxAge: 10, // 10 seconds timeout
        httpOnly: false, // Allow client-side access
        sameSite: 'lax'
      })

      return response
    } catch (error) {
      console.error('Unexpected OAuth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Unexpected error`)
    }
  }

  console.error('OAuth callback missing code parameter')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=No authorization code`)
}