/**
 * Tests for API Client
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const mockAxiosRequest = vi.hoisted(() => vi.fn())
const mockAxiosCreate = vi.hoisted(() => vi.fn())

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Mock ensure-https
vi.mock('@/lib/utils/ensure-https', () => ({
  getSecureApiUrl: () => 'https://api.test.com',
}))

// Setup axios mock
const mockInterceptors = {
  request: { use: vi.fn() },
  response: { use: vi.fn() },
}

const mockAxiosInstance = {
  request: mockAxiosRequest,
  interceptors: mockInterceptors,
}

vi.mock('axios', () => ({
  default: {
    create: mockAxiosCreate,
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxiosCreate.mockReturnValue(mockAxiosInstance)
  })

  describe('module initialization', () => {
    it('should create axios instance with correct config', async () => {
      vi.resetModules()
      await import('./client')

      expect(mockAxiosCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        withCredentials: false,
      })
    })

    it('should register request interceptor', async () => {
      vi.resetModules()
      await import('./client')

      expect(mockInterceptors.request.use).toHaveBeenCalled()
    })

    it('should register response interceptor', async () => {
      vi.resetModules()
      await import('./client')

      expect(mockInterceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('apiRequest', () => {
    it('should return success response on successful request', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: { id: 1, name: 'test' } })
      const { apiRequest } = await import('./client')

      const result = await apiRequest({ method: 'GET', url: '/test' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'test' })
    })

    it('should return error response on request failure', async () => {
      vi.resetModules()
      mockAxiosRequest.mockRejectedValueOnce({
        message: 'Test error',
        status: 500,
        code: 'SERVER_ERROR',
        response: { data: { detail: 'Server error details' } },
      })
      const { apiRequest } = await import('./client')

      const result = await apiRequest({ method: 'GET', url: '/test' })

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Test error')
      expect(result.error?.status).toBe(500)
    })

    it('should handle undefined error message', async () => {
      vi.resetModules()
      mockAxiosRequest.mockRejectedValueOnce({})
      const { apiRequest } = await import('./client')

      const result = await apiRequest({ method: 'GET', url: '/test' })

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('An error occurred')
    })
  })

  describe('api convenience methods', () => {
    it('should call GET with correct config', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: {} })
      const { api } = await import('./client')

      await api.get('/users')

      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/users',
        })
      )
    })

    it('should call POST with data', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: {} })
      const { api } = await import('./client')

      await api.post('/users', { name: 'test' })

      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          data: { name: 'test' },
        })
      )
    })

    it('should call PUT with data', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: {} })
      const { api } = await import('./client')

      await api.put('/users/1', { name: 'updated' })

      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/1',
          data: { name: 'updated' },
        })
      )
    })

    it('should call DELETE', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: {} })
      const { api } = await import('./client')

      await api.delete('/users/1')

      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/users/1',
        })
      )
    })

    it('should call PATCH with data', async () => {
      vi.resetModules()
      mockAxiosRequest.mockResolvedValueOnce({ data: {} })
      const { api } = await import('./client')

      await api.patch('/users/1', { status: 'active' })

      expect(mockAxiosRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          url: '/users/1',
          data: { status: 'active' },
        })
      )
    })
  })

  describe('exports', () => {
    it('should export API_BASE_URL', async () => {
      vi.resetModules()
      const { API_BASE_URL } = await import('./client')

      expect(API_BASE_URL).toBe('https://api.test.com')
    })

    it('should export WS_BASE_URL', async () => {
      vi.resetModules()
      const { WS_BASE_URL } = await import('./client')

      expect(WS_BASE_URL).toBe('wss://api.test.com')
    })

    it('should export default apiClient', async () => {
      vi.resetModules()
      const module = await import('./client')

      expect(module.default).toBeDefined()
    })
  })
})
