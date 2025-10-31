import { SmartChatService, SmartChatOptions, ModelPreference } from './smart-chat.service';
import { chatCache } from './chat-cache.service';
import { costMetrics } from '@/lib/telemetry/cost-metrics';
import type { ChatResponse } from '@/types/chat';

/**
 * Smart Chat Service with intelligent caching
 * Extends SmartChatService to add cache layer
 */
export class CachedSmartChatService extends SmartChatService {
  
  /**
   * Send message with cache check
   */
  async sendMessage(
    message: string,
    options: SmartChatOptions = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    // Check cache first (unless explicitly disabled)
    if (options.preferredModel !== 'quality') {
      const cached = chatCache.get(message);
      
      if (cached) {
        // Record cache hit metric
        costMetrics.record({
          model_used: cached.metadata?.model_used || 'cached',
          response_time: Date.now() - startTime,
          from_cache: true,
          success: true,
          endpoint: 'cache',
          message_length: message.length,
        });
        
        console.log('[CachedChat] Returning cached response');
        return cached;
      }
    }
    
    try {
      // Get fresh response from API
      const response = await super.sendMessage(message, options);
      
      // Cache successful responses
      if (response.confidence > 0.8 && !response.metadata?.error) {
        chatCache.set(message, response);
      }
      
      // Record metric
      costMetrics.record({
        model_used: response.metadata?.model_used || 'unknown',
        tokens_used: response.metadata?.tokens_used,
        response_time: Date.now() - startTime,
        from_cache: false,
        success: true,
        endpoint: response.metadata?.endpoint,
        message_length: message.length,
      });
      
      return response;
      
    } catch (error) {
      // Record error metric
      costMetrics.record({
        model_used: 'error',
        response_time: Date.now() - startTime,
        from_cache: false,
        success: false,
        error: (error as Error).message,
        message_length: message.length,
      });
      
      throw error;
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return chatCache.getStats();
  }
  
  /**
   * Get cost metrics
   */
  getCostMetrics(hours: number = 24) {
    return costMetrics.getReport(hours);
  }
  
  /**
   * Get real-time metrics
   */
  getRealTimeMetrics() {
    return costMetrics.getRealTimeMetrics();
  }
  
  /**
   * Clear cache
   */
  clearCache(pattern?: string) {
    chatCache.clear(pattern);
  }
  
  /**
   * Preload cache with common queries
   */
  async preloadCache() {
    const commonQueries = [
      { message: 'Olá', model: 'economic' },
      { message: 'O que é o Cidadão.AI?', model: 'economic' },
      { message: 'Como funciona o sistema?', model: 'economic' },
      { message: 'Como posso ajudar?', model: 'economic' },
      { message: 'Obrigado', model: 'economic' },
    ];
    
    console.log('[CachedChat] Preloading cache with common queries...');
    
    for (const query of commonQueries) {
      try {
        // Check if already cached
        const existing = chatCache.get(query.message);
        if (existing) continue;
        
        // Get response with economic model
        const response = await super.sendMessage(query.message, {
          preferredModel: query.model as ModelPreference,
        });
        
        // Cache it
        if (response.confidence > 0.8) {
          chatCache.set(query.message, response);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`[CachedChat] Failed to preload: "${query.message}"`);
      }
    }
    
    console.log('[CachedChat] Preloading complete');
  }
}

// Singleton instance
export const cachedSmartChatService = new CachedSmartChatService();