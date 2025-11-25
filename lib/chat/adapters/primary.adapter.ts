/**
 * Primary Chat Adapter - Backend API with SSE Streaming
 * Main adapter for production use with real-time streaming support
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
   */
  async sendStreaming(request: ChatRequest, callbacks: StreamCallbacks): Promise<ChatResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    let accumulatedContent = ''
    let agentId: string | undefined
    let agentName: string | undefined
    let suggestedActions: string[] | undefined

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
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

                  case 'chunk':
                    if (event.content) {
                      // Add space between chunks if needed (backend sends chunks without trailing spaces)
                      const needsSpace =
                        accumulatedContent.length > 0 &&
                        !accumulatedContent.endsWith(' ') &&
                        !accumulatedContent.endsWith('\n') &&
                        !event.content.startsWith(' ') &&
                        !event.content.startsWith('\n')

                      if (needsSpace) {
                        accumulatedContent += ' '
                      }
                      accumulatedContent += event.content
                      callbacks.onChunk?.(needsSpace ? ' ' + event.content : event.content)
                    }
                    break

                  case 'complete':
                    suggestedActions = event.suggested_actions
                    logger.debug('Stream complete', { suggestedActions })
                    callbacks.onComplete?.(suggestedActions)
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

      return {
        success: true,
        data: {
          response: accumulatedContent,
          agentId,
          agentName,
          suggestions: suggestedActions,
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
      const response = await fetch(`${this.baseUrl}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
