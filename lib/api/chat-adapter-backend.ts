/**
 * Compatibility layer for backend adapter
 * Redirects to new chat system
 *
 * @deprecated Use @/lib/chat instead
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { chatService } from '@/lib/chat'
import type { ChatRequest, ChatResponse } from '@/types/chat'

export async function sendBackendMessage(
  message: string,
  sessionId?: string,
  agentId?: string
): Promise<ChatResponse> {
  console.warn('Deprecated: sendBackendMessage. Use chatService.sendMessage instead')

  const response = await chatService.sendMessage({
    message,
    sessionId,
    agentId
  })

  // Convert to old format
  return {
    success: response.success,
    message: response.data?.response || '',
    data: response.data,
    error: response.error?.message
  } as ChatResponse
}

export default sendBackendMessage