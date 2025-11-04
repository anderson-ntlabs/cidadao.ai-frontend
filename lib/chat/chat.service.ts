/**
 * Simplified Chat Service
 * Consolidation: From 6 adapters + SmartChatService to 2 adapters with simple fallback
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import type { ChatAdapter, ChatRequest, ChatResponse, ChatServiceConfig } from './types'
import { PrimaryAdapter } from './adapters/primary.adapter'
import { FallbackAdapter } from './adapters/fallback.adapter'
import { logger } from '@/lib/utils/logger'
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'

export class ChatService {
  private primaryAdapter: ChatAdapter
  private fallbackAdapter?: ChatAdapter
  private cacheEnabled: boolean
  private cacheTTL: number
  private maxRetries: number
  private cache: Map<string, { response: ChatResponse; timestamp: number }>

  constructor(config?: Partial<ChatServiceConfig>) {
    this.primaryAdapter = config?.primaryAdapter || new PrimaryAdapter()
    this.fallbackAdapter = config?.fallbackAdapter || new FallbackAdapter()
    this.cacheEnabled = config?.cacheEnabled ?? true
    this.cacheTTL = config?.cacheTTL ?? 5 * 60 * 1000 // 5 minutes
    this.maxRetries = config?.maxRetries ?? 2
    this.cache = new Map()
  }

  /**
   * Send a chat message with automatic fallback and caching
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()
    let usedAdapter: 'primary' | 'fallback' | 'cache' | 'none' = 'none'

    // Check cache first
    if (this.cacheEnabled) {
      const cachedResponse = this.getCachedResponse(request)
      if (cachedResponse) {
        logger.info('Chat cache hit')
        chatTelemetry.recordCacheHit()
        return cachedResponse
      }
    }

    // Check if Maritaca direct mode is requested (from localStorage)
    const maritacaModel =
      typeof window !== 'undefined' ? localStorage.getItem('maritaca_selected_model') : null

    // If Maritaca model is selected, use fallback adapter directly (bypass backend)
    if (maritacaModel && this.fallbackAdapter) {
      logger.info(`Using Maritaca direct mode with model: ${maritacaModel}`)
      const response = await this.tryAdapter(this.fallbackAdapter, request, 'fallback')

      if (response.success && this.cacheEnabled) {
        this.setCachedResponse(request, response)
      }

      const duration = Date.now() - startTime
      chatTelemetry.recordMessage({
        success: response.success,
        adapter: 'fallback',
        duration,
        error: response.error?.code,
      })

      return response
    }

    // Try primary adapter (Cidadão.AI mode)
    let response = await this.tryAdapter(this.primaryAdapter, request, 'primary')

    if (response.success) {
      usedAdapter = 'primary'
    }

    // Fallback if primary fails
    if (!response.success && this.fallbackAdapter) {
      logger.warn('Primary adapter failed, using fallback')
      response = await this.tryAdapter(this.fallbackAdapter, request, 'fallback')

      if (response.success) {
        usedAdapter = 'fallback'
      }
    }

    // Cache successful responses
    if (response.success && this.cacheEnabled) {
      this.setCachedResponse(request, response)
    }

    // Record telemetry
    const duration = Date.now() - startTime
    chatTelemetry.recordMessage({
      success: response.success,
      adapter: usedAdapter,
      duration,
      error: response.error?.code,
    })

    return response
  }

  /**
   * Try an adapter with retries
   */
  private async tryAdapter(
    adapter: ChatAdapter,
    request: ChatRequest,
    adapterType: string
  ): Promise<ChatResponse> {
    let lastError: ChatResponse | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Trying ${adapterType} adapter (attempt ${attempt}/${this.maxRetries})`)

        const response = await adapter.send(request)

        if (response.success) {
          return response
        }

        lastError = response

        // Don't retry on certain errors
        if (response.error?.code === 'INVALID_REQUEST') {
          break
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`${adapterType} adapter error: ${errorMessage}`, {
          adapter: adapterType,
          attempt,
        })
        lastError = {
          success: false,
          error: {
            code: 'ADAPTER_ERROR',
            message: errorMessage,
          },
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < this.maxRetries) {
        await this.sleep(Math.pow(2, attempt) * 1000)
      }
    }

    return (
      lastError || {
        success: false,
        error: {
          code: 'MAX_RETRIES',
          message: `Failed after ${this.maxRetries} attempts`,
        },
      }
    )
  }

  /**
   * Get cached response
   */
  private getCachedResponse(request: ChatRequest): ChatResponse | null {
    const cacheKey = this.getCacheKey(request)
    const cached = this.cache.get(cacheKey)

    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > this.cacheTTL) {
      this.cache.delete(cacheKey)
      return null
    }

    return cached.response
  }

  /**
   * Set cached response
   */
  private setCachedResponse(request: ChatRequest, response: ChatResponse): void {
    const cacheKey = this.getCacheKey(request)
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    })

    // Clean old cache entries
    this.cleanCache()
  }

  /**
   * Generate cache key
   */
  private getCacheKey(request: ChatRequest): string {
    return `${request.message}-${request.agentId || 'default'}-${request.sessionId || 'none'}`
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if service is available
   */
  async checkAvailability(): Promise<{
    primary: boolean
    fallback: boolean
  }> {
    const [primaryAvailable, fallbackAvailable] = await Promise.all([
      this.primaryAdapter.isAvailable(),
      this.fallbackAdapter?.isAvailable() || Promise.resolve(false),
    ])

    return {
      primary: primaryAvailable,
      fallback: fallbackAvailable,
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    logger.info('Chat cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    maxAge: number
    ttl: number
  } {
    let maxAge = 0
    const now = Date.now()

    for (const value of this.cache.values()) {
      const age = now - value.timestamp
      if (age > maxAge) {
        maxAge = age
      }
    }

    return {
      size: this.cache.size,
      maxAge,
      ttl: this.cacheTTL,
    }
  }
}

// Export singleton instance for convenience
export const chatService = new ChatService()
