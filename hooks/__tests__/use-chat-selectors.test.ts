/**
 * @vitest-environment jsdom
 *
 * Chat Selectors Tests
 *
 * Tests for optimized Zustand selectors that prevent unnecessary re-renders.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStore } from '@/store/chat-store'
import {
  useChatMessages,
  useChatSession,
  useChatLoading,
  useChatError,
  useChatAgents,
  useChatSelectedAgent,
  useChatTypingStates,
  useChatStreaming,
  useChatStatus,
  useChatInputState,
  useChatActions,
  useChatLastMessage,
  useChatMessageCount,
  useChatIsActive,
  useChatCanSend,
  useChatSelectors,
} from '../use-chat-selectors'

// Mock dependencies
vi.mock('@/lib/api/chat.service', () => ({
  chatService: {
    sendMessage: vi.fn(),
    getAgents: vi.fn().mockResolvedValue([]),
    getSuggestions: vi.fn().mockResolvedValue([]),
  },
  generateSessionId: vi.fn(() => 'test-session-id'),
}))

vi.mock('@/lib/services/chat-session.service', () => ({
  chatSessionService: {
    getSession: vi.fn(),
    createSession: vi.fn(),
  },
}))

// WebSocket mock removed - no longer used in store

vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}))

vi.mock('@/lib/chat/adapters/primary.adapter', () => ({
  PrimaryAdapter: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn(),
    streamMessage: vi.fn(),
  })),
}))

describe('use-chat-selectors', () => {
  beforeEach(() => {
    // Reset store to initial state
    useChatStore.setState({
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
      streaming: {
        isStreaming: false,
        phase: 'idle',
        statusMessage: '',
        currentAgentId: null,
        currentAgentName: null,
        streamingMessageId: null,
        accumulatedContent: '',
      },
    })
  })

  describe('Atomic Selectors', () => {
    it('useChatMessages should return messages array', () => {
      const { result } = renderHook(() => useChatMessages())
      expect(result.current).toEqual([])

      // Add a message
      act(() => {
        useChatStore.setState({
          messages: [
            {
              id: 'msg-1',
              session_id: 'session-1',
              role: 'user',
              content: 'Hello',
              timestamp: '2025-01-01T00:00:00Z',
            },
          ],
        })
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].content).toBe('Hello')
    })

    it('useChatSession should return current session', () => {
      const { result } = renderHook(() => useChatSession())
      expect(result.current).toBeNull()

      act(() => {
        useChatStore.setState({
          session: {
            session_id: 'session-1',
            created_at: '2025-01-01T00:00:00Z',
            last_message_at: '2025-01-01T00:00:00Z',
            metadata: {},
          },
        })
      })

      expect(result.current?.session_id).toBe('session-1')
    })

    it('useChatLoading should return loading state', () => {
      const { result } = renderHook(() => useChatLoading())
      expect(result.current).toBe(false)

      act(() => {
        useChatStore.setState({ isLoading: true })
      })

      expect(result.current).toBe(true)
    })

    it('useChatError should return error state', () => {
      const { result } = renderHook(() => useChatError())
      expect(result.current).toBeNull()

      act(() => {
        useChatStore.setState({ error: 'Test error' })
      })

      expect(result.current).toBe('Test error')
    })

    it('useChatAgents should return active agents', () => {
      const { result } = renderHook(() => useChatAgents())
      expect(result.current).toEqual([])

      act(() => {
        useChatStore.setState({
          activeAgents: [
            { id: 'agent-1', name: 'Test Agent', role: 'assistant', status: 'active' },
          ],
        })
      })

      expect(result.current).toHaveLength(1)
      expect(result.current[0].name).toBe('Test Agent')
    })

    it('useChatSelectedAgent should return selected agent ID', () => {
      const { result } = renderHook(() => useChatSelectedAgent())
      expect(result.current).toBeNull()

      act(() => {
        useChatStore.setState({ selectedAgentId: 'agent-1' })
      })

      expect(result.current).toBe('agent-1')
    })

    it('useChatTypingStates should return typing states', () => {
      const { result } = renderHook(() => useChatTypingStates())
      expect(result.current).toEqual({ isTyping: false, agentTyping: false })

      act(() => {
        useChatStore.setState({ isTyping: true, agentTyping: true })
      })

      expect(result.current).toEqual({ isTyping: true, agentTyping: true })
    })

    it('useChatStreaming should return streaming state', () => {
      const { result } = renderHook(() => useChatStreaming())
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.phase).toBe('idle')

      act(() => {
        useChatStore.setState({
          streaming: {
            isStreaming: true,
            phase: 'responding',
            statusMessage: 'Generating response...',
            currentAgentId: 'agent-1',
            currentAgentName: 'Test Agent',
            streamingMessageId: 'msg-1',
            accumulatedContent: 'Hello',
          },
        })
      })

      expect(result.current.isStreaming).toBe(true)
      expect(result.current.phase).toBe('responding')
    })
  })

  describe('Composite Selectors', () => {
    it('useChatStatus should return loading, error, and connection status', () => {
      const { result } = renderHook(() => useChatStatus())

      expect(result.current).toEqual({
        isLoading: false,
        error: null,
        connectionStatus: 'disconnected',
      })

      act(() => {
        useChatStore.setState({
          isLoading: true,
          error: 'Error',
          connectionStatus: 'connected',
        })
      })

      expect(result.current).toEqual({
        isLoading: true,
        error: 'Error',
        connectionStatus: 'connected',
      })
    })

    it('useChatInputState should return input-related states', () => {
      const { result } = renderHook(() => useChatInputState())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isTyping).toBe(false)
      expect(result.current.agentTyping).toBe(false)
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Derived Selectors', () => {
    it('useChatLastMessage should return the last message', () => {
      const { result } = renderHook(() => useChatLastMessage())
      expect(result.current).toBeUndefined()

      act(() => {
        useChatStore.setState({
          messages: [
            {
              id: 'msg-1',
              session_id: 's-1',
              role: 'user',
              content: 'First',
              timestamp: '2025-01-01T00:00:00Z',
            },
            {
              id: 'msg-2',
              session_id: 's-1',
              role: 'assistant',
              content: 'Second',
              timestamp: '2025-01-01T00:00:01Z',
            },
          ],
        })
      })

      expect(result.current?.content).toBe('Second')
    })

    it('useChatMessageCount should return message count', () => {
      const { result } = renderHook(() => useChatMessageCount())
      expect(result.current).toBe(0)

      act(() => {
        useChatStore.setState({
          messages: [
            {
              id: 'msg-1',
              session_id: 's-1',
              role: 'user',
              content: 'Test',
              timestamp: '2025-01-01T00:00:00Z',
            },
          ],
        })
      })

      expect(result.current).toBe(1)
    })

    it('useChatIsActive should return true when messages exist', () => {
      const { result } = renderHook(() => useChatIsActive())
      expect(result.current).toBe(false)

      act(() => {
        useChatStore.setState({
          messages: [
            {
              id: 'msg-1',
              session_id: 's-1',
              role: 'user',
              content: 'Test',
              timestamp: '2025-01-01T00:00:00Z',
            },
          ],
        })
      })

      expect(result.current).toBe(true)
    })

    it('useChatIsActive should return true when session exists', () => {
      const { result } = renderHook(() => useChatIsActive())
      expect(result.current).toBe(false)

      act(() => {
        useChatStore.setState({
          session: {
            session_id: 's-1',
            created_at: '2025-01-01T00:00:00Z',
            last_message_at: '2025-01-01T00:00:00Z',
            metadata: {},
          },
        })
      })

      expect(result.current).toBe(true)
    })

    it('useChatCanSend should return true when not loading/streaming/error', () => {
      const { result } = renderHook(() => useChatCanSend())
      expect(result.current).toBe(true)

      act(() => {
        useChatStore.setState({ isLoading: true })
      })
      expect(result.current).toBe(false)

      act(() => {
        useChatStore.setState({
          isLoading: false,
          streaming: { ...useChatStore.getState().streaming, isStreaming: true },
        })
      })
      expect(result.current).toBe(false)

      act(() => {
        useChatStore.setState({
          streaming: { ...useChatStore.getState().streaming, isStreaming: false },
          error: 'Error',
        })
      })
      expect(result.current).toBe(false)
    })
  })

  describe('Action Selectors', () => {
    it('useChatActions should return action functions', () => {
      const { result } = renderHook(() => useChatActions())

      expect(typeof result.current.initializeChat).toBe('function')
      expect(typeof result.current.sendMessage).toBe('function')
      expect(typeof result.current.sendStreamingMessage).toBe('function')
      expect(typeof result.current.setSelectedAgent).toBe('function')
      expect(typeof result.current.clearChat).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })

  describe('Flexible Selector', () => {
    it('useChatSelectors should return only requested keys', () => {
      const { result } = renderHook(() => useChatSelectors(['messages', 'isLoading', 'error']))

      expect(result.current).toHaveProperty('messages')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).not.toHaveProperty('session')
      expect(result.current).not.toHaveProperty('activeAgents')
    })

    it('useChatSelectors should update when selected state changes', () => {
      const { result } = renderHook(() => useChatSelectors(['isLoading', 'error']))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()

      act(() => {
        useChatStore.setState({ isLoading: true, error: 'Test error' })
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe('Test error')
    })
  })
})
