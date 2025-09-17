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

    // Parse the user query to determine data source and filters
    const parsed = parseUserQuery(request.message);
    
    // Use the /api/investigate endpoint that's available in the HuggingFace deployment
    const response = await api.post<any>('/api/investigate', {
      query: parsed.searchTerm,
      data_source: parsed.dataSource,
      filters: parsed.filters,
      max_results: 100
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to send message');
    }

    const data = response.data;

    // Convert investigate response to ChatResponse format
    const queryDescription = formatParsedQuery(parsed);
    let responseMessage = `🔍 **${queryDescription}**\n\n`;
    
    if (data.results && data.results.length > 0) {
      responseMessage += `Encontrei ${data.total_found} resultados:\n\n`;
      
      // Show first 3 results
      data.results.slice(0, 3).forEach((result: any, idx: number) => {
        if (data.data_source === 'servidores' && result.nome) {
          responseMessage += `**${idx + 1}. ${result.nome}**\n`;
          responseMessage += `- Órgão: ${result.orgao}\n`;
          responseMessage += `- Cargo: ${result.cargo}\n`;
          if (result.remuneracao?.total_liquido) {
            responseMessage += `- Remuneração: R$ ${result.remuneracao.total_liquido.toLocaleString('pt-BR')}\n`;
          }
          responseMessage += '\n';
        } else {
          // Generic result display
          responseMessage += `**${idx + 1}. Resultado**\n`;
          responseMessage += JSON.stringify(result, null, 2) + '\n\n';
        }
      });
      
      if (data.total_found > 3) {
        responseMessage += `... e ${data.total_found - 3} outros resultados.\n`;
      }
    } else {
      responseMessage = `Não encontrei resultados para "${request.message}" na base de dados de ${data.data_source}.`;
    }
    
    if (data.anomalies_detected > 0) {
      responseMessage += `\n⚠️ **Anomalias detectadas:** ${data.anomalies_detected}`;
    }

    return {
      session_id: request.session_id || `session_${Date.now()}`,
      agent_id: 'zumbi',
      agent_name: 'Zumbi dos Palmares',
      message: responseMessage,
      confidence: data.confidence_score || 0.8,
      suggested_actions: [
        'Buscar por outro nome',
        'Filtrar por órgão específico',
        'Ver contratos relacionados',
        'Analisar despesas do órgão'
      ],
      metadata: {
        data_source: data.data_source,
        total_found: data.total_found,
        anomalies_detected: data.anomalies_detected,
        processing_time_ms: data.processing_time_ms,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Chat error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      url: `${API_BASE_URL}/api/investigate`,
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

**URL tentada:** ${API_BASE_URL}/api/investigate

Por favor, tente novamente ou reformule sua pergunta.`,
      confidence: 0,
      suggested_actions: [
        'Tentar novamente',
        'Verificar conexão',
        'Reformular pergunta',
        'Usar o modo de investigação',
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