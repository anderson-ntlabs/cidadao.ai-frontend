/**
 * IndexedDB-based cache service for chat responses
 *
 * Benefits over in-memory cache:
 * - Persistence across sessions (survives page reloads)
 * - Larger storage capacity (>50MB vs ~10MB RAM)
 * - Better memory management (browser handles eviction)
 * - Offline support (works with PWA)
 *
 * Uses the 'idb' library for promise-based IndexedDB API
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CachedResponse {
  message: string; // Original message (primary key)
  response: any; // ChatResponse object
  timestamp: number; // When cached
  hitCount: number; // Number of cache hits
  model: string; // Model used
  confidence: number; // Response confidence
  ttl: number; // Time-to-live in ms
}

interface ChatCacheDB extends DBSchema {
  'chat-responses': {
    key: string; // Normalized message
    value: CachedResponse;
    indexes: {
      'by-timestamp': number;
      'by-model': string;
      'by-confidence': number;
    };
  };
  'cache-stats': {
    key: string;
    value: {
      totalRequests: number;
      cacheHits: number;
      cacheMisses: number;
      lastCleanup: number;
    };
  };
}

export class ChatCacheIDBService {
  private db: IDBPDatabase<ChatCacheDB> | null = null;
  private readonly dbName = 'cidadao-ai-cache';
  private readonly dbVersion = 1;
  private readonly storeName = 'chat-responses';
  private readonly statsStore = 'cache-stats';
  private readonly maxCacheSize = 2000; // Increased from 1000 (IndexedDB can handle more)
  private readonly defaultTTL = 3600000; // 1 hour

  // Different TTL for different types of questions
  private readonly ttlByType = {
    greeting: 86400000, // 24 hours for greetings
    help: 3600000, // 1 hour for help
    factual: 86400000, // 24 hours for factual info
    analysis: 600000, // 10 minutes for analysis (data might change)
    default: 1800000, // 30 minutes default
  };

  /**
   * Initialize IndexedDB database
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<ChatCacheDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Create chat responses store with indexes
          if (!db.objectStoreNames.contains('chat-responses')) {
            const store = db.createObjectStore('chat-responses', { keyPath: 'message' });
            store.createIndex('by-timestamp', 'timestamp');
            store.createIndex('by-model', 'model');
            store.createIndex('by-confidence', 'confidence');
          }

          // Create stats store
          if (!db.objectStoreNames.contains('cache-stats')) {
            db.createObjectStore('cache-stats');
          }
        },
      });

      // Initialize stats if not exists
      const stats = await this.db.get(this.statsStore, 'stats');
      if (!stats) {
        await this.db.put(this.statsStore, {
          totalRequests: 0,
          cacheHits: 0,
          cacheMisses: 0,
          lastCleanup: Date.now(),
        }, 'stats');
      }

      console.log('[Cache IDB] Initialized successfully');
    } catch (error) {
      console.error('[Cache IDB] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBPDatabase<ChatCacheDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Get cached response if available and not expired
   */
  async get(message: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const key = this.normalizeMessage(message);
      const cached = await db.get(this.storeName, key);

      // Update stats
      await this.updateStats('request');

      if (!cached) {
        await this.updateStats('miss');
        return null;
      }

      // Check expiration
      const isExpired = Date.now() - cached.timestamp > cached.ttl;

      if (isExpired) {
        await db.delete(this.storeName, key);
        await this.updateStats('miss');
        return null;
      }

      // Update hit count
      cached.hitCount++;
      await db.put(this.storeName, cached);
      await this.updateStats('hit');

      // Log cache hit
      console.log(`[Cache IDB] Hit for: "${message.substring(0, 50)}..." (${cached.hitCount} hits)`);

      return {
        ...cached.response,
        metadata: {
          ...cached.response.metadata,
          from_cache: true,
          cache_hits: cached.hitCount,
          cached_at: cached.timestamp,
          cache_type: 'indexeddb',
        },
      };
    } catch (error) {
      console.error('[Cache IDB] Get error:', error);
      return null;
    }
  }

  /**
   * Store response in cache
   */
  async set(message: string, response: any): Promise<void> {
    try {
      // Only cache high confidence responses
      if (response.confidence < 0.8) {
        console.log('[Cache IDB] Skipping low confidence response');
        return;
      }

      // Don't cache error responses
      if (response.metadata?.error) {
        console.log('[Cache IDB] Skipping error response');
        return;
      }

      const db = await this.ensureDB();
      const key = this.normalizeMessage(message);
      const ttl = this.getTTL(message, response.confidence);

      // Check cache size and evict if necessary
      await this.evictIfFull();

      const cached: CachedResponse = {
        message: key,
        response,
        timestamp: Date.now(),
        hitCount: 0,
        model: response.metadata?.model_used || 'unknown',
        confidence: response.confidence || 0,
        ttl,
      };

      await db.put(this.storeName, cached);

      const count = await db.count(this.storeName);
      console.log(`[Cache IDB] Stored: "${message.substring(0, 50)}..." (${count} items)`);
    } catch (error) {
      console.error('[Cache IDB] Set error:', error);
    }
  }

  /**
   * Clear cache or specific entries
   */
  async clear(pattern?: string): Promise<void> {
    try {
      const db = await this.ensureDB();

      if (!pattern) {
        await db.clear(this.storeName);
        console.log('[Cache IDB] Cleared all entries');
        return;
      }

      // Clear entries matching pattern
      const regex = new RegExp(pattern, 'i');
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      let cursor = await store.openCursor();
      let deletedCount = 0;

      while (cursor) {
        if (regex.test(cursor.value.message)) {
          await cursor.delete();
          deletedCount++;
        }
        cursor = await cursor.continue();
      }

      await tx.done;
      console.log(`[Cache IDB] Cleared ${deletedCount} entries matching "${pattern}"`);
    } catch (error) {
      console.error('[Cache IDB] Clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const db = await this.ensureDB();

      // Get all entries for stats calculation
      const allEntries = await db.getAll(this.storeName);

      let totalHits = 0;
      let totalSize = 0;
      const modelDistribution: Record<string, number> = {};

      allEntries.forEach((cached) => {
        totalHits += cached.hitCount;
        totalSize += JSON.stringify(cached.response).length;

        const model = cached.model;
        modelDistribution[model] = (modelDistribution[model] || 0) + 1;
      });

      // Get stored stats
      const stats = await db.get(this.statsStore, 'stats');

      return {
        entries: allEntries.length,
        totalHits,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        averageHitsPerEntry: allEntries.length > 0 ? (totalHits / allEntries.length).toFixed(2) : 0,
        modelDistribution,
        oldestEntry: this.getOldestEntry(allEntries)?.timestamp,
        newestEntry: this.getNewestEntry(allEntries)?.timestamp,
        // Additional IndexedDB-specific stats
        totalRequests: stats?.totalRequests || 0,
        cacheHits: stats?.cacheHits || 0,
        cacheMisses: stats?.cacheMisses || 0,
        hitRate: stats?.totalRequests ? ((stats.cacheHits / stats.totalRequests) * 100).toFixed(2) + '%' : '0%',
        lastCleanup: stats?.lastCleanup,
      };
    } catch (error) {
      console.error('[Cache IDB] Stats error:', error);
      return {
        entries: 0,
        totalHits: 0,
        totalSizeBytes: 0,
        totalSizeMB: '0.00',
        averageHitsPerEntry: 0,
        modelDistribution: {},
        error: (error as Error).message,
      };
    }
  }

  /**
   * Clean expired entries (manual garbage collection)
   */
  async cleanExpired(): Promise<number> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      let cursor = await store.openCursor();
      let deletedCount = 0;

      while (cursor) {
        const cached = cursor.value;
        const isExpired = Date.now() - cached.timestamp > cached.ttl;

        if (isExpired) {
          await cursor.delete();
          deletedCount++;
        }

        cursor = await cursor.continue();
      }

      await tx.done;

      // Update last cleanup timestamp
      const stats = await db.get(this.statsStore, 'stats');
      if (stats) {
        stats.lastCleanup = Date.now();
        await db.put(this.statsStore, stats, 'stats');
      }

      if (deletedCount > 0) {
        console.log(`[Cache IDB] Cleaned ${deletedCount} expired entries`);
      }

      return deletedCount;
    } catch (error) {
      console.error('[Cache IDB] Clean error:', error);
      return 0;
    }
  }

  /**
   * Export cache data (for backup/debugging)
   */
  async exportData(): Promise<CachedResponse[]> {
    try {
      const db = await this.ensureDB();
      return await db.getAll(this.storeName);
    } catch (error) {
      console.error('[Cache IDB] Export error:', error);
      return [];
    }
  }

  /**
   * Import cache data (for restore/migration)
   */
  async importData(data: CachedResponse[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');

      for (const entry of data) {
        await tx.store.put(entry);
      }

      await tx.done;
      console.log(`[Cache IDB] Imported ${data.length} entries`);
    } catch (error) {
      console.error('[Cache IDB] Import error:', error);
    }
  }

  /**
   * Normalize message for cache key
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:'"]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(eu|me|meu|minha)\b/g, '') // Remove personal pronouns
      .replace(/\b(o|a|os|as|um|uma)\b/g, '') // Remove articles
      .trim();
  }

  /**
   * Get TTL based on message type and confidence
   */
  private getTTL(message: string, confidence: number): number {
    const lower = message.toLowerCase();

    // High confidence factual responses can be cached longer
    if (confidence > 0.95) {
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
   * Evict oldest entry if cache is full (LRU)
   */
  private async evictIfFull(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const count = await db.count(this.storeName);

      if (count >= this.maxCacheSize) {
        // Get oldest entry by timestamp index
        const tx = db.transaction(this.storeName, 'readwrite');
        const index = tx.store.index('by-timestamp');
        const cursor = await index.openCursor();

        if (cursor) {
          await cursor.delete();
          console.log('[Cache IDB] Evicted oldest entry (LRU)');
        }

        await tx.done;
      }
    } catch (error) {
      console.error('[Cache IDB] Eviction error:', error);
    }
  }

  /**
   * Update cache statistics
   */
  private async updateStats(type: 'request' | 'hit' | 'miss'): Promise<void> {
    try {
      const db = await this.ensureDB();
      const stats = await db.get(this.statsStore, 'stats') || {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        lastCleanup: Date.now(),
      };

      if (type === 'request') stats.totalRequests++;
      if (type === 'hit') stats.cacheHits++;
      if (type === 'miss') stats.cacheMisses++;

      await db.put(this.statsStore, stats, 'stats');
    } catch (error) {
      console.error('[Cache IDB] Stats update error:', error);
    }
  }

  /**
   * Get oldest entry from array
   */
  private getOldestEntry(entries: CachedResponse[]): CachedResponse | null {
    if (entries.length === 0) return null;

    return entries.reduce((oldest, current) =>
      current.timestamp < oldest.timestamp ? current : oldest
    );
  }

  /**
   * Get newest entry from array
   */
  private getNewestEntry(entries: CachedResponse[]): CachedResponse | null {
    if (entries.length === 0) return null;

    return entries.reduce((newest, current) =>
      current.timestamp > newest.timestamp ? current : newest
    );
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[Cache IDB] Database closed');
    }
  }
}

// Singleton instance with lazy initialization
let cacheInstance: ChatCacheIDBService | null = null;

export async function getChatCacheIDB(): Promise<ChatCacheIDBService> {
  if (!cacheInstance) {
    cacheInstance = new ChatCacheIDBService();
    await cacheInstance.init();
  }
  return cacheInstance;
}

// Direct instance export (will initialize on first use)
export const chatCacheIDB = new ChatCacheIDBService();
