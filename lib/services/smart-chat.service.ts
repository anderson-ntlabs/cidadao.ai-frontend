import type { ChatRequest, ChatResponse } from '@/types/chat';
import { sendSimpleMessage } from '@/lib/api/chat-adapter-simple';
import { sendOptimizedMessage } from '@/lib/api/chat-adapter-optimized';
import { sendStableMessage } from '@/lib/api/chat-adapter-stable';
import { sendChatMessageV3 } from '@/lib/api/chat-adapter-v3';
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry';

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
}

/**
 * Smart Chat Service with intelligent model selection and fallback
 */
export class SmartChatService {
  private endpoints: ChatEndpoint[] = [
    {
      url: '/api/v1/chat/optimized',
      name: 'Optimized (Sabiazinho-3)',
      adapter: sendOptimizedMessage,
      model: 'sabiazinho-3',
      costLevel: 1,
      priority: 1,
    },
    {
      url: '/api/v1/chat/stable',
      name: 'Stable (Multi-fallback)',
      adapter: sendStableMessage,
      model: 'mixed',
      costLevel: 2,
      priority: 2,
    },
    {
      url: '/api/v1/chat/simple',
      name: 'Simple (Sabiá-3)',
      adapter: sendSimpleMessage,
      model: 'sabia-3',
      costLevel: 3,
      priority: 3,
    },
  ];

  /**
   * Send a message with intelligent routing
   */
  async sendMessage(
    message: string,
    options: SmartChatOptions = {}
  ): Promise<ChatResponse> {
    const sessionId = `smart_${Date.now()}`;
    const request: ChatRequest = {
      message,
      session_id: sessionId,
      context: {
        model_preference: options.preferredModel || 'auto',
        use_drummond: options.useDrummond ?? true,
      },
    };

    // Select endpoints based on preference
    const selectedEndpoints = this.selectEndpoints(message, options);
    
    // Try each endpoint in order
    let lastError: Error | null = null;
    
    for (const endpoint of selectedEndpoints) {
      try {
        console.log(`[SmartChat] Trying ${endpoint.name}...`);
        
        const startTime = Date.now();
        const response = await this.tryEndpoint(endpoint, request, options.timeout);
        
        // Success! Log metrics
        this.logSuccess(endpoint, response, Date.now() - startTime);
        
        return response;
      } catch (error) {
        console.warn(`[SmartChat] ${endpoint.name} failed:`, error);
        lastError = error as Error;
        
        // Continue to next endpoint
        continue;
      }
    }

    // All endpoints failed - use local fallback
    console.error('[SmartChat] All endpoints failed, using local fallback');
    
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
      // Sort by cost (cheapest first)
      endpoints.sort((a, b) => a.costLevel - b.costLevel);
    } else if (options.preferredModel === 'quality') {
      // Sort by cost (most expensive first = highest quality)
      endpoints.sort((a, b) => b.costLevel - a.costLevel);
    } else if (options.preferredModel === 'stable') {
      // Put stable endpoint first
      endpoints.sort((a, b) => 
        a.url.includes('stable') ? -1 : b.url.includes('stable') ? 1 : 0
      );
    } else if (options.preferredModel === 'auto') {
      // Auto mode - select based on complexity
      if (complexity === 'simple') {
        // Prefer economic for simple queries
        endpoints.sort((a, b) => a.costLevel - b.costLevel);
      } else if (complexity === 'complex') {
        // Prefer quality for complex queries
        endpoints.sort((a, b) => b.costLevel - a.costLevel);
      }
      // moderate complexity keeps default order
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
    console.log(`[SmartChat] Success with ${endpoint.name} in ${duration}ms`);
    
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