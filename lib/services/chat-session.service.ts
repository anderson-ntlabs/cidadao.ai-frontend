import { createClient } from '@/lib/supabase/client'
import type { ChatSession, ChatMessage } from '@/types/supabase'

export class ChatSessionService {
  private supabase = createClient()

  async createSession(data: {
    investigation_id?: string
    agent_id: string
    metadata?: Record<string, any>
  }): Promise<ChatSession | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: session, error } = await this.supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        investigation_id: data.investigation_id,
        agent_id: data.agent_id,
        messages: [],
        session_metadata: data.metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chat session:', error)
      return null
    }

    return session
  }

  async getSession(id: string): Promise<ChatSession | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching chat session:', error)
      return null
    }

    return data
  }

  async getUserSessions(limit = 10): Promise<ChatSession[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching chat sessions:', error)
      return []
    }

    return data || []
  }

  async getInvestigationSessions(investigationId: string): Promise<ChatSession[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await this.supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('investigation_id', investigationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching investigation sessions:', error)
      return []
    }

    return data || []
  }

  async addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<boolean> {
    const session = await this.getSession(sessionId)
    if (!session) return false

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...message
    }

    const updatedMessages = [...session.messages, newMessage]

    const { error } = await this.supabase
      .from('chat_sessions')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Error adding message:', error)
      return false
    }

    return true
  }

  async updateSessionMetadata(
    sessionId: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return false

    const { error } = await this.supabase
      .from('chat_sessions')
      .update({
        session_metadata: metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating session metadata:', error)
      return false
    }

    return true
  }

  async deleteSession(id: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return false

    const { error } = await this.supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting chat session:', error)
      return false
    }

    return true
  }
}

export const chatSessionService = new ChatSessionService()