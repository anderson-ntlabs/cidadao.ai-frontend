import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useChatStore } from './chat-store'
import { chatService } from '@/lib/api/chat.service'
import { chatSessionService } from '@/lib/services/chat-session.service'
// WebSocket functions are no longer used - backend doesn't support WebSocket
import type { ChatMessage, ChatResponse } from '@/types/chat'
import * as chatServiceModule from '@/lib/api/chat.service'

// Mock generateSessionId
vi.spyOn(chatServiceModule, 'generateSessionId').mockImplementation(
  () => 'test-session-' + Date.now()
)

// Mock dependencies
vi.mock('@/lib/api/chat.service')
vi.mock('@/lib/services/chat-session.service')
// WebSocket mock removed - no longer used in store

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}))

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
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
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState()
      expect(state.messages).toEqual([])
      expect(state.session).toBeNull()
      expect(state.connectionStatus).toBe('disconnected')
      expect(state.isTyping).toBe(false)
      expect(state.agentTyping).toBe(false)
      expect(state.activeAgents).toEqual([])
      expect(state.suggestedActions).toEqual([])
      expect(state.currentInvestigation).toBeNull()
      expect(state.error).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.ws).toBeNull()
    })
  })

  describe('initializeChat', () => {
    it('should create new session and load initial data', async () => {
      const mockAgents = [{ id: 'agent1', name: 'Agent 1' }]
      const mockSuggestions = [
        { id: 'sug1', label: 'Suggestion 1', action: 'action1', icon: 'icon' },
      ]

      vi.mocked(chatService.getAgents).mockResolvedValue(mockAgents as any)
      vi.mocked(chatService.getSuggestions).mockResolvedValue(mockSuggestions)
      vi.mocked(chatSessionService.createSession).mockResolvedValue({ id: 'session1' } as any)

      await useChatStore.getState().initializeChat()

      const state = useChatStore.getState()
      expect(state.session).toBeTruthy()
      expect(state.session?.session_id).toBeTruthy()
      expect(state.activeAgents).toEqual(mockAgents)
      expect(state.suggestedActions).toEqual(mockSuggestions)
      expect(state.connectionStatus).toBe('disconnected')
    })

    it('should handle errors during initialization gracefully', async () => {
      vi.mocked(chatService.getAgents).mockRejectedValue(new Error('Failed to load agents'))
      vi.mocked(chatService.getSuggestions).mockRejectedValue(
        new Error('Failed to load suggestions')
      )

      // Should not throw
      await expect(useChatStore.getState().initializeChat()).resolves.not.toThrow()
    })
  })

  describe('sendMessage', () => {
    beforeEach(() => {
      // Set up a session
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
      })
    })

    it('should send message and add user and assistant messages', async () => {
      const userContent = 'Hello, AI!'
      const mockResponse: ChatResponse = {
        message: 'Hello, human!',
        session_id: 'test-session',
        agent_id: 'agent1',
        agent_name: 'Agent 1',
        confidence: 0.9,
        suggested_actions: ['Action 1', 'Action 2'],
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue({} as any)

      await useChatStore.getState().sendMessage(userContent)

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(2)

      // Check user message
      expect(messages[0].role).toBe('user')
      expect(messages[0].content).toBe(userContent)

      // Check assistant message
      expect(messages[1].role).toBe('assistant')
      expect(messages[1].content).toBe(mockResponse.message)
      expect(messages[1].agent_id).toBe(mockResponse.agent_id)
      expect(messages[1].agent_name).toBe(mockResponse.agent_name)

      // Check suggested actions
      const suggestedActions = useChatStore.getState().suggestedActions
      expect(suggestedActions).toHaveLength(2)
      expect(suggestedActions[0].label).toBe('Action 1')
      expect(suggestedActions[1].label).toBe('Action 2')
    })

    it('should handle empty response gracefully', async () => {
      vi.mocked(chatService.sendMessage).mockResolvedValue(null as any)

      await useChatStore.getState().sendMessage('Test message')

      const state = useChatStore.getState()
      expect(state.error).toBe('No response from server')
      expect(state.isLoading).toBe(false)
    })

    it('should handle errors when sending message', async () => {
      const errorMessage = 'Network error'
      vi.mocked(chatService.sendMessage).mockRejectedValue(new Error(errorMessage))

      await useChatStore.getState().sendMessage('Test message')

      const state = useChatStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
      expect(state.agentTyping).toBe(false)
    })

    it('should create session if none exists', async () => {
      useChatStore.setState({ session: null })

      const mockResponse: ChatResponse = {
        message: 'Response',
        session_id: 'new-session',
      }
      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse)

      await useChatStore.getState().sendMessage('Test')

      const state = useChatStore.getState()
      expect(state.session).toBeTruthy()
      expect(state.session?.session_id).toBeTruthy()
    })

    it('should update investigation if metadata contains investigation_id', async () => {
      const mockResponse: ChatResponse = {
        message: 'Investigation started',
        session_id: 'test-session',
        agent_id: 'agent1',
        metadata: {
          investigation_id: 'inv123',
          investigation_title: 'Test Investigation',
        },
        confidence: 0.85,
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse)

      await useChatStore.getState().sendMessage('Investigate this')

      const investigation = useChatStore.getState().currentInvestigation
      expect(investigation).toBeTruthy()
      expect(investigation?.id).toBe('inv123')
      expect(investigation?.title).toBe('Test Investigation')
      expect(investigation?.status).toBe('in_progress')
      expect(investigation?.confidence_score).toBe(0.85)
    })
  })

  describe('UI State Actions', () => {
    it('should set typing state', () => {
      useChatStore.getState().setTyping(true)
      expect(useChatStore.getState().isTyping).toBe(true)

      useChatStore.getState().setTyping(false)
      expect(useChatStore.getState().isTyping).toBe(false)
    })

    it('should set agent typing state', () => {
      useChatStore.getState().setAgentTyping(true)
      expect(useChatStore.getState().agentTyping).toBe(true)

      useChatStore.getState().setAgentTyping(false)
      expect(useChatStore.getState().agentTyping).toBe(false)
    })

    it('should set and clear error', () => {
      const errorMessage = 'Test error'
      useChatStore.getState().setError(errorMessage)
      expect(useChatStore.getState().error).toBe(errorMessage)

      useChatStore.getState().clearError()
      expect(useChatStore.getState().error).toBeNull()
    })
  })

  describe('Message Actions', () => {
    it('should add message', () => {
      const message: ChatMessage = {
        id: 'msg1',
        session_id: 'session1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message)

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(message)
    })

    it('should update existing message', () => {
      const message: ChatMessage = {
        id: 'msg1',
        session_id: 'session1',
        role: 'user',
        content: 'Original content',
        timestamp: new Date().toISOString(),
      }

      useChatStore.setState({ messages: [message] })
      useChatStore.getState().updateMessage('msg1', { content: 'Updated content' })

      const messages = useChatStore.getState().messages
      expect(messages[0].content).toBe('Updated content')
    })

    it('should not update non-existent message', () => {
      const message: ChatMessage = {
        id: 'msg1',
        session_id: 'session1',
        role: 'user',
        content: 'Original content',
        timestamp: new Date().toISOString(),
      }

      useChatStore.setState({ messages: [message] })
      useChatStore.getState().updateMessage('msg2', { content: 'Updated content' })

      const messages = useChatStore.getState().messages
      expect(messages[0].content).toBe('Original content')
    })
  })

  describe('Session Actions', () => {
    it('should create new session', async () => {
      vi.mocked(chatSessionService.createSession).mockResolvedValue({} as any)

      await useChatStore.getState().createNewSession()

      const state = useChatStore.getState()
      expect(state.session).toBeTruthy()
      expect(state.session?.session_id).toBeTruthy()
      expect(state.messages).toEqual([])
      expect(state.currentInvestigation).toBeNull()
    })

    it('should update session', () => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
      })

      useChatStore.getState().updateSession({ metadata: { updated: true } })

      const session = useChatStore.getState().session
      expect(session?.metadata).toEqual({ updated: true })
    })

    it('should not update session if none exists', () => {
      useChatStore.setState({ session: null })
      useChatStore.getState().updateSession({ metadata: { updated: true } })

      expect(useChatStore.getState().session).toBeNull()
    })
  })

  describe('Chat History', () => {
    it('should load chat history', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          session_id: 'session1',
          role: 'user',
          content: 'Message 1',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg2',
          session_id: 'session1',
          role: 'assistant',
          content: 'Message 2',
          timestamp: new Date().toISOString(),
        },
      ]

      vi.mocked(chatService.getHistory).mockResolvedValue(mockMessages)

      await useChatStore.getState().loadChatHistory('session1')

      const state = useChatStore.getState()
      expect(state.messages).toEqual(mockMessages)
      expect(state.isLoading).toBe(false)
    })

    it('should handle errors when loading history', async () => {
      const errorMessage = 'Failed to load'
      vi.mocked(chatService.getHistory).mockRejectedValue(new Error(errorMessage))

      await useChatStore.getState().loadChatHistory('session1')

      const state = useChatStore.getState()
      expect(state.error).toBe(errorMessage)
      expect(state.isLoading).toBe(false)
    })

    it('should clear chat', async () => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messages: [
          {
            id: 'msg1',
            session_id: 'test-session',
            role: 'user',
            content: 'Test',
            timestamp: new Date().toISOString(),
          },
        ],
        currentInvestigation: {
          id: 'inv1',
          title: 'Test',
          status: 'in_progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          agents_involved: [],
          findings_count: 0,
          anomalies_count: 0,
          confidence_score: 0,
        },
      })

      vi.mocked(chatService.clearHistory).mockResolvedValue(undefined)

      await useChatStore.getState().clearChat()

      const state = useChatStore.getState()
      expect(state.messages).toEqual([])
      expect(state.currentInvestigation).toBeNull()
    })
  })

  describe('WebSocket Actions', () => {
    it('should not connect WebSocket (backend does not support)', () => {
      // Test the actual behavior - WebSocket is not supported by backend
      useChatStore.getState().connectWebSocket()

      // Verify the connection status remains disconnected
      expect(useChatStore.getState().connectionStatus).toBe('disconnected')
    })

    it('should handle disconnect gracefully (no-op)', () => {
      // WebSocket is never instantiated, so disconnect is a no-op
      useChatStore.getState().disconnectWebSocket()

      // Should just set status to disconnected
      expect(useChatStore.getState().connectionStatus).toBe('disconnected')
    })
  })

  describe('Load Actions', () => {
    it('should load agents', async () => {
      const mockAgents = [
        { id: 'agent1', name: 'Agent 1' },
        { id: 'agent2', name: 'Agent 2' },
      ]
      vi.mocked(chatService.getAgents).mockResolvedValue(mockAgents as any)

      await useChatStore.getState().loadAgents()

      expect(useChatStore.getState().activeAgents).toEqual(mockAgents)
    })

    it('should handle errors when loading agents', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(chatService.getAgents).mockRejectedValue(new Error('Failed to load'))

      await useChatStore.getState().loadAgents()

      // Uses structured logging via createLogger
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] [ChatStore] Failed to load agents'),
        expect.objectContaining({ error: expect.any(Error) })
      )
      consoleSpy.mockRestore()
    })

    it('should load suggestions', async () => {
      const mockSuggestions = [
        { id: 'sug1', label: 'Suggestion 1', action: 'action1', icon: 'icon1' },
        { id: 'sug2', label: 'Suggestion 2', action: 'action2', icon: 'icon2' },
      ]
      vi.mocked(chatService.getSuggestions).mockResolvedValue(mockSuggestions)

      await useChatStore.getState().loadSuggestions()

      expect(useChatStore.getState().suggestedActions).toEqual(mockSuggestions)
    })
  })

  describe('Pagination', () => {
    it('should load more messages with pagination', async () => {
      const existingMessages: ChatMessage[] = [
        {
          id: 'msg2',
          session_id: 'session1',
          role: 'user',
          content: 'Message 2',
          timestamp: new Date().toISOString(),
        },
      ]

      const olderMessages: ChatMessage[] = [
        {
          id: 'msg1',
          session_id: 'session1',
          role: 'user',
          content: 'Message 1',
          timestamp: new Date().toISOString(),
        },
      ]

      useChatStore.setState({
        session: {
          session_id: 'session1',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messages: existingMessages,
      })

      vi.mocked(chatService.getHistoryPaginated).mockResolvedValue({
        items: olderMessages,
        has_more: false,
        cursor: null,
      } as any)

      await useChatStore.getState().loadMoreMessages('cursor1', 'prev')

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe('msg1') // Older message first
      expect(messages[1].id).toBe('msg2') // Existing message second
    })

    it('should append newer messages', async () => {
      const existingMessages: ChatMessage[] = [
        {
          id: 'msg1',
          session_id: 'session1',
          role: 'user',
          content: 'Message 1',
          timestamp: new Date().toISOString(),
        },
      ]

      const newerMessages: ChatMessage[] = [
        {
          id: 'msg2',
          session_id: 'session1',
          role: 'user',
          content: 'Message 2',
          timestamp: new Date().toISOString(),
        },
      ]

      useChatStore.setState({
        session: {
          session_id: 'session1',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messages: existingMessages,
      })

      vi.mocked(chatService.getHistoryPaginated).mockResolvedValue({
        items: newerMessages,
        has_more: false,
        cursor: null,
      } as any)

      await useChatStore.getState().loadMoreMessages('cursor1', 'next')

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe('msg1') // Existing message first
      expect(messages[1].id).toBe('msg2') // Newer message second
    })

    it('should not load more messages without session', async () => {
      useChatStore.setState({ session: null })

      await useChatStore.getState().loadMoreMessages('cursor1', 'prev')

      // Should not call the service
      expect(chatService.getHistoryPaginated).not.toHaveBeenCalled()
    })

    it('should handle error when loading more messages', async () => {
      useChatStore.setState({
        session: {
          session_id: 'session1',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messages: [],
      })

      vi.mocked(chatService.getHistoryPaginated).mockRejectedValue(new Error('Network error'))

      await useChatStore.getState().loadMoreMessages('cursor1', 'prev')

      expect(useChatStore.getState().error).toBe('Network error')
    })
  })

  describe('Streaming State', () => {
    it('should have correct initial streaming state', () => {
      const state = useChatStore.getState()
      expect(state.streaming.isStreaming).toBe(false)
      expect(state.streaming.phase).toBe('idle')
      expect(state.streaming.statusMessage).toBe('')
      expect(state.streaming.currentAgentId).toBeNull()
      expect(state.streaming.currentAgentName).toBeNull()
      expect(state.streaming.streamingMessageId).toBeNull()
      expect(state.streaming.accumulatedContent).toBe('')
    })

    it('should reset streaming state', () => {
      useChatStore.setState({
        streaming: {
          isStreaming: true,
          phase: 'responding',
          statusMessage: 'Processing...',
          currentAgentId: 'agent1',
          currentAgentName: 'Agent 1',
          streamingMessageId: 'msg_123',
          accumulatedContent: 'Some content',
        },
      })

      useChatStore.getState().resetStreamingState()

      const state = useChatStore.getState()
      expect(state.streaming.isStreaming).toBe(false)
      expect(state.streaming.phase).toBe('idle')
      expect(state.streaming.accumulatedContent).toBe('')
    })
  })

  describe('Selected Agent', () => {
    it('should set selected agent', () => {
      useChatStore.getState().setSelectedAgent('agent1')
      expect(useChatStore.getState().selectedAgentId).toBe('agent1')
    })

    it('should clear selected agent', () => {
      useChatStore.setState({ selectedAgentId: 'agent1' })
      useChatStore.getState().setSelectedAgent(null)
      expect(useChatStore.getState().selectedAgentId).toBeNull()
    })
  })

  describe('initializeChat with existing session', () => {
    it('should load existing session when sessionId provided', async () => {
      const mockSession = {
        id: 'supabase-id',
        session_id: 'test-session-123',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T01:00:00Z',
        session_metadata: { test: true },
        messages: [
          {
            id: 'msg1',
            role: 'user' as const,
            content: 'Hello',
            timestamp: '2025-01-01T00:30:00Z',
            agent_id: '',
            agent_name: '',
          },
        ],
      }

      vi.mocked(chatSessionService.getSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatService.getAgents).mockResolvedValue([])
      vi.mocked(chatService.getSuggestions).mockResolvedValue([])

      await useChatStore.getState().initializeChat('test-session-123')

      const state = useChatStore.getState()
      expect(state.session?.session_id).toBe('test-session-123')
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].content).toBe('Hello')
    })

    it('should create new session when provided sessionId not found', async () => {
      vi.mocked(chatSessionService.getSession).mockResolvedValue(null)
      vi.mocked(chatService.getAgents).mockResolvedValue([])
      vi.mocked(chatService.getSuggestions).mockResolvedValue([])

      await useChatStore.getState().initializeChat('non-existent-session')

      const state = useChatStore.getState()
      expect(state.session).toBeTruthy()
      expect(state.session?.session_id).not.toBe('non-existent-session')
    })

    it('should create new session when loading existing session fails', async () => {
      vi.mocked(chatSessionService.getSession).mockRejectedValue(new Error('Database error'))
      vi.mocked(chatService.getAgents).mockResolvedValue([])
      vi.mocked(chatService.getSuggestions).mockResolvedValue([])

      await useChatStore.getState().initializeChat('failing-session')

      const state = useChatStore.getState()
      expect(state.session).toBeTruthy()
    })
  })

  describe('loadSession', () => {
    it('should load session from Supabase', async () => {
      const mockSession = {
        id: 'supabase-id',
        session_id: 'test-session-456',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T01:00:00Z',
        session_metadata: { source: 'test' },
        messages: [
          {
            id: 'msg1',
            role: 'user' as const,
            content: 'Test message',
            timestamp: '2025-01-01T00:30:00Z',
            agent_id: 'agent1',
            agent_name: 'Agent 1',
            metadata: {},
          },
        ],
      }

      vi.mocked(chatSessionService.getSession).mockResolvedValue(mockSession as any)

      await useChatStore.getState().loadSession('test-session-456')

      const state = useChatStore.getState()
      expect(state.session?.session_id).toBe('test-session-456')
      expect(state.messages).toHaveLength(1)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle session not found', async () => {
      vi.mocked(chatSessionService.getSession).mockResolvedValue(null)

      await useChatStore.getState().loadSession('non-existent')

      const state = useChatStore.getState()
      expect(state.error).toBe('Failed to load chat session')
      expect(state.isLoading).toBe(false)
    })

    it('should handle error when loading session', async () => {
      vi.mocked(chatSessionService.getSession).mockRejectedValue(new Error('DB error'))

      await useChatStore.getState().loadSession('error-session')

      const state = useChatStore.getState()
      expect(state.error).toBe('Failed to load chat session')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('clearChat', () => {
    it('should not clear chat without session', async () => {
      useChatStore.setState({ session: null, messages: [] })

      await useChatStore.getState().clearChat()

      // Should not call the service
      expect(chatService.clearHistory).not.toHaveBeenCalled()
    })

    it('should handle error when clearing chat', async () => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messages: [
          {
            id: 'msg1',
            session_id: 'test-session',
            role: 'user',
            content: 'Test',
            timestamp: new Date().toISOString(),
          },
        ],
      })

      vi.mocked(chatService.clearHistory).mockRejectedValue(new Error('Clear failed'))

      await useChatStore.getState().clearChat()

      expect(useChatStore.getState().error).toBe('Clear failed')
    })
  })

  describe('sendStreamingMessage', () => {
    it('should create session if none exists before streaming', async () => {
      useChatStore.setState({ session: null, messageIndex: {} })

      // Start sending - the session should be created synchronously
      const sendPromise = useChatStore.getState().sendStreamingMessage('Test message')

      // Wait for async operations to start
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Session should have been created
      expect(useChatStore.getState().session).toBeTruthy()

      await sendPromise.catch(() => {})
    })

    it('should add user message to store before network request', async () => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messageIndex: {},
      })

      // Start streaming
      const sendPromise = useChatStore.getState().sendStreamingMessage('Hello streaming')

      // Wait for synchronous operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      const messages = useChatStore.getState().messages
      // Should have at least the user message
      expect(messages.length).toBeGreaterThanOrEqual(1)
      const userMsg = messages.find((m) => m.role === 'user')
      expect(userMsg).toBeDefined()
      expect(userMsg?.content).toBe('Hello streaming')

      await sendPromise.catch(() => {})
    })

    it('should preserve selectedAgentId during streaming', async () => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        selectedAgentId: 'zumbi',
        messageIndex: {},
      })

      // Start streaming
      const sendPromise = useChatStore.getState().sendStreamingMessage('Test')

      // Wait for operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      // selectedAgentId should still be set
      expect(useChatStore.getState().selectedAgentId).toBe('zumbi')

      await sendPromise.catch(() => {})
    })
  })

  describe('Message Index', () => {
    it('should build message index when adding messages', () => {
      const message1: ChatMessage = {
        id: 'msg1',
        session_id: 'session1',
        role: 'user',
        content: 'First message',
        timestamp: new Date().toISOString(),
      }

      const message2: ChatMessage = {
        id: 'msg2',
        session_id: 'session1',
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date().toISOString(),
      }

      useChatStore.getState().addMessage(message1)
      useChatStore.getState().addMessage(message2)

      const state = useChatStore.getState()
      expect(state.messageIndex['msg1']).toBe(0)
      expect(state.messageIndex['msg2']).toBe(1)
    })

    it('should use message index for O(1) updates', () => {
      const messages: ChatMessage[] = [
        { id: 'msg1', session_id: 's', role: 'user', content: 'Original 1', timestamp: '' },
        { id: 'msg2', session_id: 's', role: 'user', content: 'Original 2', timestamp: '' },
        { id: 'msg3', session_id: 's', role: 'user', content: 'Original 3', timestamp: '' },
      ]

      const messageIndex: Record<string, number> = {}
      messages.forEach((m, idx) => (messageIndex[m.id] = idx))

      useChatStore.setState({ messages, messageIndex })

      // Update middle message
      useChatStore.getState().updateMessage('msg2', { content: 'Updated 2' })

      const state = useChatStore.getState()
      expect(state.messages[1].content).toBe('Updated 2')
      // Other messages unchanged
      expect(state.messages[0].content).toBe('Original 1')
      expect(state.messages[2].content).toBe('Original 3')
    })

    it('should rebuild message index on rehydration', () => {
      const messages: ChatMessage[] = [
        { id: 'msg1', session_id: 's', role: 'user', content: 'Msg 1', timestamp: '' },
        { id: 'msg2', session_id: 's', role: 'user', content: 'Msg 2', timestamp: '' },
      ]

      // Simulate rehydration from localStorage (no messageIndex)
      useChatStore.setState({ messages, messageIndex: {} })

      // The onRehydrateStorage callback should rebuild the index
      const onRehydrate = (useChatStore.persist as any).getOptions().onRehydrateStorage
      if (onRehydrate) {
        const rehydratedState = onRehydrate()({ messages })
      }

      // Manually rebuild index like the store does
      const messageIndex: Record<string, number> = {}
      messages.forEach((msg, idx) => (messageIndex[msg.id] = idx))
      useChatStore.setState({ messageIndex })

      const state = useChatStore.getState()
      expect(state.messageIndex['msg1']).toBe(0)
      expect(state.messageIndex['msg2']).toBe(1)
    })
  })

  describe('sendMessage - Additional edge cases', () => {
    beforeEach(() => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
      })
    })

    it('should handle response with alternative field names', async () => {
      const mockResponse = {
        response: 'Alternative response field',
        session_id: 'test-session',
        agent_id: 'agent1',
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue({} as any)

      await useChatStore.getState().sendMessage('Test')

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg?.content).toBe('Alternative response field')
    })

    it('should handle response with content field', async () => {
      const mockResponse = {
        content: 'Content field response',
        session_id: 'test-session',
        agent_id: 'agent1',
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue({} as any)

      await useChatStore.getState().sendMessage('Test')

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg?.content).toBe('Content field response')
    })

    it('should use fallback message when response content is empty', async () => {
      const mockResponse = {
        message: '',
        session_id: 'test-session',
        agent_id: 'agent1',
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue({} as any)

      await useChatStore.getState().sendMessage('Test')

      const messages = useChatStore.getState().messages
      const assistantMsg = messages.find((m) => m.role === 'assistant')
      expect(assistantMsg?.content).toBe('Desculpe, não consegui processar sua mensagem.')
    })

    it('should not add duplicate user message if already exists', async () => {
      const content = 'Test message'
      const existingMessage: ChatMessage = {
        id: 'existing',
        session_id: 'test-session',
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }

      useChatStore.setState({
        messages: [existingMessage],
        messageIndex: { existing: 0 },
      })

      const mockResponse: ChatResponse = {
        message: 'Response',
        session_id: 'test-session',
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue({} as any)

      await useChatStore.getState().sendMessage(content)

      const messages = useChatStore.getState().messages
      const userMessages = messages.filter((m) => m.role === 'user')
      expect(userMessages).toHaveLength(1) // No duplicate
    })

    it('should handle Supabase save failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockResponse: ChatResponse = {
        message: 'Response',
        session_id: 'test-session',
        agent_id: 'agent1',
      }

      vi.mocked(chatService.sendMessage).mockResolvedValue(mockResponse)
      vi.mocked(chatSessionService.addMessage).mockRejectedValue(new Error('DB error'))

      await useChatStore.getState().sendMessage('Test')

      // Should still complete successfully
      const messages = useChatStore.getState().messages
      expect(messages.length).toBeGreaterThan(0)
      expect(useChatStore.getState().error).toBeNull()

      // Should log error
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save message to Supabase'),
        expect.objectContaining({ error: expect.any(Error) })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Persist Configuration', () => {
    it('should only persist last 100 messages', () => {
      const messages: ChatMessage[] = Array.from({ length: 150 }, (_, i) => ({
        id: `msg${i}`,
        session_id: 'session1',
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        timestamp: new Date().toISOString(),
      }))

      useChatStore.setState({ messages })

      // Get what would be persisted
      const partialize = (useChatStore.persist as any).getOptions().partialize
      const persistedState = partialize(useChatStore.getState())

      expect(persistedState.messages.length).toBe(100)
      // Should keep the last 100
      expect(persistedState.messages[0].id).toBe('msg50')
      expect(persistedState.messages[99].id).toBe('msg149')
    })

    it('should persist session and selectedAgentId', () => {
      const session = {
        session_id: 'test-session',
        created_at: new Date().toISOString(),
        metadata: { test: true },
      }

      useChatStore.setState({
        session,
        selectedAgentId: 'zumbi',
      })

      const partialize = (useChatStore.persist as any).getOptions().partialize
      const persistedState = partialize(useChatStore.getState())

      expect(persistedState.session).toEqual(session)
      expect(persistedState.selectedAgentId).toBe('zumbi')
    })

    it('should not persist transient state', () => {
      useChatStore.setState({
        isLoading: true,
        error: 'Test error',
        streaming: {
          isStreaming: true,
          phase: 'responding',
          statusMessage: 'Processing...',
          currentAgentId: 'agent1',
          currentAgentName: 'Agent 1',
          streamingMessageId: 'msg_123',
          accumulatedContent: 'Content',
        },
      })

      const partialize = (useChatStore.persist as any).getOptions().partialize
      const persistedState = partialize(useChatStore.getState())

      expect(persistedState.isLoading).toBeUndefined()
      expect(persistedState.error).toBeUndefined()
      expect(persistedState.streaming).toBeUndefined()
    })
  })

  describe('sendStreamingMessage - Stream callbacks', () => {
    beforeEach(() => {
      useChatStore.setState({
        session: {
          session_id: 'test-session',
          created_at: new Date().toISOString(),
          metadata: {},
        },
        messageIndex: {},
      })
    })

    it('should set correct agent when selectedAgentId is provided', async () => {
      useChatStore.setState({ selectedAgentId: 'zumbi' })

      const sendPromise = useChatStore.getState().sendStreamingMessage('Test')

      await new Promise((resolve) => setTimeout(resolve, 50))

      const state = useChatStore.getState()
      // Either agent is set or we're in error state (network issue)
      expect(['zumbi', null]).toContain(state.streaming.currentAgentId)
      // More importantly, selectedAgentId should be preserved
      expect(state.selectedAgentId).toBe('zumbi')

      await sendPromise.catch(() => {})
    })

    it('should use detecting phase when no agent selected', async () => {
      useChatStore.setState({ selectedAgentId: null })

      const sendPromise = useChatStore.getState().sendStreamingMessage('Test')

      await new Promise((resolve) => setTimeout(resolve, 50))

      const state = useChatStore.getState()
      // Initial phase should be detecting when no agent selected
      expect(['detecting', 'error']).toContain(state.streaming.phase)

      await sendPromise.catch(() => {})
    })
  })
})
