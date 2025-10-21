import type { ChatRequest, ChatResponse } from '@/types/chat';
import { sendSSEMessage, type SSEMessageOptions } from '@/lib/api/chat-adapter-sse';
import { sendBackendMessage } from '@/lib/api/chat-adapter-backend';
import { sendFallbackMessage } from '@/lib/api/chat-adapter-fallback';
import { sendChatAsInvestigation } from '@/lib/api/chat-adapter';
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry';
import { getChatCacheIDB } from '@/lib/services/chat-cache-idb.service';
import { logger } from '@/lib/utils/logger';

export type ModelPreference = 'auto' | 'economic' | 'quality' | 'stable';

export interface ChatEndpoint {
  url: string;
  name: string;
  adapter: (request: ChatRequest) => Promise<ChatResponse>;
  model: string;
  costLevel: number; // 1 = cheapest, 3 = most expensive
  priority: number;
}

export interface SmartChatOptions {
  preferredModel?: ModelPreference;
  useDrummond?: boolean;
  maxRetries?: number;
  timeout?: number;
  streaming?: boolean; // Enable SSE streaming
  onChunk?: (text: string) => void; // Callback for streaming chunks
  onProgress?: (accumulated: string) => void; // Callback for accumulated text
}

/**
 * Smart Chat Service with intelligent model selection and fallback
 */
export class SmartChatService {
  private endpoints: ChatEndpoint[] = [
    {
      url: '/api/v1/chat/stream',
      name: 'SSE Streaming (Primary)',
      adapter: async (request) => {
        // SSE adapter will be called with streaming options
        throw new Error('SSE adapter requires streaming options - use sendMessage with streaming: true');
      },
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 1,
    },
    {
      url: '/api/v1/chat/stable',
      name: 'Backend Stable',
      adapter: sendBackendMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 2,
    },
    {
      url: '/api/v1/chat/fallback',
      name: 'Multi-Endpoint Fallback',
      adapter: sendFallbackMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 3,
    },
    {
      url: '/api/investigate',
      name: 'Local Investigation',
      adapter: sendChatAsInvestigation,
      model: 'local',
      costLevel: 0,
      priority: 4,
    },
  ];

  /**
   * Send a message with intelligent routing
   */
  async sendMessage(
    message: string,
    options: SmartChatOptions = {}
  ): Promise<ChatResponse> {
    // Check cache first (only for non-streaming requests)
    if (!options.streaming) {
      try {
        const cache = await getChatCacheIDB();
        const cachedResponse = await cache.get(message);

        if (cachedResponse) {
          logger.debug('SmartChat: Returning cached response');
          return cachedResponse;
        }
      } catch (error) {
        logger.warn('SmartChat: Cache check failed', { error });
        // Continue without cache
      }
    }

    const sessionId = `smart_${Date.now()}`;
    const request: ChatRequest = {
      message,
      session_id: sessionId,
      context: {
        model_preference: options.preferredModel || 'auto',
        use_drummond: options.useDrummond ?? true,
      },
    };

    // If streaming is enabled, use SSE directly
    if (options.streaming) {
      logger.debug('SmartChat: Using SSE streaming mode');

      try {
        const sseOptions: SSEMessageOptions = {
          onChunk: options.onChunk,
          onProgress: options.onProgress,
        };

        const response = await sendSSEMessage(request, sseOptions);

        this.logSuccess(
          { name: 'SSE Streaming', url: '/api/v1/chat/stream' } as any,
          response,
          0
        );

        // Cache SSE response (streaming responses are not cached during streaming)
        // but we cache the final result
        try {
          const cache = await getChatCacheIDB();
          await cache.set(message, response);
        } catch (error) {
          logger.warn('SmartChat: Failed to cache SSE response', { error });
        }

        return response;
      } catch (error) {
        logger.warn('SmartChat: SSE streaming failed, falling back to standard endpoints', { error });
        // Continue to fallback logic below
      }
    }

    // Select endpoints based on preference (excluding SSE for non-streaming)
    const selectedEndpoints = this.selectEndpoints(message, options).filter(
      (e) => e.url !== '/api/v1/chat/stream'
    );

    logger.debug('SmartChat: Selected endpoints order', {
      endpoints: selectedEndpoints.map(e => e.name)
    });
    logger.debug('SmartChat: Model preference', {
      preference: options.preferredModel || 'default'
    });

    // Try each endpoint in order
    let lastError: Error | null = null;

    for (const endpoint of selectedEndpoints) {
      try {
        logger.debug(`SmartChat: Trying ${endpoint.name}`, { url: endpoint.url });

        const startTime = Date.now();
        const response = await this.tryEndpoint(endpoint, request, options.timeout);

        // Success! Log metrics
        this.logSuccess(endpoint, response, Date.now() - startTime);

        // Cache the successful response
        try {
          const cache = await getChatCacheIDB();
          await cache.set(message, response);
        } catch (error) {
          logger.warn('SmartChat: Failed to cache response', { error });
          // Don't fail the request due to cache errors
        }

        return response;
      } catch (error) {
        logger.warn(`SmartChat: ${endpoint.name} failed`, { error });
        lastError = error as Error;

        // Continue to next endpoint
        continue;
      }
    }

    // All endpoints failed - use local fallback
    logger.error('SmartChat: All endpoints failed, using local fallback', {
      lastError: lastError?.message
    });
    
    return this.createFallbackResponse(request, lastError);
  }

