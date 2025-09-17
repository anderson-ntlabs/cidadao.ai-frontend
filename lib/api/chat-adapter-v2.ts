import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';

/**
 * Chat adapter for the new full API with WebSocket support
 * Uses the /api/v1/chat endpoints
 */

export interface ChatMessageRequest {
  message: string;
  session_id?: string;
  context?: Record<string, any>;
}

export interface ChatMessageResponse {
  session_id: string;
  message_id: string;
  agent_id: string;
  agent_name: string;
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    processing_time_ms?: number;
    data_source?: string;
    total_found?: number;
    anomalies_detected?: number;
  };
  suggested_actions?: string[];
}

/**
 * Send a chat message to the backend
 * Uses the new /api/v1/chat/message endpoint
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const payload: ChatMessageRequest = {
      message: request.message,
      session_id: request.session_id,
      context: request.context,
    };

    const response = await api.post<ChatMessageResponse>('/api/v1/chat/message', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;

    // Convert API response to ChatResponse format
    return {
      session_id: data.session_id,
      agent_id: data.agent_id,
      agent_name: data.agent_name,
      message: data.content,
      confidence: data.metadata?.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        message_id: data.message_id,
        timestamp: data.timestamp,
      },
    };
  } catch (error: any) {
    console.error('Chat error:', error);
    
    // Fallback to error response
    return {
      session_id: request.session_id || 'error_session',
      agent_id: 'system',
      agent_name: 'Sistema',
      message: `Desculpe, ocorreu um erro ao processar sua mensagem. 

${error.message || 'Erro desconhecido'}

Por favor, tente novamente ou reformule sua pergunta.`,
      confidence: 0,
      suggested_actions: [
        'Tentar novamente',
        'Verificar conexão',
        'Reformular pergunta',
      ],
      metadata: {
        error: true,
        error_message: error.message,
      },
    };
  }
}

/**
 * Get chat suggestions from the API
 */
export async function getChatSuggestions(session_id?: string) {
  try {
    const response = await api.get('/api/v1/chat/suggestions', {
      params: { session_id },
    });

    if (!response.success || !response.data) {
      return getDefaultSuggestions();
    }

    return response.data.suggestions || getDefaultSuggestions();
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return getDefaultSuggestions();
  }
}

/**
 * Get chat history with pagination
 */
export async function getChatHistory(session_id: string, cursor?: string, limit: number = 50) {
  try {
    const response = await api.get(`/api/v1/chat/history/${session_id}/paginated`, {
      params: { cursor, limit },
    });

    if (!response.success || !response.data) {
      return { messages: [], next_cursor: null };
    }

    return response.data;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return { messages: [], next_cursor: null };
  }
}

/**
 * Default suggestions when API is not available
 */
function getDefaultSuggestions() {
  return [
    {
      id: '1',
      label: 'Investigar contratos suspeitos',
      icon: 'FileSearch',
      action: 'Mostre contratos com valores anormais',
    },
    {
      id: '2',
      label: 'Buscar servidores',
      icon: 'Users',
      action: 'Buscar servidores por nome ou cargo',
    },
    {
      id: '3',
      label: 'Analisar despesas',
      icon: 'DollarSign',
      action: 'Analisar despesas do governo',
    },
    {
      id: '4',
      label: 'Detectar anomalias',
      icon: 'AlertTriangle',
      action: 'Detectar anomalias em contratos',
    },
  ];
}

/**
 * Stream chat response using Server-Sent Events
 */
export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        message: request.message,
        session_id: request.session_id,
        context: request.context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Stream error:', error);
    onError?.(error);
  }
}

/**
 * Get available agents from the API
 */
export async function getAvailableAgents() {
  try {
    const response = await api.get('/api/v1/agents');
    
    if (!response.success || !response.data) {
      return getMockAgents();
    }

    return response.data.agents || getMockAgents();
  } catch (error) {
    console.error('Failed to get agents:', error);
    return getMockAgents();
  }
}

/**
 * Mock agents for fallback
 */
function getMockAgents() {
  return [
    {
      id: 'abaporu',
      name: 'Abaporu',
      role: 'Orquestrador Mestre',
      status: 'available' as const,
      specialty: 'Coordenação de investigações complexas',
      type: 'master' as const,
      description: 'Agente mestre que coordena investigações',
    },
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      role: 'Investigador de Anomalias',
      status: 'available' as const,
      specialty: 'Detecção de padrões irregulares',
      type: 'investigator' as const,
      description: 'Especialista em detectar anomalias',
    },
  ];
}