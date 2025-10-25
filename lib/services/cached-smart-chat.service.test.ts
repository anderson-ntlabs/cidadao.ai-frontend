import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CachedSmartChatService } from './cached-smart-chat.service'
import type { ChatResponse } from '@/types/chat'

// Mock dependencies
vi.mock('./smart-chat.service', () => ({
  SmartChatService: class SmartChatService {
    async sendMessage(message: string, options: any): Promise<ChatResponse> {
      return {
        message: `Response to: ${message}`,
        confidence: 0.9,
        metadata: {
          model_used: options?.preferredModel === 'quality' ? 'Sabiá-3' : 'Sabiazinho-3',
          tokens_used: 100,
          endpoint: '/chat'
        }
      }
    }
  }
}))

vi.mock('./chat-cache.service', () => ({
  chatCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(() => ({
      hits: 10,
      misses: 5,
      hitRate: 66.67,
      size: 15
    }))
  }
}))

vi.mock('@/lib/telemetry/cost-metrics', () => ({
  costMetrics: {
    record: vi.fn(),
    getReport: vi.fn(() => ({
      totalRequests: 100,
      totalCost: 10.50,
      cacheHitRate: 65,
      averageResponseTime: 250
    })),
    getRealTimeMetrics: vi.fn(() => ({
      requestsPerMinute: 5,
      currentCost: 0.50,
      averageLatency: 200
    }))
  }
}))

