/**
 * Agora Chat Store
 *
 * Simplified chat store for Agora Academy with educational agents only.
 * Integrates with XP system and uses same streaming infrastructure as main app.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { PrimaryAdapter } from '@/lib/chat/adapters/primary.adapter'
import { EDUCATIONAL_AGENT_IDS, getEducationalAgents } from '@/data/agents'
import type { StreamCallbacks } from '@/lib/chat/types'
import { logger } from '@/lib/utils/logger'
import { chatSessionService } from '@/lib/services/chat-session.service'

// Types
export interface AgoraChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  agentId?: string
  agentName?: string
}

export interface AgoraStreamingState {
  isStreaming: boolean
  phase: 'idle' | 'connecting' | 'thinking' | 'responding' | 'complete' | 'error'
  statusMessage: string
  currentAgentId: string | null
  currentAgentName: string | null
  accumulatedContent: string
}

interface AgoraChatStore {
  // State
  messages: AgoraChatMessage[]
  sessionId: string | null
  selectedAgentId: string
  isLoading: boolean
  error: string | null
  streaming: AgoraStreamingState

  // XP callback (set by useAgora integration)
  onXpEarned: ((amount: number, type: string, description: string) => void) | null

  // Actions
  initializeChat: () => void
  sendMessage: (content: string) => Promise<void>
  selectAgent: (agentId: string) => void
  clearChat: () => void
  clearError: () => void
  setXpCallback: (callback: (amount: number, type: string, description: string) => void) => void
}

// Create streaming adapter
const streamingAdapter = new PrimaryAdapter()

// Track if DB session was created (outside store to avoid re-renders)
let dbSessionInitialized = false

/**
 * Persist message to database (fire and forget)
 */
async function persistMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  agentId: string,
  agentName: string
): Promise<void> {
  try {
    // Initialize DB session if needed
    if (!dbSessionInitialized) {
      await chatSessionService.createSession({
        session_id: sessionId,
        agent_id: agentId,
        metadata: {
          platform: 'agora',
          is_kids_mode: false,
          started_at: new Date().toISOString(),
        },
      })
      dbSessionInitialized = true
    }

    // Add message to session
    await chatSessionService.addMessage(sessionId, {
      role,
      content,
      agent_id: agentId,
      agent_name: agentName,
      metadata: { platform: 'agora' },
    })
  } catch (error) {
    // Silent fail - don't block chat for persistence errors
    logger.debug('Failed to persist message', { error })
  }
}

// Initial streaming state
const initialStreamingState: AgoraStreamingState = {
  isStreaming: false,
  phase: 'idle',
  statusMessage: '',
  currentAgentId: null,
  currentAgentName: null,
  accumulatedContent: '',
}

