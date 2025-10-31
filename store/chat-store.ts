import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ChatMessage as ChatChatMessage,
  ChatSession as ChatChatSession,
  ChatConnectionStatus,
  AgentInfo,
  QuickAction,
  Investigation,
  ChatResponse,
} from '@/types/chat'
import type { ChatSession as SupabaseChatSession } from '@/types/supabase'
import { chatService, generateSessionId } from '@/lib/api/chat.service'
import { ChatWebSocket, getChatWebSocket, closeChatWebSocket } from '@/lib/websocket/chat-websocket'
import { chatSessionService } from '@/lib/services/chat-session.service'

// Use chat types for the store (simpler, no user_id required)
type ChatMessage = ChatChatMessage
type ChatSession = ChatChatSession

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

  // WebSocket instance
  ws: ChatWebSocket | null

  // Actions
  initializeChat: (sessionId?: string) => Promise<void>
  sendMessage: (content: string, useWebSocket?: boolean) => Promise<void>
  sendStreamingMessage: (content: string) => void
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

          console.log('🔍 Backend response received:', response)

          if (response) {
            // Extract message content from response
            // Backend may return 'message', 'response', or 'content' field
            const responseAny = response as any
            const messageContent =
              response.message || responseAny.response || responseAny.content || ''

            console.log('📝 Message content extracted:', messageContent)

            if (!messageContent || messageContent.trim().length === 0) {
              console.error(
                '⚠️ Empty message from backend! Full response:',
                JSON.stringify(response)
              )
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

    // Send streaming message via SSE
    sendStreamingMessage: (content: string) => {
      const state = get()

      if (!state.session) {
        get().createNewSession()
      }

      const sessionId = get().session!.session_id

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      get().addMessage(userMessage)
      set({ isLoading: true, error: null, agentTyping: true })

      // For now, fallback to regular API call instead of SSE
      // TODO: Implement SSE with proper authentication
      get().sendMessage(content, false)
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
      console.log('WebSocket connection skipped - not supported by backend')
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
