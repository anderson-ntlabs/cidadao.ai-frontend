/**
 * Web Vitals Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatMetricValue,
  getCurrentWebVitals,
  useWebVitalsMonitor,
  type WebVitalsMetric,
} from './web-vitals'

// Mock web-vitals library
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Web Vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('formatMetricValue', () => {
    it('should format CLS value with 3 decimal places', () => {
      expect(formatMetricValue('CLS', 0.1234)).toBe('0.123')
      expect(formatMetricValue('CLS', 0)).toBe('0.000')
      expect(formatMetricValue('CLS', 0.25)).toBe('0.250')
    })

    it('should format LCP value in milliseconds', () => {
      expect(formatMetricValue('LCP', 2500)).toBe('2500ms')
      expect(formatMetricValue('LCP', 1234.5)).toBe('1235ms')
    })

    it('should format FCP value in milliseconds', () => {
      expect(formatMetricValue('FCP', 1800)).toBe('1800ms')
      expect(formatMetricValue('FCP', 999.4)).toBe('999ms')
    })

    it('should format TTFB value in milliseconds', () => {
      expect(formatMetricValue('TTFB', 800)).toBe('800ms')
      expect(formatMetricValue('TTFB', 123.7)).toBe('124ms')
    })

    it('should format FID value in milliseconds', () => {
      expect(formatMetricValue('FID', 100)).toBe('100ms')
      expect(formatMetricValue('FID', 50.3)).toBe('50ms')
    })

    it('should format INP value in milliseconds', () => {
      expect(formatMetricValue('INP', 200)).toBe('200ms')
      expect(formatMetricValue('INP', 150.9)).toBe('151ms')
    })
  })

  describe('getCurrentWebVitals', () => {
    it('should return empty object when sessionStorage is empty', () => {
      const vitals = getCurrentWebVitals()
      expect(vitals).toEqual({})
    })

    it('should return stored vitals from sessionStorage', () => {
      const mockVitals = {
        LCP: {
          name: 'LCP',
          value: 2000,
          rating: 'good',
          delta: 2000,
          entries: [],
        },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const vitals = getCurrentWebVitals()
      expect(vitals).toEqual(mockVitals)
    })

    it('should return empty object on parse error', () => {
      sessionStorage.setItem('webVitals', 'invalid-json')
      const vitals = getCurrentWebVitals()
      expect(vitals).toEqual({})
    })
  })

  describe('useWebVitalsMonitor', () => {
    it('should return score of 0 when no vitals', () => {
      const result = useWebVitalsMonitor()
      expect(result.score).toBe(0)
      expect(result.metrics).toEqual({})
      // Recommendations are generated for missing/undefined metrics too
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should calculate score based on good ratings', () => {
      const mockVitals = {
        LCP: { name: 'LCP', value: 2000, rating: 'good', delta: 2000, entries: [] },
        FID: { name: 'FID', value: 50, rating: 'good', delta: 50, entries: [] },
        CLS: { name: 'CLS', value: 0.05, rating: 'good', delta: 0.05, entries: [] },
        FCP: { name: 'FCP', value: 1500, rating: 'good', delta: 1500, entries: [] },
        TTFB: { name: 'TTFB', value: 500, rating: 'good', delta: 500, entries: [] },
        INP: { name: 'INP', value: 150, rating: 'good', delta: 150, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.score).toBe(100)
      expect(result.recommendations).toEqual([])
    })

    it('should calculate score based on needs-improvement ratings', () => {
      const mockVitals = {
        LCP: { name: 'LCP', value: 3000, rating: 'needs-improvement', delta: 3000, entries: [] },
        FID: { name: 'FID', value: 200, rating: 'needs-improvement', delta: 200, entries: [] },
        CLS: { name: 'CLS', value: 0.15, rating: 'needs-improvement', delta: 0.15, entries: [] },
        FCP: { name: 'FCP', value: 2500, rating: 'needs-improvement', delta: 2500, entries: [] },
        TTFB: { name: 'TTFB', value: 1200, rating: 'needs-improvement', delta: 1200, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.score).toBe(50)
    })

    it('should calculate score based on poor ratings', () => {
      const mockVitals = {
        LCP: { name: 'LCP', value: 5000, rating: 'poor', delta: 5000, entries: [] },
        FID: { name: 'FID', value: 400, rating: 'poor', delta: 400, entries: [] },
        CLS: { name: 'CLS', value: 0.3, rating: 'poor', delta: 0.3, entries: [] },
        FCP: { name: 'FCP', value: 4000, rating: 'poor', delta: 4000, entries: [] },
        TTFB: { name: 'TTFB', value: 2000, rating: 'poor', delta: 2000, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.score).toBe(0)
    })

    it('should provide LCP recommendation when rating is poor', () => {
      const mockVitals = {
        LCP: { name: 'LCP', value: 5000, rating: 'poor', delta: 5000, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.recommendations).toContainEqual(
        expect.stringContaining('largest content paint')
      )
    })

    it('should provide CLS recommendation when rating is poor', () => {
      const mockVitals = {
        CLS: { name: 'CLS', value: 0.3, rating: 'poor', delta: 0.3, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.recommendations).toContainEqual(expect.stringContaining('layout shifts'))
    })

    it('should provide FID recommendation when rating is poor', () => {
      const mockVitals = {
        FID: { name: 'FID', value: 400, rating: 'poor', delta: 400, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.recommendations).toContainEqual(expect.stringContaining('interactivity'))
    })

    it('should provide INP recommendation when rating is poor', () => {
      const mockVitals = {
        INP: { name: 'INP', value: 600, rating: 'poor', delta: 600, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.recommendations).toContainEqual(expect.stringContaining('interactivity'))
    })

    it('should provide TTFB recommendation when rating is poor', () => {
      const mockVitals = {
        TTFB: { name: 'TTFB', value: 2000, rating: 'poor', delta: 2000, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      expect(result.recommendations).toContainEqual(expect.stringContaining('server response'))
    })

    it('should handle mixed ratings correctly', () => {
      const mockVitals = {
        LCP: { name: 'LCP', value: 2000, rating: 'good', delta: 2000, entries: [] },
        FID: { name: 'FID', value: 200, rating: 'needs-improvement', delta: 200, entries: [] },
        CLS: { name: 'CLS', value: 0.3, rating: 'poor', delta: 0.3, entries: [] },
      }
      sessionStorage.setItem('webVitals', JSON.stringify(mockVitals))

      const result = useWebVitalsMonitor()
      // Score should be weighted average: (100*0.25 + 50*0.25 + 0*0.25) / 0.75 = 50
      expect(result.score).toBe(50)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })
  })
})
