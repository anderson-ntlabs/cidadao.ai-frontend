/**
 * Disable Kids Mode API Route
 *
 * Deactivate kids mode for a profile.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = await request.json()
    const { kidsProfileId } = body

    if (!kidsProfileId) {
      return NextResponse.json({ error: 'kidsProfileId é obrigatório' }, { status: 400 })
    }

    // Verify user owns this kids profile and deactivate
    const { error: updateError } = await supabase
      .from('agora_kids_profiles')
      .update({ is_active: false })
      .eq('id', kidsProfileId)
      .eq('parent_user_id', user.id)

    if (updateError) {
      console.error('Error disabling kids mode:', updateError)
      return NextResponse.json({ error: 'Erro ao desativar modo kids' }, { status: 500 })
    }

    // End any active sessions
    await supabase
      .from('agora_kids_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('kids_profile_id', kidsProfileId)
      .is('ended_at', null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
