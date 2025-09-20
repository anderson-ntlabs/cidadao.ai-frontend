import { api, API_BASE_URL } from './client';
import type { ChatRequest, ChatResponse } from '@/types/chat';
import { parseUserQuery, formatParsedQuery } from './query-parser';

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
  message_id?: string;
  agent_id: string;
  agent_name: string;
  content?: string;
  message?: string;
  confidence?: number;
  timestamp?: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    processing_time_ms?: number;
    data_source?: string;
    total_found?: number;
    anomalies_detected?: number;
    intent_type?: string;
    processing_time?: number;
    is_demo_mode?: boolean;
    timestamp?: string;
  };
  suggested_actions?: string[];
  requires_input?: any;
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

    // Parse the user query to determine data source and filters
    const parsed = parseUserQuery(request.message);
    
    // Use the actual chat endpoint
    const response = await api.post<ChatMessageResponse>('/api/v1/chat/message', payload);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;
    
    // Debug log
    console.log('Chat API response data:', data);

    // Return the chat response directly
    return {
      session_id: data.session_id,
      agent_id: data.agent_id,
      agent_name: data.agent_name,
      message: data.message || data.content || '',
      confidence: data.confidence || data.metadata?.confidence || 0.9,
      suggested_actions: data.suggested_actions || [],
      metadata: {
        ...data.metadata,
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Chat error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      url: `${API_BASE_URL}/api/v1/chat/message`,
      headers: error.config?.headers,
      method: error.config?.method,
      payload: error.config?.data
    });
    
    // Get more specific error message
    let errorMessage = 'Erro desconhecido';
    if (error.response?.status === 404) {
      errorMessage = 'Endpoint de chat não encontrado. A API pode estar em atualização.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Erro interno do servidor. Por favor, tente novamente.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Fallback to error response
    return {
      session_id: request.session_id || 'error_session',
      agent_id: 'system',
      agent_name: 'Sistema',
      message: `Desculpe, ocorreu um erro ao processar sua mensagem. 

**Erro:** ${errorMessage}

Por favor, tente novamente ou reformule sua pergunta.`,
      confidence: 0,
      suggested_actions: [
        'Tentar novamente',
        'Verificar conexão',
        'Reformular pergunta',
      ],
      metadata: {
        error: true,
        error_message: errorMessage,
        error_status: error.response?.status,
        api_url: API_BASE_URL,
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
      id: 'drummond',
      name: 'Carlos Drummond de Andrade',
      role: 'Assistente Conversacional',
      status: 'available' as const,
      specialty: 'Conversação natural e orientação',
      type: 'conversational' as const,
      description: 'Poeta e comunicador, sua voz amiga no Cidadão.AI',
    },
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