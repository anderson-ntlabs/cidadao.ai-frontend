/**
 * Custom Metrics Service
 *
 * Tracks application metrics for monitoring and observability
 */

import { logger } from '@/lib/logger'

export interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

export interface MetricsSummary {
  cacheHits: number
  cacheMisses: number
  cacheHitRate: number
  apiCalls: number
  apiErrors: number
  apiErrorRate: number
  averageLatency: number
  p95Latency: number
  p99Latency: number
}

class MetricsService {
  private static instance: MetricsService
  private metrics: Metric[] = []
  private latencies: number[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics in memory

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService()
    }
    return MetricsService.instance
  }

  /**
   * Track a custom metric
   */
  async trackMetric(metric: Metric): Promise<void> {
    const metricWithTimestamp: Metric = {
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    }

    // Add to in-memory storage
    this.metrics.push(metricWithTimestamp)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Send to metrics endpoint (async, don't wait)
    this.sendToEndpoint(metricWithTimestamp).catch((error) => {
      logger.warn('Failed to send metric to endpoint', {
        context: 'MetricsService',
        error: error.message,
        metric: metric.name,
      })
    })
  }

  /**
   * Track cache hit
   */
  trackCacheHit(cacheName: string): void {
    this.trackMetric({
      name: 'cache.hit',
      value: 1,
      tags: { cache: cacheName },
    })
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(cacheName: string): void {
    this.trackMetric({
      name: 'cache.miss',
      value: 1,
      tags: { cache: cacheName },
    })
  }

  /**
   * Track API call latency
   */
  trackAPILatency(endpoint: string, latency: number): void {
    this.latencies.push(latency)

    // Keep only recent latencies
    if (this.latencies.length > this.maxMetrics) {
      this.latencies = this.latencies.slice(-this.maxMetrics)
    }

    this.trackMetric({
      name: 'api.latency',
      value: latency,
      tags: { endpoint },
    })
  }

  /**
   * Track API error
   */
  trackAPIError(endpoint: string, errorType: string): void {
    this.trackMetric({
      name: 'api.error',
      value: 1,
      tags: { endpoint, error_type: errorType },
    })
  }

  /**
   * Track page view
   */
  trackPageView(path: string): void {
    this.trackMetric({
      name: 'page.view',
      value: 1,
      tags: { path },
    })
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, category: string): void {
    this.trackMetric({
      name: 'user.interaction',
      value: 1,
      tags: { action, category },
    })
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, string>): void {
    this.trackMetric({
      name: 'app.error',
      value: 1,
      tags: {
        error_name: error.name,
        error_message: error.message.substring(0, 100),
        ...context,
      },
    })
  }

  /**
   * Get metrics summary
   */
  getSummary(): MetricsSummary {
    const cacheHits = this.getMetricCount('cache.hit')
    const cacheMisses = this.getMetricCount('cache.miss')
    const apiCalls = this.getMetricCount('api.latency')
    const apiErrors = this.getMetricCount('api.error')

    const totalCache = cacheHits + cacheMisses
    const cacheHitRate = totalCache > 0 ? cacheHits / totalCache : 0
    const apiErrorRate = apiCalls > 0 ? apiErrors / apiCalls : 0

    const averageLatency = this.calculateAverage(this.latencies)
    const p95Latency = this.calculatePercentile(this.latencies, 95)
    const p99Latency = this.calculatePercentile(this.latencies, 99)

    return {
      cacheHits,
      cacheMisses,
      cacheHitRate,
      apiCalls,
      apiErrors,
      apiErrorRate,
      averageLatency,
      p95Latency,
      p99Latency,
    }
  }

  /**
   * Get metrics for specific name
   */
  getMetrics(name: string): Metric[] {
    return this.metrics.filter((m) => m.name === name)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.latencies = []
  }

  /**
   * Send metric to backend endpoint
   */
  private async sendToEndpoint(metric: Metric): Promise<void> {
    // Only send in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      // Silently fail - metrics should not break the app
      logger.debug('Metric send failed (non-critical)', {
        context: 'MetricsService',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get count of metrics with specific name
   */
  private getMetricCount(name: string): number {
    return this.metrics.filter((m) => m.name === name).length
  }

  /**
   * Calculate average of array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    const sum = values.reduce((a, b) => a + b, 0)
    return sum / values.length
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }
}

// Export singleton instance
export const metricsService = MetricsService.getInstance()

/**
 * Helper function to track async operations
 */
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  metricName: string,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime

    metricsService.trackMetric({
      name: `${metricName}.duration`,
      value: duration,
      tags: { ...tags, status: 'success' },
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime

    metricsService.trackMetric({
      name: `${metricName}.duration`,
      value: duration,
      tags: { ...tags, status: 'error' },
    })

    if (error instanceof Error) {
      metricsService.trackError(error, tags)
    }

    throw error
  }
}
