/**
 * LGPD Data Export API
 *
 * Implements Art. 18 of LGPD - Right to data portability.
 * Exports all user data in JSON format.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(): Promise<NextResponse> {
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = user.id
    const exportData: Record<string, unknown> = {
      _metadata: {
        exportDate: new Date().toISOString(),
        userId,
        email: user.email,
        format: 'LGPD Data Export',
        version: '1.0',
      },
      auth: {
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        provider: user.app_metadata?.provider,
      },
    }

    // 1. Agora Profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profile) {
      exportData.agoraProfile = profile
    }

    // 2. XP Transactions
    const { data: xpTransactions } = await supabase
      .from('agora_xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (xpTransactions?.length) {
      exportData.xpTransactions = xpTransactions
      exportData.xpSummary = {
        totalTransactions: xpTransactions.length,
        totalXP: xpTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      }
    }

    // 3. Sessions
    const { data: sessions } = await supabase
      .from('agora_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (sessions?.length) {
      exportData.studySessions = sessions
      exportData.sessionsSummary = {
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      }
    }

    // 4. Diary Entries
    const { data: diaryEntries } = await supabase
      .from('agora_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (diaryEntries?.length) {
      exportData.diaryEntries = diaryEntries
    }

    // 5. Video Progress
    const { data: videoProgress } = await supabase
      .from('agora_video_progress')
      .select('*')
      .eq('user_id', userId)

    if (videoProgress?.length) {
      exportData.videoProgress = videoProgress
    }

    // 6. Challenge Progress
    const { data: challengeProgress } = await supabase
      .from('agora_challenge_progress')
      .select('*')
      .eq('user_id', userId)

    if (challengeProgress?.length) {
      exportData.challengeProgress = challengeProgress
    }

    // 7. Calendar Events
    const { data: calendarEvents } = await supabase
      .from('agora_calendar_events')
      .select('*')
      .eq('user_id', userId)

    if (calendarEvents?.length) {
      exportData.calendarEvents = calendarEvents
    }

    // 8. Consent Records
    const { data: consent } = await supabase.from('agora_consent').select('*').eq('user_id', userId)

    if (consent?.length) {
      exportData.consentHistory = consent
    }

    // 9. Kids Profile (if parent)
    const { data: kidsProfile } = await supabase
      .from('agora_kids_profiles')
      .select('*')
      .eq('parent_user_id', userId)
      .maybeSingle()

    if (kidsProfile) {
      exportData.kidsProfile = {
        ...kidsProfile,
        // Mask parental code for security
        parental_code: '******',
      }

      // 10. Kids Sessions
      const { data: kidsSessions } = await supabase
        .from('agora_kids_sessions')
        .select('*')
        .eq('kids_profile_id', kidsProfile.id)
        .order('created_at', { ascending: false })

      if (kidsSessions?.length) {
        exportData.kidsSessions = kidsSessions
      }
    }

    // Create filename
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `cidadao-ai-dados-${dateStr}.json`

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
