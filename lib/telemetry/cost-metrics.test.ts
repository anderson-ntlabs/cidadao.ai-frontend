import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CostMetricsService, costMetrics, type ChatMetric, type CostReport } from './cost-metrics'

// Mock Date.now
const mockNow = 1704067200000 // 2024-01-01T00:00:00Z

describe('CostMetricsService', () => {
  let service: CostMetricsService
  let dateSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CostMetricsService()
    dateSpy = vi.spyOn(Date, 'now').mockReturnValue(mockNow)
  })

  afterEach(() => {
    dateSpy.mockRestore()
  })

  describe('record', () => {
    it('should record metric with all fields', () => {
      const metric: Partial<ChatMetric> = {
        model_used: 'sabia-3',
        tokens_used: 250,
        response_time: 150,
        from_cache: false,
        success: true,
        endpoint: '/api/chat',
        message_length: 100,
      }

      service.record(metric)

      // Check internal metrics using CircularBuffer methods
      const metrics = service['metrics']
      expect(metrics.length).toBe(1)
      const metricsArray = metrics.toArray()
      expect(metricsArray[0]).toMatchObject({
        timestamp: mockNow,
        model_used: 'sabia-3',
        tokens_used: 250,
        response_time: 150,
        from_cache: false,
        success: true,
        endpoint: '/api/chat',
        message_length: 100,
      })
    })

    it('should record metric with defaults', () => {
      service.record({})

      const metrics = service['metrics']
      expect(metrics.length).toBe(1)
      const metricsArray = metrics.toArray()
      expect(metricsArray[0]).toMatchObject({
        timestamp: mockNow,
        model_used: 'unknown',
        response_time: 0,
        from_cache: false,
        success: true,
      })
    })

    it('should estimate tokens if not provided', () => {
      service.record({
        model_used: 'sabiazinho-3',
        message_length: 400, // Should estimate ~100 tokens (400/4)
      })

      const metricsArray = service['metrics'].toArray()
      expect(metricsArray[0].tokens_used).toBe(300) // 100 (request) + 200 (response)
    })

    it('should limit metrics array size', () => {
      // Add more than maxMetrics (10000)
      for (let i = 0; i < 10005; i++) {
        service.record({ model_used: `model-${i}` })
      }

      const metrics = service['metrics']
      expect(metrics.length).toBe(10000)
      const metricsArray = metrics.toArray()
      expect(metricsArray[0].model_used).toBe('model-5') // First 5 should be removed
    })

    it('should log warnings for failed requests', async () => {
      // Import logger to spy on it
      const { logger } = await import('@/lib/logger')
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})

      service.record({
        success: false,
        error: 'Network error',
      })

      expect(warnSpy).toHaveBeenCalledWith('Cost metric request failed', {
        context: 'CostMetrics',
        error: 'Network error',
        endpoint: undefined,
      })
      warnSpy.mockRestore()
    })

    it('should log cache hits', async () => {
      // Import logger to spy on it
      const { logger } = await import('@/lib/logger')
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => {})

      service.record({
        from_cache: true,
      })

      expect(debugSpy).toHaveBeenCalledWith('Cache hit - saved API call', {
        context: 'CostMetrics',
        endpoint: undefined,
      })
      debugSpy.mockRestore()
    })
  })

  describe('getReport', () => {
    it('should return empty report when no metrics', () => {
      const report = service.getReport()

      expect(report).toMatchObject({
        totalRequests: 0,
        cachedRequests: 0,
        modelUsage: {},
        totalTokens: 0,
        estimatedCost: 0,
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        costSavings: 0,
      })
    })

    it('should generate report for last 24 hours by default', () => {
      // Add some metrics
      service.record({
        model_used: 'sabia-3',
        tokens_used: 200,
        response_time: 100,
        success: true,
      })

      service.record({
        model_used: 'sabiazinho-3',
        tokens_used: 150,
        response_time: 80,
        from_cache: true,
        success: true,
      })

      service.record({
        model_used: 'sabia-3',
        tokens_used: 250,
        response_time: 120,
        success: false,
        error: 'Timeout',
      })

      const report = service.getReport()

      expect(report).toMatchObject({
        totalRequests: 3,
        cachedRequests: 1,
        modelUsage: {
          'sabia-3': 2,
          'sabiazinho-3': 1,
        },
        totalTokens: 600,
        avgResponseTime: 100,
        errorRate: expect.closeTo(33.33, 2),
        cacheHitRate: expect.closeTo(33.33, 2),
      })
    })

    it('should filter metrics by time period', () => {
      // Add old metric
      dateSpy.mockReturnValue(mockNow - 25 * 60 * 60 * 1000) // 25 hours ago
      service.record({ model_used: 'old-model' })

      // Add recent metric
      dateSpy.mockReturnValue(mockNow)
      service.record({ model_used: 'recent-model' })

      const report = service.getReport(24)

      expect(report.totalRequests).toBe(1)
      expect(report.modelUsage).toEqual({ 'recent-model': 1 })
    })

    it('should calculate cost correctly', () => {
      service.record({
        model_used: 'sabia-3',
        tokens_used: 1000,
        from_cache: false,
      })

      service.record({
        model_used: 'sabiazinho-3',
        tokens_used: 1000,
        from_cache: false,
      })

      const report = service.getReport()

      // sabia-3: 1000 tokens * $0.0006/1000 = $0.0006
      // sabiazinho-3: 1000 tokens * $0.0002/1000 = $0.0002
      expect(report.estimatedCost).toBeCloseTo(0.0008, 6)
    })

    it('should calculate cost savings from cache', () => {
      // Non-cached request
      service.record({
        model_used: 'sabia-3',
        tokens_used: 250, // Default token count
        from_cache: false,
      })

      // Cached request (would have cost the same)
      service.record({
        model_used: 'sabia-3',
        tokens_used: 250,
        from_cache: true,
      })

      const report = service.getReport()

      // Cost savings is based on average cost per request
      // In this case: 1 cached request * avg cost of sabia-3 request
      // 250 tokens * $0.0006/1000 = $0.00015
      expect(report.costSavings).toBeCloseTo(0.00015, 6)
    })
  })

  describe('getRealTimeMetrics', () => {
    it('should return metrics for last 5 minutes', () => {
      // Add old metric
      dateSpy.mockReturnValue(mockNow - 6 * 60 * 1000) // 6 minutes ago
      service.record({ model_used: 'old' })

      // Add recent metrics
      dateSpy.mockReturnValue(mockNow - 2 * 60 * 1000) // 2 minutes ago
      service.record({ model_used: 'recent', endpoint: '/api/chat' })

      dateSpy.mockReturnValue(mockNow)
      service.record({ model_used: 'recent', endpoint: '/api/investigate' })

      const metrics = service.getRealTimeMetrics()

      expect(metrics).toMatchObject({
        requestsLast5Min: 2,
        requestsPerMinute: 0.4,
        modelDistribution: { recent: 2 },
        endpointDistribution: {
          '/api/chat': 1,
          '/api/investigate': 1,
        },
      })
    })

    it('should calculate real-time costs', () => {
      dateSpy.mockReturnValue(mockNow)
      service.record({
        model_used: 'sabia-3',
        tokens_used: 1000,
        from_cache: false,
      })

      const metrics = service.getRealTimeMetrics()
      expect(metrics.costLast5Min).toBeCloseTo(0.0006, 6)
    })

    it('should calculate cache hit rate', () => {
      dateSpy.mockReturnValue(mockNow)
      service.record({ from_cache: true })
      service.record({ from_cache: false })
      service.record({ from_cache: true })

      const metrics = service.getRealTimeMetrics()
      expect(metrics.cacheHitRate).toBeCloseTo(66.67, 2)
    })
  })

  describe('getCostBreakdown', () => {
    it('should return cost breakdown by model', () => {
      service.record({
        model_used: 'sabia-3',
        tokens_used: 1000,
      })

      service.record({
        model_used: 'sabiazinho-3',
        tokens_used: 1000,
      })

      service.record({
        model_used: 'sabia-3',
        tokens_used: 1000,
      })

      const breakdown = service.getCostBreakdown()

      // Each request: 250 tokens (50 req + 200 res)
      // sabia-3: 2 requests * 250 tokens * $0.0006/1000 = $0.0003
      // sabiazinho-3: 1 request * 250 tokens * $0.0002/1000 = $0.00005
      expect(breakdown).toEqual({
        'sabia-3': expect.closeTo(0.0003, 6),
        'sabiazinho-3': expect.closeTo(0.00005, 6),
      })
    })

    it('should handle unknown models', () => {
      service.record({
        model_used: 'unknown-model',
      })

      const breakdown = service.getCostBreakdown()
      expect(breakdown['unknown-model']).toBe(0)
    })
  })

  describe('exportMetrics', () => {
    it('should export metrics as JSON', () => {
      service.record({
        model_used: 'sabia-3',
        tokens_used: 100,
      })

      const exported = service.exportMetrics()
      const parsed = JSON.parse(exported)

      expect(parsed).toHaveProperty('report')
      expect(parsed).toHaveProperty('breakdown')
      expect(parsed).toHaveProperty('metrics')
      expect(Array.isArray(parsed.metrics)).toBe(true)
    })

    it('should limit exported metrics to last 100', () => {
      // Add 150 metrics
      for (let i = 0; i < 150; i++) {
        service.record({ model_used: `model-${i}` })
      }

      const exported = service.exportMetrics()
      const parsed = JSON.parse(exported)

      expect(parsed.metrics).toHaveLength(100)
      expect(parsed.metrics[0].model_used).toBe('model-50') // First 50 not included
    })
  })

  describe('edge cases', () => {
    it('should handle zero tokens from cache', () => {
      service.record({
        model_used: 'sabia-3',
        tokens_used: 0,
        from_cache: true, // Cached requests have 0 cost
      })

      const report = service.getReport()
      expect(report.estimatedCost).toBe(0)
    })

    it('should handle missing message length', () => {
      service.record({
        model_used: 'sabia-3',
        // No message_length or tokens_used
      })

      const metricsArray = service['metrics'].toArray()
      // Should use default: 50 (request) + 200 (response)
      expect(metricsArray[0].tokens_used).toBe(250)
    })

    it('should handle very long messages', () => {
      service.record({
        model_used: 'sabia-3',
        message_length: 10000, // Very long message
      })

      const metricsArray = service['metrics'].toArray()
      // 10000/4 = 2500 request tokens + 200 response tokens
      expect(metricsArray[0].tokens_used).toBe(2700)
    })

    it('should handle all cached requests', () => {
      service.record({ from_cache: true })
      service.record({ from_cache: true })

      const report = service.getReport()
      expect(report.cacheHitRate).toBe(100)
      expect(report.estimatedCost).toBe(0)
    })

    it('should handle all error requests', () => {
      service.record({ success: false })
      service.record({ success: false })

      const report = service.getReport()
      expect(report.errorRate).toBe(100)
    })

    it('should handle mixed model types', () => {
      service.record({ model_used: 'sabia-3' })
      service.record({ model_used: 'sabiazinho-3' })
      service.record({ model_used: 'mixed' })
      service.record({ model_used: 'fallback' })
      service.record({ model_used: 'custom' })

      const breakdown = service.getCostBreakdown()
      expect(Object.keys(breakdown)).toHaveLength(5)
      expect(breakdown.fallback).toBe(0) // Fallback is free
      expect(breakdown.custom).toBe(0) // Unknown models have 0 cost
    })
  })

  describe('singleton', () => {
    it('should export singleton instance', () => {
      expect(costMetrics).toBeInstanceOf(CostMetricsService)
    })
  })
})
