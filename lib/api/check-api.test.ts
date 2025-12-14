/**
 * Tests for API Check Utility
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
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

import { checkAPIEndpoints } from './check-api'

describe('checkAPIEndpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should test multiple backend URLs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'healthy' }),
      text: () => Promise.resolve('OK'),
    })

    await checkAPIEndpoints()

    // Should have made calls to various endpoints
    expect(mockFetch).toHaveBeenCalled()
  })

  it('should handle health check errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(checkAPIEndpoints()).resolves.not.toThrow()
  })

  it('should handle non-ok responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server error'),
    })

    await expect(checkAPIEndpoints()).resolves.not.toThrow()
  })

  it('should test health endpoint with trailing slash', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'healthy' }),
      text: () => Promise.resolve('OK'),
    })

    await checkAPIEndpoints()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const healthCalls = calls.filter((url) => url.includes('/health/'))
    expect(healthCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should test docs endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('OK'),
    })

    await checkAPIEndpoints()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const docsCalls = calls.filter((url) => url.includes('/docs'))
    expect(docsCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should test chat message endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('OK'),
    })

    await checkAPIEndpoints()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const chatCalls = calls.filter((url) => url.includes('/api/v1/chat/message'))
    expect(chatCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('should include saved backend URL from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('https://custom-backend.example.com')

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('OK'),
    })

    await checkAPIEndpoints()

    const calls = mockFetch.mock.calls.map((call) => call[0])
    const customCalls = calls.filter((url) => url.includes('custom-backend.example.com'))
    expect(customCalls.length).toBeGreaterThanOrEqual(1)
  })
})
