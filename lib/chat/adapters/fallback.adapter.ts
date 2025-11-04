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

export type MaritacaModel = 'sabiazinho-3' | 'sabia-3'

export class FallbackAdapter implements ChatAdapter {
  name = 'fallback-maritaca'
  private model: MaritacaModel
  private apiKey: string | null = null

  constructor(model: MaritacaModel = 'sabiazinho-3') {
    this.model = model
    // API key would be stored server-side in production
    // This is just for local development
    this.apiKey = process.env.NEXT_PUBLIC_MARITACA_API_KEY || null
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

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: this.model,
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          response: data.content || data.response || data.message,
          agentId: 'maritaca',
          agentName: `Maritaca (${this.model})`,
          confidence: 0.85, // Fixed confidence for Maritaca
          metadata: {
            model: data.model || this.model,
            usage: data.usage,
            id: data.id,
            finish_reason: data.finish_reason,
          },
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
