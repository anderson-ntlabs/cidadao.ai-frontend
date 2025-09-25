import { api } from './client';
import type { ChatRequest, ChatResponse, BackendChatMessageResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Send message to the official backend endpoint
 * Uses the stable endpoint with Maritaca integration
 */
export async function sendBackendMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat Backend] Sending to /api/v1/chat/stable:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'backend');
    
    // Call the stable endpoint with Maritaca
    const response = await api.post<BackendChatMessageResponse>('/api/v1/chat/stable', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Backend] Response received in', duration, 'ms');
    console.log('[Chat Backend] Full response:', JSON.stringify(data, null, 2));
    
    // Backend returns 'message' field, not 'response'
    const messageText = data.message || data.response || '';
    
    // Check if backend is returning maintenance message
    const isMaintenanceMessage = messageText.includes('manutenção') || 
                                messageText.includes('em breve') ||
                                messageText.includes('temporariamente indisponível') ||
                                data.agent_id === 'system';
    
    if (isMaintenanceMessage) {
      console.log('[Chat Backend] Backend is in maintenance mode');
      // Let the upstream handler deal with fallback
      throw new Error('Backend in maintenance mode');
    }
    
    console.log('[Chat Backend] Agent used:', data.agent_id);
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert backend response to frontend ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id || 'assistant',
      agent_name: data.agent_name || mapAgentIdToName(data.agent_id || 'assistant'),
      message: messageText,
      confidence: data.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        endpoint: 'backend',
        response_time: duration,
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Backend] Error:', error);
    
    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);
    
    // Re-throw for proper error handling upstream
    throw error;
  }
}

/**
 * Map agent IDs to friendly names
 * Based on the 17 agents in the system
 */
function mapAgentIdToName(agentId: string): string {
  const agentNames: Record<string, string> = {
    'abaporu': 'Abaporu',
    'zumbi': 'Zumbi dos Palmares',
    'anita': 'Anita Garibaldi',
    'tiradentes': 'Tiradentes',
    'nana': 'Nanã',
    'ayrton': 'Ayrton Senna',
    'machado': 'Machado de Assis',
    'dandara': 'Dandara',
    'drummond': 'Carlos Drummond de Andrade',
    'assistant': 'Assistente Cidadão.AI',
    'default': 'Assistente',
  };
  
  return agentNames[agentId.toLowerCase()] || agentId;
}