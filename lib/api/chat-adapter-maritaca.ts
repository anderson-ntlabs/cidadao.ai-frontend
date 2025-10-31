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
import type { ChatResponse as TypesChatResponse } from '@/types/chat'

export type MaritacaModel = 'sabiazinho-3' | 'sabia-3'

export interface MaritacaOptions {
  model?: MaritacaModel
  temperature?: number
  maxTokens?: number
}

// Model configurations
export const MARITACA_MODELS = {
  SABIAZINHO3: 'sabiazinho-3' as MaritacaModel,
  SABIA3: 'sabia-3' as MaritacaModel,
}

export const MARITACA_MODELS_LIST: MaritacaModel[] = ['sabiazinho-3', 'sabia-3']

export const MODEL_INFO = {
  'sabiazinho-3': {
    name: 'Sabiazinho-3',
    description: 'Modelo otimizado para velocidade e eficiência',
    icon: '🐦',
    contextLength: 8192,
    costLevel: 1,
    speed: 'fast',
    quality: 'good',
  },
  'sabia-3': {
    name: 'Sabiá-3',
    description: 'Modelo completo com máxima qualidade',
    icon: '🦜',
    contextLength: 32768,
    costLevel: 2,
    speed: 'medium',
    quality: 'excellent',
  },
} as const

export function getModelInfo(model: MaritacaModel) {
  return MODEL_INFO[model] || MODEL_INFO['sabiazinho-3']
}

export async function sendMaritacaMessage(
  message: string,
  options: MaritacaOptions = {}
): Promise<TypesChatResponse> {
  console.warn('Deprecated: sendMaritacaMessage. Use FallbackAdapter instead')

  const adapter = new FallbackAdapter(options.model || 'sabiazinho-3')
  const response = await adapter.send({
    message,
    context: options,
  })

  // Map to ChatResponse format (types/chat.ts format)
  return {
    session_id: '',
    message_id: `msg_${Date.now()}`,
    agent_id: response.data?.agentId || '',
    agent_name: response.data?.agentName || '',
    message: response.data?.response || '',
    confidence: response.data?.confidence || 0,
    suggested_actions: response.data?.suggestions,
    metadata: response.data?.metadata || {},
  }
}

export default sendMaritacaMessage
