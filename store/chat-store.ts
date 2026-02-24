import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ChatMessage,
  ChatSession,
  ChatConnectionStatus,
  AgentInfo,
  QuickAction,
  Investigation,
} from '@/types/chat'
import { chatService, generateSessionId } from '@/lib/api/chat.service'
import { createLogger } from '@/lib/logger'
import { PrimaryAdapter } from '@/lib/chat/adapters/primary.adapter'
import type { StreamCallbacks } from '@/lib/chat/types'

const logger = createLogger('ChatStore')

// Streaming state for UI
export interface StreamingState {
  isStreaming: boolean
  phase:
    | 'idle'
    | 'detecting'
    | 'intent'
    | 'agent_selected'
    | 'thinking'
    | 'responding'
    | 'complete'
    | 'error'
  statusMessage: string
  currentAgentId: string | null
  currentAgentName: string | null
  streamingMessageId: string | null
  accumulatedContent: string
}

interface ChatStore {
  // State
  messages: ChatMessage[]
  // O(1) lookup index for messages by ID - optimizes updateMessage from O(n) to O(1)
  // Using Record instead of Map for JSON serialization compatibility with devtools
  messageIndex: Record<string, number>
  session: ChatSession | null
  connectionStatus: ChatConnectionStatus
  isTyping: boolean
  agentTyping: boolean
  activeAgents: AgentInfo[]
  suggestedActions: QuickAction[]
  currentInvestigation: Investigation | null
  error: string | null
  isLoading: boolean

  // Selected agent for conversation mode
  selectedAgentId: string | null

  // Streaming state
  streaming: StreamingState

  // Actions
  initializeChat: (sessionId?: string) => Promise<void>
  sendMessage: (content: string, useWebSocket?: boolean) => Promise<void>
  sendStreamingMessage: (content: string) => Promise<void>
  setSelectedAgent: (agentId: string | null) => void
  resetStreamingState: () => void
  loadChatHistory: (sessionId: string) => Promise<void>
  loadMoreMessages: (cursor: string, direction?: 'next' | 'prev') => Promise<void>
  clearChat: () => Promise<void>

  // WebSocket actions
  connectWebSocket: () => void
  disconnectWebSocket: () => void

  // UI state actions
  setTyping: (isTyping: boolean) => void
  setAgentTyping: (isTyping: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Agent actions
  loadAgents: () => Promise<void>
  loadSuggestions: () => Promise<void>

  // Message actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void

  // Session actions
  createNewSession: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  updateSession: (updates: Partial<ChatSession>) => void
}

// Create streaming adapter instance
const streamingAdapter = new PrimaryAdapter()

// Initial streaming state
const initialStreamingState: StreamingState = {
  isStreaming: false,
  phase: 'idle',
  statusMessage: '',
  currentAgentId: null,
  currentAgentName: null,
  streamingMessageId: null,
  accumulatedContent: '',
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        messageIndex: {},
        session: null,
        connectionStatus: 'disconnected',
        isTyping: false,
        agentTyping: false,
        activeAgents: [],
        suggestedActions: [],
        currentInvestigation: null,
        error: null,
        isLoading: false,
        selectedAgentId: null,
        streaming: initialStreamingState,

        // Initialize chat
        initializeChat: async (sessionId?: string) => {
          // If sessionId provided, try to load existing session from backend
          if (sessionId) {
            try {
              const backendSession = await chatService.getSession(sessionId)
              if (backendSession) {
                // Load messages from backend
                const messages = await chatService.getHistory(sessionId)

                // Build index for O(1) lookups
                const messageIndex: Record<string, number> = {}
                messages.forEach((msg, idx) => (messageIndex[msg.id] = idx))

                set({
                  session: backendSession,
                  messages,
                  messageIndex,
                })

                await Promise.all([get().loadAgents(), get().loadSuggestions()])
                set({ connectionStatus: 'disconnected' })
                return
              }
            } catch (error) {
              logger.error('Failed to load session', { error })
            }
          }

          // Create new session if no sessionId or session not found
          await get().createNewSession()

          await Promise.all([get().loadAgents(), get().loadSuggestions()])
          set({ connectionStatus: 'disconnected' })
        },

        // Send message via REST API
        sendMessage: async (content: string, useWebSocket = false) => {
          const state = get()

          if (!state.session) {
            await get().createNewSession()
          }

          const sessionId = get().session!.session_id

          // Check if user message already exists (avoid duplicates from streaming)
          const lastMessage = state.messages[state.messages.length - 1]
          if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== content) {
            // Add user message immediately
            const userMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              session_id: sessionId,
              role: 'user',
              content,
              timestamp: new Date().toISOString(),
            }

            get().addMessage(userMessage)
          }

          set({ isLoading: true, error: null })

