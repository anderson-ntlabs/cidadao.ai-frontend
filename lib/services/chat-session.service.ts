/**
 * Compatibility layer for chat session service
 * Redirects to new chat system
 *
 * @deprecated Will be replaced with new session management
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import type { ChatSession } from '@/types/chat'

export class ChatSessionService {
  private sessions: Map<string, ChatSession> = new Map()

  async createSession(title?: string): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      title: title || 'Nova Conversa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0
    }

    this.sessions.set(session.id, session)
    return session
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      this.sessions.set(sessionId, {
        ...session,
        ...updates,
        updatedAt: new Date().toISOString()
      })
    }
  }

  async listSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values())
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }
}

export const chatSessionService = new ChatSessionService()