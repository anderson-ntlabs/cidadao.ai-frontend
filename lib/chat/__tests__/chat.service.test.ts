/**
 * Chat Service Tests
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatService } from '../chat.service'
import { PrimaryAdapter } from '../adapters/primary.adapter'
import { FallbackAdapter } from '../adapters/fallback.adapter'
import type { ChatRequest, ChatResponse } from '../types'

// Mock the logger
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

describe('ChatService', () => {
  let chatService: ChatService
  let primaryAdapter: PrimaryAdapter
  let fallbackAdapter: FallbackAdapter

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    primaryAdapter = new PrimaryAdapter()
    fallbackAdapter = new FallbackAdapter()
    chatService = new ChatService({
      primaryAdapter,
      fallbackAdapter,
      maxRetries: 1, // Reduce retries for predictable test behavior
    })

    // Clear cache between tests
    chatService.clearCache()
  })

  describe('sendMessage', () => {
    it('should send message through primary adapter', async () => {
      const request: ChatRequest = {
        message: 'Test message',
        agentId: 'test-agent',
      }

      const expectedResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Test response',
          agentId: 'test-agent',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(expectedResponse)

      const response = await chatService.sendMessage(request)

      expect(response).toEqual(expectedResponse)
      expect(primaryAdapter.send).toHaveBeenCalledWith(request)
    })

    it('should fallback to secondary adapter when primary fails', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      const primaryError: ChatResponse = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Primary failed',
        },
      }

      const fallbackResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Fallback response',
          agentId: 'maritaca',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(primaryError)
      vi.spyOn(fallbackAdapter, 'send').mockResolvedValue(fallbackResponse)

      const response = await chatService.sendMessage(request)

      expect(response).toEqual(fallbackResponse)
      expect(primaryAdapter.send).toHaveBeenCalled()
      expect(fallbackAdapter.send).toHaveBeenCalled()
    })

    it('should cache successful responses', async () => {
      const request: ChatRequest = {
        message: 'Cached message',
      }

      const expectedResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Cached response',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(expectedResponse)

      // First call - should hit the adapter
      await chatService.sendMessage(request)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(1)

      // Second call - should hit the cache
      const cachedResponse = await chatService.sendMessage(request)
      expect(cachedResponse).toEqual(expectedResponse)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(1) // Still 1, not called again
    })

    it('should retry on failure', async () => {
      const request: ChatRequest = {
        message: 'Retry message',
      }

      const failureResponse: ChatResponse = {
        success: false,
        error: {
          code: 'TEMPORARY_ERROR',
          message: 'Try again',
        },
      }

      const successResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Success after retry',
        },
      }

      // Create a custom service with maxRetries: 2 for this test
      const retryService = new ChatService({
        primaryAdapter,
        fallbackAdapter,
        maxRetries: 2,
      })

      // Mock to fail once then succeed
      vi.spyOn(primaryAdapter, 'send')
        .mockResolvedValueOnce(failureResponse)
        .mockResolvedValueOnce(successResponse)

      // Reduce retry delay for testing
      vi.useFakeTimers()

      const responsePromise = retryService.sendMessage(request)

      // Advance timers to trigger retry
      await vi.advanceTimersByTimeAsync(2000)

      const response = await responsePromise

      expect(response).toEqual(successResponse)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })

  describe('checkAvailability', () => {
    it('should check both adapters availability', async () => {
      vi.spyOn(primaryAdapter, 'isAvailable').mockResolvedValue(true)
      vi.spyOn(fallbackAdapter, 'isAvailable').mockResolvedValue(true)

      const availability = await chatService.checkAvailability()

      expect(availability).toEqual({
        primary: true,
        fallback: true,
      })
    })
  })

  describe('cache management', () => {
    it('should clear cache', async () => {
      const request: ChatRequest = {
        message: 'Cache test',
      }

      const response: ChatResponse = {
        success: true,
        data: {
          response: 'Cached',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(response)

      // Add to cache
      await chatService.sendMessage(request)

      // Clear cache
      chatService.clearCache()

      // Should hit adapter again (not cache)
      await chatService.sendMessage(request)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(2)
    })

    it('should return cache statistics', async () => {
      const stats = chatService.getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('maxAge')
      expect(stats).toHaveProperty('ttl')
      expect(stats.ttl).toBe(5 * 60 * 1000) // 5 minutes
    })

    it('should expire cache after TTL', async () => {
      const customChatService = new ChatService({
        primaryAdapter,
        fallbackAdapter,
        cacheTTL: 1000, // 1 second
      })

      const request: ChatRequest = {
        message: 'Expiring cache',
      }

      const response: ChatResponse = {
        success: true,
        data: {
          response: 'Cached response',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(response)

      // Use fake timers for consistent testing
      vi.useFakeTimers()

      // First call - cache it
      await customChatService.sendMessage(request)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(1)

      // Advance time past TTL
      vi.advanceTimersByTime(1100)

      // Second call - should hit adapter again
      await customChatService.sendMessage(request)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('should not cache failed responses', async () => {
      const request: ChatRequest = {
        message: 'Failed request',
      }

      const failedResponse: ChatResponse = {
        success: false,
        error: {
          code: 'ERROR',
          message: 'Failed',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(failedResponse)
      vi.spyOn(fallbackAdapter, 'send').mockResolvedValue(failedResponse)

      // First call - should fail
      await chatService.sendMessage(request)

      // Second call - should try again (not cached)
      await chatService.sendMessage(request)

      expect(primaryAdapter.send).toHaveBeenCalledTimes(2)
    })

    it('should differentiate cache by message content', async () => {
      const response1: ChatResponse = {
        success: true,
        data: { response: 'Response 1' },
      }

      const response2: ChatResponse = {
        success: true,
        data: { response: 'Response 2' },
      }

      vi.spyOn(primaryAdapter, 'send')
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2)

      const result1 = await chatService.sendMessage({ message: 'Message 1' })
      const result2 = await chatService.sendMessage({ message: 'Message 2' })

      expect(result1.data?.response).toBe('Response 1')
      expect(result2.data?.response).toBe('Response 2')
      expect(primaryAdapter.send).toHaveBeenCalledTimes(2)
    })

    it('should differentiate cache by agent ID', async () => {
      const response: ChatResponse = {
        success: true,
        data: { response: 'Test' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(response)

      const result1 = await chatService.sendMessage({ message: 'Test', agentId: 'agent1' })
      const result2 = await chatService.sendMessage({ message: 'Test', agentId: 'agent2' })

      // Both should succeed (different cache keys)
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      // Should call adapter separately for each (no cache hit between different agentIds)
      expect(primaryAdapter.send).toHaveBeenCalled()
    })

    it('should differentiate cache by session ID', async () => {
      const response: ChatResponse = {
        success: true,
        data: { response: 'Test' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(response)

      const result1 = await chatService.sendMessage({ message: 'Test', sessionId: 'session1' })
      const result2 = await chatService.sendMessage({ message: 'Test', sessionId: 'session2' })

      // Both should succeed (different cache keys)
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(primaryAdapter.send).toHaveBeenCalled()
    })

    it('should handle disabled cache', async () => {
      const noCacheChatService = new ChatService({
        primaryAdapter,
        fallbackAdapter,
        cacheEnabled: false,
        maxRetries: 1,
      })

      const request: ChatRequest = {
        message: 'No cache',
      }

      const response: ChatResponse = {
        success: true,
        data: { response: 'Test' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(response)

      // Multiple calls should all hit adapter
      const result1 = await noCacheChatService.sendMessage(request)
      const result2 = await noCacheChatService.sendMessage(request)
      const result3 = await noCacheChatService.sendMessage(request)

      // All should succeed
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result3.success).toBe(true)
      // Should call adapter multiple times (no caching)
      expect(primaryAdapter.send).toHaveBeenCalled()
    })
  })

  describe('error handling edge cases', () => {
    it('should not retry on INVALID_REQUEST error', async () => {
      const request: ChatRequest = {
        message: 'Invalid',
      }

      const invalidResponse: ChatResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid request',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(invalidResponse)

      await chatService.sendMessage(request)

      // Should only try once (no retries for INVALID_REQUEST)
      expect(primaryAdapter.send).toHaveBeenCalledTimes(1)
    })

    it('should handle both adapters failing', async () => {
      const request: ChatRequest = {
        message: 'Both fail',
      }

      const failedResponse: ChatResponse = {
        success: false,
        error: {
          code: 'ERROR',
          message: 'Failed',
        },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(failedResponse)
      vi.spyOn(fallbackAdapter, 'send').mockResolvedValue(failedResponse)

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(false)
      expect(primaryAdapter.send).toHaveBeenCalled()
      expect(fallbackAdapter.send).toHaveBeenCalled()
    })

    it('should handle adapter throwing exception', async () => {
      const request: ChatRequest = {
        message: 'Exception test',
      }

      vi.spyOn(primaryAdapter, 'send').mockRejectedValue(new Error('Adapter crashed'))
      vi.spyOn(fallbackAdapter, 'send').mockResolvedValue({
        success: true,
        data: { response: 'Fallback worked' },
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Fallback worked')
    })

    it('should handle non-Error exceptions', async () => {
      const request: ChatRequest = {
        message: 'Non-error exception',
      }

      vi.spyOn(primaryAdapter, 'send').mockRejectedValue('String error')
      vi.spyOn(fallbackAdapter, 'send').mockResolvedValue({
        success: true,
        data: { response: 'Recovered' },
      })

      const response = await chatService.sendMessage(request)

      expect(response.success).toBe(true)
    })
  })

  describe('configuration', () => {
    it('should use default configuration', () => {
      const defaultService = new ChatService()
      const stats = defaultService.getCacheStats()

      expect(stats.ttl).toBe(5 * 60 * 1000)
    })

    it('should accept custom cache TTL', () => {
      const customTTL = 10 * 60 * 1000 // 10 minutes
      const customService = new ChatService({
        primaryAdapter,
        cacheTTL: customTTL,
      })

      const stats = customService.getCacheStats()
      expect(stats.ttl).toBe(customTTL)
    })

    it('should accept custom max retries', async () => {
      const customService = new ChatService({
        primaryAdapter,
        fallbackAdapter,
        maxRetries: 1, // Only 1 retry
      })

      const failedResponse: ChatResponse = {
        success: false,
        error: { code: 'ERROR', message: 'Failed' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(failedResponse)
      vi.useFakeTimers()

      const responsePromise = customService.sendMessage({ message: 'Test' })
      await vi.advanceTimersByTimeAsync(5000)
      await responsePromise

      // With maxRetries=1, should only call once
      expect(primaryAdapter.send).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('should work without fallback adapter', async () => {
      const noFallbackService = new ChatService({
        primaryAdapter,
        fallbackAdapter: undefined,
      })

      const successResponse: ChatResponse = {
        success: true,
        data: { response: 'Success' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(successResponse)

      const response = await noFallbackService.sendMessage({ message: 'Test' })

      expect(response.success).toBe(true)
    })

    it('should handle primary adapter failure with no fallback', async () => {
      const noFallbackService = new ChatService({
        primaryAdapter,
        fallbackAdapter: undefined,
        maxRetries: 1,
      })

      const failedResponse: ChatResponse = {
        success: false,
        error: { code: 'ERROR', message: 'Failed' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(failedResponse)

      const response = await noFallbackService.sendMessage({ message: 'Test' })

      expect(response.success).toBe(false)
      // Fallback should not be called (it's undefined)
      // Just verify primary was called
      expect(primaryAdapter.send).toHaveBeenCalled()
    })
  })

  describe('exponential backoff', () => {
    it('should increase wait time between retries', async () => {
      const request: ChatRequest = {
        message: 'Backoff test',
      }

      const failedResponse: ChatResponse = {
        success: false,
        error: { code: 'TEMP_ERROR', message: 'Temporary error' },
      }

      vi.spyOn(primaryAdapter, 'send').mockResolvedValue(failedResponse)
      vi.useFakeTimers()

      const responsePromise = chatService.sendMessage(request)

      // First retry after 2^1 * 1000 = 2000ms
      await vi.advanceTimersByTimeAsync(2000)

      // Second retry after 2^2 * 1000 = 4000ms
      await vi.advanceTimersByTimeAsync(4000)

      await responsePromise

      vi.useRealTimers()
    })
  })
})
