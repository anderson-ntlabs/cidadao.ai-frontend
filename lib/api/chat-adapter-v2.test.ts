import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { sendChatMessage, getChatSuggestions, getChatHistory } from './chat-adapter-v2'
import { api, API_BASE_URL } from './client'
import * as queryParser from './query-parser'
import type { ChatRequest } from '@/types/chat'

// Mock the dependencies
vi.mock('./client', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  },
  API_BASE_URL: 'http://test.api'
}))

vi.mock('./query-parser', () => ({
  parseUserQuery: vi.fn(),
  formatParsedQuery: vi.fn()
}))

describe('chat-adapter-v2', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock console to avoid noise in tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Default mock for parseUserQuery
    vi.mocked(queryParser.parseUserQuery).mockReturnValue({
      dataSource: 'contratos',
      searchTerm: '',
      filters: {}
    })
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendChatMessage', () => {
    it('sends message successfully and parses query', async () => {
      const request: ChatRequest = {
        message: 'Investigue contratos suspeitos',
        session_id: 'test-session-123',
        context: { locale: 'pt' }
      }

      const mockResponse = {
        session_id: 'test-session-123',
        message_id: 'msg-123',
        agent_id: 'anita',
        agent_name: 'Anita Garibaldi',
        message: 'Encontrei alguns contratos suspeitos para análise',
        confidence: 0.92,
        suggested_actions: ['Ver detalhes', 'Filtrar por valor'],
        metadata: {
          intent_type: 'investigation',
          processing_time: 250,
          anomalies_detected: 5
        },
        timestamp: '2025-01-01T10:00:00Z'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: mockResponse
      })

      const result = await sendChatMessage(request)

      // Verify query parser was called
      expect(queryParser.parseUserQuery).toHaveBeenCalledWith('Investigue contratos suspeitos')

      // Verify API call
      expect(api.post).toHaveBeenCalledWith('/api/v1/chat/message', {
        message: request.message,
        session_id: request.session_id,
        context: request.context
      })

      // Verify response format
      expect(result).toEqual({
        session_id: 'test-session-123',
        agent_id: 'anita',
        agent_name: 'Anita Garibaldi',
        message: 'Encontrei alguns contratos suspeitos para análise',
        confidence: 0.92,
        suggested_actions: ['Ver detalhes', 'Filtrar por valor'],
        metadata: {
          intent_type: 'investigation',
          processing_time: 250,
          anomalies_detected: 5,
          timestamp: '2025-01-01T10:00:00Z'
        }
      })
    })

    it('handles content field instead of message', async () => {
      const request: ChatRequest = {
        message: 'Test content field'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'test',
          agent_id: 'test',
          agent_name: 'Test Agent',
          content: 'Content response text',
          metadata: {}
        }
      })

      const result = await sendChatMessage(request)

      expect(result.message).toBe('Content response text')
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
          metadata: { confidence: 0.78 }
        }
      })

      const result = await sendChatMessage(request)

      expect(result.confidence).toBe(0.78)
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
          message: 'Response'
        }
      })

      const result = await sendChatMessage(request)

      expect(result.confidence).toBe(0.9)
    })

    it('handles API error with fallback response', async () => {
      const request: ChatRequest = {
        message: 'Test error',
        session_id: 'error-session'
      }

      const error = new Error('Network error')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessage(request)

      // Should return error fallback response
      expect(result.session_id).toBe('error-session')
      expect(result.agent_id).toBe('system')
      expect(result.agent_name).toBe('Sistema')
      expect(result.message).toContain('Desculpe, ocorreu um erro')
      expect(result.message).toContain('Network error')
      expect(result.confidence).toBe(0)
      expect(result.metadata.error).toBe(true)
      expect(result.suggested_actions).toContain('Tentar novamente')
    })

    it('handles 404 error with specific message', async () => {
      const request: ChatRequest = {
        message: 'Test 404'
      }

      const error: any = new Error('Not Found')
      error.response = { status: 404 }
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessage(request)

      expect(result.message).toContain('Endpoint de chat não encontrado')
      expect(result.metadata.error_status).toBe(404)
    })

    it('handles 500 error with specific message', async () => {
      const request: ChatRequest = {
        message: 'Test 500'
      }

      const error: any = new Error('Server Error')
      error.response = { status: 500 }
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessage(request)

      expect(result.message).toContain('Erro interno do servidor')
      expect(result.metadata.error_status).toBe(500)
    })

    it('handles error with detail message', async () => {
      const request: ChatRequest = {
        message: 'Test detailed error'
      }

      const error: any = new Error('Generic error')
      error.response = { 
        status: 400,
        data: { detail: 'Invalid request format' }
      }
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessage(request)

      expect(result.message).toContain('Invalid request format')
    })

    it('handles API response without success', async () => {
      const request: ChatRequest = {
        message: 'Test failure'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: false,
        error: { message: 'API Error' }
      })

      const result = await sendChatMessage(request)

      expect(result.agent_id).toBe('system')
      expect(result.message).toContain('API Error')
    })

    it('handles missing response data', async () => {
      const request: ChatRequest = {
        message: 'Test missing data'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: null
      })

      const result = await sendChatMessage(request)

      expect(result.agent_id).toBe('system')
      expect(result.message).toContain('Failed to send message')
    })

    it('generates session_id when not provided', async () => {
      const request: ChatRequest = {
        message: 'Test no session'
      }

      const error = new Error('Test error')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      const result = await sendChatMessage(request)

      expect(result.session_id).toBe('error_session')
    })

    it('includes timestamp in metadata', async () => {
      const request: ChatRequest = {
        message: 'Test timestamp'
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          session_id: 'test',
          agent_id: 'test',
          agent_name: 'Test',
          message: 'Response',
          metadata: { some_field: 'value' }
          // No timestamp provided
        }
      })

      const result = await sendChatMessage(request)

      expect(result.metadata.timestamp).toBeDefined()
      expect(result.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('getChatSuggestions', () => {
    it('returns suggestions from API', async () => {
      const mockSuggestions = {
        suggestions: [
          { id: '1', label: 'Investigar contratos' },
          { id: '2', label: 'Analisar despesas' }
        ]
      }

      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        data: mockSuggestions
      })

      const result = await getChatSuggestions('test-session')

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/suggestions', {
        params: { session_id: 'test-session' }
      })

      expect(result).toEqual(mockSuggestions.suggestions)
    })

    it('returns default suggestions on error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      const result = await getChatSuggestions()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns default suggestions when API returns no data', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        data: {}
      })

      const result = await getChatSuggestions()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns default suggestions when API returns failure', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: false,
        error: { message: 'Failed' }
      })

      const result = await getChatSuggestions()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getChatHistory', () => {
    it('returns chat history with pagination', async () => {
      const mockHistory = {
        messages: [
          { id: '1', content: 'Message 1' },
          { id: '2', content: 'Message 2' }
        ],
        next_cursor: 'cursor-123'
      }

      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        data: mockHistory
      })

      const result = await getChatHistory('session-123', 'prev-cursor', 20)

      expect(api.get).toHaveBeenCalledWith('/api/v1/chat/history/session-123/paginated', {
        params: { cursor: 'prev-cursor', limit: 20 }
      })

      expect(result).toEqual(mockHistory)
    })

    it('returns empty history on error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      const result = await getChatHistory('session-123')

      expect(result).toEqual({ messages: [], next_cursor: null })
    })

    it('returns empty history when API returns no data', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        data: null
      })

      const result = await getChatHistory('session-123')

      expect(result).toEqual({ messages: [], next_cursor: null })
    })

    it('uses default limit when not provided', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        success: true,
        data: { messages: [], next_cursor: null }
      })

      await getChatHistory('session-123')

      expect(api.get).toHaveBeenCalledWith(
        '/api/v1/chat/history/session-123/paginated',
        { params: { cursor: undefined, limit: 50 } }
      )
    })
  })
})