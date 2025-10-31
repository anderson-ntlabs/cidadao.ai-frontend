/**
 * Compatibility layer for fallback adapter
 * Redirects to new chat system
 *
 * @deprecated Use @/lib/chat instead
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { chatService } from '@/lib/chat'
import type { ChatResponse } from '@/types/chat'

export async function sendFallbackMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  console.warn('Deprecated: sendFallbackMessage. Use chatService.sendMessage instead')

  const response = await chatService.sendMessage({
    message,
    sessionId
  })

  // Convert to old format
  return {
    success: response.success,
    message: response.data?.response || '',
    data: response.data,
    error: response.error?.message
  } as ChatResponse
}

export default sendFallbackMessage