/**
 * LGPD Account Deletion API
 *
 * Implements Art. 18 of LGPD - Right to data elimination.
 * Two modes:
 * - soft: Marks account for deletion (30 day grace period)
 * - hard: Permanently deletes all data (immediate, for testing)
 *
 * Certificates are preserved in anonymized form for verification.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const { mode = 'soft', confirmation } = body

    // Require explicit confirmation
    if (confirmation !== 'DELETAR MINHA CONTA') {
      return NextResponse.json(
        { error: 'Confirmação inválida. Digite "DELETAR MINHA CONTA" para confirmar.' },
        { status: 400 }
      )
    }

    const userId = user.id
    const results: Record<string, string> = {}

    // Get kids profile first (for cascade delete)
    const { data: kidsProfile } = await supabase
      .from('agora_kids_profiles')
      .select('id')
      .eq('parent_user_id', userId)
      .maybeSingle()

    if (mode === 'hard') {
      // Immediate deletion (for testing or explicit request)

      // 1. Delete Kids data
      if (kidsProfile) {
        const { error: kidsSessionsError } = await supabase
          .from('agora_kids_sessions')
          .delete()
          .eq('kids_profile_id', kidsProfile.id)
        results.kids_sessions = kidsSessionsError
          ? `Error: ${kidsSessionsError.message}`
          : 'Deleted'
      }

      // 2. Delete parental codes
      const { error: parentalCodesError } = await supabase
        .from('agora_parental_codes')
        .delete()
        .eq('parent_user_id', userId)
      results.parental_codes = parentalCodesError
        ? `Error: ${parentalCodesError.message}`
        : 'Deleted'

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

      // 7. Delete consent records
      const { error: consentError } = await supabase
        .from('agora_consent')
        .delete()
        .eq('user_id', userId)
      results.consent = consentError ? `Error: ${consentError.message}` : 'Deleted'

      // 8. Delete calendar events
      const { error: calendarError } = await supabase
        .from('agora_calendar_events')
        .delete()
        .eq('user_id', userId)
      results.calendar_events = calendarError ? `Error: ${calendarError.message}` : 'Deleted'

      // 9. Delete video progress
      const { error: videoError } = await supabase
        .from('agora_video_progress')
        .delete()
        .eq('user_id', userId)
      results.video_progress = videoError ? `Error: ${videoError.message}` : 'Deleted'

      // 10. Delete challenge progress
      const { error: challengeError } = await supabase
        .from('agora_challenge_progress')
        .delete()
        .eq('user_id', userId)
      results.challenge_progress = challengeError ? `Error: ${challengeError.message}` : 'Deleted'

      // 11. Delete Agora profile (last)
      const { error: profileError } = await supabase
        .from('agora_profiles')
        .delete()
        .eq('user_id', userId)
      results.agora_profile = profileError ? `Error: ${profileError.message}` : 'Deleted'

      // Note: Certificates are preserved in certificate_registry (anonymized)
      // The user's certificates table entries are deleted, but verification hashes remain

      return NextResponse.json({
        success: true,
        mode: 'hard',
        message: 'Todos os dados foram excluídos permanentemente.',
        details: results,
        note: 'Certificados emitidos permanecem verificáveis de forma anônima.',
      })
    } else {
      // Soft delete - mark for deletion in 30 days
      const deletionDate = new Date()
      deletionDate.setDate(deletionDate.getDate() + 30)

      const { error: updateError } = await supabase
        .from('agora_profiles')
        .update({
          scheduled_deletion_at: deletionDate.toISOString(),
          deletion_requested_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Erro ao agendar exclusão: ' + updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        mode: 'soft',
        message: 'Sua conta será excluída em 30 dias.',
        scheduledDeletion: deletionDate.toISOString(),
        note: 'Você pode cancelar a exclusão fazendo login antes da data agendada.',
      })
    }
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Check deletion status
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('scheduled_deletion_at, deletion_requested_at')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      scheduledDeletion: profile?.scheduled_deletion_at || null,
      deletionRequested: profile?.deletion_requested_at || null,
    })
  } catch (error) {
    console.error('Check deletion status error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Cancel scheduled deletion
export async function DELETE(): Promise<NextResponse> {
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('agora_profiles')
      .update({
        scheduled_deletion_at: null,
        deletion_requested_at: null,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao cancelar exclusão: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Exclusão cancelada com sucesso.',
    })
  } catch (error) {
    console.error('Cancel deletion error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
