import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  console.log('🔄 OAuth Callback: Started')

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/pt/home'

  console.log('📋 Callback params:', {
    hasCode: !!code,
    next,
    origin: requestUrl.origin,
    fullUrl: request.url
  })

  if (code) {
    console.log('✅ Code present, attempting to exchange for session')

    try {
      const cookieStore = await cookies()

      // Create Supabase client with proper cookie handling
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
                console.error('❌ Error setting cookies:', error)
              }
            },
          },
        }
      )

      console.log('🔐 Supabase client created with cookie support')

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Exchange code error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      console.log('✅ Session exchanged successfully')
      console.log('📊 Session data:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
        email: data.user?.email
      })

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      const redirectUrl = isLocalEnv
        ? `${requestUrl.origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${requestUrl.origin}${next}`

      console.log('🎯 Redirecting to:', redirectUrl)

      // Create response with redirect
      const response = NextResponse.redirect(redirectUrl)

      // Ensure cookies are set in the response
      console.log('🍪 Setting session cookies in response')

      return response
    } catch (error) {
      console.error('❌ Unexpected error in callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=Unexpected error`)
    }
  }

  console.error('❌ No code in callback URL')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=No code provided`)
}