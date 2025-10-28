import { api } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';
import { logger } from '@/lib/utils/logger';

/**
 * Available Maritaca.ai models
 */
export const MARITACA_MODELS = {
  SABIA3: 'sabia-3',
  SABIAZINHO3: 'sabiazinho-3',
} as const;

export type MaritacaModel = typeof MARITACA_MODELS[keyof typeof MARITACA_MODELS];

/**
 * Maritaca Direct Chat Request
 */
export interface MaritacaDirectRequest extends ChatRequest {
  model?: MaritacaModel;
}

/**
 * Maritaca Direct Chat Response from Backend
 */
export interface MaritacaDirectResponse {
  session_id: string;
  message_id: string;
  response: string;
  model: string;
  processing_time?: number;
  metadata?: {
    tokens_used?: number;
    model_version?: string;
    [key: string]: any;
  };
}

/**
 * Send message directly to Maritaca.ai (free tier for testing)
 * Uses the direct endpoint without agent routing
 *
 * @param request - Chat request with optional model selection
 * @returns Promise<ChatResponse>
 */
export async function sendMaritacaMessage(request: MaritacaDirectRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  const model = request.model || MARITACA_MODELS.SABIAZINHO3;

  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `maritaca_${Date.now()}`,
      model: model,
      context: request.context,
    };

    logger.debug('Chat Maritaca: Sending to /api/v1/chat/direct/maritaca', {
      message: payload.message,
      model: model
    });

    // Track message
    trackChatMessage(payload.session_id, request.message, 'maritaca-direct');

    // Call the Maritaca direct endpoint
    const response = await api.post<MaritacaDirectResponse>('/api/v1/chat/direct/maritaca', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message to Maritaca');
    }

    const data = response.data;
    const duration = Date.now() - startTime;

    logger.performance('Chat Maritaca: Response received', duration);
    logger.debug('Chat Maritaca: Full response', { data });

    const messageText = data.response || '';

    // Check if message is empty
    if (!messageText || messageText.trim().length === 0) {
      logger.error('Chat Maritaca: Received empty message from backend');
      throw new Error('Empty response from Maritaca');
    }

    logger.debug('Chat Maritaca: Model used', { model: data.model });

    // Track successful response
    trackChatResponse(payload.session_id, duration, false);

    // Convert Maritaca response to frontend ChatResponse format
    return {
      session_id: data.session_id,
      message_id: data.message_id,
      agent_id: 'maritaca-direct',
      agent_name: getModelDisplayName(data.model),
      message: messageText,
      confidence: 0.95, // Maritaca direct responses are high quality
      suggested_actions: [],
      follow_up_questions: [],
      requires_input: null,
      metadata: {
        ...data.metadata,
        endpoint: 'maritaca-direct',
        model: data.model,
        response_time: duration,
        processing_time: data.processing_time,
        is_free_tier: true,
      },
    };

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Chat Maritaca', session_id: request.session_id, model }
    );

    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);

    // Re-throw for proper error handling upstream
    throw error;
  }
}

/**
 * Get display name for Maritaca model
 */
function getModelDisplayName(model: string): string {
  const modelNames: Record<string, string> = {
    'sabia-3': 'Maritaca Sabiá-3 (Standard)',
    'sabiazinho-3': 'Maritaca Sabiazinho-3 (Optimized)',
  };

  return modelNames[model] || `Maritaca ${model}`;
}

/**
 * Get model description for UI
 */
export function getModelDescription(model: MaritacaModel): string {
  const descriptions: Record<MaritacaModel, string> = {
    [MARITACA_MODELS.SABIA3]: 'Modelo completo com maior capacidade de raciocínio',
    [MARITACA_MODELS.SABIAZINHO3]: 'Modelo otimizado para respostas rápidas e eficientes',
  };

  return descriptions[model];
}

/**
 * Get model info for display
 */
export function getModelInfo(model: MaritacaModel) {
  return {
    id: model,
    name: getModelDisplayName(model),
    description: getModelDescription(model),
    icon: model === MARITACA_MODELS.SABIA3 ? '🦜' : '🐦',
    speed: model === MARITACA_MODELS.SABIAZINHO3 ? 'fast' : 'standard',
    quality: model === MARITACA_MODELS.SABIA3 ? 'high' : 'good',
  };
}
