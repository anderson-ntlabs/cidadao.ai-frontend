/**
 * Chat System Barrel Export
 * Simplified from 6 adapters to 2
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

// Types
export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatAdapter,
  ChatServiceConfig,
} from './types'

// Adapters
export { PrimaryAdapter } from './adapters/primary.adapter'
export { FallbackAdapter, type MaritacaModel } from './adapters/fallback.adapter'

// Service
export { ChatService, chatService } from './chat.service'

// Re-export for backward compatibility (will be removed in next phase)
export const sendChatMessage = async (message: string, agentId?: string) => {
  const { chatService } = await import('./chat.service')
  return chatService.sendMessage({
    message,
    agentId,
  })
}