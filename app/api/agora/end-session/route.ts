/**
 * Agora End Session API
 *
 * Endpoint to end Agora sessions via sendBeacon on page close.
 * Uses server-side Supabase client for reliable cleanup.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-10 - Support ending session without sessionId
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface EndSessionBody {
  sessionId?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let sessionId: string | undefined

    // Try to parse body (sendBeacon may send empty or minimal data)
    try {
      const body = (await request.json()) as EndSessionBody
      sessionId = body.sessionId
    } catch {
      // Body parsing failed, continue without sessionId
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

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // End session by ID or by user (most recent open session)
    if (sessionId) {
      // End specific session
      const { error } = await supabase
        .from('agora_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id) // Security: ensure user owns session
        .is('ended_at', null)

      if (error) {
        console.error('[Agora End Session] Error ending specific session:', error)
      }
    } else {
      // End all open sessions for user (cleanup on page close)
      const { error } = await supabase
        .from('agora_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('ended_at', null)

      if (error) {
        console.error('[Agora End Session] Error ending user sessions:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Agora End Session] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
