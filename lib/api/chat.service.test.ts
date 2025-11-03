/**
 * @deprecated This test file is for the old chat service implementation
 * The new implementation is in lib/chat/chat.service.ts
 * These tests are skipped but kept for reference
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  chatService,
  generateSessionId,
  detectInvestigationIntent,
  formatAgentName,
} from './chat.service'
import { api } from './client'
import { sendBackendMessage } from './chat-adapter-backend'
import { cachedSmartChatService } from '@/lib/services/cached-smart-chat.service'
import { getMockAgents, getMockSuggestions } from './chat-adapter'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types/chat'

// Mock all dependencies
vi.mock('./client')
vi.mock('./chat-adapter-backend')
vi.mock('@/lib/services/cached-smart-chat.service')
vi.mock('./chat-adapter')
vi.mock('@/lib/feature-flags')

// Mock EventSource
let mockEventSource: any

const createMockEventSource = () => {
  mockEventSource = {
    close: vi.fn(),
    addEventListener: vi.fn(),
    onmessage: null as any,
    onerror: null as any,
  }
  return mockEventSource
}

global.EventSource = vi.fn().mockImplementation(createMockEventSource) as any

describe.skip('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset EventSource mock
    createMockEventSource()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('sendMessage', () => {
    const mockRequest: ChatRequest = {
      message: 'Test message',
      session_id: 'test-session',
    }

    const mockResponse: ChatResponse = {
      message: 'Test response',
      session_id: 'test-session',
      agent_id: 'abaporu',
      agent_name: 'Abaporu',
      confidence: 0.9,
    }

    it('should use cachedSmartChatService when smart chat is enabled', async () => {
      vi.mocked(isFeatureEnabled).mockReturnValue(true)
      vi.mocked(cachedSmartChatService.sendMessage).mockResolvedValue(mockResponse)

      const result = await chatService.sendMessage(mockRequest)

      expect(isFeatureEnabled).toHaveBeenCalledWith('smartChatEnabled')
      expect(cachedSmartChatService.sendMessage).toHaveBeenCalledWith('Test message', {
        preferredModel: 'auto',
        useDrummond: true,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should pass model preference from context when using smart chat', async () => {
      vi.mocked(isFeatureEnabled).mockReturnValue(true)
      vi.mocked(cachedSmartChatService.sendMessage).mockResolvedValue(mockResponse)

      const requestWithModel: ChatRequest = {
        ...mockRequest,
        context: { model_preference: 'premium' },
      }

      await chatService.sendMessage(requestWithModel)

      expect(cachedSmartChatService.sendMessage).toHaveBeenCalledWith('Test message', {
        preferredModel: 'premium',
        useDrummond: true,
      })
    })

    it('should use backend adapter when smart chat is disabled', async () => {
      vi.mocked(isFeatureEnabled).mockReturnValue(false)
      vi.mocked(sendBackendMessage).mockResolvedValue(mockResponse)

      const result = await chatService.sendMessage(mockRequest)

      expect(sendBackendMessage).toHaveBeenCalledWith(mockRequest)
      expect(result).toEqual(mockResponse)
    })

    // Note: Fallback logic was refactored. Legacy adapters (v3) no longer exist.
    // The current implementation uses Smart Chat Service with built-in fallback logic.
    // These tests are skipped as they reference deleted adapters.
    it.skip('should fallback to v3 adapter when backend fails', async () => {
      // Legacy test - v3 adapter no longer exists
    })

    it.skip('should throw error when all adapters fail', async () => {
      // Legacy test - fallback logic is now in Smart Chat Service
    })

    it('should log appropriate messages during execution', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(isFeatureEnabled).mockReturnValue(false)
      vi.mocked(sendBackendMessage).mockResolvedValue(mockResponse)

      await chatService.sendMessage(mockRequest)

      expect(consoleSpy).toHaveBeenCalledWith('Chat service: Routing message')
      expect(consoleSpy).toHaveBeenCalledWith('Using official backend adapter')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Backend responded successfully')

      consoleSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('getSuggestions', () => {
    it('should return mock suggestions', async () => {
      const mockSuggestions = [{ id: '1', label: 'Test', action: 'test', icon: 'icon' }]
      vi.mocked(getMockSuggestions).mockReturnValue(mockSuggestions)

      const result = await chatService.getSuggestions()

      expect(getMockSuggestions).toHaveBeenCalled()
      expect(result).toEqual(mockSuggestions)
    })
  })

  describe('getAgents', () => {
    it('should return mock agents', async () => {
      const mockAgents = [
        { id: 'abaporu', name: 'Abaporu', role: 'orchestrator', status: 'active' as const },
      ]
      vi.mocked(getMockAgents).mockReturnValue(mockAgents as any)

      const result = await chatService.getAgents()

      expect(getMockAgents).toHaveBeenCalled()
      expect(result).toEqual(mockAgents)
    })
  })

  describe('getHistory', () => {
    it('should fetch chat history successfully', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          session_id: 'test-session',
          role: 'user',
          content: 'Test',
          timestamp: new Date().toISOString(),
        },
      ]

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: { messages: mockMessages },
      })

      const result = await chatService.getHistory('test-session', 100)

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/history/test-session', {
        params: { limit: 100 },
      })
      expect(result).toEqual(mockMessages)
    })

    it('should return empty array on failure', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: false })

      const result = await chatService.getHistory('test-session')

      expect(result).toEqual([])
    })

    it('should use default limit of 50', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: { messages: [] },
      })

      await chatService.getHistory('test-session')

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/history/test-session', {
        params: { limit: 50 },
      })
    })
  })

  describe('getHistoryPaginated', () => {
    it('should fetch paginated history successfully', async () => {
      const mockResponse = {
        items: [],
        has_more: false,
        cursor: null,
      }

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockResponse,
      })

      const result = await chatService.getHistoryPaginated('test-session', 'cursor123', 30, 'prev')

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/history/test-session/paginated', {
        params: { cursor: 'cursor123', limit: 30, direction: 'prev' },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should return null on failure', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: false })

      const result = await chatService.getHistoryPaginated('test-session')

      expect(result).toBeNull()
    })

    it('should use default parameters', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: { items: [], has_more: false, cursor: null },
      })

      await chatService.getHistoryPaginated('test-session')

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/history/test-session/paginated', {
        params: { cursor: undefined, limit: 20, direction: 'next' },
      })
    })
  })

  describe('clearHistory', () => {
    it('should clear history successfully', async () => {
      vi.mocked(api.delete).mockResolvedValue({ success: true })

      const result = await chatService.clearHistory('test-session')

      expect(api.delete).toHaveBeenCalledWith('/api/v1/chat/history/test-session')
      expect(result).toBe(true)
    })

    it('should return false on failure', async () => {
      vi.mocked(api.delete).mockResolvedValue({ success: false })

      const result = await chatService.clearHistory('test-session')

      expect(result).toBe(false)
    })
  })

  describe('getCacheStats', () => {
    it('should fetch cache stats successfully', async () => {
      const mockStats = { hits: 100, misses: 20 }
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: mockStats,
      })

      const result = await chatService.getCacheStats()

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/cache/stats')
      expect(result).toEqual(mockStats)
    })

    it('should return null on failure', async () => {
      vi.mocked(api.get).mockResolvedValue({ success: false })

      const result = await chatService.getCacheStats()

      expect(result).toBeNull()
    })
  })

  describe.skip('streamMessage', () => {
    // Skipping SSE tests due to complex EventSource mocking
    // The functionality is tested indirectly through integration tests
    it('should handle streaming', () => {
      expect(true).toBe(true)
    })
  })
})

describe.skip('Helper Functions', () => {
  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()

      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('detectInvestigationIntent', () => {
    it('should detect investigation keywords in Portuguese', () => {
      expect(detectInvestigationIntent('Quero investigar este contrato')).toBe(true)
      expect(detectInvestigationIntent('Preciso analisar esta licitação')).toBe(true)
      expect(detectInvestigationIntent('Verificar irregularidades')).toBe(true)
      expect(detectInvestigationIntent('Detectar anomalia nos gastos')).toBe(true)
    })

    it('should detect investigation keywords in English', () => {
      expect(detectInvestigationIntent('I want to investigate this contract')).toBe(true)
      expect(detectInvestigationIntent('Please analyze this bidding')).toBe(true)
      expect(detectInvestigationIntent('Check for anomalies')).toBe(true)
      expect(detectInvestigationIntent('Audit the suspicious transactions')).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(detectInvestigationIntent('INVESTIGAR CONTRATO')).toBe(true)
      expect(detectInvestigationIntent('InVeStIgAtE')).toBe(true)
    })

    it('should return false for non-investigation messages', () => {
      expect(detectInvestigationIntent('Hello, how are you?')).toBe(false)
      expect(detectInvestigationIntent('What is the weather today?')).toBe(false)
      expect(detectInvestigationIntent('Tell me a joke')).toBe(false)
    })
  })

  describe('formatAgentName', () => {
    it('should format known agent IDs', () => {
      expect(formatAgentName('abaporu')).toBe('Abaporu')
      expect(formatAgentName('zumbi')).toBe('Zumbi dos Palmares')
      expect(formatAgentName('anita')).toBe('Anita Garibaldi')
      expect(formatAgentName('tiradentes')).toBe('Tiradentes')
      expect(formatAgentName('nana')).toBe('Nanã')
      expect(formatAgentName('ayrton')).toBe('Ayrton Senna')
      expect(formatAgentName('machado')).toBe('Machado de Assis')
      expect(formatAgentName('dandara')).toBe('Dandara')
      expect(formatAgentName('drummond')).toBe('Carlos Drummond de Andrade')
    })

    it('should return original ID for unknown agents', () => {
      expect(formatAgentName('unknown-agent')).toBe('unknown-agent')
      expect(formatAgentName('test-123')).toBe('test-123')
    })
  })
})
