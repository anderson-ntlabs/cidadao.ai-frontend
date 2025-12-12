/**
 * Dev Reset User Endpoint
 *
 * Resets all Agora and Kids data for the authenticated user.
 * ONLY available in development mode.
 *
 * Usage: GET /api/dev/reset-user
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(): Promise<NextResponse> {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

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
      return NextResponse.json({ error: 'Not authenticated. Please login first.' }, { status: 401 })
    }

    const userId = user.id
    const results: Record<string, string> = {}

    // 1. Delete Kids sessions (depends on kids_profile)
    // First get the kids profile ID
    const { data: kidsProfile } = await supabase
      .from('agora_kids_profiles')
      .select('id')
      .eq('parent_user_id', userId)
      .maybeSingle()

    if (kidsProfile) {
      const { error: kidsSessionsError } = await supabase
        .from('agora_kids_sessions')
        .delete()
        .eq('kids_profile_id', kidsProfile.id)

      results.kids_sessions = kidsSessionsError ? `Error: ${kidsSessionsError.message}` : 'Deleted'
    } else {
      results.kids_sessions = 'No kids profile found'
    }

    // 2. Delete parental codes
    const { error: parentalCodesError } = await supabase
      .from('agora_parental_codes')
      .delete()
      .eq('parent_user_id', userId)

    results.parental_codes = parentalCodesError ? `Error: ${parentalCodesError.message}` : 'Deleted'

    // 3. Delete Kids profile
    const { error: kidsProfileError } = await supabase
      .from('agora_kids_profiles')
      .delete()
      .eq('parent_user_id', userId)

    results.kids_profile = kidsProfileError ? `Error: ${kidsProfileError.message}` : 'Deleted'

    // 4. Delete Agora sessions
    const { error: sessionsError } = await supabase
      .from('agora_sessions')
      .delete()
      .eq('user_id', userId)

    results.agora_sessions = sessionsError ? `Error: ${sessionsError.message}` : 'Deleted'

    // 5. Delete XP transactions
    const { error: xpError } = await supabase
      .from('agora_xp_transactions')
      .delete()
      .eq('user_id', userId)

    results.xp_transactions = xpError ? `Error: ${xpError.message}` : 'Deleted'

    // 6. Delete diary entries
    const { error: diaryError } = await supabase
      .from('agora_diary_entries')
      .delete()
      .eq('user_id', userId)

    results.diary_entries = diaryError ? `Error: ${diaryError.message}` : 'Deleted'

    // 7. Delete consent
    const { error: consentError } = await supabase
      .from('agora_consent')
      .delete()
      .eq('user_id', userId)

    results.consent = consentError ? `Error: ${consentError.message}` : 'Deleted'

    // 8. Delete Agora profile (last, as other tables may reference it)
    const { error: profileError } = await supabase
      .from('agora_profiles')
      .delete()
      .eq('user_id', userId)

    results.agora_profile = profileError ? `Error: ${profileError.message}` : 'Deleted'

    // 9. Delete calendar events
    const { error: calendarError } = await supabase
      .from('agora_calendar_events')
      .delete()
      .eq('user_id', userId)

    results.calendar_events = calendarError ? `Error: ${calendarError.message}` : 'Deleted'

    // 10. Delete video progress
    const { error: videoError } = await supabase
      .from('agora_video_progress')
      .delete()
      .eq('user_id', userId)

    results.video_progress = videoError ? `Error: ${videoError.message}` : 'Deleted'

    // 11. Delete challenge progress
    const { error: challengeError } = await supabase
      .from('agora_challenge_progress')
      .delete()
      .eq('user_id', userId)

    results.challenge_progress = challengeError ? `Error: ${challengeError.message}` : 'Deleted'

    return NextResponse.json({
      success: true,
      message: `All Agora data reset for user ${user.email}`,
      userId,
      email: user.email,
      results,
      instructions: [
        '1. Clear your browser localStorage (or use incognito)',
        '2. Refresh the page',
        '3. You will see the first-time user experience again',
      ],
    })
  } catch (error) {
    console.error('Reset user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
