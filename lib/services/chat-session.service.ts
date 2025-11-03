/**
 * Chat Session Service - Manages Supabase chat sessions
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { ChatSession, ChatMessage } from '@/types/supabase'

const logger = createLogger('ChatSessionService')

export class ChatSessionService {
  private supabase = createClient()

  /**
   * Create a new chat session
   */
  async createSession(data: {
    session_id: string
    agent_id: string
    investigation_id?: string
    metadata?: Record<string, any>
  }): Promise<ChatSession | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        logger.warn('No authenticated user, skipping session creation')
        return null
      }

      const { data: session, error } = await this.supabase
        .from('chat_sessions')
        .insert({
          session_id: data.session_id,
          user_id: user.id,
          agent_id: data.agent_id,
          investigation_id: data.investigation_id,
          messages: [],
          session_metadata: data.metadata || {},
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create session:', error)
        return null
      }

      logger.info('Session created', { sessionId: data.session_id, agentId: data.agent_id })
      return session
    } catch (error) {
      console.error('Session creation error:', error)
      return null
    }
  }

  /**
   * Get a session by session_id
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        logger.warn('No authenticated user')
        return null
      }

      const { data: session, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Failed to get session:', error)
        return null
      }

      logger.debug('Session retrieved', { sessionId, messageCount: session.messages?.length || 0 })
      return session
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  }

  /**
   * Get user's chat sessions (paginated)
   */
  async getUserSessions(limit: number = 20, offset: number = 0): Promise<ChatSession[]> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        logger.warn('No authenticated user')
        return []
      }

      const { data: sessions, error } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Failed to get user sessions:', error)
        return []
      }

      logger.debug('User sessions retrieved', { count: sessions?.length || 0, limit, offset })
      return sessions || []
    } catch (error) {
      console.error('Sessions retrieval error:', error)
      return []
    }
  }

  /**
   * Update a session
   */
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        logger.warn('No authenticated user')
        return false
      }

      const { error } = await this.supabase
        .from('chat_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to update session:', error)
        return false
      }

      logger.debug('Session updated', { sessionId })
      return true
    } catch (error) {
      console.error('Session update error:', error)
      return false
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) {
        logger.warn('No authenticated user')
        return false
      }

      const { error } = await this.supabase
        .from('chat_sessions')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to delete session:', error)
        return false
      }

      logger.info('Session deleted', { sessionId })
      return true
    } catch (error) {
      console.error('Session deletion error:', error)
      return false
    }
  }

  /**
   * Add a message to a session
   */
  async addMessage(
    sessionId: string,
    message: {
      role: 'user' | 'assistant' | 'system'
      content: string
      agent_id: string
      agent_name: string
      metadata?: Record<string, any>
    }
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)

      if (!session) {
        logger.warn('Session not found', { sessionId })
        return false
      }

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        role: message.role,
        content: message.content,
        timestamp: new Date().toISOString(),
        agent_id: message.agent_id,
        agent_name: message.agent_name,
        metadata: message.metadata,
      }

      const updatedMessages = [...(session.messages || []), newMessage]

      const success = await this.updateSession(sessionId, {
        messages: updatedMessages,
      })

      if (success) {
        logger.debug('Message added to session', {
          sessionId,
          role: message.role,
          agentId: message.agent_id,
        })
      }

      return success
    } catch (error) {
      console.error('Message addition error:', error)
      return false
    }
  }
}

export const chatSessionService = new ChatSessionService()