  /**
   * Analyze message complexity to determine best model
   */
  analyzeComplexity(message: string): 'simple' | 'moderate' | 'complex' {
    const complexKeywords = [
      'analise', 'investigue', 'compare', 'tendência',
      'padrão', 'anomalia', 'detalhe', 'relatório',
      'histórico', 'evolução', 'correlação', 'estatística'
    ];
    
    const moderateKeywords = [
      'explique', 'como funciona', 'o que é', 'por que',
      'quando', 'onde', 'quem', 'liste', 'mostre'
    ];

    const lowerMessage = message.toLowerCase();
    
    // Check message length
    if (message.length > 200) return 'complex';
    if (message.length < 20) return 'simple';
    
    // Check keywords
    const hasComplexKeyword = complexKeywords.some(kw => lowerMessage.includes(kw));
    if (hasComplexKeyword) return 'complex';
    
    const hasModerateKeyword = moderateKeywords.some(kw => lowerMessage.includes(kw));
    if (hasModerateKeyword) return 'moderate';
    
    // Simple greetings and basic questions
    return 'simple';
  }

  /**
   * Select endpoints based on message and preferences
   */
  private selectEndpoints(
    message: string,
    options: SmartChatOptions
  ): ChatEndpoint[] {
    let endpoints = [...this.endpoints];
    const complexity = this.analyzeComplexity(message);
    
    // Handle explicit preferences
    if (options.preferredModel === 'economic') {
      // Sort by cost (cheapest first) but prioritize Maritaca over legacy
      endpoints.sort((a, b) => {
        // Legacy fallback should always be last resort
        if (a.model === 'legacy') return 1;
        if (b.model === 'legacy') return -1;
        return a.costLevel - b.costLevel;
      });
    } else if (options.preferredModel === 'quality') {
      // Sort by cost (most expensive first = highest quality)
      endpoints.sort((a, b) => b.costLevel - a.costLevel);
    } else if (options.preferredModel === 'stable') {
      // Put stable endpoint first
      endpoints.sort((a, b) => 
        a.url.includes('stable') ? -1 : b.url.includes('stable') ? 1 : 0
      );
    } else {
      // Default: use priority field
      endpoints.sort((a, b) => a.priority - b.priority);
    }
    
    return endpoints;
  }

  /**
   * Try a specific endpoint with timeout
   */
  private async tryEndpoint(
    endpoint: ChatEndpoint,
    request: ChatRequest,
    timeout: number = 30000
  ): Promise<ChatResponse> {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
    
    // Race between the request and timeout
    const response = await Promise.race([
      endpoint.adapter(request),
      timeoutPromise
    ]);
    
    return response;
  }

  /**
   * Create a local fallback response
   */
  private createFallbackResponse(
    request: ChatRequest,
    error: Error | null
  ): ChatResponse {
    const responses = {
      greeting: 'Olá! No momento estou com dificuldades de conexão, mas estou aqui para ajudar assim que o serviço for restabelecido.',
      help: 'O Cidadão.AI é um sistema de transparência pública. No momento estamos offline, mas em breve voltaremos.',
      default: 'Desculpe, estou temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
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
      session_id: request.session_id || 'fallback',
      agent_id: 'system',
      agent_name: 'Sistema',
      message: responseText,
      confidence: 0,
      suggested_actions: ['Tentar novamente', 'Verificar conexão'],
      metadata: {
        fallback: true,
        error: error?.message,
        endpoint: 'local',
      },
    };
  }

  /**
   * Log successful request for metrics
   */
  private logSuccess(
    endpoint: ChatEndpoint,
    response: ChatResponse,
    duration: number
  ): void {
    logger.performance(`SmartChat: Success with ${endpoint.name}`, duration, {
      endpoint: endpoint.name,
      model: endpoint.model,
      confidence: response.confidence
    });

    // Log to telemetry
    chatTelemetry.track({
      type: 'message_received',
      timestamp: Date.now(),
      sessionId: response.session_id,
      duration,
      data: {
        endpoint: endpoint.name,
        model: endpoint.model,
        costLevel: endpoint.costLevel,
        confidence: response.confidence,
      },
    });
  }

  /**
   * Get cost estimate for a model
   */
  getModelCost(model: string): number {
    const costs = {
      'sabiazinho-3': 0.001,  // per 1k tokens
      'sabia-3': 0.003,       // per 1k tokens
      'mixed': 0.002,         // average
    };
    
    return costs[model as keyof typeof costs] || 0.002;
  }
}

// Singleton instance
export const smartChatService = new SmartChatService();