import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useChat } from './use-chat'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as any

// Mock agents data
vi.mock('@/data/agents', () => ({
  agents: [
    { id: 'zumbi', name: 'Zumbi dos Palmares', role: { pt: 'Detector de Anomalias' } },
    { id: 'anita', name: 'Anita Garibaldi', role: { pt: 'Analista de Padrões' } },
    { id: 'tiradentes', name: 'Tiradentes', role: { pt: 'Gerador de Relatórios' } },
    { id: 'abaporu', name: 'Abaporu', role: { pt: 'Orquestrador' } },
    { id: 'drummond', name: 'Carlos Drummond de Andrade', role: { pt: 'Comunicador' } },
  ],
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('sendMessage', () => {
    it('should send message to unified chat endpoint', async () => {
      const mockResponse = {
        message: 'Olá! Como posso ajudar?',
        agent_id: 'drummond',
        confidence: 0.9,
        metadata: {
          sources: [],
        },
      }

      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useChat())

      let response
      await act(async () => {
        response = await result.current.sendMessage({
          message: 'Olá',
        })
      })

      // Verify correct endpoint was called
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/message`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"message":"Olá"'),
        })
      )

      // Verify response structure
      expect(response).toMatchObject({
        response: 'Olá! Como posso ajudar?',
        message: 'Olá! Como posso ajudar?',
        agent: 'drummond',
        confidence: 0.9,
      })
    })

    it('should include session_id in request', async () => {
      const mockResponse = {
        message: 'Response',
        agent_id: 'drummond',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useChat())

      await act(async () => {
        await result.current.sendMessage({
          message: 'Test',
          session_id: 'test-session-123',
        })
      })

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody).toHaveProperty('session_id', 'test-session-123')
    })

    it('should include context in request', async () => {
      const mockResponse = {
        message: 'Response',
        agent_id: 'drummond',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useChat())

      const context = { investigation_id: '123' }
      await act(async () => {
        await result.current.sendMessage({
          message: 'Test',
          context,
        })
      })

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody).toHaveProperty('context')
      expect(callBody.context).toMatchObject(context)
    })

    it('should handle backend error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Internal server error' }),
      })

      const { result } = renderHook(() => useChat())

      await expect(
        act(async () => {
          await result.current.sendMessage({
            message: 'Test',
          })
        })
      ).rejects.toThrow('Internal server error')
    })

    it('should handle HTML response error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
      })

      const { result } = renderHook(() => useChat())

      await expect(
        act(async () => {
          await result.current.sendMessage({
            message: 'Test',
          })
        })
      ).rejects.toThrow('Servidor retornou HTML em vez de JSON')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useChat())

      await expect(
        act(async () => {
          await result.current.sendMessage({
            message: 'Test',
          })
        })
      ).rejects.toThrow('Não foi possível conectar ao servidor')
    })

    it('should handle invalid content type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: async () => ({ message: 'test' }),
      })

      const { result } = renderHook(() => useChat())

      await expect(
        act(async () => {
          await result.current.sendMessage({
            message: 'Test',
          })
        })
      ).rejects.toThrow('Resposta inválida do servidor')
    })

    it('should set loading state to false after request completes', async () => {
      const mockResponse = {
        message: 'Response',
        agent_id: 'drummond',
      }

      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useChat())

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        await result.current.sendMessage({
          message: 'Test',
        })
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should set error state on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ detail: 'Bad request' }),
      })

      const { result } = renderHook(() => useChat())

      // Initial error state should be null
      expect(result.current?.error).toBe(null)

      let caughtError = false
      await act(async () => {
        try {
          await result.current.sendMessage({
            message: 'Test',
          })
        } catch (err) {
          caughtError = true
        }
      })

      expect(caughtError).toBe(true)
      expect(result.current?.error).toBe('Bad request')
    })
  })

  describe('getSuggestions', () => {
    it('should return static suggestions', async () => {
      const { result } = renderHook(() => useChat())

      let suggestions: any
      await act(async () => {
        suggestions = await result.current?.getSuggestions()
      })

      expect(suggestions).toBeDefined()
      expect(suggestions).toHaveProperty('suggestions')
      expect(Array.isArray(suggestions.suggestions)).toBe(true)
      expect(suggestions.suggestions.length).toBe(3)
    })

    it('should return suggestions even without agent_id', async () => {
      const { result } = renderHook(() => useChat())

      let suggestions: any
      await act(async () => {
        suggestions = await result.current?.getSuggestions()
      })

      expect(suggestions).toBeDefined()
      expect(suggestions.suggestions).toBeDefined()
      expect(suggestions.suggestions.length).toBeGreaterThan(0)
    })
  })
})
