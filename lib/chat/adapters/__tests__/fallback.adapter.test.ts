/**
 * Fallback Adapter Tests
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { FallbackAdapter, normalizeMaritacaModel, type MaritacaModel } from '../fallback.adapter'
import type { ChatRequest } from '../../types'

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('FallbackAdapter', () => {
  let adapter: FallbackAdapter

  beforeEach(() => {
    adapter = new FallbackAdapter()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('send', () => {
    it('should send message successfully with default model', async () => {
      const request: ChatRequest = {
        message: 'Test message',
        sessionId: 'test-session',
      }

      const mockResponse = {
        response: 'Maritaca response',
        metadata: {
          tokens: 100,
          cost: 0.001,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Maritaca response')
      expect(response.data?.agentId).toBe('maritaca')
      expect(response.data?.agentName).toBe('Maritaca (sabiazinho-4)')
      expect(response.data?.confidence).toBe(0.85)
      expect(response.data?.metadata?.model).toBe('sabiazinho-4')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/chat/direct/maritaca'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('sabiazinho-4'),
        })
      )
    })

    it('should send message with sabia-4 model', async () => {
      const adapter = new FallbackAdapter('sabia-4')
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(response.data?.agentName).toBe('Maritaca (sabia-4)')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('sabia-4'),
        })
      )
    })

    it('should handle message field fallback', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Response in message field' }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBe('Response in message field')
    })

    it('should include context in request', async () => {
      const request: ChatRequest = {
        message: 'Test message',
        context: {
          intent: 'search',
          filters: { date: '2024' },
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"intent":"search"'),
        })
      )
    })

    it('should handle HTTP errors', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('FALLBACK_ERROR')
      expect(response.error?.message).toContain('429')
    })

    it('should handle network errors', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))

      const response = await adapter.send(request)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('FALLBACK_ERROR')
      expect(response.error?.message).toContain('Network failure')
    })

    it('should handle timeout', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockImplementation(() => {
        const error = new Error('The operation was aborted')
        error.name = 'AbortError'
        return Promise.reject(error)
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('FALLBACK_ERROR')
    })

    it('should handle unknown errors', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockRejectedValue('Unknown error')

      const response = await adapter.send(request)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('UNKNOWN_ERROR')
      expect(response.error?.message).toBe('Fallback adapter failed')
    })

    it('should preserve metadata from response', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      const mockMetadata = {
        model: 'sabiazinho-4',
        tokens: 150,
        cost: 0.002,
        processingTime: 500,
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          response: 'Test',
          metadata: mockMetadata,
        }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(response.data?.metadata).toMatchObject(mockMetadata)
      expect(response.data?.metadata?.model).toBe('sabiazinho-4')
    })
  })

  describe('isAvailable', () => {
    it('should always return true', async () => {
      const available = await adapter.isAvailable()
      expect(available).toBe(true)
    })

    it('should return true even after failed requests', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await adapter.send({ message: 'Test' })

      const available = await adapter.isAvailable()
      expect(available).toBe(true)
    })
  })

  describe('model management', () => {
    it('should switch to sabia-4 model', () => {
      adapter.setModel('sabia-4')
      expect(adapter.getModel()).toBe('sabia-4')
    })

    it('should switch to sabiazinho-4 model', () => {
      adapter.setModel('sabia-4')
      adapter.setModel('sabiazinho-4')
      expect(adapter.getModel()).toBe('sabiazinho-4')
    })

    it('should use new model after switching', async () => {
      adapter.setModel('sabia-4')

      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"model":"sabia-4"'),
        })
      )
    })

    it('should reflect model in agent name', async () => {
      adapter.setModel('sabia-4')

      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      const response = await adapter.send(request)

      expect(response.data?.agentName).toBe('Maritaca (sabia-4)')
    })

    it('should start with sabiazinho-4 by default', () => {
      const newAdapter = new FallbackAdapter()
      expect(newAdapter.getModel()).toBe('sabiazinho-4')
    })

    it('should accept initial model in constructor', () => {
      const newAdapter = new FallbackAdapter('sabia-4')
      expect(newAdapter.getModel()).toBe('sabia-4')
    })
  })

  describe('request format', () => {
    it('should send message with session ID', async () => {
      const request: ChatRequest = {
        message: 'Test message',
        sessionId: 'session-123',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"session_id":"session-123"'),
        })
      )
    })

    it('should send message without session ID', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
      expect(callBody.session_id).toBeUndefined()
    })

    it('should use correct endpoint', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/chat/direct/maritaca'),
        expect.any(Object)
      )
    })

    it('should set correct headers', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should have 30 second timeout', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      await adapter.send(request)

      const fetchCall = (global.fetch as any).mock.calls[0]
      expect(fetchCall[1].signal).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty response', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(response.data?.response).toBeUndefined()
    })

    it('should handle null response', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      // Response will be undefined when not provided
      expect(response.data?.response).toBeUndefined()
    })

    it('should handle malformed JSON', async () => {
      const request: ChatRequest = {
        message: 'Test message',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('FALLBACK_ERROR')
    })

    it('should handle empty message', async () => {
      const request: ChatRequest = {
        message: '',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Empty message processed' }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
    })

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000)
      const request: ChatRequest = {
        message: longMessage,
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Long message processed' }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
    })

    it('should handle special characters in message', async () => {
      const request: ChatRequest = {
        message: 'Test with special chars: 你好 émojis 🎉 and \n newlines',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Processed' }),
      })

      const response = await adapter.send(request)

      expect(response.success).toBe(true)
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('adapter identity', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('fallback-maritaca')
    })

    it('should identify as maritaca agent', async () => {
      const request: ChatRequest = {
        message: 'Test',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      const response = await adapter.send(request)

      expect(response.data?.agentId).toBe('maritaca')
    })

    it('should have fixed confidence', async () => {
      const request: ChatRequest = {
        message: 'Test',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'Test' }),
      })

      const response = await adapter.send(request)

      expect(response.data?.confidence).toBe(0.85)
    })
  })

  describe('normalizeMaritacaModel', () => {
    it('should map retired sabia-3 / sabia-3.1 to sabia-4', () => {
      expect(normalizeMaritacaModel('sabia-3')).toBe('sabia-4')
      expect(normalizeMaritacaModel('sabia-3.1')).toBe('sabia-4')
    })

    it('should map retired sabiazinho-3 to sabiazinho-4', () => {
      expect(normalizeMaritacaModel('sabiazinho-3')).toBe('sabiazinho-4')
    })

    it('should pass through current models unchanged', () => {
      expect(normalizeMaritacaModel('sabia-4')).toBe('sabia-4')
      expect(normalizeMaritacaModel('sabiazinho-4')).toBe('sabiazinho-4')
    })

    it('should default unknown / null / undefined to sabia-4', () => {
      expect(normalizeMaritacaModel('unknown-model')).toBe('sabia-4')
      expect(normalizeMaritacaModel(null)).toBe('sabia-4')
      expect(normalizeMaritacaModel(undefined)).toBe('sabia-4')
    })
  })
})
