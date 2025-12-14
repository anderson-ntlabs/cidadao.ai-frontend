/**
 * Tests for AI Telemetry Integration
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks for Sentry
const mockStartSpan = vi.hoisted(() =>
  vi.fn((config, callback) => callback({ setStatus: vi.fn() }))
)
const mockAddBreadcrumb = vi.hoisted(() => vi.fn())
const mockSetMeasurement = vi.hoisted(() => vi.fn())
const mockCaptureMessage = vi.hoisted(() => vi.fn())
const mockSetContext = vi.hoisted(() => vi.fn())
const mockSetTag = vi.hoisted(() => vi.fn())

vi.mock('@sentry/nextjs', () => ({
  startSpan: mockStartSpan,
  addBreadcrumb: mockAddBreadcrumb,
  setMeasurement: mockSetMeasurement,
  captureMessage: mockCaptureMessage,
  setContext: mockSetContext,
  setTag: mockSetTag,
}))

import {
  startAISpan,
  trackAICall,
  withAITelemetry,
  trackTokenUsage,
  setAIAgentContext,
} from './ai-telemetry'

describe('AI Telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startAISpan', () => {
    it('should start a Sentry span with AI operation', () => {
      startAISpan('chat', {
        model: 'sabia-3',
        provider: 'maritaca',
        agentId: 'zumbi',
      })

      expect(mockStartSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ai.chat',
          op: 'ai.chat',
        }),
        expect.any(Function)
      )
    })

    it('should use unknown for missing attributes', () => {
      startAISpan('completion', {})

      expect(mockStartSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            'ai.model': 'unknown',
            'ai.provider': 'unknown',
          }),
        }),
        expect.any(Function)
      )
    })

    it('should track prompt length for privacy', () => {
      startAISpan('chat', {
        prompt: 'Hello, how are you?',
      })

      expect(mockStartSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            'ai.prompt_length': 19,
          }),
        }),
        expect.any(Function)
      )
    })
  })

  describe('trackAICall', () => {
    it('should add breadcrumb for successful call', () => {
      trackAICall({
        model: 'sabia-3',
        provider: 'maritaca',
        operation: 'chat',
        latencyMs: 500,
        success: true,
        agentId: 'zumbi',
      })

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'ai',
        message: 'maritaca/sabia-3 - chat',
        level: 'info',
        data: expect.objectContaining({
          model: 'sabia-3',
          provider: 'maritaca',
          success: true,
        }),
      })
    })

    it('should add breadcrumb with error level for failed call', () => {
      trackAICall({
        model: 'sabia-3',
        provider: 'maritaca',
        operation: 'chat',
        latencyMs: 1000,
        success: false,
        error: 'Timeout',
      })

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
        })
      )
    })

    it('should set latency measurement', () => {
      trackAICall({
        model: 'sabia-3',
        provider: 'maritaca',
        operation: 'chat',
        latencyMs: 250,
        success: true,
      })

      expect(mockSetMeasurement).toHaveBeenCalledWith('ai.latency', 250, 'millisecond')
    })

    it('should set token measurements', () => {
      trackAICall({
        model: 'sabia-3',
        provider: 'maritaca',
        operation: 'chat',
        latencyMs: 300,
        success: true,
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      })

      expect(mockSetMeasurement).toHaveBeenCalledWith('ai.tokens.total', 150, 'none')
      expect(mockSetMeasurement).toHaveBeenCalledWith('ai.tokens.input', 100, 'none')
      expect(mockSetMeasurement).toHaveBeenCalledWith('ai.tokens.output', 50, 'none')
    })

    it('should capture error message on failure', () => {
      trackAICall({
        model: 'sabia-3',
        provider: 'maritaca',
        operation: 'chat',
        latencyMs: 5000,
        success: false,
        error: 'Rate limit exceeded',
        agentId: 'zumbi',
        sessionId: 'session-123',
      })

      expect(mockCaptureMessage).toHaveBeenCalledWith(
        'AI call failed: Rate limit exceeded',
        expect.objectContaining({
          level: 'error',
          tags: expect.objectContaining({
            'ai.model': 'sabia-3',
            'ai.provider': 'maritaca',
          }),
        })
      )
    })
  })

  describe('withAITelemetry', () => {
    it('should track successful async operation', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')

      const result = await withAITelemetry(
        'chat',
        {
          model: 'sabia-3',
          provider: 'maritaca',
          agentId: 'zumbi',
        },
        mockFn
      )

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalled()
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            success: true,
          }),
        })
      )
    })

    it('should track failed async operation and rethrow', async () => {
      const mockError = new Error('Network error')
      const mockFn = vi.fn().mockRejectedValue(mockError)

      await expect(
        withAITelemetry(
          'chat',
          {
            model: 'sabia-3',
            provider: 'maritaca',
          },
          mockFn
        )
      ).rejects.toThrow('Network error')

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            success: false,
          }),
        })
      )
    })

    it('should use unknown for missing attributes', async () => {
      await withAITelemetry('completion', {}, vi.fn().mockResolvedValue('ok'))

      expect(mockStartSpan).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            'ai.model': 'unknown',
            'ai.provider': 'unknown',
          }),
        }),
        expect.any(Function)
      )
    })
  })

  describe('trackTokenUsage', () => {
    it('should set context with token usage', () => {
      trackTokenUsage('maritaca', 'sabia-3', 1000, 500)

      expect(mockSetContext).toHaveBeenCalledWith(
        'ai_usage',
        expect.objectContaining({
          provider: 'maritaca',
          model: 'sabia-3',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        })
      )
    })

    it('should calculate estimated cost for sabia-3', () => {
      trackTokenUsage('maritaca', 'sabia-3', 1000000, 500000)

      expect(mockSetContext).toHaveBeenCalledWith(
        'ai_usage',
        expect.objectContaining({
          estimatedCostUSD: expect.any(String),
        })
      )
    })

    it('should set cost measurement', () => {
      trackTokenUsage('maritaca', 'sabia-3', 1000, 500)

      expect(mockSetMeasurement).toHaveBeenCalledWith(
        'ai.cost.estimated',
        expect.any(Number),
        'none'
      )
    })

    it('should use default cost for unknown models', () => {
      trackTokenUsage('backend', 'unknown-model', 1000, 500)

      expect(mockSetContext).toHaveBeenCalledWith(
        'ai_usage',
        expect.objectContaining({
          model: 'unknown-model',
        })
      )
    })
  })

  describe('setAIAgentContext', () => {
    it('should set agent context and tags', () => {
      setAIAgentContext('zumbi', 'Zumbi dos Palmares', 'session-123')

      expect(mockSetContext).toHaveBeenCalledWith('ai_agent', {
        agentId: 'zumbi',
        agentName: 'Zumbi dos Palmares',
        sessionId: 'session-123',
      })

      expect(mockSetTag).toHaveBeenCalledWith('ai.agent', 'zumbi')
      expect(mockSetTag).toHaveBeenCalledWith('ai.session', 'session-123')
    })

    it('should not set session tag if no sessionId', () => {
      setAIAgentContext('abaporu', 'Abaporu')

      expect(mockSetTag).toHaveBeenCalledWith('ai.agent', 'abaporu')
      expect(mockSetTag).not.toHaveBeenCalledWith('ai.session', expect.any(String))
    })
  })
})
