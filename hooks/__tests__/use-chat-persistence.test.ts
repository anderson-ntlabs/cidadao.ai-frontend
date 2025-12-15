/**
 * Tests for useChatPersistence hook
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChatPersistence } from '../use-chat-persistence'
import { chatSessionService } from '@/lib/services/chat-session.service'

// Mock the chat session service
vi.mock('@/lib/services/chat-session.service', () => ({
  chatSessionService: {
    createSession: vi.fn(),
    addMessage: vi.fn(),
  },
}))

// Mock crypto.randomUUID
const mockUUID = '12345678-1234-1234-1234-123456789012'
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => mockUUID),
  },
})

describe('useChatPersistence', () => {
  const defaultOptions = {
    agentId: 'agent-123',
    agentName: 'Test Agent',
    isKidsMode: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with null session ID', () => {
      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      expect(result.current.sessionId).toBe(null)
      expect(typeof result.current.initSession).toBe('function')
      expect(typeof result.current.saveUserMessage).toBe('function')
      expect(typeof result.current.saveAssistantMessage).toBe('function')
    })

    it('should accept kids mode option', () => {
      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
          childName: 'João',
        })
      )

      expect(result.current.sessionId).toBe(null)
    })
  })

  describe('initSession', () => {
    it('should create a new session successfully', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
        agent_id: 'agent-123',
        metadata: {
          is_kids_mode: false,
          platform: 'agora',
        },
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let sessionId: string = ''

      await act(async () => {
        sessionId = await result.current.initSession()
      })

      expect(sessionId).toBe(mockUUID)
      // Note: sessionId is stored in a ref and won't trigger re-renders
      expect(chatSessionService.createSession).toHaveBeenCalledWith({
        session_id: mockUUID,
        agent_id: 'agent-123',
        metadata: {
          is_kids_mode: false,
          child_name: undefined,
          platform: 'agora',
          started_at: expect.any(String),
        },
      })
    })

    it('should create session with kids mode metadata', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)

      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
          childName: 'Maria',
        })
      )

      await act(async () => {
        await result.current.initSession()
      })

      expect(chatSessionService.createSession).toHaveBeenCalledWith({
        session_id: mockUUID,
        agent_id: 'agent-123',
        metadata: {
          is_kids_mode: true,
          child_name: 'Maria',
          platform: 'agora',
          started_at: expect.any(String),
        },
      })
    })

    it('should return existing session ID if already initialized', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      // First call
      await act(async () => {
        await result.current.initSession()
      })

      // Second call
      let secondSessionId: string = ''
      await act(async () => {
        secondSessionId = await result.current.initSession()
      })

      expect(secondSessionId).toBe(mockUUID)
      expect(chatSessionService.createSession).toHaveBeenCalledTimes(1)
    })

    it('should handle session creation errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(chatSessionService.createSession).mockRejectedValue(new Error('Database error'))

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let sessionId: string = ''

      await act(async () => {
        sessionId = await result.current.initSession()
      })

      // Should still return session ID even if DB save fails
      expect(sessionId).toBe(mockUUID)

      consoleErrorSpy.mockRestore()
    })

    it('should handle null session response', async () => {
      vi.mocked(chatSessionService.createSession).mockResolvedValue(null)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      let sessionId: string = ''

      await act(async () => {
        sessionId = await result.current.initSession()
      })

      expect(sessionId).toBe(mockUUID)
    })
  })

  describe('saveUserMessage', () => {
    it('should save user message successfully', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      await act(async () => {
        await result.current.saveUserMessage('Hello, how can I help?')
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(mockUUID, {
        role: 'user',
        content: 'Hello, how can I help?',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        metadata: {
          is_kids_mode: false,
          child_name: undefined,
        },
      })
    })

    it('should initialize session if not already initialized', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      // Don't call initSession first
      await act(async () => {
        await result.current.saveUserMessage('Test message')
      })

      expect(chatSessionService.createSession).toHaveBeenCalled()
      expect(chatSessionService.addMessage).toHaveBeenCalled()
    })

    it('should include kids mode metadata in user message', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
          childName: 'Pedro',
        })
      )

      await act(async () => {
        await result.current.initSession()
        await result.current.saveUserMessage('Kids message')
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(mockUUID, {
        role: 'user',
        content: 'Kids message',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        metadata: {
          is_kids_mode: true,
          child_name: 'Pedro',
        },
      })
    })

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      // Should not throw
      await act(async () => {
        await result.current.saveUserMessage('Test')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('saveAssistantMessage', () => {
    it('should save assistant message successfully', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      await act(async () => {
        await result.current.saveAssistantMessage('I can help you with that.')
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(mockUUID, {
        role: 'assistant',
        content: 'I can help you with that.',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        metadata: {
          is_kids_mode: false,
        },
      })
    })

    it('should initialize session if not already initialized', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.saveAssistantMessage('Assistant response')
      })

      expect(chatSessionService.createSession).toHaveBeenCalled()
      expect(chatSessionService.addMessage).toHaveBeenCalled()
    })

    it('should include kids mode flag in assistant message', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
        })
      )

      await act(async () => {
        await result.current.saveAssistantMessage('Kids response')
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(mockUUID, {
        role: 'assistant',
        content: 'Kids response',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        metadata: {
          is_kids_mode: true,
        },
      })
    })

    it('should not include child_name in assistant messages', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
          childName: 'Ana',
        })
      )

      await act(async () => {
        await result.current.saveAssistantMessage('Response')
      })

      const callArgs = vi.mocked(chatSessionService.addMessage).mock.calls[0][1]
      expect(callArgs.metadata).not.toHaveProperty('child_name')
    })

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.initSession()
      })

      await act(async () => {
        await result.current.saveAssistantMessage('Test')
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('conversation flow', () => {
    it('should handle complete conversation flow', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      // Initialize session
      await act(async () => {
        await result.current.initSession()
      })

      // User message
      await act(async () => {
        await result.current.saveUserMessage('What is transparency?')
      })

      // Assistant response
      await act(async () => {
        await result.current.saveAssistantMessage(
          'Transparency is about making government data accessible.'
        )
      })

      // Another user message
      await act(async () => {
        await result.current.saveUserMessage('Tell me more')
      })

      expect(chatSessionService.createSession).toHaveBeenCalledTimes(1)
      expect(chatSessionService.addMessage).toHaveBeenCalledTimes(3)
    })
  })

  describe('edge cases', () => {
    it('should handle empty message content', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      await act(async () => {
        await result.current.saveUserMessage('')
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(mockUUID, {
        role: 'user',
        content: '',
        agent_id: 'agent-123',
        agent_name: 'Test Agent',
        metadata: expect.any(Object),
      })
    })

    it('should handle very long messages', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)
      vi.mocked(chatSessionService.addMessage).mockResolvedValue(true)

      const { result } = renderHook(() => useChatPersistence(defaultOptions))

      const longMessage = 'a'.repeat(10000)

      await act(async () => {
        await result.current.saveUserMessage(longMessage)
      })

      expect(chatSessionService.addMessage).toHaveBeenCalledWith(
        mockUUID,
        expect.objectContaining({
          content: longMessage,
        })
      )
    })

    it('should handle null child name', async () => {
      const mockSession = {
        id: 'db-session-id',
        session_id: mockUUID,
      }

      vi.mocked(chatSessionService.createSession).mockResolvedValue(mockSession as any)

      const { result } = renderHook(() =>
        useChatPersistence({
          ...defaultOptions,
          isKidsMode: true,
          childName: null,
        })
      )

      await act(async () => {
        await result.current.initSession()
      })

      expect(chatSessionService.createSession).toHaveBeenCalledWith({
        session_id: mockUUID,
        agent_id: 'agent-123',
        metadata: {
          is_kids_mode: true,
          child_name: null,
          platform: 'agora',
          started_at: expect.any(String),
        },
      })
    })
  })
})
