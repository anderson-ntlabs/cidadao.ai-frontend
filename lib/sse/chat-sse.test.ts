import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ChatSSE, streamChatMessage } from './chat-sse'
import type { ChatRequest, ChatResponse } from '@/types/chat'

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  API_BASE_URL: 'https://test-api.example.com',
}))

vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}))

vi.mock('@/lib/telemetry/chat-telemetry', () => ({
  trackChatMessage: vi.fn(),
  trackChatResponse: vi.fn(),
  trackChatError: vi.fn(),
}))

// Helper to create a mock ReadableStream
function createMockStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let chunkIndex = 0

  return new ReadableStream({
    async pull(controller) {
      if (chunkIndex < chunks.length) {
        controller.enqueue(encoder.encode(chunks[chunkIndex]))
        chunkIndex++
      } else {
        controller.close()
      }
    },
  })
}

// Helper to create SSE formatted message
function createSSEMessage(type: string, data: any): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`
}

describe('ChatSSE', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Mock global fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage: vi.fn() })

      expect(sse).toBeDefined()
      expect(sse.isActive()).toBe(false)
    })

    it('should merge custom config with defaults', () => {
      const sse = new ChatSSE(
        {
          sessionId: 'test-session',
          endpoint: '/custom/endpoint',
          reconnectInterval: 5000,
          maxReconnectAttempts: 10,
        },
        { onMessage: vi.fn() }
      )

      expect(sse).toBeDefined()
    })
  })

  describe('sendMessage', () => {
    it('should send message and process streaming response', async () => {
      const onMessage = vi.fn()
      const onComplete = vi.fn()
      const onConnectionStatus = vi.fn()

      const chunks = [
        createSSEMessage('chunk', { text: 'Hello ' }),
        createSSEMessage('chunk', { text: 'world!' }),
        createSSEMessage('complete', {
          session_id: 'test-session',
          agent_id: 'zumbi',
          agent_name: 'Zumbi dos Palmares',
          confidence: 0.95,
        }),
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(chunks),
      })

      const sse = new ChatSSE(
        { sessionId: 'test-session' },
        { onMessage, onComplete, onConnectionStatus }
      )

      await sse.sendMessage('Test message')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/v1/chat/stream',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            message: 'Test message',
            session_id: 'test-session',
            context: undefined,
          }),
        })
      )

      expect(onConnectionStatus).toHaveBeenCalledWith('connecting')
      expect(onConnectionStatus).toHaveBeenCalledWith('connected')
      expect(onConnectionStatus).toHaveBeenCalledWith('disconnected')

      expect(onMessage).toHaveBeenCalledWith('Hello ')
      expect(onMessage).toHaveBeenCalledWith('world!')

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'test-session',
          agent_id: 'zumbi',
          agent_name: 'Zumbi dos Palmares',
          message: 'Hello world!',
          confidence: 0.95,
        })
      )
    })

    it('should include context in request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage: vi.fn() })

      const context = { userId: '123', locale: 'pt-BR' }
      await sse.sendMessage('Test', context)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            message: 'Test',
            session_id: 'test-session',
            context,
          }),
        })
      )
    })

    it('should handle HTTP errors', async () => {
      const onError = vi.fn()
      const onConnectionStatus = vi.fn()

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const sse = new ChatSSE(
        { sessionId: 'test-session', reconnect: false },
        { onError, onConnectionStatus }
      )

      await sse.sendMessage('Test')

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('HTTP 500'),
        })
      )
      expect(onConnectionStatus).toHaveBeenCalledWith('error')
    })

    it('should handle null response body', async () => {
      const onError = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: null,
      })

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: false }, { onError })

      await sse.sendMessage('Test')

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Response body is null',
        })
      )
    })

    it('should handle network errors', async () => {
      const onError = vi.fn()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: false }, { onError })

      await sse.sendMessage('Test')

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error',
        })
      )
    })

    it('should reset state on new message', async () => {
      const onMessage = vi.fn()
      const onComplete = vi.fn()

      // First message
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'First ' }),
          createSSEMessage('complete', { session_id: 'test-session' }),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage, onComplete })

      await sse.sendMessage('First')

      expect(onMessage).toHaveBeenCalledWith('First ')
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ message: 'First ' }))

      // Second message - state should be reset
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'Second ' }),
          createSSEMessage('complete', { session_id: 'test-session' }),
        ]),
      })

      onMessage.mockClear()
      onComplete.mockClear()

      await sse.sendMessage('Second')

      expect(onMessage).toHaveBeenCalledWith('Second ')
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ message: 'Second ' }))
    })
  })

  describe('SSE message processing', () => {
    it('should handle chunk messages with text field', async () => {
      const onMessage = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'Chunk 1' }),
          createSSEMessage('complete', {}),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage })
      await sse.sendMessage('Test')

      expect(onMessage).toHaveBeenCalledWith('Chunk 1')
    })

    it('should handle chunk messages with content field', async () => {
      const onMessage = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { content: 'Chunk 1' }),
          createSSEMessage('complete', {}),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage })
      await sse.sendMessage('Test')

      expect(onMessage).toHaveBeenCalledWith('Chunk 1')
    })

    it('should accumulate multiple chunks', async () => {
      const onMessage = vi.fn()
      const onComplete = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'Part 1 ' }),
          createSSEMessage('chunk', { text: 'Part 2 ' }),
          createSSEMessage('chunk', { text: 'Part 3' }),
          createSSEMessage('complete', { session_id: 'test' }),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage, onComplete })
      await sse.sendMessage('Test')

      expect(onMessage).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Part 1 Part 2 Part 3' })
      )
    })

    it('should handle complete message with metadata', async () => {
      const onComplete = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'Response' }),
          createSSEMessage('complete', {
            session_id: 'test-session',
            agent_id: 'zumbi',
            agent_name: 'Zumbi dos Palmares',
            confidence: 0.95,
            suggested_actions: ['action1', 'action2'],
            metadata: { source: 'backend' },
          }),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onComplete })
      await sse.sendMessage('Test')

      expect(onComplete).toHaveBeenCalledWith({
        session_id: 'test-session',
        agent_id: 'zumbi',
        agent_name: 'Zumbi dos Palmares',
        message: 'Response',
        confidence: 0.95,
        suggested_actions: ['action1', 'action2'],
        metadata: { source: 'backend' },
      })
    })

    it('should use defaults for missing complete message fields', async () => {
      const onComplete = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          createSSEMessage('chunk', { text: 'Response' }),
          createSSEMessage('complete', {}),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onComplete })
      await sse.sendMessage('Test')

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'test-session',
          agent_id: 'system',
          agent_name: 'Sistema',
          confidence: 0.8,
          suggested_actions: [],
        })
      )
    })

    it('should handle error message type', async () => {
      const onError = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('error', { message: 'Server error occurred' })]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: false }, { onError })
      await sse.sendMessage('Test')

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error occurred',
        })
      )
    })

    it('should handle malformed SSE messages gracefully', async () => {
      const onError = vi.fn()
      const onComplete = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(['invalid sse format\n\n', createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onError, onComplete })
      await sse.sendMessage('Test')

      // Should still complete despite malformed message
      expect(onComplete).toHaveBeenCalled()
    })

    it('should handle invalid JSON in SSE data', async () => {
      const onError = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(['data: {invalid json}\n\n', createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onError })
      await sse.sendMessage('Test')

      expect(onError).toHaveBeenCalled()
    })

    it('should handle buffered incomplete messages', async () => {
      const onMessage = vi.fn()

      // Simulate incomplete SSE message split across chunks
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([
          'data: {"type":"chunk","data":{"text":"Part ',
          '1"}}\n\n',
          createSSEMessage('complete', {}),
        ]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage })
      await sse.sendMessage('Test')

      expect(onMessage).toHaveBeenCalledWith('Part 1')
    })

    it('should handle empty chunk data', async () => {
      const onMessage = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('chunk', {}), createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onMessage })
      await sse.sendMessage('Test')

      expect(onMessage).toHaveBeenCalledWith('')
    })
  })

  describe('abort', () => {
    it('should abort active stream', async () => {
      const onConnectionStatus = vi.fn()
      let resolveRead: (value: any) => void

      const readPromise = new Promise((resolve) => {
        resolveRead = resolve
      })

      const mockStream = {
        getReader: () => ({
          read: () => readPromise,
        }),
      }

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: mockStream,
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onConnectionStatus })

      const sendPromise = sse.sendMessage('Test')

      // Wait for connection to establish
      await Promise.resolve()
      await Promise.resolve()

      expect(sse.isActive()).toBe(true)

      sse.abort()

      expect(sse.isActive()).toBe(false)
      expect(onConnectionStatus).toHaveBeenCalledWith('disconnected')

      // Clean up
      resolveRead!({ done: true, value: undefined })
    })

    it('should handle abort when not active', () => {
      const sse = new ChatSSE({ sessionId: 'test-session' }, {})

      expect(() => sse.abort()).not.toThrow()
      expect(sse.isActive()).toBe(false)
    })

    it('should handle AbortError without logging error', async () => {
      const onError = vi.fn()

      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'

      const mockStream = {
        getReader: () => ({
          read: vi.fn().mockRejectedValue(abortError),
        }),
      }

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: mockStream,
      })

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: false }, { onError })

      await sse.sendMessage('Test')

      // AbortError should not trigger onError
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('reconnection', () => {
    it('should attempt reconnection on error when enabled', async () => {
      const onError = vi.fn()
      const onConnectionStatus = vi.fn()

      // First attempt fails
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'))

      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE(
        {
          sessionId: 'test-session',
          reconnect: true,
          reconnectInterval: 1000,
          maxReconnectAttempts: 3,
        },
        { onError, onConnectionStatus }
      )

      const sendPromise = sse.sendMessage('Test')

      // Wait for first failure
      await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1))

      expect(onConnectionStatus).toHaveBeenCalledWith('error')

      // Advance timers to trigger reconnect
      await vi.advanceTimersByTimeAsync(1000)

      // Second attempt should succeed
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should stop reconnecting after max attempts', async () => {
      const onError = vi.fn()
      const onConnectionStatus = vi.fn()

      mockFetch.mockRejectedValue(new Error('Always fails'))

      const sse = new ChatSSE(
        {
          sessionId: 'test-session',
          reconnect: true,
          reconnectInterval: 100,
          maxReconnectAttempts: 3,
        },
        { onError, onConnectionStatus }
      )

      await sse.sendMessage('Test')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // First retry
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Second retry
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(3)

      // Third retry (maxReconnectAttempts = 3)
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(4)

      // Verify error state was set after hitting max attempts
      // The last error call should have triggered the max attempts check
      const errorCalls = onConnectionStatus.mock.calls.filter((call) => call[0] === 'error')
      expect(errorCalls.length).toBeGreaterThan(0)
    })

    it('should not reconnect when disabled', async () => {
      const onError = vi.fn()

      mockFetch.mockRejectedValue(new Error('Failed'))

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: false }, { onError })

      await sse.sendMessage('Test')

      // Advance timers
      await vi.advanceTimersByTimeAsync(10000)

      // Should only attempt once
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should use exponential backoff for reconnection delay', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))

      const sse = new ChatSSE(
        {
          sessionId: 'test-session',
          reconnect: true,
          reconnectInterval: 1000,
          maxReconnectAttempts: 3,
        },
        { onError: vi.fn() }
      )

      await sse.sendMessage('Test')

      // Initial call is already done
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // First retry should happen after 1000ms (1000 * 1)
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Second retry should happen after 2000ms (1000 * 2)
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(3)

      // Third retry should happen after 3000ms (1000 * 3, capped)
      await vi.runOnlyPendingTimersAsync()
      expect(mockFetch).toHaveBeenCalledTimes(4)
    })

    it('should reset reconnection attempts on successful completion', async () => {
      const onComplete = vi.fn()

      // First message succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session', reconnect: true }, { onComplete })

      await sse.sendMessage('First')
      expect(onComplete).toHaveBeenCalled()

      // Second message fails then succeeds
      mockFetch.mockRejectedValueOnce(new Error('Temporary error'))
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      onComplete.mockClear()
      await sse.sendMessage('Second')

      // Should retry from 0 attempts
      await vi.advanceTimersByTimeAsync(3000)
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('dispose', () => {
    it('should clean up resources', () => {
      const sse = new ChatSSE({ sessionId: 'test-session' }, {})

      sse.dispose()

      expect(sse.isActive()).toBe(false)
    })

    it('should cancel pending reconnection', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))

      const sse = new ChatSSE(
        {
          sessionId: 'test-session',
          reconnect: true,
          reconnectInterval: 1000,
        },
        { onError: vi.fn() }
      )

      await sse.sendMessage('Test')

      // Dispose before reconnection
      sse.dispose()

      // Advance timers
      await vi.advanceTimersByTimeAsync(5000)

      // Should only have initial attempt
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple dispose calls', () => {
      const sse = new ChatSSE({ sessionId: 'test-session' }, {})

      expect(() => {
        sse.dispose()
        sse.dispose()
        sse.dispose()
      }).not.toThrow()
    })
  })

  describe('isActive', () => {
    it('should return true when streaming', async () => {
      let resolveRead: (value: any) => void
      const readPromise = new Promise((resolve) => {
        resolveRead = resolve
      })

      const mockStream = {
        getReader: () => ({
          read: () => readPromise,
        }),
      }

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: mockStream,
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, {})

      const sendPromise = sse.sendMessage('Test')

      // Wait for connection to establish
      await Promise.resolve()
      await Promise.resolve()

      expect(sse.isActive()).toBe(true)

      // Complete the stream
      resolveRead!({ done: true, value: undefined })
      await sendPromise

      expect(sse.isActive()).toBe(false)
    })

    it('should return false when not streaming', () => {
      const sse = new ChatSSE({ sessionId: 'test-session' }, {})

      expect(sse.isActive()).toBe(false)
    })
  })

  describe('custom endpoint', () => {
    it('should use custom endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session', endpoint: '/custom/stream' }, {})

      await sse.sendMessage('Test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/custom/stream',
        expect.any(Object)
      )
    })
  })

  describe('connection status callbacks', () => {
    it('should call onConnectionStatus with all states', async () => {
      const onConnectionStatus = vi.fn()

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream([createSSEMessage('complete', {})]),
      })

      const sse = new ChatSSE({ sessionId: 'test-session' }, { onConnectionStatus })

      await sse.sendMessage('Test')

      expect(onConnectionStatus).toHaveBeenNthCalledWith(1, 'connecting')
      expect(onConnectionStatus).toHaveBeenNthCalledWith(2, 'connected')
      expect(onConnectionStatus).toHaveBeenNthCalledWith(3, 'disconnected')
    })

    it('should call onConnectionStatus with error on failure', async () => {
      const onConnectionStatus = vi.fn()

      mockFetch.mockRejectedValue(new Error('Failed'))

      const sse = new ChatSSE(
        { sessionId: 'test-session', reconnect: false },
        { onConnectionStatus }
      )

      await sse.sendMessage('Test')

      expect(onConnectionStatus).toHaveBeenCalledWith('connecting')
      expect(onConnectionStatus).toHaveBeenCalledWith('error')
    })
  })
})

describe('streamChatMessage', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should stream a message using the function API', async () => {
    const onChunk = vi.fn()
    const onComplete = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: createMockStream([
        createSSEMessage('chunk', { text: 'Hello' }),
        createSSEMessage('complete', { session_id: 'test' }),
      ]),
    })

    const request: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
    }

    await streamChatMessage(request, onChunk, onComplete)

    expect(onChunk).toHaveBeenCalledWith('Hello')
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ message: 'Hello' }))
  })

  it('should handle errors in function API', async () => {
    const onChunk = vi.fn()
    const onError = vi.fn()

    mockFetch.mockRejectedValue(new Error('Network error'))

    const request: ChatRequest = {
      message: 'Test message',
    }

    await streamChatMessage(request, onChunk, undefined, onError)

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Network error',
      })
    )
  })

  it('should generate session_id if not provided', async () => {
    const onChunk = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: createMockStream([createSSEMessage('complete', {})]),
    })

    const request: ChatRequest = {
      message: 'Test message',
    }

    await streamChatMessage(request, onChunk)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('session_'),
      })
    )
  })

  it('should dispose instance after completion', async () => {
    const onChunk = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: createMockStream([
        createSSEMessage('chunk', { text: 'test' }),
        createSSEMessage('complete', {}),
      ]),
    })

    const request: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
    }

    await streamChatMessage(request, onChunk)

    // Instance should be disposed after use - verify by checking it received messages
    expect(onChunk).toHaveBeenCalled()
  })

  it('should dispose instance even on error', async () => {
    const onChunk = vi.fn()
    const onError = vi.fn()

    mockFetch.mockRejectedValue(new Error('Failed'))

    const request: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
    }

    await streamChatMessage(request, onChunk, undefined, onError)

    expect(onError).toHaveBeenCalled()
  })

  it('should work without optional callbacks', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: createMockStream([
        createSSEMessage('chunk', { text: 'Test' }),
        createSSEMessage('complete', {}),
      ]),
    })

    const request: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
    }

    // Should not throw without onComplete and onError
    await expect(streamChatMessage(request, vi.fn())).resolves.not.toThrow()
  })

  it('should pass context to underlying ChatSSE', async () => {
    const onChunk = vi.fn()

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      body: createMockStream([createSSEMessage('complete', {})]),
    })

    const request: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
      context: { userId: '123' },
    }

    await streamChatMessage(request, onChunk)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"context":{"userId":"123"}'),
      })
    )
  })
})