// Generate session ID
const generateSessionId = () => `agora_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useAgoraChatStore = create<AgoraChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        sessionId: null,
        selectedAgentId: EDUCATIONAL_AGENT_IDS[0], // Default to Santos-Dumont
        isLoading: false,
        error: null,
        streaming: initialStreamingState,
        onXpEarned: null,

        // Initialize chat session
        initializeChat: () => {
          const state = get()
          if (!state.sessionId) {
            set({ sessionId: generateSessionId() })
          }
          logger.debug('Agora chat initialized', { sessionId: get().sessionId })
        },

        // Send message with streaming
        sendMessage: async (content: string) => {
          const state = get()

          // Ensure session exists
          if (!state.sessionId) {
            get().initializeChat()
          }

          const sessionId = get().sessionId!
          const streamingMessageId = `msg_${Date.now()}_streaming`
          const selectedAgent = state.selectedAgentId

          // Validate agent is educational
          if (
            !EDUCATIONAL_AGENT_IDS.includes(selectedAgent as (typeof EDUCATIONAL_AGENT_IDS)[number])
          ) {
            set({ error: 'Agente não disponível na Academy' })
            return
          }

          // Add user message
          const userMessage: AgoraChatMessage = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
          }

          set((s) => ({ messages: [...s.messages, userMessage] }))

          // Get agent name for persistence
          const agents = getEducationalAgents()
          const agent = agents.find((a) => a.id === selectedAgent)
          const agentName = agent?.name || 'Mentor'

          // Persist user message to database (async, don't await)
          persistMessage(sessionId, 'user', content, selectedAgent, agentName)

          // Add placeholder for streaming response
          const placeholderMessage: AgoraChatMessage = {
            id: streamingMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            agentId: selectedAgent,
          }

          set((s) => ({
            messages: [...s.messages, placeholderMessage],
            isLoading: true,
            error: null,
            streaming: {
              isStreaming: true,
              phase: 'connecting',
              statusMessage: 'Conectando ao mentor...',
              currentAgentId: selectedAgent,
              currentAgentName: null,
              accumulatedContent: '',
            },
          }))

          // Define streaming callbacks
          const callbacks: StreamCallbacks = {
            onStart: () => {
              set((s) => ({
                streaming: {
                  ...s.streaming,
                  phase: 'connecting',
                  statusMessage: `${agentName} está conectando...`,
                },
              }))
            },

            onThinking: (message: string) => {
              set((s) => ({
                streaming: {
                  ...s.streaming,
                  phase: 'thinking',
                  statusMessage: message || `${agentName} está pensando...`,
                },
              }))
            },

            onAgentSelected: (agentId: string, name: string) => {
              set((s) => ({
                streaming: {
                  ...s.streaming,
                  currentAgentId: agentId,
                  currentAgentName: name,
                  statusMessage: `${name} vai responder...`,
                },
              }))

              // Update placeholder with agent info
              set((s) => ({
                messages: s.messages.map((msg) =>
                  msg.id === streamingMessageId ? { ...msg, agentId, agentName: name } : msg
                ),
              }))
            },

            onChunk: (chunk: string) => {
              set((s) => {
                const newContent = s.streaming.accumulatedContent + chunk
                return {
                  streaming: {
                    ...s.streaming,
                    phase: 'responding',
                    statusMessage: '',
                    accumulatedContent: newContent,
                  },
                  messages: s.messages.map((msg) =>
                    msg.id === streamingMessageId ? { ...msg, content: newContent } : msg
                  ),
                }
              })
            },

            onComplete: () => {
              const finalState = get()
              const assistantContent = finalState.streaming.accumulatedContent

              set({
                isLoading: false,
                streaming: {
                  ...finalState.streaming,
                  isStreaming: false,
                  phase: 'complete',
                  statusMessage: '',
                },
              })

              // Persist assistant message to database (async, don't await)
              if (assistantContent) {
                persistMessage(sessionId, 'assistant', assistantContent, selectedAgent, agentName)
              }

              // Award XP for conversation
              const messageCount = finalState.messages.filter((m) => m.role === 'user').length
              if (messageCount % 5 === 0 && finalState.onXpEarned) {
                finalState.onXpEarned(5, 'conversation', `Conversa com ${agentName}`)
              }

              logger.debug('Agora chat message complete', {
                agentId: selectedAgent,
                messageCount,
              })
            },

            onError: (errorMessage: string) => {
              logger.error('Agora chat error', { error: errorMessage })

              set((s) => ({
                isLoading: false,
                error: errorMessage,
                streaming: {
                  ...initialStreamingState,
                  phase: 'error',
                  statusMessage: errorMessage,
                },
                messages: s.messages.map((msg) =>
                  msg.id === streamingMessageId
                    ? { ...msg, content: `Erro: ${errorMessage}. Tente novamente.` }
                    : msg
                ),
              }))
            },
          }

          // Execute streaming request
          try {
            // Map educational agent IDs to backend agent IDs
            const backendAgentId =
              selectedAgent === 'santos-dumont'
                ? 'santos_dumont'
                : selectedAgent === 'bobardi'
                  ? 'bobardi'
                  : 'abaporu'

            await streamingAdapter.sendStreaming(
              {
                message: content,
                sessionId,
                agentId: backendAgentId,
              },
              callbacks
            )
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
            callbacks.onError?.(errorMsg)
          }
        },

        // Select agent (must be educational)
        selectAgent: (agentId: string) => {
          if (EDUCATIONAL_AGENT_IDS.includes(agentId as (typeof EDUCATIONAL_AGENT_IDS)[number])) {
            set({ selectedAgentId: agentId })
            logger.debug('Agent selected', { agentId })
          } else {
            logger.warn('Attempted to select non-educational agent', { agentId })
          }
        },

        // Clear chat
        clearChat: () => {
          // Reset DB session tracking for new conversation
          dbSessionInitialized = false

          set({
            messages: [],
            sessionId: generateSessionId(),
            streaming: initialStreamingState,
            error: null,
          })
        },

        // Clear error
        clearError: () => {
          set({ error: null })
        },

        // Set XP callback (called from useAgora integration)
        setXpCallback: (callback) => {
          set({ onXpEarned: callback })
        },
      }),
      {
        name: 'agora-chat-storage',
        partialize: (state) => ({
          messages: state.messages.slice(-50), // Keep last 50 messages
          sessionId: state.sessionId,
          selectedAgentId: state.selectedAgentId,
        }),
      }
    ),
    { name: 'AgoraChatStore' }
  )
)
