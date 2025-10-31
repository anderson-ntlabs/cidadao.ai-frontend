/**
 * Simplified Chat Types
 * Consolidation: Reducing complexity from 6 adapters to 2
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: string
  metadata?: {
    agentId?: string
    agentName?: string
    confidence?: number
    processingTime?: number
  }
}

export interface ChatRequest {
  message: string
  sessionId?: string
  agentId?: string
  context?: Record<string, any>
}

export interface ChatResponse {
  success: boolean
  message?: string
  data?: {
    response: string
    agentId?: string
    agentName?: string
    confidence?: number
    suggestions?: string[]
    metadata?: Record<string, any>
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface ChatAdapter {
  name: string
  send(request: ChatRequest): Promise<ChatResponse>
  isAvailable(): Promise<boolean>
}

export interface ChatServiceConfig {
  primaryAdapter: ChatAdapter
  fallbackAdapter?: ChatAdapter
  cacheEnabled?: boolean
  cacheTTL?: number
  maxRetries?: number
  timeout?: number
}