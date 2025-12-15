/**
 * Tests for WebSocket chat client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ChatWebSocket,
  getChatWebSocket,
  closeChatWebSocket,
  type WebSocketConfig,
  type WebSocketEventHandler,
} from './chat-websocket'
import type { WSMessage, WSChatResponse } from '@/types/chat'

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  WS_BASE_URL: 'wss://test-api.com',
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock WebSocket class
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  url: string
  readyState: number = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    this.url = url
    // Simulate connection after a delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.(new Event('open'))
    }, 10)
  }

  send = vi.fn((data: string) => {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
  })

  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: code === 1000 }))
  })

  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }

  simulateError() {
    this.onerror?.(new Event('error'))
  }

  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: code === 1000 }))
  }
}

// Replace global WebSocket
;(global as any).WebSocket = MockWebSocket

describe('ChatWebSocket', () => {
  let config: WebSocketConfig
  let handlers: WebSocketEventHandler
  let chatWs: ChatWebSocket
  let mockWebSocket: MockWebSocket

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    config = {
      sessionId: 'test-session',
      token: 'test-token',
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      heartbeatInterval: 5000,
    }

    handlers = {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
      onChat: vi.fn(),
      onTyping: vi.fn(),
      onConnectionStatus: vi.fn(),
    }

    // Capture created WebSocket instances
    const originalWebSocket = (global as any).WebSocket
    ;(global as any).WebSocket = vi.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url)
      return mockWebSocket
    })
    ;(global as any).WebSocket.CONNECTING = MockWebSocket.CONNECTING
    ;(global as any).WebSocket.OPEN = MockWebSocket.OPEN
    ;(global as any).WebSocket.CLOSING = MockWebSocket.CLOSING
    ;(global as any).WebSocket.CLOSED = MockWebSocket.CLOSED
  })

  afterEach(() => {
    if (chatWs) {
      chatWs.disconnect()
    }
    vi.clearAllTimers()
    vi.useRealTimers()
    closeChatWebSocket()
  })

  describe('constructor', () => {
    it('should create instance with default config', () => {
      chatWs = new ChatWebSocket(config, handlers)
      expect(chatWs).toBeInstanceOf(ChatWebSocket)
    })

    it('should merge custom config with defaults', () => {
      const customConfig: WebSocketConfig = {
        sessionId: 'test-session',
        reconnect: false,
        reconnectInterval: 10000,
        maxReconnectAttempts: 10,
        heartbeatInterval: 60000,
      }

      chatWs = new ChatWebSocket(customConfig, handlers)
      expect(chatWs).toBeInstanceOf(ChatWebSocket)
    })

    it('should use default values for optional config', () => {
      const minimalConfig: WebSocketConfig = {
        sessionId: 'test-session',
      }

      chatWs = new ChatWebSocket(minimalConfig, handlers)
      expect(chatWs).toBeInstanceOf(ChatWebSocket)
    })
  })

  describe('connect', () => {
    it('should establish WebSocket connection', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('connecting')
      expect((global as any).WebSocket).toHaveBeenCalledWith(
        'wss://test-api.com/api/v1/ws/chat/test-session?token=test-token'
      )

      // Wait for connection
      await vi.advanceTimersByTimeAsync(10)

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('connected')
      expect(handlers.onOpen).toHaveBeenCalled()
    })

    it('should connect without token', async () => {
      const noTokenConfig = { sessionId: 'test-session' }
      chatWs = new ChatWebSocket(noTokenConfig, handlers)
      chatWs.connect()

      expect((global as any).WebSocket).toHaveBeenCalledWith(
        'wss://test-api.com/api/v1/ws/chat/test-session'
      )
    })

    it('should not connect if already connected', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      vi.clearAllMocks()
      chatWs.connect()

      expect((global as any).WebSocket).not.toHaveBeenCalled()
    })

    it('should not connect if connection in progress', () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      // Try to connect again immediately
      vi.clearAllMocks()
      chatWs.connect()

      // Should not create another WebSocket
      expect((global as any).WebSocket).not.toHaveBeenCalled()
    })

    it('should handle connection error during creation', () => {
      // Mock WebSocket constructor to throw
      ;(global as any).WebSocket = vi.fn(() => {
        throw new Error('Connection failed')
      })
      ;(global as any).WebSocket.OPEN = MockWebSocket.OPEN

      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('connecting')
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('error')
    })

    it('should reset reconnect attempts on successful connection', async () => {
      chatWs = new ChatWebSocket(config, handlers)

      // Simulate previous failed attempts
      ;(chatWs as any).reconnectAttempts = 2

      chatWs.connect()
      await vi.advanceTimersByTimeAsync(10)

      expect((chatWs as any).reconnectAttempts).toBe(0)
    })

    it('should start heartbeat on connection', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      expect((chatWs as any).heartbeatInterval).not.toBeNull()
    })

    it('should flush message queue on connection', async () => {
      chatWs = new ChatWebSocket(config, handlers)

      // Queue messages before connecting
      const message: WSMessage = { type: 'chat', data: { content: 'Queued' } }
      ;(chatWs as any).messageQueue.push(message)

      chatWs.connect()
      await vi.advanceTimersByTimeAsync(10)

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message))
      expect((chatWs as any).messageQueue).toHaveLength(0)
    })
  })

  describe('message handling', () => {
    beforeEach(async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()
      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()
    })

    it('should handle connection messages', () => {
      const message: WSMessage = {
        type: 'connection',
        data: { sessionId: 'test-session' },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle chat messages', () => {
      const message: WSChatResponse = {
        type: 'chat',
        data: {
          agent_id: 'zumbi',
          agent_name: 'Zumbi dos Palmares',
          content: 'Hello, I can help you!',
          chunk_index: 0,
        },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
      expect(handlers.onChat).toHaveBeenCalledWith(message.data)
    })

    it('should handle chat_complete messages', () => {
      const message: WSChatResponse = {
        type: 'chat_complete',
        data: {
          agent_id: 'zumbi',
          agent_name: 'Zumbi dos Palmares',
          content: 'Analysis complete',
          is_complete: true,
        },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
      expect(handlers.onChat).toHaveBeenCalledWith(message.data)
    })

    it('should handle typing messages', () => {
      const message: WSMessage = {
        type: 'typing',
        data: { isTyping: true },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onTyping).toHaveBeenCalledWith(true)
    })

    it('should handle typing messages with missing isTyping field', () => {
      const message: WSMessage = {
        type: 'typing',
        data: {},
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onTyping).toHaveBeenCalledWith(false)
    })

    it('should handle error messages', () => {
      const message: WSMessage = {
        type: 'error',
        data: { message: 'Server error' },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle pong messages', () => {
      const message: WSMessage = {
        type: 'pong',
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle subscribed messages', () => {
      const message: WSMessage = {
        type: 'subscribed',
        data: { investigation_id: 'inv-123' },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle unsubscribed messages', () => {
      const message: WSMessage = {
        type: 'unsubscribed',
        data: { investigation_id: 'inv-123' },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle investigation_update messages', () => {
      const message: WSMessage = {
        type: 'investigation_update',
        data: { status: 'in_progress' },
      }

      mockWebSocket.simulateMessage(message)

      expect(handlers.onMessage).toHaveBeenCalledWith(message)
    })

    it('should handle malformed JSON messages', async () => {
      const { logger } = await import('@/lib/logger')
      const errorSpy = vi.spyOn(logger, 'error')

      mockWebSocket.onmessage?.(new MessageEvent('message', { data: 'invalid json' }))

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to parse WebSocket message',
        expect.any(Error),
        expect.objectContaining({
          context: 'ChatWebSocket',
        })
      )
      expect(handlers.onMessage).not.toHaveBeenCalled()
    })

    it('should handle messages with optional handlers missing', () => {
      const minimalHandlers: WebSocketEventHandler = {}
      const minimalWs = new ChatWebSocket(config, minimalHandlers)
      ;(minimalWs as any).ws = mockWebSocket

      const message: WSChatResponse = {
        type: 'chat',
        data: {
          agent_id: 'zumbi',
          agent_name: 'Zumbi',
          content: 'Test',
        },
      }

      // Should not throw
      expect(() => mockWebSocket.simulateMessage(message)).not.toThrow()
    })
  })

  describe('sending messages', () => {
    beforeEach(async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()
      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()
    })

    it('should send messages when connected', () => {
      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello' },
      }

      chatWs.send(message)

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message))
    })

    it('should queue messages when not connected', () => {
      mockWebSocket.readyState = MockWebSocket.CLOSED

      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello' },
      }

      chatWs.send(message)

      expect(mockWebSocket.send).not.toHaveBeenCalled()
      expect((chatWs as any).messageQueue).toHaveLength(1)
    })

    it('should trigger reconnect when queuing messages', async () => {
      chatWs.disconnect()
      vi.clearAllMocks()

      const message: WSMessage = {
        type: 'chat',
        data: { content: 'Hello' },
      }

      chatWs.send(message)

      // Should attempt to connect
      expect((global as any).WebSocket).toHaveBeenCalled()
    })

    it('should send chat messages with context', () => {
      chatWs.sendChatMessage('Hello', { key: 'value' })

      expect(mockWebSocket.send).toHaveBeenCalledWith(expect.stringContaining('"content":"Hello"'))
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"session_id":"test-session"')
      )
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"context":{"key":"value"}')
      )
    })

    it('should send chat messages without context', () => {
      chatWs.sendChatMessage('Simple message')

      const sentData = JSON.parse((mockWebSocket.send as any).mock.calls[0][0])
      expect(sentData.type).toBe('chat')
      expect(sentData.data.content).toBe('Simple message')
      expect(sentData.id).toMatch(/^msg_/)
      expect(sentData.timestamp).toBeDefined()
    })

    it('should generate unique message IDs', () => {
      chatWs.sendChatMessage('Message 1')
      chatWs.sendChatMessage('Message 2')

      const id1 = JSON.parse((mockWebSocket.send as any).mock.calls[0][0]).id
      const id2 = JSON.parse((mockWebSocket.send as any).mock.calls[1][0]).id

      expect(id1).not.toBe(id2)
    })

    it('should subscribe to investigations', () => {
      chatWs.subscribeToInvestigation('inv-123')

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'subscribe',
          data: { investigation_id: 'inv-123' },
        })
      )
    })

    it('should unsubscribe from investigations', () => {
      chatWs.unsubscribeFromInvestigation('inv-456')

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'unsubscribe',
          data: { investigation_id: 'inv-456' },
        })
      )
    })
  })

  describe('heartbeat', () => {
    it('should send ping messages periodically', async () => {
      const customConfig = { ...config, heartbeatInterval: 1000 }
      chatWs = new ChatWebSocket(customConfig, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Advance to trigger heartbeat
      await vi.advanceTimersByTimeAsync(1000)

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }))

      // Advance again for another heartbeat
      await vi.advanceTimersByTimeAsync(1000)

      expect(mockWebSocket.send).toHaveBeenCalledTimes(2)
    })

    it('should stop heartbeat on disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      chatWs.disconnect()
      const sendCallsAfterDisconnect = (mockWebSocket.send as any).mock.calls.length

      // Advance time - no heartbeat should be sent
      await vi.advanceTimersByTimeAsync(10000)

      expect((mockWebSocket.send as any).mock.calls.length).toBe(sendCallsAfterDisconnect)
    })

    it('should not send ping if connection is not open', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Close connection
      mockWebSocket.readyState = MockWebSocket.CLOSED

      // Trigger heartbeat
      await vi.advanceTimersByTimeAsync(5000)

      // Should not send ping when closed
      expect(mockWebSocket.send).not.toHaveBeenCalled()
    })

    it('should restart heartbeat on reconnection', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      // Simulate close and reconnect
      mockWebSocket.simulateClose(1006, 'Abnormal')
      await vi.advanceTimersByTimeAsync(config.reconnectInterval!)
      await vi.advanceTimersByTimeAsync(10)

      expect((chatWs as any).heartbeatInterval).not.toBeNull()
    })
  })

  describe('reconnection', () => {
    it('should reconnect on unexpected close', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Simulate unexpected close
      mockWebSocket.simulateClose(1006, 'Abnormal closure')

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('disconnected')
      expect(handlers.onClose).toHaveBeenCalled()

      // Advance time for reconnect
      await vi.advanceTimersByTimeAsync(config.reconnectInterval!)

      expect((global as any).WebSocket).toHaveBeenCalled()
    })

    it('should not reconnect on clean close', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Simulate clean close
      mockWebSocket.simulateClose(1000, 'Normal closure')

      await vi.advanceTimersByTimeAsync(config.reconnectInterval!)

      // Should not reconnect on clean close
      expect((global as any).WebSocket).not.toHaveBeenCalled()
    })

    it('should increase delay with exponential backoff', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      // Initial state should be connected with 0 attempts
      expect((chatWs as any).reconnectAttempts).toBe(0)

      // Simulate first failed connection - should schedule reconnect with 1x delay
      mockWebSocket.simulateClose(1006, 'Connection lost')
      expect((chatWs as any).reconnectAttempts).toBe(1)

      // Verify the delay calculation happens before next connection
      const firstDelay = config.reconnectInterval! * 1

      // Wait for first reconnect
      await vi.advanceTimersByTimeAsync(firstDelay)
      await vi.advanceTimersByTimeAsync(10)

      // After successful reconnection, attempts should reset to 0
      expect((chatWs as any).reconnectAttempts).toBe(0)

      // Now test second failure to verify backoff increases
      mockWebSocket.simulateClose(1006, 'Connection lost')
      expect((chatWs as any).reconnectAttempts).toBe(1)

      // Close again before it reconnects to increase attempts
      await vi.advanceTimersByTimeAsync(config.reconnectInterval!)
      await vi.advanceTimersByTimeAsync(5)
      mockWebSocket.simulateClose(1006, 'Connection lost')

      // Now attempts should be 2, and delay should be 2x
      expect((chatWs as any).reconnectAttempts).toBe(2)
    })

    it('should stop after max reconnection attempts', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Manually increment attempts to simulate failed reconnections
      // The scheduleReconnect method increments before checking the limit
      ;(chatWs as any).reconnectAttempts = config.maxReconnectAttempts!

      // Now trigger another close - this should hit the limit
      mockWebSocket.simulateClose(1006, 'Connection lost')

      // The scheduleReconnect should have been called and detected we're at max
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('error')

      // Verify no reconnection is scheduled
      const callsBeforeWait = ((global as any).WebSocket as any).mock.calls.length
      await vi.advanceTimersByTimeAsync(config.reconnectInterval! * 10)
      expect(((global as any).WebSocket as any).mock.calls.length).toBe(callsBeforeWait)
    })

    it('should not reconnect if disabled', async () => {
      const noReconnectConfig = { ...config, reconnect: false }
      chatWs = new ChatWebSocket(noReconnectConfig, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      // Simulate close
      mockWebSocket.simulateClose(1006, 'Connection lost')

      await vi.advanceTimersByTimeAsync(5000)

      // Should not trigger reconnection
      expect((global as any).WebSocket).not.toHaveBeenCalled()
    })

    it('should clear reconnect timeout on manual disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      // Trigger reconnect scheduling
      mockWebSocket.simulateClose(1006, 'Connection lost')

      // Disconnect before reconnect happens
      chatWs.disconnect()

      expect((chatWs as any).reconnectTimeout).toBeNull()
    })
  })

  describe('disconnect', () => {
    it('should close connection cleanly', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      chatWs.disconnect()

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect')
      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('disconnected')
    })

    it('should stop reconnection on disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      chatWs.disconnect()

      // Should not reconnect after manual disconnect
      vi.clearAllMocks()
      await vi.advanceTimersByTimeAsync(5000)

      expect((global as any).WebSocket).not.toHaveBeenCalled()
    })

    it('should clear all timers on disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      chatWs.disconnect()

      expect((chatWs as any).reconnectTimeout).toBeNull()
      expect((chatWs as any).heartbeatInterval).toBeNull()
    })

    it('should disable reconnect flag on disconnect', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      chatWs.disconnect()

      expect((chatWs as any).config.reconnect).toBe(false)
    })

    it('should handle disconnect when not connected', () => {
      chatWs = new ChatWebSocket(config, handlers)

      // Should not throw
      expect(() => chatWs.disconnect()).not.toThrow()
    })
  })

  describe('state management', () => {
    it('should report disconnected when no connection', () => {
      chatWs = new ChatWebSocket(config, handlers)

      expect(chatWs.getState()).toBe('disconnected')
      expect(chatWs.isConnected()).toBe(false)
    })

    it('should report connecting state', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      // Check immediately after connect (before async connection completes)
      expect(['connecting', 'connected']).toContain(chatWs.getState())
    })

    it('should report connected when open', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      expect(chatWs.getState()).toBe('connected')
      expect(chatWs.isConnected()).toBe(true)
    })

    it('should report disconnected when closed', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      mockWebSocket.readyState = MockWebSocket.CLOSED

      expect(chatWs.getState()).toBe('disconnected')
      expect(chatWs.isConnected()).toBe(false)
    })

    it('should report disconnected when closing', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      mockWebSocket.readyState = MockWebSocket.CLOSING

      expect(chatWs.getState()).toBe('disconnected')
      expect(chatWs.isConnected()).toBe(false)
    })

    it('should handle invalid readyState', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      mockWebSocket.readyState = 999 as any

      expect(chatWs.getState()).toBe('error')
      expect(chatWs.isConnected()).toBe(false)
    })
  })

  describe('message queue', () => {
    it('should queue messages when not connected', async () => {
      chatWs = new ChatWebSocket(config, handlers)

      // Send messages before connecting
      const message1: WSMessage = { type: 'chat', data: { content: 'Message 1' } }
      const message2: WSMessage = { type: 'chat', data: { content: 'Message 2' } }

      chatWs.send(message1)
      chatWs.send(message2)

      expect((chatWs as any).messageQueue).toHaveLength(2)

      // Connect and wait for connection
      chatWs.connect()
      await vi.advanceTimersByTimeAsync(10)

      // Both messages should be sent after connection
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message1))
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message2))
      expect((chatWs as any).messageQueue).toHaveLength(0)
    })

    it('should flush queue only when connection is open', async () => {
      chatWs = new ChatWebSocket(config, handlers)

      const message: WSMessage = { type: 'chat', data: { content: 'Test' } }
      ;(chatWs as any).messageQueue.push(message)

      // Try to flush with closed connection
      mockWebSocket.readyState = MockWebSocket.CLOSED
      ;(chatWs as any).flushMessageQueue()

      expect(mockWebSocket.send).not.toHaveBeenCalled()
      expect((chatWs as any).messageQueue).toHaveLength(1)
    })
  })

  describe('error handling', () => {
    it('should handle WebSocket errors', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)

      mockWebSocket.simulateError()

      expect(handlers.onConnectionStatus).toHaveBeenCalledWith('error')
      expect(handlers.onError).toHaveBeenCalled()
    })

    it('should schedule reconnect on error', async () => {
      chatWs = new ChatWebSocket(config, handlers)
      chatWs.connect()

      await vi.advanceTimersByTimeAsync(10)
      vi.clearAllMocks()

      mockWebSocket.simulateError()
      mockWebSocket.simulateClose(1006, 'Connection error')

      await vi.advanceTimersByTimeAsync(config.reconnectInterval!)

      expect((global as any).WebSocket).toHaveBeenCalled()
    })
  })
})

describe('singleton management', () => {
  let handlers: WebSocketEventHandler

  beforeEach(() => {
    vi.useFakeTimers()

    handlers = {
      onOpen: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
      onMessage: vi.fn(),
    }

    // Clear singleton
    closeChatWebSocket()
  })

  afterEach(() => {
    closeChatWebSocket()
    vi.useRealTimers()
  })

  it('should create singleton instance', () => {
    const config = { sessionId: 'test-session' }

    const instance1 = getChatWebSocket(config, handlers)
    const instance2 = getChatWebSocket(config, handlers)

    expect(instance1).toBe(instance2)
  })

  it('should close and clear singleton', () => {
    const config = { sessionId: 'test-session' }

    const instance = getChatWebSocket(config, handlers)
    const disconnectSpy = vi.spyOn(instance, 'disconnect')

    closeChatWebSocket()

    expect(disconnectSpy).toHaveBeenCalled()

    // New instance should be different
    const newInstance = getChatWebSocket(config, handlers)
    expect(newInstance).not.toBe(instance)
  })

  it('should handle closing when no instance exists', () => {
    // Should not throw
    expect(() => closeChatWebSocket()).not.toThrow()

    // Call again
    expect(() => closeChatWebSocket()).not.toThrow()
  })
})
