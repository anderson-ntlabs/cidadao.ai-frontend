import { describe, it, expect, beforeEach, vi } from 'vitest'
import { streamChatMessage, StreamAccumulator, type StreamToken } from './chat-stream-backend'
import { trackChatMessage, trackChatError } from '@/lib/telemetry/chat-telemetry'

// Mock dependencies
vi.mock('@/lib/telemetry/chat-telemetry')

// Mock EventSource
class MockEventSource {
  url: string
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((error: Event) => void) | null = null
  readyState: number = 0

  constructor(url: string) {
    this.url = url
    this.readyState = 1 // OPEN
  }

  close() {
    this.readyState = 2 // CLOSED
  }
}

// Mock fetch
global.fetch = vi.fn()

describe('chat-stream-backend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock EventSource globally
    ;(global as any).EventSource = MockEventSource
    // Mock localStorage
    ;(global as any).localStorage = {
      getItem: vi.fn(),
    }
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('streamChatMessage', () => {
    it('should create EventSource and send POST request', () => {
      const request = {
        message: 'Test message',
        session_id: 'test-session',
        context: { test: true },
      }
      const onToken = vi.fn()

      vi.mocked(global.localStorage.getItem).mockReturnValue('test-token')
      vi.mocked(global.fetch).mockResolvedValue(new Response())

      const eventSource = streamChatMessage(request, onToken)

      expect(eventSource).toBeInstanceOf(MockEventSource)
      expect(eventSource.url).toContain('/api/v1/chat/stream?token=test-token')

      expect(trackChatMessage).toHaveBeenCalledWith('test-session', 'Test message', 'stream')

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/chat/stream'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          message: 'Test message',
          session_id: 'test-session',
          context: { test: true },
        }),
      })
    })

    it('should generate session_id if not provided', () => {
      const request = { message: 'Test' }
      const onToken = vi.fn()

      vi.spyOn(Date, 'now').mockReturnValue(12345)

      streamChatMessage(request, onToken)

      expect(trackChatMessage).toHaveBeenCalledWith('stream_12345', 'Test', 'stream')
    })

    it('should work without auth token', () => {
      const request = { message: 'Test', session_id: 'test-session' }
      const onToken = vi.fn()

      vi.mocked(global.localStorage.getItem).mockReturnValue(null)
      vi.mocked(global.fetch).mockResolvedValue(new Response())

      const eventSource = streamChatMessage(request, onToken)

      expect(eventSource.url).toContain('/api/v1/chat/stream')
      expect(eventSource.url).not.toContain('token=')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })

    it('should handle token messages', () => {
      const onToken = vi.fn()
      const eventSource = streamChatMessage({ message: 'Test' }, onToken)

      const tokenMessage: StreamToken = {
        type: 'token',
        content: 'Hello ',
      }

      eventSource.onmessage?.({
        data: JSON.stringify(tokenMessage),
      } as MessageEvent)

      // Test the actual behavior - the callback should be called with the token
      expect(onToken).toHaveBeenCalledWith(tokenMessage)
      expect(onToken).toHaveBeenCalledTimes(1)
    })

    it('should close connection on complete message', () => {
      const onToken = vi.fn()
      const eventSource = streamChatMessage({ message: 'Test' }, onToken)

      const completeMessage: StreamToken = {
        type: 'complete',
        metadata: { agent: 'abaporu', processing_time: 1000 },
      }

      eventSource.onmessage?.({
        data: JSON.stringify(completeMessage),
      } as MessageEvent)

      expect(onToken).toHaveBeenCalledWith(completeMessage)
      expect(eventSource.readyState).toBe(2) // CLOSED
    })

    it('should handle error messages and close connection', () => {
      const onToken = vi.fn()
      const onError = vi.fn()
      const eventSource = streamChatMessage({ message: 'Test' }, onToken, onError)

      const errorMessage: StreamToken = {
        type: 'error',
        error: 'Processing failed',
      }

      eventSource.onmessage?.({
        data: JSON.stringify(errorMessage),
      } as MessageEvent)

      expect(onToken).toHaveBeenCalledWith(errorMessage)
      expect(eventSource.readyState).toBe(2) // CLOSED
    })

    it('should handle JSON parse errors', () => {
      const onToken = vi.fn()
      const onError = vi.fn()
      const eventSource = streamChatMessage({ message: 'Test' }, onToken, onError)

      eventSource.onmessage?.({
        data: 'invalid json',
      } as MessageEvent)

      expect(onToken).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(console.error).toHaveBeenCalledWith('[Chat Stream] Parse error:', expect.any(Error))
    })

    it('should handle SSE connection errors', () => {
      const onToken = vi.fn()
      const onError = vi.fn()
      const eventSource = streamChatMessage(
        { message: 'Test', session_id: 'test-session' },
        onToken,
        onError
      )

      eventSource.onerror?.({} as Event)

      expect(console.error).toHaveBeenCalledWith('[Chat Stream] SSE error:', {})
      expect(trackChatError).toHaveBeenCalledWith(
        'test-session',
        expect.objectContaining({ message: 'SSE connection failed' })
      )
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Stream connection failed' })
      )
      expect(eventSource.readyState).toBe(2) // CLOSED
    })

    it('should handle fetch errors', async () => {
      const onToken = vi.fn()
      const onError = vi.fn()
      const fetchError = new Error('Network error')

      vi.mocked(global.fetch).mockRejectedValue(fetchError)

      streamChatMessage({ message: 'Test', session_id: 'test-session' }, onToken, onError)

      // Wait for fetch promise to reject
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(console.error).toHaveBeenCalledWith(
        '[Chat Stream] Failed to send message:',
        fetchError
      )
      expect(trackChatError).toHaveBeenCalledWith('test-session', fetchError)
      expect(onError).toHaveBeenCalledWith(fetchError)
    })
  })

  describe('StreamAccumulator', () => {
    let accumulator: StreamAccumulator

    beforeEach(() => {
      accumulator = new StreamAccumulator()
    })

    it('should accumulate token content', () => {
      accumulator.addToken({ type: 'token', content: 'Hello ' })
      accumulator.addToken({ type: 'token', content: 'world' })
      accumulator.addToken({ type: 'token', content: '!' })

      expect(accumulator.getContent()).toBe('Hello world!')
    })

    it('should ignore tokens without content', () => {
      accumulator.addToken({ type: 'token', content: 'Hello' })
      accumulator.addToken({ type: 'token' }) // No content
      accumulator.addToken({ type: 'token', content: ' world' })

      expect(accumulator.getContent()).toBe('Hello world')
    })

    it('should store metadata from complete message', () => {
      const metadata = { agent: 'abaporu', processing_time: 1500 }

      accumulator.addToken({ type: 'token', content: 'Response' })
      accumulator.addToken({ type: 'complete', metadata })

      expect(accumulator.getMetadata()).toEqual(metadata)
    })

    it('should ignore non-token and non-complete messages', () => {
      accumulator.addToken({ type: 'error', error: 'Failed' })
      accumulator.addToken({ type: 'token', content: 'Hello' })

      expect(accumulator.getContent()).toBe('Hello')
      expect(accumulator.getMetadata()).toEqual({})
    })

    it('should reset content and metadata', () => {
      accumulator.addToken({ type: 'token', content: 'Hello' })
      accumulator.addToken({ type: 'complete', metadata: { agent: 'test' } })

      expect(accumulator.getContent()).toBe('Hello')
      expect(accumulator.getMetadata()).toEqual({ agent: 'test' })

      accumulator.reset()

      expect(accumulator.getContent()).toBe('')
      expect(accumulator.getMetadata()).toEqual({})
    })

    it('should handle multiple complete messages (last one wins)', () => {
      accumulator.addToken({ type: 'complete', metadata: { agent: 'first' } })
      accumulator.addToken({ type: 'complete', metadata: { agent: 'second' } })

      expect(accumulator.getMetadata()).toEqual({ agent: 'second' })
    })
  })
})
