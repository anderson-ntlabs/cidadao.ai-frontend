import { api, API_BASE_URL } from './client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('ChatService')

import type {
  ChatRequest,
  ChatResponse,
  QuickAction,
  ChatMessage,
  CursorPaginationResponse,
  AgentInfo,
  SSEEvent,
  SSEEventType,
} from '@/types/chat'
import { sendChatAsInvestigation, getMockAgents, getMockSuggestions } from './chat-adapter'
import { sendBackendMessage } from './chat-adapter-backend'
import { sendFallbackMessage } from './chat-adapter-fallback'
import { chatService as unifiedChatService } from '@/lib/chat'
import { isFeatureEnabled } from '@/lib/feature-flags'
import {
  sanitizeSearchQuery,
  isValidInvestigationId,
  InputValidator,
} from '@/lib/security/input-validation'

// Chat API endpoints
const CHAT_ENDPOINTS = {
  MESSAGE: '/api/v1/chat/message',
  STREAM: '/api/v1/chat/stream',
  SUGGESTIONS: '/api/v1/chat/suggestions',
  HISTORY: (sessionId: string) => `/api/v1/chat/history/${sessionId}`,
  HISTORY_PAGINATED: (sessionId: string) => `/api/v1/chat/history/${sessionId}/paginated`,
  CACHE_STATS: '/api/v1/chat/cache/stats',
  AGENTS: '/api/v1/chat/agents',
}

