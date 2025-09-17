import { api, API_BASE_URL } from './client';
import type {
  ChatRequest,
  ChatResponse,
  QuickAction,
  ChatMessage,
  CursorPaginationResponse,
  AgentInfo,
  SSEEvent,
  SSEEventType,
} from '@/types/chat';

// Chat API endpoints
const CHAT_ENDPOINTS = {
  MESSAGE: '/api/v1/chat/message',
  STREAM: '/api/v1/chat/stream',
  SUGGESTIONS: '/api/v1/chat/suggestions',
  HISTORY: (sessionId: string) => `/api/v1/chat/history/${sessionId}`,
  HISTORY_PAGINATED: (sessionId: string) => `/api/v1/chat/history/${sessionId}/paginated`,
  CACHE_STATS: '/api/v1/chat/cache/stats',
  AGENTS: '/api/v1/chat/agents',
};

// Chat service for API interactions
export const chatService = {
  // Send a chat message
  async sendMessage(request: ChatRequest): Promise<ChatResponse | null> {
    try {
      console.log('Sending message to:', `${API_BASE_URL}${CHAT_ENDPOINTS.MESSAGE}`);
      console.log('Request:', request);
      
      const response = await api.post<ChatResponse>(CHAT_ENDPOINTS.MESSAGE, request);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response success:', response.success);
      
      if (!response.success) {
        console.error('API Error:', response.error);
        throw new Error(response.error?.message || 'Failed to send message');
      }
      
      if (!response.data) {
        console.error('No data in response');
        return null;
      }
      
      // Ensure we have all required fields
      const chatResponse: ChatResponse = {
        session_id: response.data.session_id || request.session_id || 'unknown',
        agent_id: response.data.agent_id || 'abaporu',
        agent_name: response.data.agent_name || 'Abaporu',
        message: response.data.message || 'Sem resposta',
        confidence: response.data.confidence || 0.5,
        suggested_actions: response.data.suggested_actions,
        requires_input: response.data.requires_input,
        metadata: response.data.metadata || {},
      };
      
      return chatResponse;
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  // Get quick action suggestions
  async getSuggestions(): Promise<QuickAction[]> {
    const response = await api.get<QuickAction[]>(CHAT_ENDPOINTS.SUGGESTIONS);
    return response.success ? response.data! : [];
  },

  // Get available agents
  async getAgents(): Promise<AgentInfo[]> {
    const response = await api.get<AgentInfo[]>(CHAT_ENDPOINTS.AGENTS);
    return response.success ? response.data! : [];
  },

  // Get chat history
  async getHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await api.get<{ messages: ChatMessage[] }>(
      CHAT_ENDPOINTS.HISTORY(sessionId),
      { params: { limit } }
    );
    return response.success ? response.data!.messages : [];
  },

  // Get paginated chat history
  async getHistoryPaginated(
    sessionId: string,
    cursor?: string,
    limit: number = 20,
    direction: 'next' | 'prev' = 'next'
  ): Promise<CursorPaginationResponse | null> {
    const response = await api.get<CursorPaginationResponse>(
      CHAT_ENDPOINTS.HISTORY_PAGINATED(sessionId),
      { params: { cursor, limit, direction } }
    );
    return response.success ? response.data! : null;
  },

  // Clear chat history
  async clearHistory(sessionId: string): Promise<boolean> {
    const response = await api.delete(CHAT_ENDPOINTS.HISTORY(sessionId));
    return response.success;
  },

  // Get cache statistics (admin feature)
  async getCacheStats(): Promise<any> {
    const response = await api.get(CHAT_ENDPOINTS.CACHE_STATS);
    return response.success ? response.data : null;
  },

  // Stream chat response using Server-Sent Events
  streamMessage(
    request: ChatRequest,
    onEvent: (type: SSEEventType, data: any) => void,
    onError?: (error: Error) => void
  ): () => void {
    const eventSource = new EventSource(
      `${API_BASE_URL}${CHAT_ENDPOINTS.STREAM}?${new URLSearchParams({
        message: request.message,
        session_id: request.session_id || '',
        context: JSON.stringify(request.context || {}),
      })}`
    );

    // Parse SSE events
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data.type || 'chunk', data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    // Handle specific event types
    const eventTypes: SSEEventType[] = ['start', 'detecting', 'intent', 'agent_selected', 'chunk', 'complete', 'error'];
    
    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: any) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(eventType, data);
        } catch (error) {
          console.error(`Error parsing ${eventType} event:`, error);
        }
      });
    });

    // Handle errors
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      if (onError) {
        onError(new Error('Streaming connection failed'));
      }
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  },
};

// Helper to create a new session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Helper to detect investigation intent
export function detectInvestigationIntent(message: string): boolean {
  const investigationKeywords = [
    'investigar',
    'investigate',
    'analisar',
    'analyze',
    'verificar',
    'verify',
    'checar',
    'check',
    'auditar',
    'audit',
    'examinar',
    'examine',
    'procurar',
    'search',
    'anomalia',
    'anomaly',
    'irregularidade',
    'irregularity',
    'suspeito',
    'suspicious',
    'contrato',
    'contract',
    'licitação',
    'bidding',
    'transparência',
    'transparency',
  ];

  const lowerMessage = message.toLowerCase();
  return investigationKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper to format agent names for display
export function formatAgentName(agentId: string): string {
  const agentNames: Record<string, string> = {
    'abaporu': 'Abaporu',
    'zumbi': 'Zumbi dos Palmares',
    'anita': 'Anita Garibaldi',
    'tiradentes': 'Tiradentes',
    'nana': 'Nanã',
    'ayrton': 'Ayrton Senna',
    'machado': 'Machado de Assis',
    'dandara': 'Dandara',
  };
  
  return agentNames[agentId] || agentId;
}