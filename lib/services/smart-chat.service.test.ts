import { describe, expect, it, beforeEach, vi, afterEach, type MockedFunction } from 'vitest'
import { SmartChatService, type ModelPreference, type SmartChatOptions } from './smart-chat.service'
import * as backendAdapter from '@/lib/api/chat-adapter-backend'
import * as v3Adapter from '@/lib/api/chat-adapter-v3'
import * as optimizedAdapter from '@/lib/api/chat-adapter-optimized-maritaca'
import * as emergencyAdapter from '@/lib/api/chat-adapter-emergency'
import * as telemetry from '@/lib/telemetry/chat-telemetry'
import type { ChatRequest, ChatResponse } from '@/types/chat'

// Mock all adapters
vi.mock('@/lib/api/chat-adapter-backend')
vi.mock('@/lib/api/chat-adapter-v3')
vi.mock('@/lib/api/chat-adapter-optimized-maritaca')
vi.mock('@/lib/api/chat-adapter-emergency')
vi.mock('@/lib/telemetry/chat-telemetry', () => ({
  chatTelemetry: {
    track: vi.fn()
  }
}))

describe('SmartChatService', () => {
  let service: SmartChatService
  let consoleLogSpy: any
  let consoleWarnSpy: any
  let consoleErrorSpy: any
  
  const mockResponse: ChatResponse = {
    session_id: 'test-session',
    agent_id: 'anita',
    agent_name: 'Anita Garibaldi',
    message: 'Test response',
    confidence: 0.95,
    suggested_actions: ['Action 1', 'Action 2'],
    metadata: { test: true }
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Create new service instance for each test
    service = new SmartChatService()
    
    // Mock console to avoid noise
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Default mock implementations
    vi.mocked(backendAdapter.sendBackendMessage).mockRejectedValue(new Error('Backend failed'))
    vi.mocked(optimizedAdapter.sendOptimizedMessage).mockRejectedValue(new Error('Optimized failed'))
    vi.mocked(emergencyAdapter.sendEmergencyMessage).mockRejectedValue(new Error('Emergency failed'))
    vi.mocked(v3Adapter.sendChatMessageV3).mockRejectedValue(new Error('V3 failed'))
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('sendMessage', () => {
    it('tries endpoints in priority order and returns first success', async () => {
      // Make the second endpoint succeed
      vi.mocked(optimizedAdapter.sendOptimizedMessage).mockResolvedValueOnce(mockResponse)
      
      const result = await service.sendMessage('Test message')
      
      // Should have tried backend first (failed), then optimized (success)
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalledOnce()
      expect(optimizedAdapter.sendOptimizedMessage).toHaveBeenCalledOnce()
      
      // Should not have tried the rest
      expect(emergencyAdapter.sendEmergencyMessage).not.toHaveBeenCalled()
      expect(v3Adapter.sendChatMessageV3).not.toHaveBeenCalled()
      
      expect(result).toEqual(mockResponse)
    })

    it('creates fallback response when all endpoints fail', async () => {
      // All adapters will fail (default mocks)
      
      const result = await service.sendMessage('Test message')
      
      // Should have tried all endpoints
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalledOnce()
      expect(optimizedAdapter.sendOptimizedMessage).toHaveBeenCalledOnce()
      expect(emergencyAdapter.sendEmergencyMessage).toHaveBeenCalledOnce()
      expect(v3Adapter.sendChatMessageV3).toHaveBeenCalledOnce()
      
      // Should return fallback response
      expect(result.agent_id).toBe('system')
      expect(result.agent_name).toBe('Sistema')
      expect(result.message).toContain('temporariamente indisponível')
      expect(result.confidence).toBe(0)
      expect(result.metadata.fallback).toBe(true)
    })

    it('handles timeout correctly', async () => {
      // Make adapter hang forever
      vi.mocked(backendAdapter.sendBackendMessage).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      )
      
      // Make second adapter succeed
      vi.mocked(optimizedAdapter.sendOptimizedMessage).mockResolvedValueOnce(mockResponse)
      
      const resultPromise = service.sendMessage('Test message', { timeout: 100 })
      
      // Advance timers to trigger timeout
      vi.advanceTimersByTime(100)
      
      const result = await resultPromise
      
      // Should have fallen back to second adapter
      expect(result).toEqual(mockResponse)
    })

    it('passes correct request format to adapters', async () => {
      vi.mocked(backendAdapter.sendBackendMessage).mockResolvedValueOnce(mockResponse)
      
      await service.sendMessage('Test message', {
        preferredModel: 'quality',
        useDrummond: false
      })
      
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalledWith({
        message: 'Test message',
        session_id: expect.stringMatching(/^smart_\d+$/),
        context: {
          model_preference: 'quality',
          use_drummond: false
        }
      })
    })

    it('logs telemetry on success', async () => {
      vi.mocked(backendAdapter.sendBackendMessage).mockResolvedValueOnce(mockResponse)
      
      await service.sendMessage('Test message')
      
      expect(telemetry.chatTelemetry.track).toHaveBeenCalledWith({
        type: 'message_received',
        timestamp: expect.any(Number),
        sessionId: 'test-session',
        duration: expect.any(Number),
        data: {
          endpoint: 'Maritaca Stable',
          model: 'sabiazinho-3',
          costLevel: 1,
          confidence: 0.95
        }
      })
    })
  })

  describe('analyzeComplexity', () => {
    const testCases = [
      { message: 'Oi', expected: 'simple' },
      { message: 'Como funciona o sistema?', expected: 'moderate' },
      { message: 'Analise os contratos e identifique anomalias', expected: 'complex' },
      { message: 'Investigue padrões suspeitos', expected: 'complex' },
      { message: 'O que é transparência?', expected: 'moderate' },
      { message: 'Liste todos os agentes disponíveis', expected: 'moderate' },
      { message: 'a'.repeat(201), expected: 'complex' }, // Long message
    ]

    testCases.forEach(({ message, expected }) => {
      it(`analyzes "${message.substring(0, 30)}..." as ${expected}`, () => {
        const result = service.analyzeComplexity(message)
        expect(result).toBe(expected)
      })
    })
  })

  describe('model selection based on preference', () => {
    it('sorts by cost for economic preference', async () => {
      // Make all fail to see the order
      const result = await service.sendMessage('Test', { preferredModel: 'economic' })
      
      // Should try in cost order (cheapest first), but legacy last
      const calls = [
        backendAdapter.sendBackendMessage,
        optimizedAdapter.sendOptimizedMessage,
        emergencyAdapter.sendEmergencyMessage,
        v3Adapter.sendChatMessageV3
      ]
      
      calls.forEach(call => expect(call).toHaveBeenCalledOnce())
      
      // Verify legacy (v3) was called last
      const callOrders = calls.map(call => (call as any).mock.invocationCallOrder[0])
      const v3CallOrder = (v3Adapter.sendChatMessageV3 as any).mock.invocationCallOrder[0]
      expect(v3CallOrder).toBe(Math.max(...callOrders))
    })

    it('sorts by quality for quality preference', async () => {
      // For quality, should prefer higher cost endpoints
      await service.sendMessage('Test', { preferredModel: 'quality' })
      
      // All adapters should be called
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalled()
      expect(optimizedAdapter.sendOptimizedMessage).toHaveBeenCalled()
      expect(emergencyAdapter.sendEmergencyMessage).toHaveBeenCalled()
      expect(v3Adapter.sendChatMessageV3).toHaveBeenCalled()
    })

    it('prioritizes stable endpoint for stable preference', async () => {
      await service.sendMessage('Test', { preferredModel: 'stable' })
      
      // Stable endpoint should be called first
      const stableCallOrder = (backendAdapter.sendBackendMessage as any).mock.invocationCallOrder[0]
      const otherCallOrders = [
        (optimizedAdapter.sendOptimizedMessage as any).mock.invocationCallOrder[0],
        (emergencyAdapter.sendEmergencyMessage as any).mock.invocationCallOrder[0],
        (v3Adapter.sendChatMessageV3 as any).mock.invocationCallOrder[0]
      ].filter(order => order !== undefined)
      
      expect(stableCallOrder).toBeLessThan(Math.min(...otherCallOrders))
    })

    it('uses default priority for auto preference', async () => {
      await service.sendMessage('Test', { preferredModel: 'auto' })
      
      // Should follow the priority field order
      const calls = [
        { fn: backendAdapter.sendBackendMessage, priority: 1 },
        { fn: optimizedAdapter.sendOptimizedMessage, priority: 2 },
        { fn: emergencyAdapter.sendEmergencyMessage, priority: 3 },
        { fn: v3Adapter.sendChatMessageV3, priority: 4 }
      ]
      
      // Verify they were called in priority order
      const callOrders = calls.map(({ fn }) => ({
        order: (fn as any).mock.invocationCallOrder[0],
        fn
      })).sort((a, b) => a.order - b.order)
      
      expect(callOrders[0].fn).toBe(backendAdapter.sendBackendMessage)
      expect(callOrders[1].fn).toBe(optimizedAdapter.sendOptimizedMessage)
      expect(callOrders[2].fn).toBe(emergencyAdapter.sendEmergencyMessage)
      expect(callOrders[3].fn).toBe(v3Adapter.sendChatMessageV3)
    })
  })

  describe('fallback responses', () => {
    it('returns greeting fallback for greeting messages', async () => {
      const result = await service.sendMessage('Olá!')
      
      expect(result.message).toContain('dificuldades de conexão')
      expect(result.suggested_actions).toContain('Tentar novamente')
    })

    it('returns help fallback for help messages', async () => {
      const result = await service.sendMessage('Preciso de ajuda')
      
      expect(result.message).toContain('sistema de transparência pública')
    })

    it('returns default fallback for other messages', async () => {
      const result = await service.sendMessage('Random message')
      
      expect(result.message).toContain('temporariamente indisponível')
    })

    it('includes error details in metadata', async () => {
      const result = await service.sendMessage('Test')
      
      expect(result.metadata.fallback).toBe(true)
      expect(result.metadata.error).toBe('V3 failed') // Last error
      expect(result.metadata.endpoint).toBe('local')
    })
  })

  describe('getModelCost', () => {
    it('returns correct costs for known models', () => {
      expect(service.getModelCost('sabiazinho-3')).toBe(0.001)
      expect(service.getModelCost('sabia-3')).toBe(0.003)
      expect(service.getModelCost('mixed')).toBe(0.002)
    })

    it('returns default cost for unknown models', () => {
      expect(service.getModelCost('unknown-model')).toBe(0.002)
    })
  })

  describe('context handling', () => {
    it('includes useDrummond in context with default true', async () => {
      vi.mocked(backendAdapter.sendBackendMessage).mockResolvedValueOnce(mockResponse)
      
      await service.sendMessage('Test')
      
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            use_drummond: true
          })
        })
      )
    })

    it('respects useDrummond option when set to false', async () => {
      vi.mocked(backendAdapter.sendBackendMessage).mockResolvedValueOnce(mockResponse)
      
      await service.sendMessage('Test', { useDrummond: false })
      
      expect(backendAdapter.sendBackendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            use_drummond: false
          })
        })
      )
    })
  })

  describe('error handling and logging', () => {
    it('logs warnings for each failed endpoint', async () => {
      await service.sendMessage('Test')
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SmartChat] Maritaca Stable failed:',
        expect.any(Error)
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SmartChat] Maritaca Optimized failed:',
        expect.any(Error)
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SmartChat] Maritaca Emergency failed:',
        expect.any(Error)
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SmartChat] Legacy Fallback failed:',
        expect.any(Error)
      )
    })

    it('logs error when all endpoints fail', async () => {
      await service.sendMessage('Test')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SmartChat] All endpoints failed, using local fallback'
      )
    })
  })
})