          try {
            // Send via REST API (WebSocket not supported by backend)
            const response = await chatService.sendMessage({
              message: content,
              session_id: sessionId,
            })

            logger.debug('Backend response received', { response })

            if (response) {
              // Extract message content from response
              // Backend may return 'message', 'response', or 'content' field
              const responseAny = response as any
              const messageContent =
                response.message || responseAny.response || responseAny.content || ''

              logger.debug('Message content extracted', { messageContent })

              if (!messageContent || messageContent.trim().length === 0) {
                logger.warn('Empty message from backend', {
                  fullResponse: JSON.stringify(response),
                })
              }

              // Add assistant response
              const assistantMessage: ChatMessage = {
                id: `msg_${Date.now()}_assistant`,
                session_id: response.session_id,
                role: 'assistant',
                content: messageContent || 'Desculpe, não consegui processar sua mensagem.',
                agent_id: response.agent_id,
                agent_name: response.agent_name,
                timestamp: new Date().toISOString(),
                metadata: response.metadata,
              }

              get().addMessage(assistantMessage)

              // Messages are already persisted by the backend during sendMessage

              // Update suggested actions
              if (response.suggested_actions) {
                set({
                  suggestedActions: response.suggested_actions.map((action, idx) => ({
                    id: `action_${idx}`,
                    label: action,
                    icon: 'MessageSquare',
                    action,
                  })),
                })
              }

              // Check for investigation
              if (response.metadata?.investigation_id) {
                set({
                  currentInvestigation: {
                    id: response.metadata.investigation_id,
                    title: response.metadata.investigation_title || 'Investigation',
                    status: 'in_progress',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    agents_involved: [response.agent_id],
                    findings_count: 0,
                    anomalies_count: 0,
                    confidence_score: response.confidence,
                  },
                })
              }
            } else {
              throw new Error('No response from server')
            }
          } catch (error: any) {
            set({ error: error.message || 'Failed to send message' })
          } finally {
            set({ isLoading: false, agentTyping: false })
          }
        },

        // Reset streaming state
        resetStreamingState: () => {
          set({ streaming: initialStreamingState })
        },

        // Set selected agent for conversation mode
        setSelectedAgent: (agentId: string | null) => {
          set({ selectedAgentId: agentId })
          logger.debug('Selected agent changed', { agentId })
        },

        // Send streaming message via SSE - Real implementation
        sendStreamingMessage: async (content: string) => {
          const state = get()

          if (!state.session) {
            await get().createNewSession()
          }

          const sessionId = get().session!.session_id
          const streamingMessageId = `msg_${Date.now()}_streaming`
          const selectedAgent = state.selectedAgentId

          // Add user message
          const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            session_id: sessionId,
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
          }
          get().addMessage(userMessage)

          // Add placeholder for streaming response
          const placeholderMessage: ChatMessage = {
            id: streamingMessageId,
            session_id: sessionId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            agent_id: selectedAgent || undefined,
          }
          get().addMessage(placeholderMessage)

          // Set streaming state
          set({
            isLoading: true,
            error: null,
            agentTyping: true,
            streaming: {
              isStreaming: true,
              phase: selectedAgent ? 'agent_selected' : 'detecting',
              statusMessage: selectedAgent ? 'Conectando ao agente...' : 'Iniciando...',
              currentAgentId: selectedAgent,
              currentAgentName: null,
              streamingMessageId,
              accumulatedContent: '',
            },
          })

          // Define callbacks for streaming events
          const callbacks: StreamCallbacks = {
            onStart: () => {
              logger.debug('Stream started')
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  phase: 'detecting',
                  statusMessage: 'Conectado...',
                },
              }))
            },

            onDetecting: (message: string) => {
              logger.debug('Detecting', { message })
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  phase: 'detecting',
                  statusMessage: message,
                },
              }))
            },

            onIntent: (intent: string, confidence: number) => {
              logger.debug('Intent detected', { intent, confidence })
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  phase: 'intent',
                  statusMessage: `Entendendo: ${intent} (${Math.round(confidence * 100)}%)`,
                },
              }))
            },

            onAgentSelected: (agentId: string, agentName: string) => {
              logger.debug('Agent selected', { agentId, agentName })
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  phase: 'agent_selected',
                  statusMessage: `${agentName} vai responder...`,
                  currentAgentId: agentId,
                  currentAgentName: agentName,
                },
              }))

              // Update placeholder message with agent info
              get().updateMessage(streamingMessageId, {
                agent_id: agentId,
                agent_name: agentName,
              })
            },

            onThinking: (message: string) => {
              logger.debug('Agent thinking', { message })
              const currentState = get()
              const agentName = currentState.streaming.currentAgentName || 'Agente'
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  phase: 'thinking',
                  statusMessage: message || `${agentName} está pensando...`,
                },
              }))
            },

            onChunk: (chunk: string) => {
              set((state) => {
                const newContent = state.streaming.accumulatedContent + chunk
                return {
                  streaming: {
                    ...state.streaming,
                    phase: 'responding',
                    statusMessage: '',
                    accumulatedContent: newContent,
                  },
                }
              })

              // Update message content in real-time
              const currentState = get()
              get().updateMessage(streamingMessageId, {
                content: currentState.streaming.accumulatedContent,
              })
            },

            onComplete: (data) => {
              const { suggestedActions, contracts, downloadAvailable, totalContracts } = data
              logger.debug('Stream complete', {
                suggestedActions,
                contractCount: contracts?.length,
                downloadAvailable,
              })

              // Update suggested actions if provided
              if (suggestedActions && suggestedActions.length > 0) {
                set({
                  suggestedActions: suggestedActions.map((action, idx) => ({
                    id: `action_${idx}`,
                    label:
                      action === 'start_investigation'
                        ? 'Iniciar Investigacao'
                        : action === 'learn_more'
                          ? 'Saber Mais'
                          : action,
                    icon: 'MessageSquare',
                    action,
                  })),
                })
              }

              // If contracts were returned, update the message with contract data
              if (contracts && contracts.length > 0) {
                const currentState = get()
                const streamingMsgId = currentState.streaming.streamingMessageId
                if (streamingMsgId) {
                  get().updateMessage(streamingMsgId, {
                    metadata: {
                      contracts,
                      downloadAvailable,
                      totalContracts,
                    },
                  })
                }
              }

              set((state) => ({
                isLoading: false,
                agentTyping: false,
                streaming: {
                  ...state.streaming,
                  isStreaming: false,
                  phase: 'complete',
                  statusMessage: '',
                },
              }))

              // Messages are persisted by the backend during streaming
            },

            onError: (errorMessage: string) => {
              logger.error('Stream error', { errorMessage })
              set({
                isLoading: false,
                agentTyping: false,
                error: errorMessage,
                streaming: {
                  ...initialStreamingState,
                  phase: 'error',
                  statusMessage: errorMessage,
                },
              })

              // Update placeholder with error message
              get().updateMessage(streamingMessageId, {
                content: `Erro: ${errorMessage}. Por favor, tente novamente.`,
              })
            },
          }

          // Execute streaming request with retry logic for 5xx errors
          const maxRetries = 3
          let lastError: string = 'Unknown error'

          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              const result = await streamingAdapter.sendStreaming(
                {
                  message: content,
                  sessionId,
                  agentId: selectedAgent || undefined,
                },
                callbacks
              )

              // If request succeeded, we're done
              if (result.success) {
                return
              }

              // Check if it's a retryable error (5xx)
              const errorCode = result.error?.code || ''
              const errorMsg = result.error?.message || 'Unknown error'
              lastError = errorMsg

              // Only retry on server errors (5xx) or network errors
              const isRetryable =
                errorMsg.includes('503') ||
                errorMsg.includes('502') ||
                errorMsg.includes('500') ||
                errorCode === 'NETWORK_ERROR' ||
                errorCode === 'TIMEOUT'

              if (!isRetryable || attempt === maxRetries - 1) {
                // Don't retry or last attempt failed
                break
              }

              // Wait before retry with exponential backoff
              const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
              logger.info(
                `Retrying streaming request in ${delay}ms (attempt ${attempt + 2}/${maxRetries})`
              )

              // Update UI to show retry status
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  statusMessage: `Tentando novamente em ${delay / 1000}s...`,
                },
              }))

              await new Promise((resolve) => setTimeout(resolve, delay))

              // Reset accumulated content for retry
              set((state) => ({
                streaming: {
                  ...state.streaming,
                  accumulatedContent: '',
                  phase: 'detecting',
                  statusMessage: 'Reconectando...',
                },
              }))
            } catch (error) {
              lastError = error instanceof Error ? error.message : 'Unknown error'

              if (attempt === maxRetries - 1) {
                break
              }

              // Wait before retry
              const delay = Math.pow(2, attempt) * 1000
              await new Promise((resolve) => setTimeout(resolve, delay))
            }
          }

          // All retries failed
          callbacks.onError?.(lastError)
        },

        // Load chat history
        loadChatHistory: async (sessionId: string) => {
          set({ isLoading: true })
          try {
            const messages = await chatService.getHistory(sessionId)
            // Rebuild index for O(1) lookups
            const messageIndex: Record<string, number> = {}
            messages.forEach((msg, idx) => (messageIndex[msg.id] = idx))
            set({ messages, messageIndex })
          } catch (error: any) {
            set({ error: error.message || 'Failed to load chat history' })
          } finally {
            set({ isLoading: false })
          }
        },

        // Load more messages with pagination
        loadMoreMessages: async (cursor: string, direction = 'prev') => {
          const state = get()
          if (!state.session) return

          try {
            const response = await chatService.getHistoryPaginated(
              state.session.session_id,
              cursor,
              20,
              direction
            )

            if (response) {
              let newMessages: ChatMessage[]
              if (direction === 'prev') {
                // Prepend older messages
                newMessages = [...response.items, ...state.messages]
              } else {
                // Append newer messages
                newMessages = [...state.messages, ...response.items]
              }

              // Rebuild index for O(1) lookups
              const messageIndex: Record<string, number> = {}
              newMessages.forEach((msg, idx) => (messageIndex[msg.id] = idx))

              set({ messages: newMessages, messageIndex })
            }
          } catch (error: any) {
            set({ error: error.message || 'Failed to load more messages' })
          }
        },

        // Clear chat
        clearChat: async () => {
          const state = get()
          if (!state.session) return

          try {
            await chatService.clearHistory(state.session.session_id)
            set({ messages: [], messageIndex: {}, currentInvestigation: null })
          } catch (error: any) {
            set({ error: error.message || 'Failed to clear chat' })
          }
        },

        // WebSocket connection (not supported by current backend)
        connectWebSocket: () => {
          logger.debug('WebSocket connection skipped - not supported by backend')
          set({ connectionStatus: 'disconnected' })
        },

        // Disconnect WebSocket (no-op - WebSocket not supported by backend)
        disconnectWebSocket: () => {
          // No-op: WebSocket is not instantiated (backend doesn't support it)
          // Infrastructure exists in lib/websocket/ for future use
          set({ connectionStatus: 'disconnected' })
        },

        // UI state actions
        setTyping: (isTyping) => set({ isTyping }),
        setAgentTyping: (isTyping) => set({ agentTyping: isTyping }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Load agents
        loadAgents: async () => {
          try {
            const agents = await chatService.getAgents()
            set({ activeAgents: agents })
          } catch (error) {
            logger.error('Failed to load agents', { error })
          }
        },

        // Load suggestions
        loadSuggestions: async () => {
          try {
            const suggestions = await chatService.getSuggestions()
            set({ suggestedActions: suggestions })
          } catch (error) {
            logger.error('Failed to load suggestions', { error })
          }
        },

        // Message actions - optimized with O(1) index lookup
        addMessage: (message) => {
          set((state) => {
            const newIndex = state.messages.length
            return {
              messages: [...state.messages, message],
              messageIndex: { ...state.messageIndex, [message.id]: newIndex },
            }
          })
        },

        updateMessage: (messageId, updates) => {
          set((state) => {
            // O(1) lookup using index instead of O(n) array scan
            const index = state.messageIndex[messageId]
            if (index === undefined) {
              logger.warn('Message not found for update', { messageId })
              return state
            }

            // Create new array with updated message at the correct index
            const newMessages = [...state.messages]
            newMessages[index] = { ...newMessages[index], ...updates }

            return { messages: newMessages }
          })
        },

        // Session actions
        createNewSession: async () => {
          const sessionId = generateSessionId()
          const chatSession: ChatSession = {
            session_id: sessionId,
            created_at: new Date().toISOString(),
            metadata: {},
          }

          set({
            session: chatSession,
            messages: [],
            messageIndex: {},
            currentInvestigation: null,
          })

          // Session will be created in backend automatically on first message
          // via chat_service.get_or_create_session()
        },

        loadSession: async (sessionId: string) => {
          set({ isLoading: true })

          try {
            const backendSession = await chatService.getSession(sessionId)

            if (backendSession) {
              // Load messages from backend
              const messages = await chatService.getHistory(sessionId)

              // Build index for O(1) lookups
              const messageIndex: Record<string, number> = {}
              messages.forEach((msg, idx) => (messageIndex[msg.id] = idx))

              set({
                session: backendSession,
                messages,
                messageIndex,
                currentInvestigation: null,
                error: null,
              })
            } else {
              throw new Error('Session not found')
            }
          } catch (error) {
            logger.error('Failed to load session', { error })
            set({ error: 'Failed to load chat session' })
          } finally {
            set({ isLoading: false })
          }
        },

        updateSession: (updates) => {
          set((state) => ({
            session: state.session ? { ...state.session, ...updates } : null,
          }))
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          // Only persist essential data - keep last 100 messages
          messages: state.messages.slice(-100),
          session: state.session,
          selectedAgentId: state.selectedAgentId,
          // Exclude transient state: streaming, isLoading, error, messageIndex, etc.
        }),
        // Rehydrate messageIndex on load
        onRehydrateStorage: () => (state) => {
          if (state?.messages) {
            // Rebuild messageIndex for O(1) lookups
            const messageIndex: Record<string, number> = {}
            state.messages.forEach((msg, idx) => (messageIndex[msg.id] = idx))
            state.messageIndex = messageIndex
          }
        },
      }
    ),
    { name: 'ChatStore' }
  )
)
