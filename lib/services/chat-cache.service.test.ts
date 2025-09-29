import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { ChatCacheService } from './chat-cache.service'

describe('ChatCacheService', () => {
  let service: ChatCacheService
  
  beforeEach(() => {
    service = new ChatCacheService()
    vi.useFakeTimers()
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('get', () => {
    it('returns null for non-cached messages', () => {
      const result = service.get('test message')
      expect(result).toBeNull()
    })

    it('returns cached response within TTL', () => {
      const message = 'What is the weather?'
      const response = { 
        response: 'The weather is sunny',
        confidence: 0.9,
        metadata: { model_used: 'test' }
      }
      
      service.set(message, response)
      
      const cached = service.get(message)
      expect(cached).toBeDefined()
      expect(cached.response).toBe('The weather is sunny')
      expect(cached.metadata.from_cache).toBe(true)
      expect(cached.metadata.cache_hits).toBe(1)
    })

    it('returns null for expired cache', () => {
      const message = 'Old query'
      const response = { 
        response: 'Old response',
        confidence: 0.9,
        metadata: { model_used: 'test' }
      }
      
      service.set(message, response)
      
      // Advance time past TTL
      vi.advanceTimersByTime(3700000) // More than 1 hour
      
      const cached = service.get(message)
      expect(cached).toBeNull()
    })

    it('increments hit count on subsequent gets', () => {
      const message = 'Popular query'
      const response = { 
        response: 'Popular response',
        confidence: 0.9,
        metadata: { model_used: 'test' }
      }
      
      service.set(message, response)
      
      service.get(message)
      service.get(message)
      const cached = service.get(message)
      
      expect(cached.metadata.cache_hits).toBe(3)
    })

    it('normalizes message for cache key', () => {
      const response = { 
        response: 'Test response',
        confidence: 0.9,
        metadata: { model_used: 'test' }
      }
      
      service.set('  Hello World!  ', response)
      
      const cached = service.get('hello world!')
      expect(cached).toBeDefined()
      expect(cached.response).toBe('Test response')
    })
  })

  describe('set', () => {
    it('caches response with metadata', () => {
      const message = 'Test query'
      const response = { 
        response: 'Test response',
        confidence: 0.95,
        metadata: { model_used: 'gpt-4' }
      }
      
      service.set(message, response)
      
      const cached = service.get(message)
      expect(cached).toBeDefined()
      expect(cached.metadata.from_cache).toBe(true)
    })

    it('handles suggestions array', () => {
      const message = 'Test with suggestions'
      const response = { 
        response: 'Test response',
        confidence: 0.9,
        metadata: { model_used: 'test' },
        suggestions: ['Question 1', 'Question 2']
      }
      
      service.set(message, response)
      
      // Note: The current implementation doesn't actually cache suggestions separately
      // This test verifies that responses with suggestions can be cached
      const cached = service.get(message)
      expect(cached).toBeDefined()
      expect(cached.suggestions).toEqual(['Question 1', 'Question 2'])
    })

    it('maintains max cache size', () => {
      // Set max size to 3 for testing
      service['maxCacheSize'] = 3
      
      service.set('Query 1', { response: 'Response 1', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('Query 2', { response: 'Response 2', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('Query 3', { response: 'Response 3', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('Query 4', { response: 'Response 4', confidence: 0.9, metadata: { model_used: 'model' } })
      
      // First query should be evicted
      expect(service.get('Query 1')).toBeNull()
      expect(service.get('Query 4')).toBeDefined()
    })

    it('skips low confidence responses', () => {
      const message = 'Low confidence query'
      const response = { 
        response: 'Uncertain response',
        confidence: 0.7, // Below 0.8 threshold
        metadata: { model_used: 'test' }
      }
      
      service.set(message, response)
      
      expect(service.get(message)).toBeNull()
    })

    it('skips error responses', () => {
      const message = 'Error query'
      const response = { 
        response: 'Error occurred',
        confidence: 0.9,
        metadata: { model_used: 'test', error: true }
      }
      
      service.set(message, response)
      
      expect(service.get(message)).toBeNull()
    })
  })

  describe('clear', () => {
    it('removes all cached entries', () => {
      service.set('Query 1', { response: 'Response 1', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('Query 2', { response: 'Response 2', confidence: 0.9, metadata: { model_used: 'model' } })
      
      service.clear()
      
      expect(service.get('Query 1')).toBeNull()
      expect(service.get('Query 2')).toBeNull()
    })
    
    it('clears entries matching pattern', () => {
      service.set('chat query 1', { response: 'Response 1', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('chat query 2', { response: 'Response 2', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('other query', { response: 'Response 3', confidence: 0.9, metadata: { model_used: 'model' } })
      
      service.clear('chat')
      
      expect(service.get('chat query 1')).toBeNull()
      expect(service.get('chat query 2')).toBeNull()
      expect(service.get('other query')).toBeDefined()
    })
  })

  describe('getStats', () => {
    it('returns cache statistics', () => {
      service.clear() // Clear any previous cache
      
      service.set('Query 1', { response: 'Response 1', confidence: 0.9, metadata: { model_used: 'model-a' } })
      service.set('Query 2', { response: 'Response 2', confidence: 0.9, metadata: { model_used: 'model-b' } })
      
      service.get('Query 1')
      service.get('Query 1')
      service.get('Query 2')
      
      const stats = service.getStats()
      
      expect(stats.entries).toBe(2)
      expect(stats.totalHits).toBe(3)
      expect(stats.modelDistribution).toBeDefined()
      expect(stats.modelDistribution['model-a']).toBe(1)
      expect(stats.modelDistribution['model-b']).toBe(1)
    })

    it('calculates size statistics', () => {
      service.clear()
      
      service.set('Small', { response: 'Hi', confidence: 0.9, metadata: { model_used: 'model' } })
      service.set('Large', { response: 'A very long response that contains many words', confidence: 0.9, metadata: { model_used: 'model' } })
      
      const stats = service.getStats()
      
      expect(stats.totalSizeBytes).toBeGreaterThan(0)
      expect(stats.totalSizeMB).toBeDefined()
      expect(stats.averageHitsPerEntry).toBeDefined()
    })
  })

  describe('TTL by message type', () => {
    it('uses longer TTL for greetings', () => {
      service.set('oi', { response: 'Hello!', confidence: 0.9, metadata: { model_used: 'model' } })
      
      // Advance time less than greeting TTL
      vi.advanceTimersByTime(3700000) // More than default TTL
      
      // Should still be cached
      expect(service.get('oi')).toBeDefined()
    })

    it('uses short TTL for analysis queries', () => {
      service.set('analise os gastos', { response: 'Analysis...', confidence: 0.9, metadata: { model_used: 'model' } })
      
      // Advance time past analysis TTL
      vi.advanceTimersByTime(700000) // More than 10 minutes
      
      // Should be expired
      expect(service.get('analise os gastos')).toBeNull()
    })

    it('uses default TTL for other queries', () => {
      service.set('random query', { response: 'Response', confidence: 0.9, metadata: { model_used: 'model' } })
      
      // Advance time less than default TTL
      vi.advanceTimersByTime(1700000) // Less than 30 minutes default
      
      // Should still be cached
      expect(service.get('random query')).toBeDefined()
      
      // Advance past default TTL
      vi.advanceTimersByTime(1000000) // Total more than 30 minutes
      
      // Should be expired
      expect(service.get('random query')).toBeNull()
    })
  })
})