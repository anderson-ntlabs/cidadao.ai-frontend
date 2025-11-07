import { createLogger } from '@/lib/logger'

const logger = createLogger('ChatAdapterBackend')

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
import type { ChatRequest } from '@/lib/chat/types'
import type { ChatResponse } from '@/types/chat'

export async function sendBackendMessage(request: ChatRequest): Promise<ChatResponse | null> {
  logger.warn('Deprecated: sendBackendMessage. Use chatService.sendMessage instead')

  const response = await chatService.sendMessage(request)

  if (!response.success) {
    return null
  }

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

export default sendBackendMessage
