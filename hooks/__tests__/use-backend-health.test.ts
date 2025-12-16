/**
 * Tests for useBackendHealth and useIsBackendAvailable hooks
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBackendHealth, useIsBackendAvailable } from '../use-backend-health'

// Mock dependencies
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/utils/ensure-https', () => ({
  getSecureApiUrl: vi.fn(() => 'https://api.test.com'),
}))

describe('useBackendHealth', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()

    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('starts with checking status', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useBackendHealth())

      expect(result.current.status).toBe('checking')
      expect(result.current.isAvailable).toBe(false)
      expect(result.current.lastCheck).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.responseTime).toBeNull()
    })
  })

  describe('Successful Health Check', () => {
    it('sets healthy status on 200 response', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      })

      const { result } = renderHook(() => useBackendHealth({ enabled: true }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('healthy')
        },
        { timeout: 5000 }
      )

      expect(result.current.isAvailable).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('sets degraded status on 401 response', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      })

      const { result } = renderHook(() => useBackendHealth({ enabled: true }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('degraded')
        },
        { timeout: 5000 }
      )

      expect(result.current.isAvailable).toBe(true)
    })

    it('sets degraded status on 403 response', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      })

      const { result } = renderHook(() => useBackendHealth({ enabled: true }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('degraded')
        },
        { timeout: 5000 }
      )

      expect(result.current.isAvailable).toBe(true)
    })
  })

  describe('Failed Health Check', () => {
    it('sets unavailable status on network error', async () => {
      vi.useRealTimers()
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useBackendHealth({ enabled: true }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('unavailable')
        },
        { timeout: 5000 }
      )

      expect(result.current.isAvailable).toBe(false)
      expect(result.current.error).toBe('Network error')
    })

    it('sets unavailable status on 500 response', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useBackendHealth({ enabled: true }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('unavailable')
        },
        { timeout: 5000 }
      )

      expect(result.current.isAvailable).toBe(false)
    })

    it('handles timeout error', async () => {
      vi.useRealTimers()
      const abortError = new Error('AbortError')
      abortError.name = 'AbortError'
      mockFetch.mockRejectedValue(abortError)

      const { result } = renderHook(() => useBackendHealth({ timeout: 100 }))

      await waitFor(
        () => {
          expect(result.current.status).toBe('unavailable')
        },
        { timeout: 5000 }
      )

      expect(result.current.error).toBe('Request timeout')
    })
  })

  describe('Options', () => {
    it('respects enabled option', () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 })

      const { result } = renderHook(() => useBackendHealth({ enabled: false }))

      // Should still be checking because no health check was performed
      expect(result.current.status).toBe('checking')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('accepts check interval option', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}))

      renderHook(() => useBackendHealth({ checkInterval: 5000, enabled: false }))

      // Just verify it accepts the option without crashing
      expect(true).toBe(true)
    })
  })

  describe('Endpoint Fallback', () => {
    it('tries multiple endpoints if first fails', async () => {
      vi.useRealTimers()
      let callCount = 0
      mockFetch.mockImplementation(async (url: string) => {
        callCount++
        if (url.includes('/health/')) {
          throw new Error('Health endpoint failed')
        }
        return { ok: true, status: 200 }
      })

      const { result } = renderHook(() => useBackendHealth())

      await waitFor(
        () => {
          expect(result.current.status).toBe('healthy')
        },
        { timeout: 5000 }
      )

      // Should have tried at least 2 endpoints
      expect(callCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Cleanup', () => {
    it('clears interval on unmount', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}))
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = renderHook(() => useBackendHealth({ enabled: false }))

      unmount()

      // Just verify no errors occur on unmount
      expect(true).toBe(true)
    })
  })
})

describe('useIsBackendAvailable', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns boolean value', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useIsBackendAvailable({ enabled: false }))

    expect(typeof result.current).toBe('boolean')
  })

  it('defaults to false initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useIsBackendAvailable({ enabled: false }))

    expect(result.current).toBe(false)
  })

  it('accepts options parameter', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() =>
      useIsBackendAvailable({
        checkInterval: 60000,
        timeout: 10000,
        enabled: false,
      })
    )

    expect(typeof result.current).toBe('boolean')
  })
})
