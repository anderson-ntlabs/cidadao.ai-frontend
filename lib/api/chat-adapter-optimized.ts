import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Chat adapter for the optimized endpoint using Sabiazinho-3
 * More economical model with Drummond persona
 */

interface OptimizedRequest {
  message: string;
  session_id?: string;
  use_drummond?: boolean;
  context?: Record<string, any>;
}

interface OptimizedResponse {
  message: string;
  session_id: string;
  agent_name?: string;
  agent_id?: string;
  confidence?: number;
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

/**
 * Send message to the optimized Sabiazinho endpoint
 */
export async function sendOptimizedMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload: OptimizedRequest = {
      message: request.message,
      session_id: request.session_id || `opt_${Date.now()}`,
      use_drummond: true, // Always use Drummond persona
      context: request.context,
    };

    console.log('[Chat Optimized] Using Sabiazinho-3 (economical):', payload.message);
    
    // Track message
    if (payload.session_id) {
      trackChatMessage(payload.session_id, request.message, 'optimized');
    }
    
    // Call the optimized endpoint
    const response = await api.post<OptimizedResponse>('/api/v1/chat/optimized', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Optimized] Response in', duration, 'ms');
    console.log('[Chat Optimized] Model:', data.model_used || 'sabiazinho-3');
    console.log('[Chat Optimized] Tokens:', data.tokens_used);
    
    // Track successful response
    if (payload.session_id) {
      trackChatResponse(payload.session_id, duration, false);
    }
    
    // Convert to standard ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id || 'drummond',
      agent_name: data.agent_name || 'Carlos Drummond de Andrade',
      message: data.message,
      confidence: data.confidence || 0.9,
      suggested_actions: extractSuggestedActions(data.message),
      metadata: {
        model_used: data.model_used || 'sabiazinho-3',
        tokens_used: data.tokens_used,
        response_time: duration,
        cost_optimized: true,
        endpoint: 'optimized',
        ...data.metadata
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Optimized] Error:', error);
    
    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);
    
    // Return error response
    throw error; // Let the service handle fallback
  }
}

/**
 * Extract suggested actions from message content
 */
function extractSuggestedActions(message: string): string[] {
  const actions: string[] = [];
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('investig') || lowerMessage.includes('analis')) {
    actions.push('Iniciar investigação');
  }
  
  if (lowerMessage.includes('transparência') || lowerMessage.includes('portal')) {
    actions.push('Ver portal da transparência');
  }
  
  if (lowerMessage.includes('contrat') || lowerMessage.includes('licitaç')) {
    actions.push('Buscar contratos');
  }
  
  if (lowerMessage.includes('ajud') || lowerMessage.includes('explic')) {
    actions.push('Ver tutorial');
  }
  
  return actions.slice(0, 3);
}