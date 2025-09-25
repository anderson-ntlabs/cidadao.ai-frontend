import { api } from './client';
import type { ChatRequest, ChatResponse, BackendChatMessageResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Send message to the optimized endpoint
 * Performance-focused with Drummond persona
 * Uses Maritaca sabiazinho-3 model
 */
export async function sendOptimizedMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  
  try {
    const payload = {
      message: request.message,
      session_id: request.session_id || `session_${Date.now()}`,
      context: request.context,
    };

    console.log('[Chat Optimized] Sending message:', payload.message);
    
    // Track message
    trackChatMessage(payload.session_id, request.message, 'optimized');
    
    // Call the optimized endpoint
    const response = await api.post<BackendChatMessageResponse>('/api/v1/chat/optimized', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    const duration = Date.now() - startTime;
    
    console.log('[Chat Optimized] Response received in', duration, 'ms');
    
    // Backend returns 'message' field
    const messageText = data.message || data.response || '';
    
    // Track successful response
    trackChatResponse(payload.session_id, duration, false);
    
    // Convert backend response to frontend ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id || 'drummond',
      agent_name: data.agent_name || 'Carlos Drummond de Andrade',
      message: messageText,
      confidence: data.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        endpoint: 'optimized',
        response_time: duration,
        model: 'sabiazinho-3',
        persona: 'drummond',
      },
    };
    
  } catch (error: any) {
    console.error('[Chat Optimized] Error:', error);
    
    const duration = Date.now() - startTime;
    trackChatError(request.session_id || 'unknown', error);
    
    throw error;
  }
}