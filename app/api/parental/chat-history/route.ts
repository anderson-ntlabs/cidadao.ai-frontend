/**
 * Parental Chat History API Route
 *
 * Fetches chat history for a child's Kids mode sessions.
 * Only accessible with valid parental verification.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  agent_id?: string
  agent_name?: string
}

interface ChatSession {
  id: string
  session_id: string
  agent_id: string
  messages: ChatMessage[]
  session_metadata: {
    is_kids_mode?: boolean
    child_name?: string
    platform?: string
    started_at?: string
  }
  created_at: string
  updated_at: string
}

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Fetch chat sessions with kids mode metadata
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .contains('session_metadata', { is_kids_mode: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 })
    }

    // Format response
    const chatHistory = (sessions as ChatSession[]).map((session) => ({
      id: session.id,
      sessionId: session.session_id,
      agentId: session.agent_id,
      agentName: getAgentDisplayName(session.agent_id),
      messageCount: session.messages?.length || 0,
      messages: session.messages || [],
      startedAt: session.session_metadata?.started_at || session.created_at,
      childName: session.session_metadata?.child_name || kidsProfile.child_name,
    }))

    // Get total count for pagination
    const { count } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .contains('session_metadata', { is_kids_mode: true })

    return NextResponse.json({
      success: true,
      childName: kidsProfile.child_name,
      chatHistory,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

/**
 * Get display name for kids agents
 */
function getAgentDisplayName(agentId: string): string {
  const agentNames: Record<string, string> = {
    monteiro_lobato: 'Monteiro Lobato',
    tarsila: 'Tarsila do Amaral',
    tarsila_do_amaral: 'Tarsila do Amaral',
  }
  return agentNames[agentId] || agentId
}
