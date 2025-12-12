/**
 * Agora Chat Store Tests
 *
 * Tests for Agora Academy chat state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// Mock dependencies before import
vi.mock('@/lib/chat/adapters/primary.adapter', () => ({
  PrimaryAdapter: vi.fn().mockImplementation(() => ({
    sendStreaming: vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('@/lib/services/chat-session.service', () => ({
  chatSessionService: {
    createSession: vi.fn().mockResolvedValue(undefined),
    addMessage: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/data/agents', () => ({
  EDUCATIONAL_AGENT_IDS: ['santos-dumont', 'bobardi', 'monteiro_lobato'] as const,
  getEducationalAgents: vi.fn(() => [
    { id: 'santos-dumont', name: 'Santos-Dumont' },
    { id: 'bobardi', name: 'Bobardi' },
    { id: 'monteiro_lobato', name: 'Monteiro Lobato' },
  ]),
}))

import { useAgoraChatStore, type AgoraChatMessage } from './agora-chat-store'

describe('Agora Chat Store', () => {
  beforeEach(() => {
    // Reset store state
    useAgoraChatStore.setState({
      messages: [],
      sessionId: null,
      selectedAgentId: 'santos-dumont',
      isLoading: false,
      error: null,
      streaming: {
        isStreaming: false,
        phase: 'idle',
        statusMessage: '',
        currentAgentId: null,
        currentAgentName: null,
        accumulatedContent: '',
      },
      onXpEarned: null,
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with empty messages', () => {
      const state = useAgoraChatStore.getState()
      expect(state.messages).toEqual([])
    })

    it('should start with no session', () => {
      const state = useAgoraChatStore.getState()
      expect(state.sessionId).toBeNull()
    })

    it('should start with default educational agent', () => {
      const state = useAgoraChatStore.getState()
      expect(state.selectedAgentId).toBe('santos-dumont')
    })

    it('should not be loading initially', () => {
      const state = useAgoraChatStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const state = useAgoraChatStore.getState()
      expect(state.error).toBeNull()
    })

    it('should have idle streaming state', () => {
      const state = useAgoraChatStore.getState()
      expect(state.streaming.isStreaming).toBe(false)
      expect(state.streaming.phase).toBe('idle')
      expect(state.streaming.accumulatedContent).toBe('')
    })

    it('should have no XP callback initially', () => {
      const state = useAgoraChatStore.getState()
      expect(state.onXpEarned).toBeNull()
    })
  })

  describe('initializeChat', () => {
    it('should create session ID if none exists', () => {
      act(() => {
        useAgoraChatStore.getState().initializeChat()
      })

      const state = useAgoraChatStore.getState()
      expect(state.sessionId).not.toBeNull()
      expect(state.sessionId).toMatch(/^agora_\d+_\w+$/)
    })

    it('should not change session ID if already initialized', () => {
      // Set initial session
      useAgoraChatStore.setState({ sessionId: 'agora_existing_session' })

      act(() => {
        useAgoraChatStore.getState().initializeChat()
      })

      const state = useAgoraChatStore.getState()
      expect(state.sessionId).toBe('agora_existing_session')
    })
  })

  describe('selectAgent', () => {
    it('should select valid educational agent', () => {
      act(() => {
        useAgoraChatStore.getState().selectAgent('bobardi')
      })

      expect(useAgoraChatStore.getState().selectedAgentId).toBe('bobardi')
    })

    it('should select another valid educational agent', () => {
      act(() => {
        useAgoraChatStore.getState().selectAgent('monteiro_lobato')
      })

      expect(useAgoraChatStore.getState().selectedAgentId).toBe('monteiro_lobato')
    })

    it('should not select non-educational agent', () => {
      act(() => {
        useAgoraChatStore.getState().selectAgent('invalid_agent')
      })

      // Should remain unchanged
      expect(useAgoraChatStore.getState().selectedAgentId).toBe('santos-dumont')
    })
  })

  describe('clearChat', () => {
    it('should clear all messages', () => {
      // Add some messages first
      const messages: AgoraChatMessage[] = [
        {
          id: 'msg_1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date().toISOString(),
          agentId: 'santos-dumont',
        },
      ]
      useAgoraChatStore.setState({ messages })

      act(() => {
        useAgoraChatStore.getState().clearChat()
      })

      expect(useAgoraChatStore.getState().messages).toEqual([])
    })

    it('should generate new session ID', () => {
      useAgoraChatStore.setState({ sessionId: 'old_session_id' })

      act(() => {
        useAgoraChatStore.getState().clearChat()
      })

      const newSessionId = useAgoraChatStore.getState().sessionId
      expect(newSessionId).not.toBe('old_session_id')
      expect(newSessionId).toMatch(/^agora_\d+_\w+$/)
    })

    it('should reset streaming state', () => {
      useAgoraChatStore.setState({
        streaming: {
          isStreaming: true,
          phase: 'responding',
          statusMessage: 'Processing...',
          currentAgentId: 'santos-dumont',
          currentAgentName: 'Santos-Dumont',
          accumulatedContent: 'Some content',
        },
      })

      act(() => {
        useAgoraChatStore.getState().clearChat()
      })

      const state = useAgoraChatStore.getState()
      expect(state.streaming.isStreaming).toBe(false)
      expect(state.streaming.phase).toBe('idle')
      expect(state.streaming.accumulatedContent).toBe('')
    })

    it('should clear error', () => {
      useAgoraChatStore.setState({ error: 'Some error' })

      act(() => {
        useAgoraChatStore.getState().clearChat()
      })

      expect(useAgoraChatStore.getState().error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error', () => {
      useAgoraChatStore.setState({ error: 'Test error message' })

      act(() => {
        useAgoraChatStore.getState().clearError()
      })

      expect(useAgoraChatStore.getState().error).toBeNull()
    })

    it('should do nothing if no error', () => {
      act(() => {
        useAgoraChatStore.getState().clearError()
      })

      expect(useAgoraChatStore.getState().error).toBeNull()
    })
  })

  describe('setXpCallback', () => {
    it('should set XP callback function', () => {
      const mockCallback = vi.fn()

      act(() => {
        useAgoraChatStore.getState().setXpCallback(mockCallback)
      })

      expect(useAgoraChatStore.getState().onXpEarned).toBe(mockCallback)
    })

    it('should replace existing callback', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      useAgoraChatStore.setState({ onXpEarned: callback1 })

      act(() => {
        useAgoraChatStore.getState().setXpCallback(callback2)
      })

      expect(useAgoraChatStore.getState().onXpEarned).toBe(callback2)
    })
  })

  describe('Streaming State', () => {
    it('should track streaming progress', () => {
      useAgoraChatStore.setState({
        streaming: {
          isStreaming: true,
          phase: 'thinking',
          statusMessage: 'Santos-Dumont está pensando...',
          currentAgentId: 'santos-dumont',
          currentAgentName: 'Santos-Dumont',
          accumulatedContent: '',
        },
      })

      const state = useAgoraChatStore.getState()
      expect(state.streaming.isStreaming).toBe(true)
      expect(state.streaming.phase).toBe('thinking')
      expect(state.streaming.currentAgentName).toBe('Santos-Dumont')
    })

    it('should accumulate content during streaming', () => {
      useAgoraChatStore.setState({
        streaming: {
          isStreaming: true,
          phase: 'responding',
          statusMessage: '',
          currentAgentId: 'santos-dumont',
          currentAgentName: 'Santos-Dumont',
          accumulatedContent: 'Hello, ',
        },
      })

      // Simulate adding more content
      const currentContent = useAgoraChatStore.getState().streaming.accumulatedContent
      useAgoraChatStore.setState({
        streaming: {
          ...useAgoraChatStore.getState().streaming,
          accumulatedContent: currentContent + 'how are you?',
        },
      })

      expect(useAgoraChatStore.getState().streaming.accumulatedContent).toBe('Hello, how are you?')
    })
  })

  describe('Message Management', () => {
    it('should add user message', () => {
      const userMessage: AgoraChatMessage = {
        id: 'msg_user_1',
        role: 'user',
        content: 'Tell me about aviation',
        timestamp: new Date().toISOString(),
      }

      useAgoraChatStore.setState({
        messages: [userMessage],
      })

      const state = useAgoraChatStore.getState()
      expect(state.messages.length).toBe(1)
      expect(state.messages[0].role).toBe('user')
      expect(state.messages[0].content).toBe('Tell me about aviation')
    })

    it('should add assistant message with agent info', () => {
      const assistantMessage: AgoraChatMessage = {
        id: 'msg_assistant_1',
        role: 'assistant',
        content: 'Aviation is fascinating!',
        timestamp: new Date().toISOString(),
        agentId: 'santos-dumont',
        agentName: 'Santos-Dumont',
      }

      useAgoraChatStore.setState({
        messages: [assistantMessage],
      })

      const state = useAgoraChatStore.getState()
      expect(state.messages[0].role).toBe('assistant')
      expect(state.messages[0].agentId).toBe('santos-dumont')
      expect(state.messages[0].agentName).toBe('Santos-Dumont')
    })

    it('should maintain message order', () => {
      const messages: AgoraChatMessage[] = [
        { id: '1', role: 'user', content: 'First', timestamp: '2025-01-01T10:00:00Z' },
        { id: '2', role: 'assistant', content: 'Response 1', timestamp: '2025-01-01T10:00:01Z' },
        { id: '3', role: 'user', content: 'Second', timestamp: '2025-01-01T10:00:02Z' },
        { id: '4', role: 'assistant', content: 'Response 2', timestamp: '2025-01-01T10:00:03Z' },
      ]

      useAgoraChatStore.setState({ messages })

      const state = useAgoraChatStore.getState()
      expect(state.messages.length).toBe(4)
      expect(state.messages[0].content).toBe('First')
      expect(state.messages[3].content).toBe('Response 2')
    })
  })

  describe('Error Handling', () => {
    it('should store error message', () => {
      useAgoraChatStore.setState({ error: 'Connection failed' })

      expect(useAgoraChatStore.getState().error).toBe('Connection failed')
    })

    it('should track error in streaming state', () => {
      useAgoraChatStore.setState({
        streaming: {
          isStreaming: false,
          phase: 'error',
          statusMessage: 'Request timeout',
          currentAgentId: null,
          currentAgentName: null,
          accumulatedContent: '',
        },
      })

      const state = useAgoraChatStore.getState()
      expect(state.streaming.phase).toBe('error')
      expect(state.streaming.statusMessage).toBe('Request timeout')
    })
  })

  describe('Loading State', () => {
    it('should track loading state', () => {
      useAgoraChatStore.setState({ isLoading: true })
      expect(useAgoraChatStore.getState().isLoading).toBe(true)

      useAgoraChatStore.setState({ isLoading: false })
      expect(useAgoraChatStore.getState().isLoading).toBe(false)
    })
  })
})
