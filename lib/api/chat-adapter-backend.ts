import { api } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Chat adapter for the official backend API
 * Follows the API specification from the backend documentation
 */

// Backend response structure as per documentation
interface BackendChatMessageResponse {
  response: string;
  session_id: string;
  message_id: string;
  agent_used: string;
  processing_time: number;
  suggestions?: string[];
}

/**
 * Send message to the official backend endpoint
 * Uses the documented /api/v1/chat/message endpoint
 */
export async function sendBackendMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat Backend] Sending to /api/v1/chat/message:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'backend');
    
    // Call the official backend endpoint
    const response = await api.post<BackendChatMessageResponse>('/api/v1/chat/message', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Backend] Response received in', duration, 'ms');
    console.log('[Chat Backend] Agent used:', data.agent_used);
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert backend response to frontend ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_used,
      agent_name: mapAgentIdToName(data.agent_used),
      message: data.response,
      confidence: 0.9, // Default confidence since backend doesn't provide it
      suggested_actions: data.suggestions,
      metadata: {
        message_id: data.message_id,
        processing_time: data.processing_time,
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