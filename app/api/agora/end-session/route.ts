/**
 * Agora End Session API
 *
 * Endpoint to end Agora sessions via sendBeacon on page close.
 * Uses server-side Supabase client for reliable cleanup.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

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

    // End the session
    const { error } = await supabase
      .from('agora_sessions')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .is('ended_at', null)

    if (error) {
      console.error('[Agora End Session] Error:', error)
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Agora End Session] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
