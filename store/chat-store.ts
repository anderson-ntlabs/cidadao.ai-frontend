import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  ChatMessage,
  ChatSession,
  ChatConnectionStatus,
  AgentInfo,
  QuickAction,
  Investigation,
  ChatResponse,
} from '@/types/chat';
import { chatService, generateSessionId } from '@/lib/api/chat.service';
import { ChatWebSocket, getChatWebSocket, closeChatWebSocket } from '@/lib/websocket/chat-websocket';

interface ChatStore {
  // State
  messages: ChatMessage[];
  session: ChatSession | null;
  connectionStatus: ChatConnectionStatus;
  isTyping: boolean;
  agentTyping: boolean;
  activeAgents: AgentInfo[];
  suggestedActions: QuickAction[];
  currentInvestigation: Investigation | null;
  error: string | null;
  isLoading: boolean;
  
  // WebSocket instance
  ws: ChatWebSocket | null;
  
  // Actions
  initializeChat: (sessionId?: string) => Promise<void>;
  sendMessage: (content: string, useWebSocket?: boolean) => Promise<void>;
  sendStreamingMessage: (content: string) => void;
  loadChatHistory: (sessionId: string) => Promise<void>;
  loadMoreMessages: (cursor: string, direction?: 'next' | 'prev') => Promise<void>;
  clearChat: () => Promise<void>;
  
  // WebSocket actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  
  // UI state actions
  setTyping: (isTyping: boolean) => void;
  setAgentTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Agent actions
  loadAgents: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
  
  // Investigation actions
  subscribeToInvestigation: (investigationId: string) => void;
  unsubscribeFromInvestigation: (investigationId: string) => void;
  
  // Message actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  
  // Session actions
  createNewSession: () => void;
  updateSession: (updates: Partial<ChatSession>) => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
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
          const state = get();
          
          // Create or retrieve session
          if (!sessionId && !state.session) {
            get().createNewSession();
          } else if (sessionId && sessionId !== state.session?.session_id) {
            // Load existing session
            set({
              session: {
                session_id: sessionId,
                created_at: new Date().toISOString(),
                metadata: {},
              },
            });
            await get().loadChatHistory(sessionId);
          }
          
          // Load initial data
          await Promise.all([
            get().loadAgents(),
            get().loadSuggestions(),
          ]);
          
