import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { sendBackendMessage } from './chat-adapter-backend'
import { api } from './client'
import * as telemetry from '@/lib/telemetry/chat-telemetry'
import type { ChatRequest, BackendChatMessageResponse } from '@/types/chat'

// Mock the dependencies
vi.mock('./client', () => ({
  api: {
    post: vi.fn()
  }
}))

vi.mock('@/lib/telemetry/chat-telemetry', () => ({
  trackChatMessage: vi.fn(),
  trackChatResponse: vi.fn(),
  trackChatError: vi.fn()
}))

describe('sendBackendMessage', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock console to avoid noise in tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('sends message successfully and tracks telemetry', async () => {
    const request: ChatRequest = {
      message: 'Hello, how are you?',
      session_id: 'test-session-123',
      context: { locale: 'pt' }
    }

    const mockResponse: BackendChatMessageResponse = {
      message: 'I am doing well, thank you!',
      session_id: 'test-session-123',
      message_id: 'msg-123',
      agent_id: 'anita',
      agent_name: 'Anita Garibaldi',
      confidence: 0.95,
      suggestions: ['What can I help you with?', 'Tell me about your project'],
      processing_time: 150,
      metadata: { intent: 'greeting' }
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    const result = await sendBackendMessage(request)

    // Verify API call
    expect(api.post).toHaveBeenCalledWith('/api/v1/chat/message', {
      message: request.message,
      session_id: request.session_id,
      context: request.context
    })

    // Verify telemetry
    expect(telemetry.trackChatMessage).toHaveBeenCalledWith(
      'test-session-123',
      'Hello, how are you?',
      'backend'
    )
    expect(telemetry.trackChatResponse).toHaveBeenCalledWith(
      'test-session-123',
      expect.any(Number),
      false
    )

    // Verify response format (partial match to allow for additional fields)
    expect(result).toMatchObject({
      session_id: 'test-session-123',
      agent_id: 'anita',
      agent_name: 'Anita Garibaldi',
      message: 'I am doing well, thank you!',
      confidence: 0.95,
      suggested_actions: ['What can I help you with?', 'Tell me about your project'],
      metadata: expect.objectContaining({
        intent: 'greeting',
        endpoint: 'backend',
        processing_time: 150
      })
    })

    // Verify response contains expected fields
    expect(result).toHaveProperty('metadata.response_time')
    expect(typeof result.metadata.response_time).toBe('number')
  })

  it('generates session_id when not provided', async () => {
    const request: ChatRequest = {
      message: 'Hello'
    }

    const mockResponse: BackendChatMessageResponse = {
      message: 'Hi there!',
      session_id: 'generated-session',
      message_id: 'msg-456'
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    await sendBackendMessage(request)

    expect(api.post).toHaveBeenCalledWith('/api/v1/chat/message', {
      message: 'Hello',
      session_id: expect.stringMatching(/^session_\d+$/),
      context: undefined
    })
  })

  it('handles backend response field variations', async () => {
    const request: ChatRequest = {
      message: 'Test message'
    }

    // Test with 'response' field instead of 'message'
    const mockResponse: BackendChatMessageResponse = {
      response: 'Response text',
      session_id: 'test-session',
      message_id: 'msg-789',
      agent_used: 'zumbi', // Instead of agent_id
      suggested_actions: ['Action 1'] // Instead of suggestions
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    const result = await sendBackendMessage(request)

    expect(result.message).toBe('Response text')
    expect(result.agent_id).toBe('zumbi')
    expect(result.suggested_actions).toEqual(['Action 1'])
  })

  it('detects and throws on maintenance mode', async () => {
    const request: ChatRequest = {
      message: 'Test message'
    }

    const mockResponse: BackendChatMessageResponse = {
      message: 'Sistema em manutenção, voltaremos em breve',
      session_id: 'test-session',
      message_id: 'msg-maintenance',
      agent_id: 'system'
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    await expect(sendBackendMessage(request)).rejects.toThrow('Backend in maintenance mode')
  })

  it('tracks telemetry on error', async () => {
    const request: ChatRequest = {
      message: 'Test error',
      session_id: 'error-session'
    }

    const error = new Error('Network error')
    vi.mocked(api.post).mockRejectedValueOnce(error)

    await expect(sendBackendMessage(request)).rejects.toThrow('Network error')

    expect(telemetry.trackChatError).toHaveBeenCalledWith(
      'error-session',
      error
    )
  })

  it('handles API error response', async () => {
    const request: ChatRequest = {
      message: 'Test message'
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: false,
      error: { message: 'API Error: Invalid request' }
    })

    await expect(sendBackendMessage(request)).rejects.toThrow('API Error: Invalid request')
  })

  it('handles missing response data', async () => {
    const request: ChatRequest = {
      message: 'Test message'
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: null
    })

    await expect(sendBackendMessage(request)).rejects.toThrow('Failed to send message')
  })

  it('maps agent IDs to names correctly', async () => {
    const request: ChatRequest = {
      message: 'Test mapping'
    }

    const mockResponse: BackendChatMessageResponse = {
      message: 'Response',
      session_id: 'test-session',
      message_id: 'msg-map',
      agent_id: 'assistant' // Should be mapped to a name
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    const result = await sendBackendMessage(request)

    // The mapAgentIdToName function should convert 'assistant' to a proper name
    expect(result.agent_name).toBeDefined()
    expect(result.agent_name).not.toBe('')
  })

  it('includes all metadata in response', async () => {
    const request: ChatRequest = {
      message: 'Test metadata',
      context: { user_type: 'premium' }
    }

    const mockResponse: BackendChatMessageResponse = {
      message: 'Response with metadata',
      session_id: 'meta-session',
      message_id: 'msg-meta',
      agent_id: 'senna',
      metadata: {
        intent: 'query',
        complexity: 'high',
        tokens_used: 150
      },
      processing_time: 200
    }

    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: mockResponse
    })

    const result = await sendBackendMessage(request)

    expect(result.metadata).toEqual({
      intent: 'query',
      complexity: 'high',
      tokens_used: 150,
      endpoint: 'backend',
      response_time: expect.any(Number),
      processing_time: 200
    })
  })

  it('detects maintenance mode from various keywords', async () => {
    const maintenanceMessages = [
      'Sistema em manutenção',
      'Voltaremos em breve com novidades',
      'Serviço temporariamente indisponível'
    ]

    for (const message of maintenanceMessages) {
      vi.mocked(api.post).mockResolvedValueOnce({
        success: true,
        data: {
          message: message,
          session_id: 'test',
          message_id: 'test'
        }
      })

      await expect(sendBackendMessage({ message: 'test' }))
        .rejects.toThrow('Backend in maintenance mode')
    }

    // Also test system agent detection
    vi.mocked(api.post).mockResolvedValueOnce({
      success: true,
      data: {
        message: 'Any message',
        session_id: 'test',
        message_id: 'test',
        agent_id: 'system'
      }
    })

    await expect(sendBackendMessage({ message: 'test' }))
      .rejects.toThrow('Backend in maintenance mode')
  })
})