/**
 * Tests for useChatPage hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatPage } from '../use-chat-page'

// Mock store functions using vi.hoisted
const {
  mockSendMessage,
  mockSendStreamingMessage,
  mockClearError,
  mockLoadSession,
  mockCreateNewSession,
  mockInitializeChat,
  mockSetSelectedAgent,
  mockChatStoreState,
} = vi.hoisted(() => ({
  mockSendMessage: vi.fn(() => Promise.resolve()),
  mockSendStreamingMessage: vi.fn(() => Promise.resolve()),
  mockClearError: vi.fn(),
  mockLoadSession: vi.fn(() => Promise.resolve()),
  mockCreateNewSession: vi.fn(() => Promise.resolve()),
  mockInitializeChat: vi.fn(),
  mockSetSelectedAgent: vi.fn(),
  mockChatStoreState: {
    messages: [] as Array<{ id: string; content: string | null; role: string; agent_id?: string }>,
    session: null as { session_id: string; title?: string } | null,
    isLoading: false,
    error: null as string | null,
    streaming: { isStreaming: false, accumulatedContent: '' },
    selectedAgentId: null as string | null,
  },
}))

vi.mock('@/store/chat-store', () => ({
  useChatStore: (selector: (state: typeof mockChatStoreState) => unknown) => {
    const state = {
      ...mockChatStoreState,
      sendMessage: mockSendMessage,
      sendStreamingMessage: mockSendStreamingMessage,
      clearError: mockClearError,
      loadSession: mockLoadSession,
      createNewSession: mockCreateNewSession,
      initializeChat: mockInitializeChat,
      setSelectedAgent: mockSetSelectedAgent,
    }
    return selector(state as unknown as typeof mockChatStoreState)
  },
}))

// Mock useAuth
const mockUser = vi.hoisted(() => ({
  current: { id: 'user-123', email: 'test@test.com' } as { id: string; email: string } | null,
}))

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: mockUser.current,
  }),
}))

// Mock toast
const mockToast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock announcement helpers
const mockAnnounce = vi.hoisted(() => ({
  announceLoading: vi.fn(),
  announceSuccess: vi.fn(),
  announceError: vi.fn(),
}))

vi.mock('@/components/a11y', () => ({
  useAnnouncementHelpers: () => mockAnnounce,
}))

// Mock mobile keyboard
vi.mock('@/hooks/use-mobile-keyboard', () => ({
  useMobileKeyboard: () => ({
    keyboardHeight: 0,
    isKeyboardVisible: false,
  }),
}))

// Mock mobile detection
vi.mock('@/lib/utils/mobile-detection', () => ({
  useMobileDetection: () => false,
}))

// Mock chat mode history
const mockModeHistory = vi.hoisted(() => ({
  saveMessages: vi.fn(),
  getMessagesForMode: vi.fn(() => []),
  switchMode: vi.fn(),
  hasModeMessages: vi.fn(() => false),
}))

vi.mock('@/hooks/use-chat-mode-history', () => ({
  useChatModeHistory: () => mockModeHistory,
}))

// Mock getAgentById
vi.mock('@/hooks/use-agent', () => ({
  getAgentById: (id: string) => ({
    id,
    name: 'Abaporu',
    role_pt: 'Analista Geral',
  }),
}))

describe('useChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.current = { id: 'user-123', email: 'test@test.com' }
    mockChatStoreState.messages = []
    mockChatStoreState.session = null
    mockChatStoreState.isLoading = false
    mockChatStoreState.error = null
    mockChatStoreState.streaming = { isStreaming: false, accumulatedContent: '' }
    mockChatStoreState.selectedAgentId = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('returns initial UI state', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.inputMessage).toBe('')
      expect(result.current.isHistoryOpen).toBe(false)
      expect(result.current.isAgentSelectorOpen).toBe(false)
      expect(result.current.currentAgentId).toBe('abaporu')
      expect(result.current.chatMode).toBe('cidadao')
    })

    it('returns user from auth', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.user).toEqual({ id: 'user-123', email: 'test@test.com' })
    })

    it('returns refs', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.messagesEndRef).toBeDefined()
      expect(result.current.messagesContainerRef).toBeDefined()
      expect(result.current.textareaRef).toBeDefined()
    })

    it('returns mobile state', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.keyboardHeight).toBe(0)
      expect(result.current.isKeyboardVisible).toBe(false)
      expect(result.current.isMobile).toBe(false)
    })

    it('returns chat store state', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.messages).toEqual([])
      expect(result.current.session).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.streaming).toEqual({ isStreaming: false, accumulatedContent: '' })
      expect(result.current.selectedAgentId).toBeNull()
    })

    it('canSendMessage is true when not loading and no error', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.canSendMessage).toBe(true)
    })

    it('canSendMessage is false when loading', () => {
      mockChatStoreState.isLoading = true
      const { result } = renderHook(() => useChatPage())

      expect(result.current.canSendMessage).toBe(false)
    })

    it('canSendMessage is false when streaming', () => {
      mockChatStoreState.streaming = { isStreaming: true, accumulatedContent: 'test' }
      const { result } = renderHook(() => useChatPage())

      expect(result.current.canSendMessage).toBe(false)
    })

    it('canSendMessage is false when there is an error', () => {
      mockChatStoreState.error = 'Some error'
      const { result } = renderHook(() => useChatPage())

      expect(result.current.canSendMessage).toBe(false)
    })
  })

  describe('Input Message', () => {
    it('updates input message', () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello world')
      })

      expect(result.current.inputMessage).toBe('Hello world')
    })
  })

  describe('History Panel', () => {
    it('toggles history panel', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.isHistoryOpen).toBe(false)

      act(() => {
        result.current.setIsHistoryOpen(true)
      })

      expect(result.current.isHistoryOpen).toBe(true)
    })
  })

  describe('Agent Selector', () => {
    it('toggles agent selector', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.isAgentSelectorOpen).toBe(false)

      act(() => {
        result.current.setIsAgentSelectorOpen(true)
      })

      expect(result.current.isAgentSelectorOpen).toBe(true)
    })

    it('sets selected agent', () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setSelectedAgent('zumbi')
      })

      expect(mockSetSelectedAgent).toHaveBeenCalledWith('zumbi')
    })

    it('updates current agent id when setting agent', () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setSelectedAgent('zumbi')
      })

      expect(result.current.currentAgentId).toBe('zumbi')
    })
  })

  describe('Model Selection', () => {
    it('sets selected model', () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.selectedModel).toBe('sabia-4')

      act(() => {
        result.current.setSelectedModel('sabia-4-2025-01-10')
      })

      expect(result.current.selectedModel).toBe('sabia-4-2025-01-10')
    })
  })

  describe('Send Message', () => {
    it('does not send empty message', async () => {
      const { result } = renderHook(() => useChatPage())

      await act(async () => {
        await result.current.handleSendMessage()
      })

      expect(mockSendStreamingMessage).not.toHaveBeenCalled()
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('sends message in cidadao mode using streaming', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      await act(async () => {
        await result.current.handleSendMessage()
      })

      expect(mockSendStreamingMessage).toHaveBeenCalledWith('Hello')
      expect(result.current.inputMessage).toBe('')
    })

    it('sends message in maritaca mode using regular send', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      await act(async () => {
        await result.current.handleModeChange('maritaca')
      })

      act(() => {
        result.current.setInputMessage('Hello Maritaca')
      })

      await act(async () => {
        await result.current.handleSendMessage()
      })

      expect(mockSendMessage).toHaveBeenCalledWith('Hello Maritaca', false)
    })

    it('clears input after sending', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      expect(result.current.inputMessage).toBe('Hello')

      await act(async () => {
        await result.current.handleSendMessage()
      })

      expect(result.current.inputMessage).toBe('')
    })

    it('announces loading when sending', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      await act(async () => {
        await result.current.handleSendMessage()
      })

      expect(mockAnnounce.announceLoading).toHaveBeenCalledWith('resposta do agente')
    })
  })

  describe('Keyboard Navigation', () => {
    it('sends message on Enter key', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      await act(async () => {
        result.current.handleKeyDown({
          key: 'Enter',
          shiftKey: false,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent)
      })

      expect(mockSendStreamingMessage).toHaveBeenCalledWith('Hello')
    })

    it('does not send message on Shift+Enter', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setInputMessage('Hello')
      })

      await act(async () => {
        result.current.handleKeyDown({
          key: 'Enter',
          shiftKey: true,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent)
      })

      expect(mockSendStreamingMessage).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('dismisses error', () => {
      mockChatStoreState.error = 'Some error'
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.handleDismissError()
      })

      expect(mockClearError).toHaveBeenCalled()
      expect(result.current.showErrorBanner).toBe(false)
    })
  })

  describe('Mode Change', () => {
    it('changes mode to maritaca', async () => {
      const { result } = renderHook(() => useChatPage())

      expect(result.current.chatMode).toBe('cidadao')

      await act(async () => {
        await result.current.handleModeChange('maritaca')
      })

      expect(result.current.chatMode).toBe('maritaca')
      expect(mockCreateNewSession).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalled()
    })

    it('changes mode to cidadao', async () => {
      const { result } = renderHook(() => useChatPage())

      await act(async () => {
        await result.current.handleModeChange('maritaca')
      })

      await act(async () => {
        await result.current.handleModeChange('cidadao')
      })

      expect(result.current.chatMode).toBe('cidadao')
      expect(mockCreateNewSession).toHaveBeenCalled()
    })

    it('saves current messages when changing mode', async () => {
      mockChatStoreState.messages = [
        { id: '1', content: 'Hello', role: 'user' },
        { id: '2', content: 'Hi there', role: 'assistant', agent_id: 'abaporu' },
      ]

      const { result } = renderHook(() => useChatPage())

      await act(async () => {
        await result.current.handleModeChange('maritaca')
      })

      expect(mockModeHistory.saveMessages).toHaveBeenCalledWith(
        'cidadao',
        mockChatStoreState.messages
      )
    })
  })

  describe('Session Management', () => {
    it('loads session', async () => {
      const { result } = renderHook(() => useChatPage())

      act(() => {
        result.current.setIsHistoryOpen(true)
      })

      await act(async () => {
        await result.current.handleSelectSession('session-123')
      })

      expect(mockLoadSession).toHaveBeenCalledWith('session-123')
      expect(result.current.isHistoryOpen).toBe(false)
      expect(mockToast.success).toHaveBeenCalledWith('Sucesso', 'Conversa carregada!')
    })

    it('handles session load error', async () => {
      mockLoadSession.mockRejectedValueOnce(new Error('Failed'))
      const { result } = renderHook(() => useChatPage())

      await act(async () => {
        await result.current.handleSelectSession('session-123')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Erro', 'Falha ao carregar conversa')
    })

    it('creates new session', async () => {
      const { result } = renderHook(() => useChatPage())

      await act(async () => {
        await result.current.createNewSession()
      })

      expect(mockCreateNewSession).toHaveBeenCalled()
    })
  })

  describe('Scroll Functions', () => {
    it('provides scrollToBottom function', () => {
      const { result } = renderHook(() => useChatPage())

      expect(typeof result.current.scrollToBottom).toBe('function')
    })

    it('provides handleScroll function', () => {
      const { result } = renderHook(() => useChatPage())

      expect(typeof result.current.handleScroll).toBe('function')
    })
  })

  describe('Mode History', () => {
    it('provides hasModeMessages function', () => {
      const { result } = renderHook(() => useChatPage())

      expect(typeof result.current.hasModeMessages).toBe('function')
    })

    it('calls hasModeMessages from chat mode history', () => {
      mockModeHistory.hasModeMessages.mockReturnValueOnce(true)
      const { result } = renderHook(() => useChatPage())

      const hasMessages = result.current.hasModeMessages('maritaca')

      expect(mockModeHistory.hasModeMessages).toHaveBeenCalledWith('maritaca')
      expect(hasMessages).toBe(true)
    })
  })

  describe('Textarea Height', () => {
    it('provides adjustTextareaHeight function', () => {
      const { result } = renderHook(() => useChatPage())

      expect(typeof result.current.adjustTextareaHeight).toBe('function')
    })
  })

  describe('Initialization', () => {
    it('initializes chat on mount', () => {
      renderHook(() => useChatPage())

      expect(mockInitializeChat).toHaveBeenCalled()
    })

    it('only initializes once', () => {
      const { rerender } = renderHook(() => useChatPage())

      rerender()
      rerender()

      expect(mockInitializeChat).toHaveBeenCalledTimes(1)
    })
  })
})
