/**
 * Compatibility layer for cached smart chat service
 * Redirects to new chat system
 *
 * @deprecated Use @/lib/chat instead
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { chatService } from '@/lib/chat'
import type { ChatRequest } from '@/lib/chat/types'
import type { ChatResponse } from '@/types/chat'

export class CachedSmartChatService {
  async sendMessage(message: string, options: any = {}): Promise<ChatResponse> {
    console.warn('Deprecated: CachedSmartChatService. Use chatService instead')

    const request: ChatRequest = {
      message,
      sessionId: options.sessionId,
      agentId: options.agentId,
      context: options,
    }

    const response = await chatService.sendMessage(request)

    // Map to ChatResponse format (types/chat.ts format)
    return {
      session_id: request.sessionId || '',
      message_id: `msg_${Date.now()}`,
      agent_id: response.data?.agentId || '',
      agent_name: response.data?.agentName || '',
      message: response.data?.response || '',
      confidence: response.data?.confidence || 0,
      suggested_actions: response.data?.suggestions,
      metadata: response.data?.metadata || {},
    }
  }

  clearCache(): void {
    chatService.clearCache()
  }

  getCacheStats() {
    return chatService.getCacheStats()
  }
}

export const cachedSmartChatService = new CachedSmartChatService()
