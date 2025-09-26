import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Always redirect to /pt/home after successful auth
  const next = '/pt/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Force redirect to authenticated home
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/pt/home`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/pt/home`)
      } else {
        return NextResponse.redirect(`${origin}/pt/home`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}