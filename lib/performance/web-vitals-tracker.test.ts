/**
 * Tests for Web Vitals Tracking System
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks for web-vitals
const mockOnCLS = vi.hoisted(() => vi.fn())
const mockOnFCP = vi.hoisted(() => vi.fn())
const mockOnFID = vi.hoisted(() => vi.fn())
const mockOnINP = vi.hoisted(() => vi.fn())
const mockOnLCP = vi.hoisted(() => vi.fn())
const mockOnTTFB = vi.hoisted(() => vi.fn())

vi.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onFCP: mockOnFCP,
  onFID: mockOnFID,
  onINP: mockOnINP,
  onLCP: mockOnLCP,
  onTTFB: mockOnTTFB,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

import { initWebVitals, getPerformanceSummary, PerformanceMonitor } from './web-vitals-tracker'

describe('Web Vitals Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initWebVitals', () => {
    it('should register all web vitals handlers', () => {
      initWebVitals()

      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOnFID).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function))
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should handle initialization errors gracefully', () => {
      mockOnCLS.mockImplementationOnce(() => {
        throw new Error('Web vitals error')
      })

      expect(() => initWebVitals()).not.toThrow()
    })
  })

  describe('getPerformanceSummary', () => {
    it('should be a function', () => {
      expect(typeof getPerformanceSummary).toBe('function')
    })

    it('should return summary or null', () => {
      const result = getPerformanceSummary()
      // In jsdom, performance exists
      expect(result === null || typeof result === 'object').toBe(true)
    })
  })

  describe('PerformanceMonitor', () => {
    describe('mark', () => {
      it('should be a function', () => {
        expect(typeof PerformanceMonitor.mark).toBe('function')
      })

      it('should not throw', () => {
        expect(() => PerformanceMonitor.mark('test-mark')).not.toThrow()
      })
    })

    describe('measure', () => {
      it('should be a function', () => {
        expect(typeof PerformanceMonitor.measure).toBe('function')
      })

      it('should return a number', () => {
        const result = PerformanceMonitor.measure('test', 'start', 'end')
        expect(typeof result).toBe('number')
      })
    })

    describe('clear', () => {
      it('should be a function', () => {
        expect(typeof PerformanceMonitor.clear).toBe('function')
      })

      it('should not throw', () => {
        expect(() => PerformanceMonitor.clear()).not.toThrow()
      })
    })
  })

  describe('sendToAnalytics callback', () => {
    it('should handle metric data from web-vitals', () => {
      // Initialize to register handlers
      initWebVitals()

      // Get the callback that was passed to onCLS
      const clsHandler = mockOnCLS.mock.calls[0]?.[0]

      if (clsHandler) {
        // Call the handler with mock metric data
        expect(() =>
          clsHandler({
            name: 'CLS',
            value: 0.05,
            rating: 'good',
            delta: 0.05,
            id: 'v3-1234',
            navigationType: 'navigate',
          })
        ).not.toThrow()
      }
    })

    it('should handle LCP metric', () => {
      initWebVitals()

      const lcpHandler = mockOnLCP.mock.calls[0]?.[0]

      if (lcpHandler) {
        expect(() =>
          lcpHandler({
            name: 'LCP',
            value: 2500,
            rating: 'good',
            delta: 2500,
            id: 'v3-5678',
            navigationType: 'navigate',
          })
        ).not.toThrow()
      }
    })

    it('should handle poor rating metrics', () => {
      initWebVitals()

      const fcpHandler = mockOnFCP.mock.calls[0]?.[0]

      if (fcpHandler) {
        expect(() =>
          fcpHandler({
            name: 'FCP',
            value: 5000,
            rating: 'poor',
            delta: 5000,
            id: 'v3-9012',
            navigationType: 'reload',
          })
        ).not.toThrow()
      }
    })
  })
})
