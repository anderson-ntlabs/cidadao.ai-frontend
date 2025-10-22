/**
 * Web Vitals Tracking System
 *
 * Tracks Core Web Vitals and sends to multiple destinations:
 * - Sentry for error correlation
 * - Custom endpoint for analytics
 * - Console in development
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

interface WebVitalsReport {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

// Thresholds based on Google's recommendations
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function sendToAnalytics(metric: Metric) {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  }

  // Send to custom analytics endpoint
  if (typeof window !== 'undefined' && navigator.sendBeacon) {
    const body = JSON.stringify({
      ...report,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    })

    navigator.sendBeacon('/api/web-vitals', body)
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = report.rating === 'good' ? '✅' : report.rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(
      `${emoji} Web Vital: ${report.name}`,
      `\n  Value: ${Math.round(report.value)}ms`,
      `\n  Rating: ${report.rating}`,
      `\n  Delta: ${Math.round(report.delta)}ms`
    )
  }

  // Send to Sentry for correlation with errors
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.setMeasurement(metric.name, metric.value, 'millisecond')
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this once in your app entry point
 */
export function initWebVitals() {
  try {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onFID(sendToAnalytics)
    onINP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  } catch (err) {
    console.error('Failed to initialize Web Vitals tracking:', err)
  }
}

/**
 * Get performance metrics summary
 */
export function getPerformanceSummary() {
  if (typeof window === 'undefined' || !window.performance) {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')

  return {
    // Navigation Timing
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    request: navigation?.responseStart - navigation?.requestStart,
    response: navigation?.responseEnd - navigation?.responseStart,
    domProcessing: navigation?.domComplete - navigation?.domContentLoadedEventStart,

    // Paint Timing
    fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,

    // Resource Timing
    resources: performance.getEntriesByType('resource').length,

    // Memory (if available)
    memory: (performance as any).memory ? {
      usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1048576), // MB
    } : null,
  }
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Mark a custom performance point
   */
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(name)
    }
  },

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name, 'measure')[0]

        if (process.env.NODE_ENV === 'development') {
          console.log(`⏱️ Performance: ${name} = ${Math.round(measure.duration)}ms`)
        }

        return measure.duration
      } catch (err) {
        console.error('Failed to measure performance:', err)
      }
    }
    return 0
  },

  /**
   * Clear all performance marks and measures
   */
  clear() {
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  },
}
