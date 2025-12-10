/**
 * Chat Persistence Hook
 *
 * Manages chat session persistence for Agora and Kids mode.
 * Saves conversations to Supabase for reports and analytics.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useCallback, useRef } from 'react'
import { chatSessionService } from '@/lib/services/chat-session.service'
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
  /** Save a user message */
  saveUserMessage: (content: string) => Promise<void>
  /** Save an assistant message */
  saveAssistantMessage: (content: string) => Promise<void>
  /** Get current session ID */
  sessionId: string | null
}

export function useChatPersistence(options: UseChatPersistenceOptions): ChatPersistenceResult {
  const { isKidsMode = false, agentId, agentName, childName } = options
  const sessionIdRef = useRef<string | null>(null)
  const dbSessionIdRef = useRef<string | null>(null)

  /**
   * Initialize a new chat session or return existing one
   */
  const initSession = useCallback(async (): Promise<string> => {
    // Return existing session if already initialized
    if (sessionIdRef.current) {
      return sessionIdRef.current
    }

    // Generate a new session ID
    const newSessionId = crypto.randomUUID()
    sessionIdRef.current = newSessionId

    try {
      // Create session in database
      const session = await chatSessionService.createSession({
        session_id: newSessionId,
        agent_id: agentId,
        metadata: {
          is_kids_mode: isKidsMode,
          child_name: childName,
          platform: 'agora',
          started_at: new Date().toISOString(),
        },
      })

      if (session) {
        dbSessionIdRef.current = session.id
        logger.info('Chat session created', {
          sessionId: newSessionId,
          agentId,
          isKidsMode,
        })
      }
    } catch (error) {
      logger.error('Failed to create chat session', error)
    }

    return newSessionId
  }, [agentId, isKidsMode, childName])

  /**
   * Save a user message to the session
   */
  const saveUserMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!sessionIdRef.current) {
        await initSession()
      }

      try {
        await chatSessionService.addMessage(sessionIdRef.current!, {
          role: 'user',
          content,
          agent_id: agentId,
          agent_name: agentName,
          metadata: {
            is_kids_mode: isKidsMode,
            child_name: childName,
          },
        })

        logger.debug('User message saved', {
          sessionId: sessionIdRef.current,
          contentLength: content.length,
        })
      } catch (error) {
        logger.error('Failed to save user message', error)
      }
    },
    [agentId, agentName, isKidsMode, childName, initSession]
  )

  /**
   * Save an assistant message to the session
   */
  const saveAssistantMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!sessionIdRef.current) {
        await initSession()
      }

      try {
        await chatSessionService.addMessage(sessionIdRef.current!, {
          role: 'assistant',
          content,
          agent_id: agentId,
          agent_name: agentName,
          metadata: {
            is_kids_mode: isKidsMode,
          },
        })

        logger.debug('Assistant message saved', {
          sessionId: sessionIdRef.current,
          contentLength: content.length,
        })
      } catch (error) {
        logger.error('Failed to save assistant message', error)
      }
    },
    [agentId, agentName, isKidsMode, initSession]
  )

  return {
    initSession,
    saveUserMessage,
    saveAssistantMessage,
    sessionId: sessionIdRef.current,
  }
}
