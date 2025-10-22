import { api } from './client';
import type { ChatRequest, ChatResponse, BackendChatMessageResponse } from '@/types/chat';
import { trackChatMessage, trackChatResponse, trackChatError } from '@/lib/telemetry/chat-telemetry';

/**
 * Fallback adapter for chat communication
 * Tries multiple backend endpoints with graceful degradation
 * Priority: stream → message → local fallback
 */

export async function sendFallbackMessage(request: ChatRequest): Promise<ChatResponse> {
  const startTime = Date.now();
  const sessionId = request.session_id || `session_${Date.now()}`;

  const payload = {
    message: request.message,
    session_id: sessionId,
    context: request.context,
  };

  // Track message attempt
  trackChatMessage(sessionId, request.message, 'fallback');

  // Try endpoints in order of preference
  // Only using endpoints that actually exist in the backend
  const endpoints = [
    { url: '/api/v1/chat/stream', name: 'stream', priority: 1 },
    { url: '/api/v1/chat/message', name: 'message', priority: 2 },
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`[Chat Fallback] Attempting ${endpoint.name} endpoint...`);

      const response = await api.post<BackendChatMessageResponse>(endpoint.url, payload, {
        timeout: 15000, // 15s timeout per endpoint
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Invalid response from backend');
      }

      const data = response.data;
      const duration = Date.now() - startTime;

      // Success! Track and return
      trackChatResponse(
        sessionId,
        duration,
        false
      );

      console.log(`[Chat Fallback] Success with ${endpoint.name} (${duration}ms)`);

      return {
        session_id: data.session_id,
        agent_id: data.agent_id || 'system',
        agent_name: data.agent_name || 'Sistema',
        message: data.message || '',
        confidence: data.confidence || 0.8,
        suggested_actions: data.suggested_actions || [],
        metadata: {
          ...data.metadata,
          endpoint: endpoint.name,
          priority: endpoint.priority,
          fallback_used: true,
          attempts: endpoints.indexOf(endpoint) + 1,
        },
      };
    } catch (error) {
      console.warn(`[Chat Fallback] ${endpoint.name} failed:`, error);
      lastError = error as Error;

      // Continue to next endpoint
      if (endpoint.priority < 2) {
        continue;
      }
    }
  }

  // All endpoints failed - track error and return local fallback
  const duration = Date.now() - startTime;
  trackChatError(sessionId, lastError || new Error('All endpoints failed'));

  console.error('[Chat Fallback] All endpoints exhausted, returning local response');

  return createLocalFallbackResponse(request, lastError);
}

/**
 * Create a local fallback response when all backend endpoints fail
 */
function createLocalFallbackResponse(
  request: ChatRequest,
  error: Error | null
): ChatResponse {
  const responses: Record<string, string> = {
    greeting: 'Olá! No momento estou com dificuldades de conexão com o servidor. Tente novamente em alguns instantes.',
    help: 'O Cidadão.AI está temporariamente indisponível. Por favor, aguarde alguns minutos e tente novamente.',
    default: 'Desculpe, estou enfrentando problemas de conexão no momento. Por favor, tente novamente.',
  };

  // Simple intent detection
  const lowerMessage = request.message.toLowerCase();
  let responseText = responses.default;

  if (lowerMessage.match(/^(olá|oi|bom dia|boa tarde|boa noite|hey|hello)/)) {
    responseText = responses.greeting;
  } else if (lowerMessage.includes('ajud') || lowerMessage.includes('help')) {
    responseText = responses.help;
  }

  return {
    session_id: request.session_id || 'local_fallback',
    agent_id: 'system',
    agent_name: 'Sistema',
    message: responseText,
    confidence: 0,
    suggested_actions: [
      'Tentar novamente',
      'Verificar conexão com internet',
      'Recarregar página',
    ],
    metadata: {
      fallback: true,
      local_response: true,
      error: error?.message,
      timestamp: Date.now(),
    },
  };
}

/**
 * Emergency fallback with minimal dependencies
 * Used when even the fallback adapter fails
 */
export async function sendEmergencyFallback(message: string): Promise<ChatResponse> {
  console.warn('[Emergency Fallback] Using minimal response');

  return {
    session_id: `emergency_${Date.now()}`,
    agent_id: 'system',
    agent_name: 'Sistema',
    message: 'O sistema está temporariamente indisponível. Por favor, tente novamente mais tarde.',
    confidence: 0,
    suggested_actions: ['Aguardar alguns minutos', 'Recarregar página'],
    metadata: {
      emergency: true,
      timestamp: Date.now(),
    },
  };
}