// Chat service for API interactions
export const chatService = {
  // Send a chat message
  async sendMessage(request: ChatRequest): Promise<ChatResponse | null> {
    try {
      // Validate and sanitize input
      const validator = new InputValidator()

      validator
        .required('message', request.message, 'Message')
        .length('message', request.message, 1, 4000)

      // Validate session_id if provided
      if (request.session_id && !isValidInvestigationId(request.session_id)) {
        validator.addError('session_id', 'Invalid session ID format')
      }

      if (!validator.isValid()) {
        const errors = validator.getErrors()
        logger.warn('Chat input validation failed', { errors, request })
        throw new Error(`Invalid input: ${Object.values(errors).join(', ')}`)
      }

      // Sanitize message to prevent injection
      const sanitizedMessage = sanitizeSearchQuery(request.message)

      logger.debug('Chat service: Routing message', {
        messageLength: sanitizedMessage.length,
        hasSessionId: !!request.session_id,
      })

      // Use unified chat service if feature is enabled (default)
      if (isFeatureEnabled('unifiedChatEnabled')) {
        logger.debug('Using Unified Chat Service (primary + fallback adapters)')

        // Check if Maritaca model is selected in localStorage
        const maritacaModel =
          typeof window !== 'undefined'
            ? (localStorage.getItem('maritaca_selected_model') as any)
            : null

        // Map ChatRequest to unified chat request format
        const unifiedRequest = {
          message: sanitizedMessage,
          sessionId: request.session_id,
          agentId: request.context?.agent_id,
          context: {
            ...request.context,
            maritacaModel: maritacaModel || undefined,
          },
        }

        const unifiedResponse = await unifiedChatService.sendMessage(unifiedRequest)

        // Map unified response back to ChatResponse format
        if (unifiedResponse.success && unifiedResponse.data) {
          return {
            session_id: request.session_id || '',
            message_id: `msg_${Date.now()}`,
            agent_id: unifiedResponse.data.agentId || '',
            agent_name: unifiedResponse.data.agentName || '',
            message: unifiedResponse.data.response || '',
            confidence: unifiedResponse.data.confidence || 0,
            suggested_actions: unifiedResponse.data.suggestions,
            metadata: unifiedResponse.data.metadata || {},
          }
        } else {
          // Handle error case
          logger.error('Unified chat service failed', {
            error: unifiedResponse.error,
          })
          throw new Error(unifiedResponse.error?.message || 'Chat service failed')
        }
      }

      // Legacy path: Use smart chat service if feature is enabled
      if (isFeatureEnabled('smartChatEnabled')) {
        logger.debug('Using Legacy Smart Chat Service (deprecated)')

        // Check if Maritaca model is selected in localStorage
        const maritacaModel =
          typeof window !== 'undefined'
            ? (localStorage.getItem('maritaca_selected_model') as any)
            : null

        // Import dynamically to avoid issues if deprecated service is removed
        const { cachedSmartChatService } = await import('@/lib/services/cached-smart-chat.service')

        // Determine model preference based on context
        const modelPreference = request.context?.model_preference || 'auto'

        const response = await cachedSmartChatService.sendMessage(sanitizedMessage, {
          preferredModel: modelPreference,
          useDrummond: true,
          useMaritaca: !!maritacaModel,
          maritacaModel: maritacaModel || undefined,
        })

        return response
      }

      // Fallback: Use the official backend adapter
      logger.debug('Using official backend adapter')

      // Create sanitized request
      const sanitizedRequest: ChatRequest = {
        ...request,
        message: sanitizedMessage,
      }

      try {
        const response = await sendBackendMessage(sanitizedRequest)
        logger.debug('Backend responded successfully')
        return response
      } catch (backendError) {
        logger.warn('Backend adapter failed, falling back', { error: backendError })

        // Fallback to consolidated fallback adapter
        const response = await sendFallbackMessage(sanitizedRequest)
        logger.debug('Chat response from fallback')

        return response
      }
    } catch (error) {
      logger.error('Chat service error', {
        service: 'chatService',
        action: 'sendMessage',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  },

  // Get quick action suggestions
  async getSuggestions(): Promise<QuickAction[]> {
    // Use mock suggestions while the endpoint is not available
    return getMockSuggestions()

    // Original code (kept for future use)
    // const response = await api.get<QuickAction[]>(CHAT_ENDPOINTS.SUGGESTIONS);
    // return response.success ? response.data! : [];
  },

  // Get available agents
  async getAgents(): Promise<AgentInfo[]> {
    try {
      // Use real backend endpoint
      const response = await api.get<AgentInfo[]>(CHAT_ENDPOINTS.AGENTS)

      if (response.success && response.data) {
        logger.info('✅ Loaded agents from backend:', response.data.length)
        return response.data
      }

      // Fallback to mocks only if backend fails
      logger.warn('⚠️ Backend agents endpoint failed, using mocks')
      return getMockAgents()
    } catch (error) {
      console.error('Failed to load agents from backend:', error)
      // Fallback to mocks on error
      return getMockAgents()
    }
  },

  // Get chat history
  async getHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await api.get<{ messages: ChatMessage[] }>(CHAT_ENDPOINTS.HISTORY(sessionId), {
      params: { limit },
    })
    return response.success ? response.data!.messages : []
  },

  // Get paginated chat history
  async getHistoryPaginated(
    sessionId: string,
    cursor?: string,
    limit: number = 20,
    direction: 'next' | 'prev' = 'next'
  ): Promise<CursorPaginationResponse | null> {
    const response = await api.get<CursorPaginationResponse>(
      CHAT_ENDPOINTS.HISTORY_PAGINATED(sessionId),
      { params: { cursor, limit, direction } }
    )
    return response.success ? response.data! : null
  },

  // Clear chat history
  async clearHistory(sessionId: string): Promise<boolean> {
    const response = await api.delete(CHAT_ENDPOINTS.HISTORY(sessionId))
    return response.success
  },

  // Get cache statistics (admin feature)
  async getCacheStats(): Promise<any> {
    const response = await api.get(CHAT_ENDPOINTS.CACHE_STATS)
    return response.success ? response.data : null
  },

  // Stream chat response using Server-Sent Events
  streamMessage(
    request: ChatRequest,
    onEvent: (type: SSEEventType, data: any) => void,
    onError?: (error: Error) => void
  ): () => void {
    const eventSource = new EventSource(
      `${API_BASE_URL}${CHAT_ENDPOINTS.STREAM}?${new URLSearchParams({
        message: request.message,
        session_id: request.session_id || '',
        context: JSON.stringify(request.context || {}),
      })}`
    )

    // Parse SSE events
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onEvent(data.type || 'chunk', data)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    // Handle specific event types
    const eventTypes: SSEEventType[] = [
      'start',
      'detecting',
      'intent',
      'agent_selected',
      'chunk',
      'complete',
      'error',
    ]

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: any) => {
        try {
          const data = JSON.parse(event.data)
          onEvent(eventType, data)
        } catch (error) {
          console.error(`Error parsing ${eventType} event:`, error)
        }
      })
    })

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
      if (onError) {
        onError(new Error('Streaming connection failed'))
      }
    }

    // Return cleanup function
    return () => {
      eventSource.close()
    }
  },
}

// Helper to create a new session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Helper to detect investigation intent
export function detectInvestigationIntent(message: string): boolean {
  const investigationKeywords = [
    'investigar',
    'investigate',
    'analisar',
    'analyze',
    'verificar',
    'verify',
    'checar',
    'check',
    'auditar',
    'audit',
    'examinar',
    'examine',
    'procurar',
    'search',
    'anomalia',
    'anomaly',
    'irregularidade',
    'irregularity',
    'suspeito',
    'suspicious',
    'contrato',
    'contract',
    'licitação',
    'bidding',
    'transparência',
    'transparency',
  ]

  const lowerMessage = message.toLowerCase()
  return investigationKeywords.some((keyword) => lowerMessage.includes(keyword))
}

// Helper to format agent names for display
export function formatAgentName(agentId: string): string {
  const agentNames: Record<string, string> = {
    abaporu: 'Abaporu',
    zumbi: 'Zumbi dos Palmares',
    anita: 'Anita Garibaldi',
    tiradentes: 'Tiradentes',
    nana: 'Nanã',
    ayrton: 'Ayrton Senna',
    machado: 'Machado de Assis',
    dandara: 'Dandara',
    drummond: 'Carlos Drummond de Andrade',
  }

  return agentNames[agentId] || agentId
}
