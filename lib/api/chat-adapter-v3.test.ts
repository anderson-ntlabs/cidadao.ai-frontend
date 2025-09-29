import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { sendChatMessageV3 } from './chat-adapter-v3'
import { api } from './client'
import * as telemetry from '@/lib/telemetry/chat-telemetry'
import * as featureFlags from '@/lib/feature-flags'
import * as retry from '@/lib/utils/retry'
import type { ChatRequest } from '@/types/chat'

// Mock the dependencies
vi.mock('./client', () => ({
  api: {
    post: vi.fn()
  },
  API_BASE_URL: 'http://test.api'
}))

vi.mock('@/lib/telemetry/chat-telemetry', () => ({
  trackChatMessage: vi.fn(),
  trackChatResponse: vi.fn(),
  trackChatError: vi.fn(),
  trackChatRetry: vi.fn()
}))

vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: vi.fn()
}))

vi.mock('@/lib/utils/retry', () => ({
  withRetry: vi.fn()
}))

describe('sendChatMessageV3', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock console to avoid noise in tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Default feature flags
    vi.mocked(featureFlags.isFeatureEnabled).mockReturnValue(false)
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Normal Operation Mode', () => {
    it('sends message successfully and tracks telemetry', async () => {
      const request: ChatRequest = {
        message: 'Olá, como você está?',
        session_id: 'test-session-123',
        context: { locale: 'pt' }
      }

      const mockResponse = {
        session_id: 'test-session-123',
        message_id: 'msg-123',
        agent_id: 'drummond',
        agent_name: 'Carlos Drummond de Andrade',
        message: 'Estou bem, obrigado por perguntar!',
        confidence: 0.95,
        suggested_actions: ['Como posso ajudar?', 'O que você gostaria de saber?'],
        metadata: {
          intent_type: 'greeting',
          language: 'pt'
        },
        timestamp: '2025-01-01T10:00:00Z'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: mockResponse
      })

      const result = await sendChatMessageV3(request)

      // Verify API call
      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/message', {
        message: request.message,
        session_id: request.session_id,
        context: request.context
      })

      // Verify telemetry - intent should be detected as greeting
      expect(telemetry.trackChatMessage).toHaveBeenCalledWith(
        'test-session-123',
        'Olá, como você está?',
        'greeting'
      )
      expect(telemetry.trackChatResponse).toHaveBeenCalledWith(
        'test-session-123',
        expect.any(Number),
        false // not in maintenance mode
      )

      // Verify response format
      expect(result).toEqual({
        session_id: 'test-session-123',
        agent_id: 'drummond',
        agent_name: 'Carlos Drummond de Andrade',
        message: 'Estou bem, obrigado por perguntar!',
        confidence: 0.95,
        suggested_actions: ['Como posso ajudar?', 'O que você gostaria de saber?'],
        metadata: {
          intent_type: 'greeting',
          language: 'pt',
          timestamp: '2025-01-01T10:00:00Z'
        }
      })
    })

    it('handles retry when feature is enabled', async () => {
      const request: ChatRequest = {
        message: 'Test retry'
      }

      // Enable retry feature
      vi.mocked(featureFlags.isFeatureEnabled).mockImplementation((flag) => flag === 'chatRetryEnabled')

      const mockResponse = {
        success: true,
        data: {
          session_id: 'test',
          message: 'Response',
          agent_id: 'test',
          agent_name: 'Test Agent'
        }
      }

      // Mock withRetry to call the function and return response
      vi.mocked(retry.withRetry).mockImplementation(async (fn) => {
        return mockResponse
      })

      await sendChatMessageV3(request)

      expect(retry.withRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {
          maxAttempts: 3,
          onRetry: expect.any(Function)
        }
      )
    })
  })

  describe('Demo Mode', () => {
    it('returns demo response when backend is in real maintenance mode', async () => {
      const request: ChatRequest = {
        message: 'Investigar contratos suspeitos',
        session_id: 'demo-session'
      }

      // Enable demo mode
      vi.mocked(featureFlags.isFeatureEnabled).mockImplementation((flag) => flag === 'chatDemoMode')

      const maintenanceResponse = {
        session_id: 'demo-session',
        agent_id: 'system',
        agent_name: 'System',
        message: 'Sistema em manutenção',
        confidence: 0,
        metadata: {}
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: maintenanceResponse
      })

      const result = await sendChatMessageV3(request)

      // Should return demo response with investigation content
      expect(result.agent_id).toBe('drummond')
      expect(result.agent_name).toBe('Carlos Drummond de Andrade')
      expect(result.message).toContain('Modo de Investigação Detectado')
      expect(result.confidence).toBe(0.85)
      expect(result.metadata.is_demo).toBe(true)
      expect(result.suggested_actions).toContain('Contratos do Ministério da Saúde')
    })

    it('returns normal response when Drummond is working', async () => {
      const request: ChatRequest = {
        message: 'Hello, how are you?'
      }

      const drummondResponse = {
        session_id: 'test',
        agent_id: 'drummond',
        agent_name: 'Carlos Drummond de Andrade',
        message: 'I am well, thank you!',
        confidence: 0.9,
        metadata: {}
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: drummondResponse
      })

      const result = await sendChatMessageV3(request)

      // Should return actual response, not demo
      expect(result.message).toBe('I am well, thank you!')
      expect(result.metadata.is_demo).toBeUndefined()
    })
  })

  describe('Intent Detection', () => {
    const testCases = [
      { message: 'Olá!', expectedIntent: 'greeting' },
      { message: 'Bom dia', expectedIntent: 'greeting' },
      { message: 'Hello', expectedIntent: 'greeting' },
      { message: 'Investigar contratos', expectedIntent: 'investigation' },
      { message: 'Detectar anomalias', expectedIntent: 'investigation' },
      { message: 'Contratos suspeitos', expectedIntent: 'investigation' },
      { message: 'Como funciona?', expectedIntent: 'help' },
      { message: 'O que é o Cidadão.AI?', expectedIntent: 'help' },
      { message: 'Ajuda por favor', expectedIntent: 'help' },
      { message: 'Qualquer outra coisa', expectedIntent: 'default' }
    ]

    testCases.forEach(({ message, expectedIntent }) => {
      it(`detects "${expectedIntent}" intent for "${message}"`, async () => {
        const request: ChatRequest = { message }

        vi.mocked(api.post).mockResolvedValueOnce({
          success: true,
          data: {
            session_id: 'test',
            agent_id: 'test',
            agent_name: 'Test',
            message: 'Response',
            metadata: {}
          }
        })

        await sendChatMessageV3(request)

        expect(telemetry.trackChatMessage).toHaveBeenCalledWith(
          expect.any(String),
          message,
          expectedIntent
        )
      })
    })
  })

  describe('Language Detection', () => {
    it('detects Portuguese language', async () => {
      const request: ChatRequest = {
        message: 'Como está o tempo hoje?'
      }

      // Force error to trigger demo response which uses language detection
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Test error'))

      const result = await sendChatMessageV3(request)

      // Portuguese error message
      expect(result.message).toContain('Ops! Parece que estamos com um problema técnico')
    })

    it('detects English language', async () => {
      const request: ChatRequest = {
        message: 'How is the weather today?'
      }

      // Force error to trigger demo response
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Test error'))

      const result = await sendChatMessageV3(request)

      // English error message
      expect(result.message).toContain("Oops! Looks like we're having a technical issue")
    })
  })

  describe('Error Handling', () => {
    it('returns demo response on API error', async () => {
      const request: ChatRequest = {
        message: 'How can you help me?'  // English message to get English error response
      }

      const error = new Error('Network error')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessageV3(request)

      // Should track error
      expect(telemetry.trackChatError).toHaveBeenCalledWith('unknown', error)

      // Should return demo response
      expect(result.agent_id).toBe('drummond')
      expect(result.message).toContain('technical issue')
      expect(result.confidence).toBe(0.9)
    })

    it('handles API response without success', async () => {
      const request: ChatRequest = {
        message: 'Test failure'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: false,
        error: { message: 'API Error' }
      })

      const result = await sendChatMessageV3(request)

      // Should return demo response
      expect(result.agent_id).toBe('drummond')
      expect(result.message).toBeTruthy()
      expect(result.confidence).toBe(0.9)
    })

    it('handles missing response data', async () => {
      const request: ChatRequest = {
        message: 'Test missing data'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: null
      })

      const result = await sendChatMessageV3(request)

      // Should return demo response
      expect(result.agent_id).toBe('drummond')
    })
  })

  describe('Response Field Variations', () => {
    it('handles content field instead of message', async () => {
      const request: ChatRequest = {
        message: 'Test content field'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'test',
          agent_id: 'test',
          agent_name: 'Test',
          content: 'Content instead of message',
          metadata: {}
        }
      })

      const result = await sendChatMessageV3(request)

      expect(result.message).toBe('Content instead of message')
    })

    it('uses metadata confidence when main confidence is missing', async () => {
      const request: ChatRequest = {
        message: 'Test confidence'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'test',
          agent_id: 'test',
          agent_name: 'Test',
          message: 'Response',
          metadata: { confidence: 0.75 }
        }
      })

      const result = await sendChatMessageV3(request)

      expect(result.confidence).toBe(0.75)
    })

    it('defaults to 0.9 confidence when none provided', async () => {
      const request: ChatRequest = {
        message: 'Test default confidence'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'test',
          agent_id: 'test',
          agent_name: 'Test',
          message: 'Response',
          metadata: {}
        }
      })

      const result = await sendChatMessageV3(request)

      expect(result.confidence).toBe(0.9)
    })
  })

  describe('Session Management', () => {
    it('generates session_id when not provided', async () => {
      const request: ChatRequest = {
        message: 'Test session generation'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'generated-session',
          agent_id: 'test',
          agent_name: 'Test',
          message: 'Response'
        }
      })

      await sendChatMessageV3(request)

      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/message', {
        message: 'Test session generation',
        session_id: expect.stringMatching(/^session_\d+$/),
        context: undefined
      })
    })

    it('preserves provided session_id', async () => {
      const request: ChatRequest = {
        message: 'Test',
        session_id: 'user-session-456'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'user-session-456',
          agent_id: 'test',
          agent_name: 'Test',
          message: 'Response'
        }
      })

      const result = await sendChatMessageV3(request)

      expect(result.session_id).toBe('user-session-456')
    })
  })
})