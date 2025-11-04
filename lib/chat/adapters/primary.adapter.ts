/**
 * Primary Chat Adapter - Backend API
 * Main adapter for production use
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import type { ChatAdapter, ChatRequest, ChatResponse } from '../types'
import { logger } from '@/lib/utils/logger'

export class PrimaryAdapter implements ChatAdapter {
  name = 'primary-backend'
  private baseUrl: string
  private timeout: number

  constructor(baseUrl?: string, timeout = 30000) {
    this.baseUrl =
      baseUrl || process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'
    this.timeout = timeout
  }

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

      // Handle streaming response if applicable
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        return this.handleStreamingResponse(response)
      }

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

  private async handleStreamingResponse(response: Response): Promise<ChatResponse> {
    // Simplified streaming handler
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let accumulated = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
      }

      return {
        success: true,
        data: {
          response: accumulated,
        },
      }
    } finally {
      reader.releaseLock()
    }
  }
}
