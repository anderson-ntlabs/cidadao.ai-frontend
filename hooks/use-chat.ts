import { useState, useCallback } from 'react'
import { agents } from '@/data/agents'

/**
 * Message structure for chat requests
 * 
 * @interface ChatMessage
 */
interface ChatMessage {
  /** The message content to send */
  message: string
  /** Optional agent ID to direct the message to */
  agent_id?: string
  /** Session ID for conversation continuity */
  session_id?: string
  /** Additional context for the conversation */
  context?: any
  /** List of active agents in the conversation */
  activeAgents?: string[]
}

/**
 * Response structure from chat API
 * 
 * @interface ChatResponse
 */
interface ChatResponse {
  /** Response text (legacy field) */
  response?: string
  /** Response message content */
  message?: string
  /** Agent that handled the request */
  agent?: string
  /** Confidence score (0-1) */
  confidence?: number
  /** Source references used */
  sources?: any[]
  /** Error message if request failed */
  error?: string
  /** Currently active agents */
  activeAgents?: string[]
}

/**
 * Response structure for investigation queries
 * 
 * @interface InvestigationResponse
 */
interface InvestigationResponse {
  /** Investigation status */
  status: string
  /** Agent performing the investigation */
  agent: string
  /** Original query */
  query: string
  /** Investigation results */
  results: any[]
  /** Number of anomalies detected */
  anomalies_found: number
  /** Confidence score (0-1) */
  confidence_score: number
  /** Processing time in milliseconds */
  processing_time_ms: number
}

/**
 * useChat - Hook for managing chat interactions with AI agents
 * 
 * @hook
 * @example
 * ```tsx
 * const { sendMessage, startInvestigation, isLoading, error } = useChat();
 * 
 * // Send a regular message
 * const response = await sendMessage({
 *   message: "What can you tell me about public contracts?",
 *   agent_id: "zumbi"
 * });
 * 
 * // Start an investigation
 * const investigation = await startInvestigation("suspicious contracts in 2024");
 * ```
 * 
 * @returns {Object} Chat methods and state
 * @returns {Function} returns.sendMessage - Send a message to an agent
 * @returns {Function} returns.startInvestigation - Start a new investigation
 * @returns {Function} returns.getAgentByRole - Get agent by role
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {string|null} returns.error - Error message if any
 * 
 * @since 1.0.0
 */
export function useChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (params: ChatMessage): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the unified chat endpoint with Maritaca AI integration
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          session_id: params.session_id || `session-${Date.now()}`,
          context: params.context || {}
        })
      }).catch(err => {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.')
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Servidor retornou HTML em vez de JSON. Pode estar em manutenção.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro HTTP: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta inválida do servidor')
      }

      const data = await response.json()

      // Return backend response directly (Maritaca AI powered)
      return {
        response: data.message,
        message: data.message,
        agent: data.agent_id || data.agent_name || 'drummond',
        confidence: data.confidence || 0.8,
        sources: data.metadata?.sources || [],
        activeAgents: []
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao se comunicar com o servidor'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSuggestions = useCallback(async (agent_id?: string) => {
    try {
      // Por enquanto, retornar sugestões estáticas baseadas no agente
      const suggestions = [
        'Como funciona o Cidadão.AI?',
        'Investigue contratos emergenciais de saúde em 2024',
        'Analise licitações do meu município',
        'Procure anomalias em contratos de obras públicas',
        'Quais são os principais tipos de irregularidades?',
        'Me ajude a entender o Portal da Transparência'
      ]
      
      return { 
        suggestions: suggestions.slice(0, 3) // Retornar apenas 3 sugestões
      }
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      return { suggestions: [] }
    }
  }, [])

  return {
    sendMessage,
    getSuggestions,
    isLoading,
    error
  }
}