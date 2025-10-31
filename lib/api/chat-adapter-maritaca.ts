/**
 * Compatibility layer for Maritaca adapter
 * Redirects to new chat system
 *
 * @deprecated Use @/lib/chat instead
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-31
 */

import { FallbackAdapter } from '@/lib/chat'
import type { ChatResponse } from '@/types/chat'

export type MaritacaModel = 'sabiazinho-3' | 'sabia-3'

export interface MaritacaOptions {
  model?: MaritacaModel
  temperature?: number
  maxTokens?: number
}

export async function sendMaritacaMessage(
  message: string,
  options: MaritacaOptions = {}
): Promise<ChatResponse> {
  console.warn('Deprecated: sendMaritacaMessage. Use FallbackAdapter instead')

  const adapter = new FallbackAdapter(options.model || 'sabiazinho-3')
  const response = await adapter.send({
    message,
    context: options
  })

  return {
    success: response.success,
    message: response.data?.response || '',
    data: response.data,
    error: response.error?.message
  } as ChatResponse
}

// For components that import the model type
export { MaritacaModel as MaritacaModelType }

export default sendMaritacaMessage