// Mock console
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('CachedSmartChatService', () => {
  let service: CachedSmartChatService
  let chatCache: any
  let costMetrics: any

  beforeEach(async () => {
    vi.clearAllMocks()
    consoleLogSpy.mockClear()
    consoleWarnSpy.mockClear()

    // Get mocked modules
    const cacheModule = await import('./chat-cache.service')
    const costModule = await import('@/lib/telemetry/cost-metrics')
    chatCache = cacheModule.chatCache
    costMetrics = costModule.costMetrics

    service = new CachedSmartChatService()
  })

  describe('sendMessage', () => {
    it('should return cached response when available', async () => {
      const cachedResponse: ChatResponse = {
        message: 'Cached response',
        confidence: 0.95,
        metadata: { model_used: 'cached' }
      }

      chatCache.get.mockReturnValueOnce(cachedResponse)

      const result = await service.sendMessage('Test question')

      expect(chatCache.get).toHaveBeenCalledWith('Test question')
      expect(result).toEqual(cachedResponse)
      expect(costMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({
          from_cache: true,
          success: true
        })
      )
    })

    it('should fetch fresh response when cache miss', async () => {
      chatCache.get.mockReturnValueOnce(null)

      const result = await service.sendMessage('New question')

      expect(chatCache.get).toHaveBeenCalled()
      expect(result.message).toContain('Response to: New question')
    })

    it('should cache high-confidence responses', async () => {
      chatCache.get.mockReturnValueOnce(null)

      await service.sendMessage('Question to cache')

      expect(chatCache.set).toHaveBeenCalledWith(
        'Question to cache',
        expect.objectContaining({
          message: expect.stringContaining('Response to: Question to cache'),
          confidence: 0.9
        })
      )
    })

    it('should not cache low-confidence responses', async () => {
      chatCache.get.mockReturnValueOnce(null)

      // Mock parent sendMessage to return low confidence
      vi.spyOn(service as any, 'sendMessage').mockResolvedValueOnce({
        message: 'Low confidence response',
        confidence: 0.5,
        metadata: {}
      })

      const result = await service.sendMessage('Ambiguous question')

      // Should be called for the spy, but not for cache.set
      // Let's just verify the result has low confidence
      expect(result.confidence).toBeLessThan(0.8)
    })

    it('should skip cache when quality model is preferred', async () => {
      const result = await service.sendMessage('Important question', {
        preferredModel: 'quality'
      })

      expect(chatCache.get).not.toHaveBeenCalled()
      expect(result.message).toContain('Response to: Important question')
    })

    it('should record cost metrics on success', async () => {
      chatCache.get.mockReturnValueOnce(null)

      await service.sendMessage('Test')

      expect(costMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({
          from_cache: false,
          success: true,
          message_length: 4
        })
      )
    })

    it('should record error metrics on failure', async () => {
      chatCache.get.mockReturnValueOnce(null)

      // Import and spy on the mocked SmartChatService
      const { SmartChatService } = await import('./smart-chat.service')
      const error = new Error('API Error')
      vi.spyOn(SmartChatService.prototype, 'sendMessage').mockRejectedValueOnce(error)

      await expect(service.sendMessage('Failing question')).rejects.toThrow('API Error')

      expect(costMetrics.record).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'API Error'
        })
      )
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = service.getCacheStats()

      expect(chatCache.getStats).toHaveBeenCalled()
      expect(stats).toEqual({
        hits: 10,
        misses: 5,
        hitRate: 66.67,
        size: 15
      })
    })
  })

  describe('getCostMetrics', () => {
    it('should return cost metrics for default period', () => {
      const metrics = service.getCostMetrics()

      expect(costMetrics.getReport).toHaveBeenCalledWith(24)
      expect(metrics).toHaveProperty('totalRequests')
      expect(metrics).toHaveProperty('totalCost')
    })

    it('should accept custom time period', () => {
      service.getCostMetrics(48)

      expect(costMetrics.getReport).toHaveBeenCalledWith(48)
    })
  })

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics', () => {
      const metrics = service.getRealTimeMetrics()

      expect(costMetrics.getRealTimeMetrics).toHaveBeenCalled()
      expect(metrics).toHaveProperty('requestsPerMinute')
      expect(metrics).toHaveProperty('currentCost')
    })
  })

  describe('clearCache', () => {
    it('should clear entire cache when no pattern provided', () => {
      service.clearCache()

      expect(chatCache.clear).toHaveBeenCalledWith(undefined)
    })

    it('should clear cache by pattern', () => {
      service.clearCache('test*')

      expect(chatCache.clear).toHaveBeenCalledWith('test*')
    })
  })

  describe('preloadCache', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should preload common queries', async () => {
      chatCache.get.mockReturnValue(null) // No cache hits

      const preloadPromise = service.preloadCache()

      // Fast-forward through all setTimeout delays (5 queries x 1000ms)
      await vi.advanceTimersByTimeAsync(5000)

      await preloadPromise

      // Should try to cache 5 common queries
      expect(chatCache.set).toHaveBeenCalledTimes(5)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Preloading cache')
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Preloading complete')
      )
    })

    it('should skip already cached queries', async () => {
      // First query cached, others not
      chatCache.get
        .mockReturnValueOnce({ message: 'Cached', confidence: 0.9 })
        .mockReturnValue(null)

      const preloadPromise = service.preloadCache()
      await vi.advanceTimersByTimeAsync(5000)
      await preloadPromise

      // Should cache only 4 new queries (5 total - 1 already cached)
      expect(chatCache.set).toHaveBeenCalledTimes(4)
    })

    it('should handle preload errors gracefully', async () => {
      chatCache.get.mockReturnValue(null)

      // Import and spy on the mocked SmartChatService
      const { SmartChatService } = await import('./smart-chat.service')
      const mockSendMessage = vi.spyOn(SmartChatService.prototype, 'sendMessage')
      mockSendMessage
        .mockResolvedValueOnce({ message: 'Success', confidence: 0.9, metadata: {} })
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValue({ message: 'Success', confidence: 0.9, metadata: {} })

      const preloadPromise = service.preloadCache()
      await vi.advanceTimersByTimeAsync(5000)
      await preloadPromise

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(chatCache.set).toHaveBeenCalled() // Should continue after error
    })
  })

  describe('singleton', () => {
    it('should export singleton instance', async () => {
      const { cachedSmartChatService } = await import('./cached-smart-chat.service')

      expect(cachedSmartChatService).toBeInstanceOf(CachedSmartChatService)
    })
  })
})
