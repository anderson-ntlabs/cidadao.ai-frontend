import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('OAuthCallback')

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/pt/app'

  logger.info('OAuth callback received', {
    hasCode: !!code,
    nextUrl: next,
    requestUrl: requestUrl.href,
  })

  if (code) {
    try {
      const cookieStore = await cookies()

      // Track cookies that need to be set on the response
      // This is necessary because NextResponse.redirect() doesn't include
      // cookies set via cookieStore.set() automatically
      const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

      // Create Supabase client with proper cookie handling for route handlers
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookies) {
              try {
                cookies.forEach(({ name, value, options }) => {
                  // Set on cookieStore for immediate availability
                  cookieStore.set(name, value, options)
                  // Also track for setting on redirect response
                  cookiesToSet.push({ name, value, options })
                })
              } catch (error) {
                logger.error('OAuth callback cookie error', error)
              }
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        logger.error('Exchange error', { message: error.message })
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`
        )
      }

      logger.info('Session created successfully', {
        userId: data.session?.user.id,
        email: data.session?.user.email,
        expiresAt: data.session?.expires_at,
        cookiesCount: cookiesToSet.length,
      })

      // Determine correct redirect URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // Add a timestamp to help client detect fresh OAuth completion
      const redirectPath = `${next}${next.includes('?') ? '&' : '?'}oauth_complete=${Date.now()}`

      const redirectUrl = isLocalEnv
        ? `${requestUrl.origin}${redirectPath}`
        : forwardedHost
          ? `https://${forwardedHost}${redirectPath}`
          : `${requestUrl.origin}${redirectPath}`

      logger.info('Redirecting to', { url: redirectUrl })

      // Create response with redirect
      const response = NextResponse.redirect(redirectUrl)

      // CRITICAL: Copy all session cookies to the redirect response
      // Without this, the session cookies won't be sent to the browser
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
        logger.debug('Setting cookie on response', { name, valueLength: value.length })
      })

      // Set a cookie to indicate OAuth just completed successfully
      response.cookies.set('oauth_session_ready', 'true', {
        path: '/',
        maxAge: 30,
        httpOnly: false,
        sameSite: 'lax',
      })

      return response
    } catch (error) {
      logger.error('Unexpected OAuth callback error', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Unexpected error`)
    }
  }

  logger.error('OAuth callback missing code parameter')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=No authorization code`)
}
