/**
 * Chat Integration Tests
 * Tests the complete chat flow with real adapters
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ChatService } from '../chat.service'
import { PrimaryAdapter } from '../adapters/primary.adapter'
import { FallbackAdapter } from '../adapters/fallback.adapter'
import type { ChatRequest } from '../types'

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock telemetry
vi.mock('@/lib/telemetry/chat-telemetry', () => ({
  chatTelemetry: {
    recordCacheHit: vi.fn(),
    recordMessage: vi.fn(),
  },
}))

describe('Chat Integration Tests', () => {
  let chatService: ChatService

  beforeEach(() => {
    chatService = new ChatService({
      maxRetries: 1, // Reduce retries for predictable test behavior
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful primary path', () => {
    it('should complete full chat flow with primary adapter', async () => {
      const request: ChatRequest = {
        message: 'What is the weather today?',
        sessionId: 'test-session-123',
        agentId: 'weather-agent',
      }

      const mockResponse = {
        response: 'The weather is sunny today',
        agent_id: 'weather-agent',
        agent_name: 'Weather Agent',
        confidence: 0.95,
        suggestions: ['Check tomorrow', 'View forecast'],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('The weather is sunny today')
      expect(response.data?.agentId).toBe('weather-agent')
      expect(response.data?.suggestions).toHaveLength(2)
    })

    it('should cache and reuse successful responses', async () => {
      const request: ChatRequest = {
        message: 'Repeated question',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Cached answer' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      // First call
      const response1 = await chatService.sendMessage(request)
      expect(response1.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call (should use cache)
      const response2 = await chatService.sendMessage(request)
      expect(response2.success).toBe(true)
      expect(response2.data?.response).toBe('Cached answer')
      expect(global.fetch).toHaveBeenCalledTimes(1) // Still 1, not called again
    })

    it('should handle multiple sequential requests', async () => {
      const responses = [
        { response: 'Answer 1' },
        { response: 'Answer 2' },
        { response: 'Answer 3' },
      ]

      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => responses[callCount++],
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      )

      const result1 = await chatService.sendMessage({ message: 'Question 1' })
      const result2 = await chatService.sendMessage({ message: 'Question 2' })
      const result3 = await chatService.sendMessage({ message: 'Question 3' })

      expect(result1.data?.response).toBe('Answer 1')
      expect(result2.data?.response).toBe('Answer 2')
      expect(result3.data?.response).toBe('Answer 3')
    })
  })

  describe('fallback path', () => {
    it('should fallback to Maritaca when primary fails', async () => {
      const request: ChatRequest = {
        message: 'Test with fallback',
      }

      let callCount = 0
      global.fetch = vi.fn().mockImplementation((url) => {
        callCount++

        // Primary adapter fails
        if (url.includes('/api/v1/chat') && !url.includes('maritaca')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          })
        }

        // Fallback adapter succeeds
        if (url.includes('maritaca')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              response: 'Fallback response from Maritaca',
              metadata: { model: 'sabiazinho-3' },
            }),
          })
        }

        return Promise.reject(new Error('Unexpected URL'))
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Fallback response from Maritaca')
      expect(response.data?.agentId).toBe('maritaca')
      expect(callCount).toBeGreaterThan(1) // Called both adapters
    })

    it('should handle complete system failure gracefully', async () => {
      const request: ChatRequest = {
        message: 'Everything fails',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
      expect(response.error?.code).toBeTruthy()
    })

    it('should retry on primary before falling back', async () => {
      const request: ChatRequest = {
        message: 'Retry test',
      }

      let primaryCallCount = 0
      global.fetch = vi.fn().mockImplementation((url) => {
        // Primary adapter - fail twice, then fallback succeeds
        if (url.includes('/api/v1/chat') && !url.includes('maritaca')) {
          primaryCallCount++
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Error',
          })
        }

        // Fallback succeeds
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: 'Fallback success' }),
        })
      })

      vi.useFakeTimers()

      const responsePromise = chatService.sendMessage(request)

      // Advance time for retries
      await vi.advanceTimersByTimeAsync(2000) // First retry
      await vi.advanceTimersByTimeAsync(4000) // Second retry

      const response = await responsePromise

      expect(response.success).toBe(true)
      expect(primaryCallCount).toBe(2) // Primary tried twice
      expect(response.data?.response).toBe('Fallback success')

      vi.useRealTimers()
    })
  })

  describe('availability checks', () => {
    it('should check both adapters availability', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        // Health endpoint always returns ok
        if (url.includes('/health')) {
          return Promise.resolve({ ok: true })
        }
        return Promise.reject(new Error('Not a health check'))
      })

      const availability = await chatService.checkAvailability()

      expect(availability.primary).toBe(true)
      expect(availability.fallback).toBe(true)
    })

    it('should detect primary unavailable', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (url.includes('/health')) {
          return Promise.resolve({ ok: false })
        }
        return Promise.reject(new Error('Not a health check'))
      })

      const availability = await chatService.checkAvailability()

      expect(availability.primary).toBe(false)
      expect(availability.fallback).toBe(true) // Fallback always available
    })
  })

  describe('real-world scenarios', () => {
    it('should handle conversation with context', async () => {
      const request: ChatRequest = {
        message: 'Continue from previous',
        sessionId: 'conversation-123',
        context: {
          previousMessages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' },
          ],
          userProfile: {
            preferences: { language: 'pt' },
          },
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Continued response',
          metadata: { contextUsed: true },
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('previousMessages'),
        })
      )
    })

    it('should handle rate limiting with retry', async () => {
      const request: ChatRequest = {
        message: 'Rate limited request',
      }

      let attemptCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        attemptCount++

        // First attempt - rate limited
        if (attemptCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
          })
        }

        // Second attempt - success
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: 'Success after rate limit' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      })

      vi.useFakeTimers()

      const responsePromise = chatService.sendMessage(request)
      await vi.advanceTimersByTimeAsync(2000)
      const response = await responsePromise

      expect(response.success).toBe(true)
      expect(attemptCount).toBe(2)

      vi.useRealTimers()
    })

    it('should handle network timeout and fallback', async () => {
      const request: ChatRequest = {
        message: 'Timeout test',
      }

      let callCount = 0
      global.fetch = vi.fn().mockImplementation((url) => {
        callCount++

        // Primary times out
        if (!url.includes('maritaca')) {
          const error = new Error('The operation was aborted')
          error.name = 'AbortError'
          return Promise.reject(error)
        }

        // Fallback works
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: 'Fallback after timeout' }),
        })
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Fallback after timeout')
      expect(callCount).toBeGreaterThan(1)
    })

    it('should handle streaming response from primary', async () => {
      const request: ChatRequest = {
        message: 'Streaming test',
      }

      const chunks = ['Hello', ' ', 'World', '!']
      const encoder = new TextEncoder()
      let chunkIndex = 0

      const mockReader = {
        read: vi.fn().mockImplementation(async () => {
          if (chunkIndex < chunks.length) {
            const value = encoder.encode(chunks[chunkIndex++])
            return { done: false, value }
          }
          return { done: true, value: undefined }
        }),
        releaseLock: vi.fn(),
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => mockReader,
        },
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Hello World!')
      expect(mockReader.releaseLock).toHaveBeenCalled()
    })

    it('should handle concurrent requests', async () => {
      global.fetch = vi.fn().mockImplementation((url, options) => {
        const body = JSON.parse(options.body as string)
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: `Response to: ${body.message}` }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      })

      const promises = [
        chatService.sendMessage({ message: 'Question 1' }),
        chatService.sendMessage({ message: 'Question 2' }),
        chatService.sendMessage({ message: 'Question 3' }),
      ]

      const responses = await Promise.all(promises)

      expect(responses).toHaveLength(3)
      expect(responses.every((r) => r.success)).toBe(true)
      expect(responses[0].data?.response).toContain('Question 1')
      expect(responses[1].data?.response).toContain('Question 2')
      expect(responses[2].data?.response).toContain('Question 3')
    })
  })

  describe('cache behavior in integration', () => {
    it('should not cache errors across different messages', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ response: 'Success' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })

      // First request fails
      const response1 = await chatService.sendMessage({ message: 'Test 1' })
      expect(response1.success).toBe(false)

      // Second request succeeds (different message, so no cache)
      const response2 = await chatService.sendMessage({ message: 'Test 2' })
      expect(response2.success).toBe(true)
    })

    it('should clear cache between sessions', async () => {
      const request: ChatRequest = {
        message: 'Same message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Response' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      // First call
      await chatService.sendMessage(request)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call (cached)
      await chatService.sendMessage(request)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Clear cache
      chatService.clearCache()

      // Third call (not cached)
      await chatService.sendMessage(request)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should provide accurate cache statistics', async () => {
      const request1: ChatRequest = { message: 'Message 1' }
      const request2: ChatRequest = { message: 'Message 2' }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Response' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      await chatService.sendMessage(request1)
      await chatService.sendMessage(request2)

      const stats = chatService.getCacheStats()

      expect(stats.size).toBe(2)
      expect(stats.ttl).toBe(5 * 60 * 1000)
      expect(stats.maxAge).toBeGreaterThanOrEqual(0)
    })
  })

  describe('error recovery patterns', () => {
    it('should recover from temporary network issues', async () => {
      const request: ChatRequest = {
        message: 'Recovery test',
      }

      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++

        // First two calls fail
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'))
        }

        // Third call succeeds (fallback)
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: 'Recovered' }),
        })
      })

      vi.useFakeTimers()

      const responsePromise = chatService.sendMessage(request)

      // Advance through retries
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const response = await responsePromise

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Recovered')

      vi.useRealTimers()
    })

    it('should handle partial response failures', async () => {
      const request: ChatRequest = {
        message: 'Partial failure',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('JSON parse error')
        },
        headers: new Headers({ 'content-type': 'application/json' }),
      })

      const response = await chatService.sendMessage(request)

      // Should fallback after primary JSON parse fails
      expect(response.success).toBe(false)
    })
  })
})
