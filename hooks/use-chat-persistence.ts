/**
 * Chat Persistence Hook
 *
 * Manages chat session IDs for Agora and Kids mode.
 * Messages are persisted by the backend (Railway PostgreSQL) during
 * streaming/message processing - no frontend persistence needed.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useCallback, useRef } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('useChatPersistence')

interface UseChatPersistenceOptions {
  /** Whether this is a kids mode session */
  isKidsMode?: boolean
  /** Agent ID for the chat */
  agentId: string
  /** Agent display name */
  agentName: string
  /** Optional child name for kids mode */
  childName?: string | null
}

interface ChatPersistenceResult {
  /** Initialize or get existing session */
  initSession: () => Promise<string>
  /** Save a user message (no-op, backend handles persistence) */
  saveUserMessage: (content: string) => Promise<void>
  /** Save an assistant message (no-op, backend handles persistence) */
  saveAssistantMessage: (content: string) => Promise<void>
  /** Get current session ID */
  sessionId: string | null
}

export function useChatPersistence(options: UseChatPersistenceOptions): ChatPersistenceResult {
  const { isKidsMode = false, agentId, agentName } = options
  const sessionIdRef = useRef<string | null>(null)

  /**
   * Initialize a new chat session or return existing one.
   * The backend creates the DB session on first message via get_or_create_session().
   */
  const initSession = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) {
      return sessionIdRef.current
    }

    const newSessionId = crypto.randomUUID()
    sessionIdRef.current = newSessionId

    logger.info('Chat session initialized', {
      sessionId: newSessionId,
      agentId,
      isKidsMode,
    })

    return newSessionId
  }, [agentId, isKidsMode])

  /**
   * No-op: backend persists messages automatically during streaming.
   * Kept for API compatibility with existing callers.
   */
  const saveUserMessage = useCallback(async (_content: string): Promise<void> => {
    // Backend handles persistence via chat_service.save_message()
  }, [])

  /**
   * No-op: backend persists messages automatically during streaming.
   * Kept for API compatibility with existing callers.
   */
  const saveAssistantMessage = useCallback(async (_content: string): Promise<void> => {
    // Backend handles persistence via chat_service.save_message()
  }, [])

  return {
    initSession,
    saveUserMessage,
    saveAssistantMessage,
    sessionId: sessionIdRef.current,
  }
}
