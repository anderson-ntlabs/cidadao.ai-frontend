/**
 * Tests for Metrics Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { metricsService, trackAsyncOperation } from './metrics.service'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('MetricsService', () => {
  beforeEach(() => {
    // Clear metrics between tests
    metricsService.clear()
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = metricsService
      const instance2 = metricsService

      expect(instance1).toBe(instance2)
    })
  })

  describe('trackMetric', () => {
    it('should track metric with timestamp', async () => {
      await metricsService.trackMetric({
        name: 'test.metric',
        value: 42,
        tags: { env: 'test' },
      })

      const metrics = metricsService.getMetrics('test.metric')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(42)
      expect(metrics[0].tags?.env).toBe('test')
      expect(metrics[0].timestamp).toBeDefined()
    })

    it('should preserve custom timestamp', async () => {
      const customTimestamp = 1700000000000

      await metricsService.trackMetric({
        name: 'test.metric',
        value: 1,
        timestamp: customTimestamp,
      })

      const metrics = metricsService.getMetrics('test.metric')

      expect(metrics[0].timestamp).toBe(customTimestamp)
    })
  })

  describe('trackCacheHit', () => {
    it('should track cache hit metric', () => {
      metricsService.trackCacheHit('memory-cache')

      const metrics = metricsService.getMetrics('cache.hit')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.cache).toBe('memory-cache')
    })
  })

  describe('trackCacheMiss', () => {
    it('should track cache miss metric', () => {
      metricsService.trackCacheMiss('redis-cache')

      const metrics = metricsService.getMetrics('cache.miss')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.cache).toBe('redis-cache')
    })
  })

  describe('trackAPILatency', () => {
    it('should track API latency', () => {
      metricsService.trackAPILatency('/api/chat', 150)

      const metrics = metricsService.getMetrics('api.latency')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].value).toBe(150)
      expect(metrics[0].tags?.endpoint).toBe('/api/chat')
    })
  })

  describe('trackAPIError', () => {
    it('should track API error', () => {
      metricsService.trackAPIError('/api/chat', 'timeout')

      const metrics = metricsService.getMetrics('api.error')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.endpoint).toBe('/api/chat')
      expect(metrics[0].tags?.error_type).toBe('timeout')
    })
  })

  describe('trackPageView', () => {
    it('should track page view', () => {
      metricsService.trackPageView('/pt/app/chat')

      const metrics = metricsService.getMetrics('page.view')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.path).toBe('/pt/app/chat')
    })
  })

  describe('trackInteraction', () => {
    it('should track user interaction', () => {
      metricsService.trackInteraction('click', 'button')

      const metrics = metricsService.getMetrics('user.interaction')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.action).toBe('click')
      expect(metrics[0].tags?.category).toBe('button')
    })
  })

  describe('trackError', () => {
    it('should track error with context', () => {
      const error = new Error('Test error message')
      error.name = 'TestError'

      metricsService.trackError(error, { component: 'ChatBox' })

      const metrics = metricsService.getMetrics('app.error')

      expect(metrics).toHaveLength(1)
      expect(metrics[0].tags?.error_name).toBe('TestError')
      expect(metrics[0].tags?.component).toBe('ChatBox')
    })

    it('should truncate long error messages', () => {
      const error = new Error('A'.repeat(200))

      metricsService.trackError(error)

      const metrics = metricsService.getMetrics('app.error')

      expect(metrics[0].tags?.error_message?.length).toBeLessThanOrEqual(100)
    })
  })

  describe('getSummary', () => {
    it('should calculate cache hit rate', () => {
      metricsService.trackCacheHit('cache')
      metricsService.trackCacheHit('cache')
      metricsService.trackCacheMiss('cache')

      const summary = metricsService.getSummary()

      expect(summary.cacheHits).toBe(2)
      expect(summary.cacheMisses).toBe(1)
      expect(summary.cacheHitRate).toBeCloseTo(0.667, 2)
    })

    it('should calculate API error rate', () => {
      metricsService.trackAPILatency('/api', 100)
      metricsService.trackAPILatency('/api', 200)
      metricsService.trackAPIError('/api', 'timeout')

      const summary = metricsService.getSummary()

      expect(summary.apiCalls).toBe(2)
      expect(summary.apiErrors).toBe(1)
      expect(summary.apiErrorRate).toBe(0.5)
    })

    it('should calculate average latency', () => {
      metricsService.trackAPILatency('/api', 100)
      metricsService.trackAPILatency('/api', 200)
      metricsService.trackAPILatency('/api', 300)

      const summary = metricsService.getSummary()

      expect(summary.averageLatency).toBe(200)
    })

    it('should calculate percentiles', () => {
      // Add 100 latencies from 1 to 100
      for (let i = 1; i <= 100; i++) {
        metricsService.trackAPILatency('/api', i)
      }

      const summary = metricsService.getSummary()

      expect(summary.p95Latency).toBe(95)
      expect(summary.p99Latency).toBe(99)
    })

    it('should handle empty metrics', () => {
      const summary = metricsService.getSummary()

      expect(summary.cacheHits).toBe(0)
      expect(summary.cacheHitRate).toBe(0)
      expect(summary.averageLatency).toBe(0)
    })
  })

  describe('getMetrics', () => {
    it('should filter metrics by name', async () => {
      await metricsService.trackMetric({ name: 'metric.a', value: 1 })
      await metricsService.trackMetric({ name: 'metric.b', value: 2 })
      await metricsService.trackMetric({ name: 'metric.a', value: 3 })

      const metricsA = metricsService.getMetrics('metric.a')
      const metricsB = metricsService.getMetrics('metric.b')

      expect(metricsA).toHaveLength(2)
      expect(metricsB).toHaveLength(1)
    })

    it('should return empty array for unknown metric', () => {
      const metrics = metricsService.getMetrics('unknown.metric')

      expect(metrics).toHaveLength(0)
    })
  })

  describe('clear', () => {
    it('should clear all metrics', async () => {
      await metricsService.trackMetric({ name: 'test', value: 1 })
      metricsService.trackAPILatency('/api', 100)

      metricsService.clear()

      const summary = metricsService.getSummary()

      expect(summary.apiCalls).toBe(0)
      expect(metricsService.getMetrics('test')).toHaveLength(0)
    })
  })
})

describe('trackAsyncOperation', () => {
  beforeEach(() => {
    metricsService.clear()
    vi.clearAllMocks()
  })

  it('should track successful operation duration', async () => {
    const operation = vi.fn().mockResolvedValue('result')

    const result = await trackAsyncOperation(operation, 'test.operation', { tag: 'value' })

    expect(result).toBe('result')

    const metrics = metricsService.getMetrics('test.operation.duration')

    expect(metrics).toHaveLength(1)
    expect(metrics[0].tags?.status).toBe('success')
    expect(metrics[0].tags?.tag).toBe('value')
    expect(metrics[0].value).toBeGreaterThanOrEqual(0)
  })

  it('should track failed operation and rethrow error', async () => {
    const error = new Error('Operation failed')
    const operation = vi.fn().mockRejectedValue(error)

    await expect(trackAsyncOperation(operation, 'test.operation')).rejects.toThrow(
      'Operation failed'
    )

    const durationMetrics = metricsService.getMetrics('test.operation.duration')
    const errorMetrics = metricsService.getMetrics('app.error')

    expect(durationMetrics).toHaveLength(1)
    expect(durationMetrics[0].tags?.status).toBe('error')
    expect(errorMetrics).toHaveLength(1)
  })

  it('should measure actual duration', async () => {
    const delay = 50
    const operation = () =>
      new Promise<string>((resolve) => setTimeout(() => resolve('done'), delay))

    await trackAsyncOperation(operation, 'delayed.operation')

    const metrics = metricsService.getMetrics('delayed.operation.duration')

    expect(metrics[0].value).toBeGreaterThanOrEqual(delay - 10) // Allow some variance
  })
})
