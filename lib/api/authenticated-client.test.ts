/**
 * Tests for Authenticated API Client
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const mockAxiosCreate = vi.hoisted(() => vi.fn())
const mockAxiosIsAxiosError = vi.hoisted(() => vi.fn())
const mockGetAuthHeaders = vi.hoisted(() => vi.fn())

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Mock auth integration
vi.mock('./auth-integration.service', () => ({
  authIntegrationService: {
    getAuthHeaders: mockGetAuthHeaders,
  },
}))

// Create mock axios instance with interceptors
const mockInterceptors = {
  request: { use: vi.fn() },
  response: { use: vi.fn() },
}

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: mockInterceptors,
}

vi.mock('axios', () => ({
  default: {
    create: mockAxiosCreate,
    isAxiosError: mockAxiosIsAxiosError,
  },
}))

describe('AuthenticatedApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxiosCreate.mockReturnValue(mockAxiosInstance)
    mockGetAuthHeaders.mockResolvedValue({ Authorization: 'Bearer test-token' })
  })

  describe('initialization', () => {
    it('should create axios instance with correct config', async () => {
      // Re-import to trigger constructor
      vi.resetModules()
      await import('./authenticated-client')

      expect(mockAxiosCreate).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        timeout: 30000,
      })
    })

    it('should register request interceptor', async () => {
      vi.resetModules()
      await import('./authenticated-client')

      expect(mockInterceptors.request.use).toHaveBeenCalled()
    })

    it('should register response interceptor', async () => {
      vi.resetModules()
      await import('./authenticated-client')

      expect(mockInterceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('should return success response on successful GET', async () => {
      vi.resetModules()
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { test: 'data' } })
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ test: 'data' })
    })

    it('should handle GET error', async () => {
      vi.resetModules()
      const error = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(error)
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should pass config to axios', async () => {
      vi.resetModules()
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} })
      const { authenticatedApi } = await import('./authenticated-client')
      const config = { params: { page: 1 } }

      await authenticatedApi.get('/test', config)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config)
    })
  })

  describe('post', () => {
    it('should return success response on successful POST', async () => {
      vi.resetModules()
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { id: 1 } })
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.post('/test', { name: 'test' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1 })
    })

    it('should handle POST error', async () => {
      vi.resetModules()
      const error = new Error('Server error')
      mockAxiosInstance.post.mockRejectedValueOnce(error)
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.post('/test', {})

      expect(result.success).toBe(false)
    })

    it('should pass data and config to axios', async () => {
      vi.resetModules()
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} })
      const { authenticatedApi } = await import('./authenticated-client')
      const data = { name: 'test' }
      const config = { timeout: 5000 }

      await authenticatedApi.post('/test', data, config)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, config)
    })
  })

  describe('put', () => {
    it('should return success response on successful PUT', async () => {
      vi.resetModules()
      mockAxiosInstance.put.mockResolvedValueOnce({ data: { updated: true } })
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.put('/test/1', { name: 'updated' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ updated: true })
    })

    it('should handle PUT error', async () => {
      vi.resetModules()
      mockAxiosInstance.put.mockRejectedValueOnce(new Error('Error'))
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.put('/test/1', {})

      expect(result.success).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return success response on successful DELETE', async () => {
      vi.resetModules()
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: { deleted: true } })
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.delete('/test/1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ deleted: true })
    })

    it('should handle DELETE error', async () => {
      vi.resetModules()
      mockAxiosInstance.delete.mockRejectedValueOnce(new Error('Error'))
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.delete('/test/1')

      expect(result.success).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle axios error with response', async () => {
      vi.resetModules()
      const axiosError = {
        response: {
          status: 400,
          data: { message: 'Bad request', code: 'INVALID_INPUT' },
        },
        message: 'Request failed',
      }
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError)
      mockAxiosIsAxiosError.mockReturnValue(true)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Bad request')
      expect(result.error?.code).toBe('INVALID_INPUT')
    })

    it('should handle axios error without response (network error)', async () => {
      vi.resetModules()
      const axiosError = {
        request: {},
        message: 'Network error',
      }
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError)
      mockAxiosIsAxiosError.mockReturnValue(true)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network error - no response from server')
      expect(result.error?.code).toBe('NETWORK_ERROR')
    })

    it('should handle unknown errors', async () => {
      vi.resetModules()
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Unknown'))
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Unknown')
      expect(result.error?.code).toBe('UNKNOWN_ERROR')
    })

    it('should handle null error', async () => {
      vi.resetModules()
      mockAxiosInstance.get.mockRejectedValueOnce(null)
      mockAxiosIsAxiosError.mockReturnValue(false)
      const { authenticatedApi } = await import('./authenticated-client')

      const result = await authenticatedApi.get('/test')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('An unexpected error occurred')
    })
  })
})
