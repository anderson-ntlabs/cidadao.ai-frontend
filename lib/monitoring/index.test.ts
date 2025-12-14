/**
 * Tests for Unified Monitoring Module Exports
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'

describe('Monitoring Module Exports', () => {
  it('should export Sentry functions', async () => {
    const module = await import('./index')

    expect(typeof module.captureException).toBe('function')
    expect(typeof module.captureMessage).toBe('function')
    expect(typeof module.setUser).toBe('function')
    expect(typeof module.clearUser).toBe('function')
    expect(typeof module.addBreadcrumb).toBe('function')
    expect(typeof module.trackPerformance).toBe('function')
    expect(typeof module.trackPageLoad).toBe('function')
    expect(typeof module.getSentryConfig).toBe('function')
    expect(typeof module.initSentry).toBe('function')
  })

  it('should export metrics service', async () => {
    const module = await import('./index')

    expect(module.metricsService).toBeDefined()
    expect(typeof module.trackAsyncOperation).toBe('function')
  })

  it('should export AI telemetry functions', async () => {
    const module = await import('./index')

    expect(typeof module.startAISpan).toBe('function')
    expect(typeof module.trackAICall).toBe('function')
    expect(typeof module.withAITelemetry).toBe('function')
    expect(typeof module.trackTokenUsage).toBe('function')
    expect(typeof module.setAIAgentContext).toBe('function')
  })
})
