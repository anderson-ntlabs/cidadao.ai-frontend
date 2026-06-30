/**
 * Fallback Chat Adapter - Maritaca AI
 * Secondary adapter for when primary fails or for cost optimization
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import type { ChatAdapter, ChatRequest, ChatResponse } from '../types'
import { logger } from '@/lib/utils/logger'

export type MaritacaModel = 'sabiazinho-4' | 'sabia-4'

/**
 * Maritaca retired sabia-3 / sabia-3.1 / sabiazinho-3 on 2026-07-15.
 * Normalize any legacy value (e.g. one persisted in localStorage before the
 * migration) to a currently-supported model so we never send a dead id.
 */
export function normalizeMaritacaModel(value: string | null | undefined): MaritacaModel {
  switch (value) {
    case 'sabiazinho-3':
    case 'sabiazinho-4':
      return 'sabiazinho-4'
    case 'sabia-3':
    case 'sabia-3.1':
    case 'sabia-4':
      return 'sabia-4'
    default:
      return 'sabia-4'
  }
}

export class FallbackAdapter implements ChatAdapter {
  name = 'fallback-maritaca'
  private model: MaritacaModel

  constructor(model: MaritacaModel = 'sabiazinho-4') {
    this.model = model
  }

  async send(request: ChatRequest): Promise<ChatResponse> {
    try {
      // In production, this would go through our backend
      // to keep API keys secure
      const endpoint = '/api/v1/chat/direct/maritaca'
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

      // Format message in Maritaca's expected format
      const messages = [
        {
          role: 'user',
          content: request.message,
        },
      ]

      // Build request payload with optional fields
      const payload: Record<string, unknown> = {
        messages,
        model: this.model,
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      }

      // Include session ID if provided
      if (request.sessionId) {
        payload.session_id = request.sessionId
      }

      // Include context if provided
      if (request.context) {
        payload.context = request.context
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Build metadata, prioritizing data.metadata fields
      const metadata: Record<string, unknown> = {
        model: data.metadata?.model || data.model || this.model,
      }

      // Merge metadata from response (if it exists as nested object)
      if (data.metadata && typeof data.metadata === 'object') {
        Object.assign(metadata, data.metadata)
      }

      // Include legacy top-level fields for backward compatibility
      if (data.usage !== undefined) metadata.usage = data.usage
      if (data.id !== undefined) metadata.id = data.id
      if (data.finish_reason !== undefined) metadata.finish_reason = data.finish_reason
      if (data.tokens !== undefined) metadata.tokens = data.tokens
      if (data.cost !== undefined) metadata.cost = data.cost
      if (data.processingTime !== undefined) metadata.processingTime = data.processingTime

      return {
        success: true,
        data: {
          response: data.content || data.response || data.message,
          agentId: 'maritaca',
          agentName: `Maritaca (${this.model})`,
          confidence: 0.85, // Fixed confidence for Maritaca
          metadata,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Fallback adapter error: ${errorMessage}`, {
        adapter: this.name,
        model: this.model,
      })

      if (error instanceof Error) {
        return {
          success: false,
          error: {
            code: 'FALLBACK_ERROR',
            message: `Maritaca fallback failed: ${error.message}`,
          },
        }
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Fallback adapter failed',
        },
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    // Simple availability check
    // In production, this would check the Maritaca API status
    return true // Always available as fallback
  }

  /**
   * Switch between Maritaca models
   */
  setModel(model: MaritacaModel): void {
    this.model = model
    logger.info(`Maritaca model switched to ${model}`)
  }

  /**
   * Get current model
   */
  getModel(): MaritacaModel {
    return this.model
  }
}
