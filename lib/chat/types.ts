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
  | 'searching'
  | 'found'
  | 'contract'
  | 'chunk'
  | 'complete'
  | 'error'

/**
 * Contract data returned from Portal da Transparência
 */
export interface ContractData {
  id: number
  numero: string
  objeto: string
  valor: number
  valor_formatado: string
  fornecedor: string
  cnpj_fornecedor: string
  orgao: string
  data_assinatura: string
  vigencia_inicio: string
  vigencia_fim: string
  situacao: string
  modalidade: string
  processo: string
  raw?: Record<string, any>
}

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
  // Contract search events
  orgao?: string
  orgao_nome?: string
  total?: number
  showing?: number
  index?: number
  data?: ContractData
  contracts?: ContractData[]
  download_available?: boolean
  total_contracts?: number
}

export interface StreamCallbacks {
  onStart?: () => void
  onDetecting?: (message: string) => void
  onIntent?: (intent: string, confidence: number) => void
  onAgentSelected?: (agentId: string, agentName: string) => void
  onThinking?: (message: string) => void
  onSearching?: (message: string, orgao?: string, orgaoNome?: string) => void
  onFound?: (total: number, showing: number, message: string) => void
  onContract?: (contract: ContractData, index: number, total: number) => void
  onChunk?: (content: string) => void
  onComplete?: (data: {
    suggestedActions?: string[]
    contracts?: ContractData[]
    downloadAvailable?: boolean
    totalContracts?: number
  }) => void
  onError?: (message: string) => void
}

export interface StreamingAdapter {
  sendStreaming(request: ChatRequest, callbacks: StreamCallbacks): Promise<ChatResponse>
}
