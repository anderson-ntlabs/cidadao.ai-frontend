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
import { sendChatAsInvestigation, getMockAgents, getMockSuggestions } from './chat-adapter';
import { sendBackendMessage } from './chat-adapter-backend';
import { sendFallbackMessage } from './chat-adapter-fallback';
import { cachedSmartChatService } from '@/lib/services/cached-smart-chat.service';
import { isFeatureEnabled } from '@/lib/feature-flags';

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
      console.log('Chat service: Routing message');
      
      // Use smart chat service if feature is enabled
      if (isFeatureEnabled('smartChatEnabled')) {
        console.log('Using Smart Chat Service with caching and optimization');
        
        // Determine model preference based on context
        const modelPreference = request.context?.model_preference || 'auto';
        
        const response = await cachedSmartChatService.sendMessage(request.message, {
          preferredModel: modelPreference,
          useDrummond: true,
        });
        
        return response;
      }
      
      // Use the official backend adapter
      console.log('Using official backend adapter');
      
      try {
        const response = await sendBackendMessage(request);
        console.log('✅ Backend responded successfully');
        return response;
      } catch (backendError) {
        console.error('Backend adapter failed:', backendError);

        // Fallback to consolidated fallback adapter
        console.log('Falling back to multi-endpoint fallback adapter...');
        const response = await sendFallbackMessage(request);
        console.log('Chat response from fallback:', response);

        return response;
      }
      
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  },

  // Get quick action suggestions
  async getSuggestions(): Promise<QuickAction[]> {
    // Use mock suggestions while the endpoint is not available
    return getMockSuggestions();
    
    // Original code (kept for future use)
    // const response = await api.get<QuickAction[]>(CHAT_ENDPOINTS.SUGGESTIONS);
    // return response.success ? response.data! : [];
  },

  // Get available agents
  async getAgents(): Promise<AgentInfo[]> {
    try {
      // Use real backend endpoint
      const response = await api.get<AgentInfo[]>(CHAT_ENDPOINTS.AGENTS);

      if (response.success && response.data) {
        console.log('✅ Loaded agents from backend:', response.data.length);
        return response.data;
      }

      // Fallback to mocks only if backend fails
      console.warn('⚠️ Backend agents endpoint failed, using mocks');
      return getMockAgents();
    } catch (error) {
      console.error('Failed to load agents from backend:', error);
      // Fallback to mocks on error
      return getMockAgents();
    }
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
    'drummond': 'Carlos Drummond de Andrade',
  };
  
  return agentNames[agentId] || agentId;
}