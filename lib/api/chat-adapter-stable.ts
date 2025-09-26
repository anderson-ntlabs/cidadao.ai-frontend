import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';
import { sanitizer } from '@/lib/security/sanitizer';

/**
 * Chat adapter for the stable endpoint with multi-fallback
 * Uses the best available model at the moment
 */

interface StableResponse {
  message: string;
  session_id: string;
  agent_name?: string;
  agent_id?: string;
  confidence?: number;
  model_used?: string;
  fallback_chain?: string[];
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

/**
 * Send message to the stable endpoint with automatic fallback
 */
export async function sendStableMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    // Sanitize user input
    const sanitizedMessage = sanitizer.sanitizeInput(request.message);
    
    const payload = {
      message: sanitizedMessage,
      session_id: request.session_id || `stable_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat Stable] Using multi-fallback endpoint:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'stable');
    
    // Call the stable endpoint
    const response = await api.post<StableResponse>('/api/v1/chat/stable', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Stable] Response in', duration, 'ms');
    console.log('[Chat Stable] Model chain:', data.fallback_chain || [data.model_used]);
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert to standard ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id || 'assistant',
      agent_name: data.agent_name || 'Assistente Cidadão.AI',
      message: data.message,
      confidence: data.confidence || 0.85,
      suggested_actions: extractSuggestedActions(data.message),
      metadata: {
        model_used: data.model_used || 'mixed',
        fallback_chain: data.fallback_chain,
        response_time: duration,
        endpoint: 'stable',
        ...data.metadata
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Stable] Error:', error);
    
    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);
    
    // Return error response
    throw error; // Let the service handle fallback
  }
}

/**
 * Extract suggested actions based on message content
 */
function extractSuggestedActions(message: string): string[] {
  const actions: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Common action patterns
  const actionPatterns = [
    { pattern: /investig|analis|verific/, action: 'Investigar dados' },
    { pattern: /contrat|licitaç|compra/, action: 'Ver contratos' },
    { pattern: /servidor|funcion|salári/, action: 'Buscar servidores' },
    { pattern: /transparência|portal|dados/, action: 'Acessar portal' },
    { pattern: /lei|legisla|norma/, action: 'Ver legislação' },
  ];
  
  for (const { pattern, action } of actionPatterns) {
    if (pattern.test(lowerMessage)) {
      actions.push(action);
    }
  }
  
  return [...new Set(actions)].slice(0, 3);
}