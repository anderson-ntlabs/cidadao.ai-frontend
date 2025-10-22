import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/pt/home'

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

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth exchange error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      // Determine correct redirect URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const redirectUrl = isLocalEnv
        ? `${requestUrl.origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${requestUrl.origin}${next}`

      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error('Unexpected OAuth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Unexpected error`)
    }
  }

  console.error('OAuth callback missing code parameter')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=No authorization code`)
}