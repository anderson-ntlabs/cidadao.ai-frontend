/**
 * Parental Stats API Route
 *
 * Get today's stats for a kids profile.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const kidsProfileId = searchParams.get('kidsProfileId')

    if (!kidsProfileId) {
      return NextResponse.json({ error: 'kidsProfileId é obrigatório' }, { status: 400 })
    }

    // Verify user owns this kids profile
    const { data: kidsProfile, error: profileError } = await supabase
      .from('agora_kids_profiles')
      .select('id, child_name')
      .eq('id', kidsProfileId)
      .eq('parent_user_id', user.id)
      .maybeSingle()

    if (profileError || !kidsProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado ou acesso negado' }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's sessions
    const { data: sessions } = await supabase
      .from('agora_kids_sessions')
      .select('*')
      .eq('kids_profile_id', kidsProfileId)
      .gte('started_at', today.toISOString())
      .lt('started_at', tomorrow.toISOString())

    // Calculate stats
    let totalMinutes = 0
    const videosWatched: string[] = []
    const agentsUsed: string[] = []

    sessions?.forEach((session) => {
      // Calculate duration
      if (session.started_at) {
        const start = new Date(session.started_at)
        const end = session.ended_at ? new Date(session.ended_at) : new Date()
        totalMinutes += Math.round((end.getTime() - start.getTime()) / 60000)
      }

      // Collect videos and agents from session metadata
      if (session.session_metadata) {
        const meta = session.session_metadata as Record<string, unknown>
        if (Array.isArray(meta.videos_watched)) {
          videosWatched.push(...meta.videos_watched)
        }
        if (Array.isArray(meta.agents_used)) {
          agentsUsed.push(...meta.agents_used)
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalMinutes,
        totalSessions: sessions?.length || 0,
        videosWatched: [...new Set(videosWatched)],
        agentsUsed: [...new Set(agentsUsed)],
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
