import { api } from './client';
import type { ChatRequest, ChatResponse, BackendChatMessageResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Send message to the emergency endpoint
 * Ultra resilient fallback option
 * Uses Maritaca sabiazinho-3 model
 */
export async function sendEmergencyMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat Emergency] Sending message:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'emergency');
    
    // Call the emergency endpoint
    const response = await api.post<BackendChatMessageResponse>('/api/v1/chat/emergency', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Emergency] Response received in', duration, 'ms');
    
    // Backend returns 'message' field
    const messageText = data.message || data.response || '';
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert backend response to frontend ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id || 'assistant',
      agent_name: data.agent_name || 'Assistente Cidadão.AI',
      message: messageText,
      confidence: data.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        endpoint: 'emergency',
        response_time: duration,
        model: 'sabiazinho-3',
        fallback: true,
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Emergency] Error:', error);
    
    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);
    
    throw error;
  }
}