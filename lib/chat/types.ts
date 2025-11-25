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

/**
 * SSE Streaming Types
 * Events from /api/v1/chat/stream endpoint
 */
export type StreamEventType =
  | 'start'
  | 'detecting'
  | 'intent'
  | 'agent_selected'
  | 'thinking'
  | 'chunk'
  | 'complete'
  | 'error'

export interface StreamEvent {
  type: StreamEventType
  timestamp?: string
  message?: string
  intent?: string
  confidence?: number
  agent_id?: string
  agent_name?: string
  content?: string
  suggested_actions?: string[]
  fallback_endpoint?: string
}

export interface StreamCallbacks {
  onStart?: () => void
  onDetecting?: (message: string) => void
  onIntent?: (intent: string, confidence: number) => void
  onAgentSelected?: (agentId: string, agentName: string) => void
  onThinking?: (message: string) => void
  onChunk?: (content: string) => void
  onComplete?: (suggestedActions?: string[]) => void
  onError?: (message: string) => void
}

export interface StreamingAdapter {
  sendStreaming(request: ChatRequest, callbacks: StreamCallbacks): Promise<ChatResponse>
}
