import { renderHook, act } from '@testing-library/react'
import { useChatModeHistory } from '../use-chat-mode-history'
import type { ChatMessage } from '@/types/chat'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Sample messages for testing
const createMessage = (id: string, role: 'user' | 'assistant', content: string): ChatMessage => ({
  id,
  role,
  content,
  timestamp: new Date().toISOString(),
  session_id: 'test-session',
})

describe('useChatModeHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChatModeHistory())

    expect(result.current.currentMode).toBe('cidadao')
    expect(result.current.currentMessages).toEqual([])
    expect(result.current.isLoaded).toBe(true)
  })

  it('should save messages for current mode', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const messages: ChatMessage[] = [
      createMessage('1', 'user', 'Hello'),
      createMessage('2', 'assistant', 'Hi there!'),
    ]

    act(() => {
      result.current.saveMessages('cidadao', messages)
    })

    expect(result.current.currentMessages).toEqual(messages)
    expect(result.current.getMessagesForMode('cidadao')).toEqual(messages)
  })

  it('should add a single message', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const message = createMessage('1', 'user', 'Test message')

    act(() => {
      result.current.addMessage(message)
    })

    expect(result.current.currentMessages).toHaveLength(1)
    expect(result.current.currentMessages[0]).toEqual(message)
  })

  it('should switch modes', () => {
    const { result } = renderHook(() => useChatModeHistory())

    act(() => {
      result.current.switchMode('maritaca')
    })

    expect(result.current.currentMode).toBe('maritaca')
  })

  it('should maintain separate histories for each mode', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const cidadaoMessages: ChatMessage[] = [createMessage('1', 'user', 'Cidadao message')]

    const maritacaMessages: ChatMessage[] = [createMessage('2', 'user', 'Maritaca message')]

    // Save Cidadao messages
    act(() => {
      result.current.saveMessages('cidadao', cidadaoMessages)
    })

    // Switch to Maritaca and save messages
    act(() => {
      result.current.switchMode('maritaca')
      result.current.saveMessages('maritaca', maritacaMessages)
    })

    // Verify both histories are separate
    expect(result.current.getMessagesForMode('cidadao')).toEqual(cidadaoMessages)
    expect(result.current.getMessagesForMode('maritaca')).toEqual(maritacaMessages)
  })

  it('should clear messages for a specific mode', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const messages: ChatMessage[] = [createMessage('1', 'user', 'Test')]

    act(() => {
      result.current.saveMessages('cidadao', messages)
    })

    expect(result.current.currentMessages).toHaveLength(1)

    act(() => {
      result.current.clearMessages('cidadao')
    })

    expect(result.current.currentMessages).toHaveLength(0)
  })

  it('should clear all messages', () => {
    const { result } = renderHook(() => useChatModeHistory())

    act(() => {
      result.current.saveMessages('cidadao', [createMessage('1', 'user', 'Cidadao')])
      result.current.saveMessages('maritaca', [createMessage('2', 'user', 'Maritaca')])
    })

    act(() => {
      result.current.clearAllMessages()
    })

    expect(result.current.getMessagesForMode('cidadao')).toHaveLength(0)
    expect(result.current.getMessagesForMode('maritaca')).toHaveLength(0)
  })

  it('should return correct stats', () => {
    const { result } = renderHook(() => useChatModeHistory())

    act(() => {
      result.current.saveMessages('cidadao', [
        createMessage('1', 'user', 'Message 1'),
        createMessage('2', 'assistant', 'Message 2'),
      ])
      result.current.saveMessages('maritaca', [createMessage('3', 'user', 'Message 3')])
    })

    const stats = result.current.getStats()

    expect(stats.cidadaoCount).toBe(2)
    expect(stats.maritacaCount).toBe(1)
    expect(stats.totalMessages).toBe(3)
    expect(stats.currentMode).toBe('cidadao')
  })

  it('should check if mode has messages', () => {
    const { result } = renderHook(() => useChatModeHistory())

    expect(result.current.hasModeMessages('cidadao')).toBe(false)

    act(() => {
      result.current.saveMessages('cidadao', [createMessage('1', 'user', 'Test')])
    })

    expect(result.current.hasModeMessages('cidadao')).toBe(true)
    expect(result.current.hasModeMessages('maritaca')).toBe(false)
  })

  it('should export and import history', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const messages: ChatMessage[] = [
      createMessage('1', 'user', 'Hello'),
      createMessage('2', 'assistant', 'Hi!'),
    ]

    act(() => {
      result.current.saveMessages('cidadao', messages)
    })

    const exported = result.current.exportHistory()
    const parsed = JSON.parse(exported)

    expect(parsed.cidadao).toEqual(messages)

    // Clear and reimport
    act(() => {
      result.current.clearAllMessages()
    })

    expect(result.current.currentMessages).toHaveLength(0)

    act(() => {
      result.current.importHistory(exported)
    })

    expect(result.current.currentMessages).toEqual(messages)
  })

  it('should handle invalid import gracefully', () => {
    const { result } = renderHook(() => useChatModeHistory())

    act(() => {
      const success = result.current.importHistory('invalid json')
      expect(success).toBe(false)
    })

    act(() => {
      const success = result.current.importHistory('{"invalid": "format"}')
      expect(success).toBe(false)
    })
  })

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useChatModeHistory())

    const messages: ChatMessage[] = [createMessage('1', 'user', 'Persistent message')]

    act(() => {
      result.current.saveMessages('cidadao', messages)
    })

    // Check localStorage was updated
    const stored = localStorageMock.getItem('chat_mode_history')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.cidadao).toEqual(messages)
  })

  it('should load from localStorage on mount', () => {
    // Pre-populate localStorage
    const existingData = {
      cidadao: [createMessage('1', 'user', 'Existing message')],
      maritaca: [],
      currentMode: 'cidadao',
    }
    localStorageMock.setItem('chat_mode_history', JSON.stringify(existingData))

    const { result } = renderHook(() => useChatModeHistory())

    expect(result.current.currentMessages).toEqual(existingData.cidadao)
  })
})
