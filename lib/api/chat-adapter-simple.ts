import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Chat adapter for the new /api/v1/chat/simple endpoint
 * This endpoint uses Maritaca AI (Sabiá-3 model) directly
 */

interface SimpleResponse {
  message: string;
  session_id: string;
  timestamp: string;
  model_used?: string;
}

/**
 * Send message to the simple Maritaca endpoint
 */
export async function sendSimpleMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
    };

    console.log('[Chat Simple] Sending to Maritaca AI:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'chat');
    
    // Call the simple endpoint
    const response = await api.post<SimpleResponse>('/api/v1/chat/simple', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Simple] Maritaca responded in', duration, 'ms');
    console.log('[Chat Simple] Model used:', data.model_used);
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert to standard ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: 'maritaca',
      agent_name: 'Assistente Cidadão.AI',
      message: data.message,
      confidence: 0.95, // High confidence for Maritaca responses
      suggested_actions: extractSuggestedActions(data.message),
      metadata: {
        model_used: data.model_used || 'sabia-3',
        response_time: duration,
        timestamp: data.timestamp || new Date().toISOString(),
        is_ai_response: true,
        endpoint: 'simple'
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Simple] Error:', error);
    
    const duration = Date.now() - startTime;
    
    // Track error
    trackChatError(request.session_id || 'unknown', error);
    
    // Determine error message
    let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    
    if (error.response?.status === 429) {
      errorMessage = 'Muitas requisições. Por favor, aguarde um momento.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'O serviço está temporariamente indisponível.';
    } else if (duration > 30000) {
      errorMessage = 'A resposta está demorando muito. Por favor, tente novamente.';
    }
    
    // Return error response
    return {
      session_id: request.session_id || 'error_session',
      agent_id: 'system',
      agent_name: 'Sistema',
      message: errorMessage,
      confidence: 0,
      suggested_actions: ['Tentar novamente', 'Reformular pergunta'],
      metadata: {
        error: true,
        error_message: error.message,
        error_status: error.response?.status,
        response_time: duration,
      },
    };
  }
}

/**
 * Extract suggested actions from the response text
 */
function extractSuggestedActions(message: string): string[] {
  const actions: string[] = [];
  
  // Detect common patterns in responses
  if (message.toLowerCase().includes('contrato') || message.toLowerCase().includes('licitaç')) {
    actions.push('Investigar contratos');
  }
  
  if (message.toLowerCase().includes('transparência') || message.toLowerCase().includes('portal')) {
    actions.push('Acessar portal da transparência');
  }
  
  if (message.toLowerCase().includes('lei') || message.toLowerCase().includes('informação')) {
    actions.push('Ver legislação');
  }
  
  if (message.toLowerCase().includes('dúvida') || message.toLowerCase().includes('pergunt')) {
    actions.push('Fazer outra pergunta');
  }
  
  return actions.slice(0, 3); // Maximum 3 suggestions
}