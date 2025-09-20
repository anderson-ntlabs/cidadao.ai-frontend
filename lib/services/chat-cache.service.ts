/**
 * Intelligent cache service for chat responses
 * Saves API calls and reduces costs
 */

interface CachedResponse {
  response: any;
  timestamp: number;
  hitCount: number;
  model: string;
  confidence: number;
}

export class ChatCacheService {
  private cache = new Map<string, CachedResponse>();
  private readonly maxCacheSize = 1000;
  private readonly defaultTTL = 3600000; // 1 hour
  
  // Different TTL for different types of questions
  private readonly ttlByType = {
    greeting: 86400000,    // 24 hours for greetings
    help: 3600000,         // 1 hour for help
    factual: 86400000,     // 24 hours for factual info
    analysis: 600000,      // 10 minutes for analysis (data might change)
    default: 1800000,      // 30 minutes default
  };

  /**
   * Get cached response if available and not expired
   */
  get(message: string): any | null {
    const key = this.normalizeMessage(message);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const ttl = this.getTTL(message, cached);
    const isExpired = Date.now() - cached.timestamp > ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    // Update hit count
    cached.hitCount++;
    
    // Log cache hit
    console.log(`[Cache] Hit for: "${message.substring(0, 50)}..." (${cached.hitCount} hits)`);
    
    return {
      ...cached.response,
      metadata: {
        ...cached.response.metadata,
        from_cache: true,
        cache_hits: cached.hitCount,
        cached_at: cached.timestamp,
      },
    };
  }

  /**
   * Store response in cache
   */
  set(message: string, response: any): void {
    // Only cache high confidence responses
    if (response.confidence < 0.8) {
      console.log('[Cache] Skipping low confidence response');
      return;
    }
    
    // Don't cache error responses
    if (response.metadata?.error) {
      console.log('[Cache] Skipping error response');
      return;
    }
    
    const key = this.normalizeMessage(message);
    
    // Implement LRU if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hitCount: 0,
      model: response.metadata?.model_used || 'unknown',
      confidence: response.confidence || 0,
    });
    
    console.log(`[Cache] Stored: "${message.substring(0, 50)}..." (${this.cache.size} items)`);
  }

  /**
   * Clear cache or specific entries
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('[Cache] Cleared all entries');
      return;
    }
    
    // Clear entries matching pattern
    const regex = new RegExp(pattern, 'i');
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`[Cache] Cleared ${keysToDelete.length} entries matching "${pattern}"`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    let totalSize = 0;
    const modelDistribution: Record<string, number> = {};
    
    this.cache.forEach((cached) => {
      totalHits += cached.hitCount;
      totalSize += JSON.stringify(cached.response).length;
      
      const model = cached.model;
      modelDistribution[model] = (modelDistribution[model] || 0) + 1;
    });
    
    return {
      entries: this.cache.size,
      totalHits,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      averageHitsPerEntry: this.cache.size > 0 ? (totalHits / this.cache.size).toFixed(2) : 0,
      modelDistribution,
      oldestEntry: this.getOldestEntry()?.timestamp,
      newestEntry: this.getNewestEntry()?.timestamp,
    };
  }

  /**
   * Normalize message for cache key
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, '')      // Remove punctuation
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .replace(/\b(eu|me|meu|minha)\b/g, '')  // Remove personal pronouns
      .replace(/\b(o|a|os|as|um|uma)\b/g, '') // Remove articles
      .trim();
  }

  /**
   * Get TTL based on message type
   */
  private getTTL(message: string, cached: CachedResponse): number {
    const lower = message.toLowerCase();
    
    // High confidence factual responses can be cached longer
    if (cached.confidence > 0.95) {
      return this.ttlByType.factual;
    }
    
    // Detect message type
    if (lower.match(/^(olá|oi|bom dia|boa tarde|boa noite)/)) {
      return this.ttlByType.greeting;
    }
    
    if (lower.includes('ajud') || lower.includes('help') || lower.includes('como funciona')) {
      return this.ttlByType.help;
    }
    
    if (lower.includes('analis') || lower.includes('investig')) {
      return this.ttlByType.analysis;
    }
    
    return this.ttlByType.default;
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    this.cache.forEach((cached, key) => {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('[Cache] Evicted oldest entry');
    }
  }

  /**
   * Get oldest entry
   */
  private getOldestEntry(): CachedResponse | null {
    let oldest: CachedResponse | null = null;
    
    this.cache.forEach((cached) => {
      if (!oldest || cached.timestamp < oldest.timestamp) {
        oldest = cached;
      }
    });
    
    return oldest;
  }

  /**
   * Get newest entry
   */
  private getNewestEntry(): CachedResponse | null {
    let newest: CachedResponse | null = null;
    
    this.cache.forEach((cached) => {
      if (!newest || cached.timestamp > newest.timestamp) {
        newest = cached;
      }
    });
    
    return newest;
  }
}

// Singleton instance
export const chatCache = new ChatCacheService();