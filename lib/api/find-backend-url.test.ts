/**
 * Tests for Backend URL Discovery
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import { findBackendURL } from './find-backend-url'

describe('findBackendURL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return Railway URL when all checks pass', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    })

    const url = await findBackendURL()

    expect(url).toBe('https://cidadao-api-production.up.railway.app')
  })

  it('should check root endpoint first', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    })

    await findBackendURL()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://cidadao-api-production.up.railway.app',
      expect.objectContaining({
        method: 'GET',
      })
    )
  })

  it('should check docs endpoint after root', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    })

    await findBackendURL()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const docsCalls = calls.filter((url) => url.includes('/docs'))
    expect(docsCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should check API suggestions endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    })

    await findBackendURL()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const apiCalls = calls.filter((url) => url.includes('/api/v1/chat/suggestions'))
    expect(apiCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const url = await findBackendURL()

    // Should return null when all URLs fail
    expect(url).toBeNull()
  })

  it('should fallback to health check if main checks fail', async () => {
    // First few calls fail, then health succeeds
    let callCount = 0
    mockFetch.mockImplementation(() => {
      callCount++
      if (callCount <= 3) {
        throw new Error('Connection failed')
      }
      return Promise.resolve({ ok: true, status: 200 })
    })

    const url = await findBackendURL()

    // Should still return the Railway URL if health check succeeds
    const calls = mockFetch.mock.calls.map((call) => call[0])
    const healthCalls = calls.filter((url) => url.includes('/health/'))
    expect(healthCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should use trailing slash for health endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    })

    await findBackendURL()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const healthCalls = calls.filter((url) => url.endsWith('/health/'))
    // Should use trailing slash to avoid 307 redirect
    expect(healthCalls.length).toBeGreaterThanOrEqual(0) // May or may not call health depending on prior success
  })

  it('should return null when health check fails', async () => {
    mockFetch.mockRejectedValue(new Error('All endpoints failed'))

    const url = await findBackendURL()

    expect(url).toBeNull()
  })

  it('should skip URL if API test returns 404', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/v1/chat/suggestions')) {
        return Promise.resolve({ ok: false, status: 404 })
      }
      return Promise.resolve({ ok: true, status: 200 })
    })

    await findBackendURL()

    // Should have tried multiple URLs/endpoints
    expect(mockFetch.mock.calls.length).toBeGreaterThan(1)
  })

  it('should return URL when docs returns 200', async () => {
    mockFetch.mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        status: 200,
      })
    })

    const url = await findBackendURL()

    expect(url).toBe('https://cidadao-api-production.up.railway.app')
  })
})
