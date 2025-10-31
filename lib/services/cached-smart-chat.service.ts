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
import type { ChatRequest, ChatResponse } from '@/types/chat'

export class CachedSmartChatService {
  async sendMessage(
    message: string,
    options: any = {}
  ): Promise<ChatResponse> {
    console.warn('Deprecated: CachedSmartChatService. Use chatService instead')

    const response = await chatService.sendMessage({
      message,
      sessionId: options.sessionId,
      agentId: options.agentId,
      context: options
    })

    return {
      success: response.success,
      message: response.data?.response || '',
      data: response.data,
      error: response.error?.message
    } as ChatResponse
  }

  clearCache(): void {
    chatService.clearCache()
  }

  getCacheStats() {
    return chatService.getCacheStats()
  }
}

export const cachedSmartChatService = new CachedSmartChatService()