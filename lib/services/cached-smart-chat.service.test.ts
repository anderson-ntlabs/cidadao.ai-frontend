/**
 * Cached Smart Chat Service Tests
 * Tests for deprecated compatibility layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock chat service
const mockSendMessage = vi.fn()
const mockClearCache = vi.fn()
const mockGetCacheStats = vi.fn()

vi.mock('@/lib/chat', () => ({
  chatService: {
    sendMessage: mockSendMessage,
    clearCache: mockClearCache,
    getCacheStats: mockGetCacheStats,
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('CachedSmartChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendMessage.mockResolvedValue({
      data: {
        response: 'Test response',
        agentId: 'zumbi',
        agentName: 'Zumbi',
        confidence: 0.95,
        suggestions: ['action1'],
        metadata: { test: true },
      },
    })
    mockGetCacheStats.mockReturnValue({ hits: 10, misses: 5 })
  })

  describe('sendMessage', () => {
    it('should call chatService.sendMessage', async () => {
      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      await service.sendMessage('Hello')

      expect(mockSendMessage).toHaveBeenCalled()
    })

    it('should map response to ChatResponse format', async () => {
      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      const response = await service.sendMessage('Hello', {
        sessionId: 'session-123',
        agentId: 'zumbi',
      })

      expect(response.message).toBe('Test response')
      expect(response.agent_id).toBe('zumbi')
      expect(response.agent_name).toBe('Zumbi')
      expect(response.confidence).toBe(0.95)
      expect(response.suggested_actions).toEqual(['action1'])
    })

    it('should pass options to chatService', async () => {
      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      await service.sendMessage('Hello', { sessionId: 'sess-1', agentId: 'anita' })

      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Hello',
          sessionId: 'sess-1',
          agentId: 'anita',
        })
      )
    })

    it('should handle empty response data', async () => {
      mockSendMessage.mockResolvedValue({ data: null })

      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      const response = await service.sendMessage('Hello')

      expect(response.message).toBe('')
      expect(response.confidence).toBe(0)
    })
  })

  describe('clearCache', () => {
    it('should call chatService.clearCache', async () => {
      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      service.clearCache()

      expect(mockClearCache).toHaveBeenCalled()
    })
  })

  describe('getCacheStats', () => {
    it('should return cache stats from chatService', async () => {
      const { CachedSmartChatService } = await import('./cached-smart-chat.service')
      const service = new CachedSmartChatService()

      const stats = service.getCacheStats()

      expect(stats).toEqual({ hits: 10, misses: 5 })
      expect(mockGetCacheStats).toHaveBeenCalled()
    })
  })

  describe('singleton export', () => {
    it('should export cachedSmartChatService singleton', async () => {
      const { cachedSmartChatService } = await import('./cached-smart-chat.service')
      expect(cachedSmartChatService).toBeDefined()
    })
  })
})