          // Connect WebSocket
          get().connectWebSocket();
        },

        // Send message via REST API
        sendMessage: async (content: string, useWebSocket = false) => {
          const state = get();
          
          if (!state.session) {
            get().createNewSession();
          }
          
          const sessionId = get().session!.session_id;
          
          // Check if user message already exists (avoid duplicates from streaming)
          const lastMessage = state.messages[state.messages.length - 1];
          if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== content) {
            // Add user message immediately
            const userMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              session_id: sessionId,
              role: 'user',
              content,
              timestamp: new Date().toISOString(),
            };
            
            get().addMessage(userMessage);
          }
          
          set({ isLoading: true, error: null });
          
          try {
            if (useWebSocket && state.ws?.isConnected()) {
              // Send via WebSocket
              state.ws.sendChatMessage(content);
            } else {
              // Send via REST API
              console.log('Calling chatService.sendMessage with sessionId:', sessionId);
              
              const response = await chatService.sendMessage({
                message: content,
                session_id: sessionId,
              });
              
              console.log('Chat service response:', response);
              
              if (response) {
                // Add assistant response
                const assistantMessage: ChatMessage = {
                  id: `msg_${Date.now()}_assistant`,
                  session_id: response.session_id,
                  role: 'assistant',
                  content: response.message,
                  agent_id: response.agent_id,
                  agent_name: response.agent_name,
                  timestamp: new Date().toISOString(),
                  metadata: response.metadata,
                };
                
                get().addMessage(assistantMessage);
                
                // Update suggested actions
                if (response.suggested_actions) {
                  set({ suggestedActions: response.suggested_actions.map((action, idx) => ({
                    id: `action_${idx}`,
                    label: action,
                    icon: 'MessageSquare',
                    action,
                  })) });
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
                  });
                }
              } else {
                throw new Error('No response from server');
              }
            }
          } catch (error: any) {
            set({ error: error.message || 'Failed to send message' });
          } finally {
            set({ isLoading: false, agentTyping: false });
          }
        },

        // Send streaming message via SSE
        sendStreamingMessage: (content: string) => {
          const state = get();
          
          if (!state.session) {
            get().createNewSession();
          }
          
          const sessionId = get().session!.session_id;
          
          // Add user message
          const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            session_id: sessionId,
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
          };
          
          get().addMessage(userMessage);
          set({ isLoading: true, error: null, agentTyping: true });
          
          // For now, fallback to regular API call instead of SSE
          // TODO: Implement SSE with proper authentication
          get().sendMessage(content, false);
        },

        // Load chat history
        loadChatHistory: async (sessionId: string) => {
          set({ isLoading: true });
          try {
            const messages = await chatService.getHistory(sessionId);
            set({ messages });
          } catch (error: any) {
            set({ error: error.message || 'Failed to load chat history' });
          } finally {
            set({ isLoading: false });
          }
        },

        // Load more messages with pagination
        loadMoreMessages: async (cursor: string, direction = 'prev') => {
          const state = get();
          if (!state.session) return;
          
          try {
            const response = await chatService.getHistoryPaginated(
              state.session.session_id,
              cursor,
              20,
              direction
            );
            
            if (response) {
              if (direction === 'prev') {
                // Prepend older messages
                set({ messages: [...response.items, ...state.messages] });
              } else {
                // Append newer messages
                set({ messages: [...state.messages, ...response.items] });
              }
            }
          } catch (error: any) {
            set({ error: error.message || 'Failed to load more messages' });
          }
        },

        // Clear chat
        clearChat: async () => {
          const state = get();
          if (!state.session) return;
          
          try {
            await chatService.clearHistory(state.session.session_id);
            set({ messages: [], currentInvestigation: null });
          } catch (error: any) {
            set({ error: error.message || 'Failed to clear chat' });
          }
        },

        // WebSocket connection
        connectWebSocket: () => {
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
        },

        // Disconnect WebSocket
        disconnectWebSocket: () => {
          closeChatWebSocket();
          set({ ws: null, connectionStatus: 'disconnected' });
        },

        // UI state actions
        setTyping: (isTyping) => set({ isTyping }),
        setAgentTyping: (isTyping) => set({ agentTyping: isTyping }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Load agents
        loadAgents: async () => {
          try {
            const agents = await chatService.getAgents();
            set({ activeAgents: agents });
          } catch (error) {
            console.error('Failed to load agents:', error);
          }
        },

        // Load suggestions
        loadSuggestions: async () => {
          try {
            const suggestions = await chatService.getSuggestions();
            set({ suggestedActions: suggestions });
          } catch (error) {
            console.error('Failed to load suggestions:', error);
          }
        },

        // Investigation subscriptions
        subscribeToInvestigation: (investigationId) => {
          const state = get();
          state.ws?.subscribeToInvestigation(investigationId);
        },

        unsubscribeFromInvestigation: (investigationId) => {
          const state = get();
          state.ws?.unsubscribeFromInvestigation(investigationId);
        },

        // Message actions
        addMessage: (message) => {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        },

        updateMessage: (messageId, updates) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          }));
        },

        // Session actions
        createNewSession: () => {
          const sessionId = generateSessionId();
          set({
            session: {
              session_id: sessionId,
              created_at: new Date().toISOString(),
              metadata: {},
            },
            messages: [],
            currentInvestigation: null,
          });
        },

        updateSession: (updates) => {
          set((state) => ({
            session: state.session ? { ...state.session, ...updates } : null,
          }));
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          session: state.session,
          messages: state.messages.slice(-50), // Keep last 50 messages
        }),
      }
    )
  )
);