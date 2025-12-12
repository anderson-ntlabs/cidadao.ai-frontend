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
  })
})
