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

      // Set a cookie to indicate OAuth just completed successfully
      // Extended to 30 seconds to handle slow connections
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
