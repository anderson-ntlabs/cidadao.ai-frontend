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
    primaryAdapter = new PrimaryAdapter()
    fallbackAdapter = new FallbackAdapter()
    chatService = new ChatService({
      primaryAdapter,
      fallbackAdapter,
    })
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

      // Mock to fail once then succeed
      vi.spyOn(primaryAdapter, 'send')
        .mockResolvedValueOnce(failureResponse)
        .mockResolvedValueOnce(successResponse)

      // Reduce retry delay for testing
      vi.useFakeTimers()

      const responsePromise = chatService.sendMessage(request)

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
  })
})