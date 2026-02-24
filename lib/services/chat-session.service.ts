/**
 * Chat Session Service - Manages chat sessions via backend API
 *
 * Sessions are persisted in Railway PostgreSQL (backend).
 * Supabase is only used for OAuth authentication.
 */

import { chatService } from '@/lib/api/chat.service'
import { createLogger } from '@/lib/logger'
import type { ChatSession } from '@/types/chat'

const logger = createLogger('ChatSessionService')

export class ChatSessionService {
  /**
   * Get a session by session_id
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const session = await chatService.getSession(sessionId)
      if (!session) {
        logger.debug('Session not found', { sessionId })
        return null
      }
      logger.debug('Session retrieved', { sessionId, messageCount: session.message_count || 0 })
      return session
    } catch (error) {
      logger.error('Session retrieval error', error)
      return null
    }
  }

  /**
   * Get user's chat sessions (paginated)
   */
  async getUserSessions(limit: number = 20, offset: number = 0): Promise<ChatSession[]> {
    try {
      const sessions = await chatService.getUserSessions(limit, offset)
      logger.debug('User sessions retrieved', { count: sessions.length, limit, offset })
      return sessions
    } catch (error) {
      logger.error('Sessions retrieval error', error)
      return []
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const success = await chatService.deleteSession(sessionId)
      if (success) {
        logger.info('Session deleted', { sessionId })
      }
      return success
    } catch (error) {
      logger.error('Session deletion error', error)
      return false
    }
  }
}

export const chatSessionService = new ChatSessionService()
