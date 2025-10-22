import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔄 OAuth Callback: Started')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/pt/home'

  console.log('📋 Callback params:', {
    hasCode: !!code,
    next,
    origin,
    fullUrl: request.url
  })

  if (code) {
    console.log('✅ Code present, attempting to exchange for session')

    try {
      const supabase = await createClient()
      console.log('🔐 Supabase client created')

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Exchange code error:', error)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
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
        ? `${origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`

      console.log('🎯 Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error('❌ Unexpected error in callback:', error)
      return NextResponse.redirect(`${origin}/auth/error?message=Unexpected error`)
    }
  }

  console.error('❌ No code in callback URL')
  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error?message=No code provided`)
}