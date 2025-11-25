import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  ChatMessage as ChatChatMessage,
  ChatSession as ChatChatSession,
  ChatConnectionStatus,
  AgentInfo,
  QuickAction,
  Investigation,
} from '@/types/chat'
import type { ChatSession as SupabaseChatSession } from '@/types/supabase'
import { chatService, generateSessionId } from '@/lib/api/chat.service'
import { ChatWebSocket, getChatWebSocket, closeChatWebSocket } from '@/lib/websocket/chat-websocket'
import { chatSessionService } from '@/lib/services/chat-session.service'
import { createLogger } from '@/lib/logger'
import { PrimaryAdapter } from '@/lib/chat/adapters/primary.adapter'
import type { StreamCallbacks } from '@/lib/chat/types'

const logger = createLogger('ChatStore')

// Use chat types for the store (simpler, no user_id required)
type ChatMessage = ChatChatMessage
type ChatSession = ChatChatSession

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

  // WebSocket instance
  ws: ChatWebSocket | null

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

  // Investigation actions
  subscribeToInvestigation: (investigationId: string) => void
  unsubscribeFromInvestigation: (investigationId: string) => void

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
  devtools((set, get) => ({
    // Initial state
    messages: [],
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
    ws: null,

    // Initialize chat
    initializeChat: async (sessionId?: string) => {
      const state = get()

      // If sessionId provided, try to load existing session
      if (sessionId) {
        try {
          const supabaseSession = await chatSessionService.getSession(sessionId)
          if (supabaseSession) {
            // Convert Supabase session to Chat session
            const messages: ChatMessage[] = (supabaseSession.messages || []).map((msg) => ({
              id: msg.id,
              session_id: supabaseSession.session_id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
              agent_id: msg.agent_id,
              agent_name: msg.agent_name,
              metadata: msg.metadata,
            }))

            const chatSession: ChatSession = {
              session_id: supabaseSession.session_id,
              created_at: supabaseSession.created_at,
              last_message_at: supabaseSession.updated_at,
              metadata: supabaseSession.session_metadata || {},
            }

            set({
              session: chatSession,
              messages,
            })

            // Load initial data
            await Promise.all([get().loadAgents(), get().loadSuggestions()])

            set({ connectionStatus: 'disconnected' })
            return
          }
        } catch (error) {
          console.error('Failed to load session:', error)
          // Continue to create new session
        }
      }

      // Create new session if no sessionId or session not found
      await get().createNewSession()

      // Load initial data
      await Promise.all([get().loadAgents(), get().loadSuggestions()])

      // Don't connect WebSocket - backend doesn't support it yet
      // get().connectWebSocket();
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
        if (useWebSocket && state.ws?.isConnected()) {
          // Send via WebSocket
          state.ws.sendChatMessage(content)
        } else {
          // Send via REST API
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

            // Save message to Supabase
            try {
              await chatSessionService.addMessage(sessionId, {
                role: 'user',
                content: content,
                agent_id: '',
                agent_name: '',
              })

              await chatSessionService.addMessage(sessionId, {
                role: 'assistant',
                content: assistantMessage.content,
                agent_id: response.agent_id || '',
                agent_name: response.agent_name || '',
              })
            } catch (error) {
              console.error('Failed to save message to Supabase:', error)
            }

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

        onComplete: (suggestedActions?: string[]) => {
          logger.debug('Stream complete', { suggestedActions })

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

          // Save messages to Supabase
          const finalState = get()
          chatSessionService
            .addMessage(sessionId, {
              role: 'user',
              content,
              agent_id: '',
              agent_name: '',
            })
            .catch((err) => logger.warn('Failed to save user message', { error: err }))

          chatSessionService
            .addMessage(sessionId, {
              role: 'assistant',
              content: finalState.streaming.accumulatedContent,
              agent_id: finalState.streaming.currentAgentId || '',
              agent_name: finalState.streaming.currentAgentName || '',
            })
            .catch((err) => logger.warn('Failed to save assistant message', { error: err }))
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

      // Execute streaming request
      try {
        await streamingAdapter.sendStreaming(
          {
            message: content,
            sessionId,
            agentId: selectedAgent || undefined,
          },
          callbacks
        )
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        callbacks.onError?.(errorMsg)
      }
    },

    // Load chat history
    loadChatHistory: async (sessionId: string) => {
      set({ isLoading: true })
      try {
        const messages = await chatService.getHistory(sessionId)
        set({ messages })
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
          if (direction === 'prev') {
            // Prepend older messages
            set({ messages: [...response.items, ...state.messages] })
          } else {
            // Append newer messages
            set({ messages: [...state.messages, ...response.items] })
          }
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
        set({ messages: [], currentInvestigation: null })
      } catch (error: any) {
        set({ error: error.message || 'Failed to clear chat' })
      }
    },

    // WebSocket connection
    connectWebSocket: () => {
      // WebSocket not supported by current backend deployment
      logger.info('WebSocket connection skipped - not supported by backend')
      set({ connectionStatus: 'disconnected' })
      return

      /* Disabled until backend supports WebSocket
          const state = get();
          if (!state.session || state.ws?.isConnected()) return;

          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

          const ws = getChatWebSocket(
            {
              sessionId: state.session.session_id,
              token: token || undefined,
            },
            {
              onConnectionStatus: (status) => set({ connectionStatus: status }),
              onChat: (data) => {
                if (data.is_complete) {
                  // Complete message received
                  const message: ChatMessage = {
                    id: `msg_${Date.now()}_ws`,
                    session_id: state.session!.session_id,
                    role: 'assistant',
                    content: data.content,
                    agent_id: data.agent_id,
                    agent_name: data.agent_name,
                    timestamp: new Date().toISOString(),
                    metadata: data.metadata,
                  };
                  get().addMessage(message);
                  set({ agentTyping: false });
                } else {
                  // Handle streaming chunks if needed
                  set({ agentTyping: true });
                }
              },
              onTyping: (isTyping) => set({ agentTyping: isTyping }),
              onError: (error) => {
                console.error('WebSocket error:', error);
                set({ connectionStatus: 'error' });
              },
            }
          );

          ws.connect();
          set({ ws });
          */
    },

    // Disconnect WebSocket
    disconnectWebSocket: () => {
      closeChatWebSocket()
      set({ ws: null, connectionStatus: 'disconnected' })
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
        console.error('Failed to load agents:', error)
      }
    },

    // Load suggestions
    loadSuggestions: async () => {
      try {
        const suggestions = await chatService.getSuggestions()
        set({ suggestedActions: suggestions })
      } catch (error) {
        console.error('Failed to load suggestions:', error)
      }
    },

    // Investigation subscriptions
    subscribeToInvestigation: (investigationId) => {
      const state = get()
      state.ws?.subscribeToInvestigation(investigationId)
    },

    unsubscribeFromInvestigation: (investigationId) => {
      const state = get()
      state.ws?.unsubscribeFromInvestigation(investigationId)
    },

    // Message actions
    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }))
    },

    updateMessage: (messageId, updates) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      }))
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
        currentInvestigation: null,
      })

      // Create session in Supabase (optional - fails silently if table doesn't exist)
      try {
        await chatSessionService.createSession({
          session_id: sessionId, // Pass frontend-generated session ID
          agent_id: 'abaporu', // Default to Abaporu
          metadata: { created_from: 'chat-store' },
        })
      } catch (error) {
        // Silently ignore - chat works without Supabase persistence
        console.error('Failed to create session in Supabase:', error)
      }
    },

    loadSession: async (sessionId: string) => {
      set({ isLoading: true })

      try {
        const supabaseSession = await chatSessionService.getSession(sessionId)

        if (supabaseSession) {
          // Convert Supabase session to Chat session
          const messages: ChatMessage[] = (supabaseSession.messages || []).map((msg) => ({
            id: msg.id,
            session_id: supabaseSession.session_id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            agent_id: msg.agent_id,
            agent_name: msg.agent_name,
            metadata: msg.metadata,
          }))

          const chatSession: ChatSession = {
            session_id: supabaseSession.session_id,
            created_at: supabaseSession.created_at,
            last_message_at: supabaseSession.updated_at,
            metadata: supabaseSession.session_metadata || {},
          }

          set({
            session: chatSession,
            messages,
            currentInvestigation: null,
            error: null,
          })
        } else {
          throw new Error('Session not found')
        }
      } catch (error) {
        console.error('Failed to load session:', error)
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
  }))
)
