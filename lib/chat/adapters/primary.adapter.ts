/**
 * Primary Chat Adapter - Backend API with SSE Streaming
 * Main adapter for production use with real-time streaming support
 *
 * Performance optimizations:
 * - Array-based chunk accumulation instead of string concatenation
 * - Avoids O(n²) string concatenation by using array join at end
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-25
 */

import type {
  ChatAdapter,
  ChatRequest,
  ChatResponse,
  StreamingAdapter,
  StreamCallbacks,
  StreamEvent,
  ContractData,
} from '../types'
import { logger } from '@/lib/utils/logger'

export class PrimaryAdapter implements ChatAdapter, StreamingAdapter {
  name = 'primary-backend'
  private baseUrl: string
  private timeout: number

  constructor(baseUrl?: string, timeout = 60000) {
    let url =
      baseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'
    // Ensure HTTPS in production to avoid Mixed Content errors
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      url = url.replace(/^http:/, 'https:')
    }
    this.baseUrl = url
    this.timeout = timeout
  }

  /**
   * Send message with SSE streaming support
   * This is the preferred method for real-time responses
   *
   * Performance: Uses array-based chunk accumulation to avoid O(n²) string concatenation
   */
  async sendStreaming(request: ChatRequest, callbacks: StreamCallbacks): Promise<ChatResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    // Use array for O(n) accumulation instead of O(n²) string concatenation
    const contentChunks: string[] = []
    let agentId: string | undefined
    let agentName: string | undefined
    let suggestedActions: string[] | undefined
    let contracts: ContractData[] = []
    let downloadAvailable = false

    try {
      const streamUrl = `${this.baseUrl}/api/v1/chat/stream`
      logger.debug('[PrimaryAdapter] Sending request to:', { url: streamUrl })

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: request.message,
          session_id: request.sessionId,
          agent_id: request.agentId,
          context: request.context,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        logger.error('[PrimaryAdapter] Request failed:', { status: response.status })
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Process complete SSE events (lines starting with "data: ")
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim()
              if (!jsonStr) continue

              try {
                const event: StreamEvent = JSON.parse(jsonStr)

                switch (event.type) {
                  case 'start':
                    logger.debug('Stream started', { timestamp: event.timestamp })
                    callbacks.onStart?.()
                    break

                  case 'detecting':
                    logger.debug('Detecting intent', { message: event.message })
                    callbacks.onDetecting?.(event.message || 'Analisando...')
                    break

                  case 'intent':
                    logger.debug('Intent detected', {
                      intent: event.intent,
                      confidence: event.confidence,
                    })
                    callbacks.onIntent?.(event.intent || '', event.confidence || 0)
                    break

                  case 'agent_selected':
                    agentId = event.agent_id
                    agentName = event.agent_name
                    logger.debug('Agent selected', { agentId, agentName })
                    callbacks.onAgentSelected?.(agentId || '', agentName || '')
                    break

                  case 'thinking':
                    logger.debug('Agent thinking', { message: event.message })
                    callbacks.onThinking?.(event.message || 'Processando...')
                    break

                  case 'searching':
                    logger.debug('Searching contracts', {
                      message: event.message,
                      orgao: event.orgao,
                      orgaoNome: event.orgao_nome,
                    })
                    callbacks.onSearching?.(
                      event.message || 'Buscando contratos...',
                      event.orgao,
                      event.orgao_nome
                    )
                    break

                  case 'found':
                    logger.debug('Contracts found', {
                      total: event.total,
                      showing: event.showing,
                      message: event.message,
                    })
                    callbacks.onFound?.(
                      event.total || 0,
                      event.showing || 0,
                      event.message || `Encontrados ${event.total} contratos`
                    )
                    break

                  case 'contract':
                    if (event.data) {
                      contracts.push(event.data)
                      logger.debug('Contract received', {
                        index: event.index,
                        total: event.total,
                        numero: event.data.numero,
                      })
                      callbacks.onContract?.(event.data, event.index || 0, event.total || 0)
                    }
                    break

                  case 'chunk':
                    if (event.content) {
                      // Check if we need to add space between chunks
                      // Use last chunk for comparison (O(1) instead of checking full string)
                      const lastChunk =
                        contentChunks.length > 0 ? contentChunks[contentChunks.length - 1] : ''
                      const needsSpace =
                        lastChunk.length > 0 &&
                        !lastChunk.endsWith(' ') &&
                        !lastChunk.endsWith('\n') &&
                        !event.content.startsWith(' ') &&
                        !event.content.startsWith('\n')

                      // O(1) array push instead of O(n) string concatenation
                      if (needsSpace) {
                        contentChunks.push(' ')
                      }
                      contentChunks.push(event.content)
                      callbacks.onChunk?.(needsSpace ? ' ' + event.content : event.content)
                    }
                    break

                  case 'complete':
                    suggestedActions = event.suggested_actions
                    // Check if this is a contract search completion
                    if (event.contracts) {
                      contracts = event.contracts
                    }
                    if (event.download_available !== undefined) {
                      downloadAvailable = event.download_available
                    }
                    logger.debug('Stream complete', {
                      suggestedActions,
                      contractCount: contracts.length,
                      downloadAvailable,
                      totalContracts: event.total_contracts,
                    })
                    callbacks.onComplete?.({
                      suggestedActions,
                      contracts: contracts.length > 0 ? contracts : undefined,
                      downloadAvailable,
                      totalContracts: event.total_contracts,
                    })
                    break

                  case 'error':
                    logger.error('Stream error', { message: event.message })
                    callbacks.onError?.(event.message || 'Unknown error')
                    break
                }
              } catch (parseError) {
                logger.warn('Failed to parse SSE event', { line, error: parseError })
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // O(n) join at end instead of O(n²) incremental concatenation
      const accumulatedContent = contentChunks.join('')

      return {
        success: true,
        data: {
          response: accumulatedContent,
          agentId,
          agentName,
          suggestions: suggestedActions,
          metadata:
            contracts.length > 0
              ? {
                  contracts,
                  downloadAvailable,
                  totalContracts: contracts.length,
                }
              : undefined,
        },
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        logger.error('Streaming adapter error:', error)

        if (error.name === 'AbortError') {
          callbacks.onError?.('Request timed out')
          return {
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'Request timed out',
            },
          }
        }

        callbacks.onError?.(error.message)
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
          },
        }
      }

      callbacks.onError?.('Unknown error')
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
      }
    }
  }

  /**
   * Send message without streaming (fallback)
   * Uses the sync endpoint which may have issues
   */
  async send(request: ChatRequest): Promise<ChatResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const msgToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const msgHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (msgToken) {
        msgHeaders['Authorization'] = `Bearer ${msgToken}`
      }

      const response = await fetch(`${this.baseUrl}/api/v1/chat/message`, {
        method: 'POST',
        headers: msgHeaders,
        body: JSON.stringify({
          message: request.message,
          session_id: request.sessionId,
          agent_id: request.agentId,
          context: request.context,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          response: data.response || data.message,
          agentId: data.agent_id,
          agentName: data.agent_name,
          confidence: data.confidence,
          suggestions: data.suggestions,
          metadata: data.metadata,
        },
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        logger.error('Primary adapter error:', error)

        if (error.name === 'AbortError') {
          return {
            success: false,
            error: {
              code: 'TIMEOUT',
              message: 'Request timed out',
            },
          }
        }

        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message,
          },
        }
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Use trailing slash to avoid 307 redirect that causes Mixed Content
      const response = await fetch(`${this.baseUrl}/health/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
