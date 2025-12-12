/**
 * Kids End Session API
 *
 * Endpoint to end Kids sessions via sendBeacon on page close.
 * Also clears local tracker data through response.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find active kids session for this user's profile
    const { data: profile } = await supabase
      .from('agora_kids_profiles')
      .select('id')
      .eq('parent_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!profile) {
      return NextResponse.json({ success: true, message: 'No active profile' })
    }

    // End any active sessions
    const { error } = await supabase
      .from('agora_kids_sessions')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('kids_profile_id', profile.id)
      .is('ended_at', null)

    if (error) {
      console.error('[Kids End Session] Error:', error)
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Kids End Session] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
