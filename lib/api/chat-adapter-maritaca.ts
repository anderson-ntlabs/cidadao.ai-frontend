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

// Model configurations
export const MARITACA_MODELS = {
  SABIAZINHO3: 'sabiazinho-3' as MaritacaModel,
  SABIA3: 'sabia-3' as MaritacaModel
}

export const MARITACA_MODELS_LIST: MaritacaModel[] = ['sabiazinho-3', 'sabia-3']

export const MODEL_INFO = {
  'sabiazinho-3': {
    name: 'Sabiazinho-3',
    description: 'Modelo otimizado para velocidade e eficiência',
    contextLength: 8192,
    costLevel: 1,
    speed: 'fast',
    quality: 'good'
  },
  'sabia-3': {
    name: 'Sabiá-3',
    description: 'Modelo completo com máxima qualidade',
    contextLength: 32768,
    costLevel: 2,
    speed: 'medium',
    quality: 'excellent'
  }
}

export function getModelInfo(model: MaritacaModel) {
  return MODEL_INFO[model] || MODEL_INFO['sabiazinho-3']
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