import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthIntegrationService } from './auth-integration.service'
import axios from 'axios'

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  }),
}))

vi.mock('axios')

describe('AuthIntegrationService', () => {
  let service: AuthIntegrationService
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthIntegrationService()
    mockSupabase = (service as any).supabase

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getSessionToken', () => {
    it('should return access token when session exists', async () => {
      const mockToken = 'test-access-token'
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: mockToken } },
      })

      const token = await service.getSessionToken()
      expect(token).toBe(mockToken)
    })

    it('should return null when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const token = await service.getSessionToken()
      expect(token).toBeNull()
    })

    it('should return null when session has no access token', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: {} },
      })

      const token = await service.getSessionToken()
      expect(token).toBeNull()
    })
  })

  describe('registerWithBackend', () => {
    it('should successfully register user with backend', async () => {
      const mockToken = 'test-token'
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        app_metadata: { provider: 'google' },
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: mockToken } },
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      vi.mocked(axios.post).mockResolvedValue({ status: 201 })

      const result = await service.registerWithBackend()

      expect(result).toBe(true)
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          supabase_id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          provider: 'google',
        },
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('should use email prefix as name when full_name is not available', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        user_metadata: {},
        app_metadata: {},
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      vi.mocked(axios.post).mockResolvedValue({ status: 200 })

      await service.registerWithBackend()

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'john.doe',
          provider: 'email',
        }),
        expect.any(Object)
      )
    })

    it('should return false when no session token', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const result = await service.registerWithBackend()
      expect(result).toBe(false)
      expect(axios.post).not.toHaveBeenCalled()
    })

    it('should return false when no user data', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await service.registerWithBackend()
      expect(result).toBe(false)
    })

    it('should handle axios errors gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: '123', email: 'test@test.com' } },
      })
      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'))

      const result = await service.registerWithBackend()
      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        'Failed to register with backend:',
        expect.any(Error)
      )
    })
  })

  describe('getAuthHeaders', () => {
    it('should return headers with bearer token when authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      })

      const headers = await service.getAuthHeaders()

      expect(headers).toEqual({
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
        'X-Client-Version': '1.0.0',
      })
    })

    it('should return headers with empty authorization when not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const headers = await service.getAuthHeaders()

      expect(headers).toEqual({
        Authorization: '',
        'Content-Type': 'application/json',
        'X-Client-Type': 'web',
        'X-Client-Version': '1.0.0',
      })
    })
  })

  describe('authenticatedRequest', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      vi.mocked(axios).mockResolvedValue({ data: mockResponse })

      const result = await service.authenticatedRequest('GET', '/api/test')

      expect(result).toEqual(mockResponse)
      expect(axios).toHaveBeenCalledWith({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/test`,
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
          'X-Client-Type': 'web',
          'X-Client-Version': '1.0.0',
        },
        data: undefined,
      })
    })

    it('should make successful POST request with data', async () => {
      const postData = { key: 'value' }
      const mockResponse = { success: true }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      vi.mocked(axios).mockResolvedValue({ data: mockResponse })

      const result = await service.authenticatedRequest('POST', '/api/test', postData)

      expect(result).toEqual(mockResponse)
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/test`,
        headers: expect.any(Object),
        data: postData,
      })
    })

    it('should handle request errors and return null', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      vi.mocked(axios).mockRejectedValue(new Error('Request failed'))

      const result = await service.authenticatedRequest('GET', '/api/test')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Authenticated request failed:', expect.any(Error))
    })
  })

  describe('syncProfile', () => {
    it('should successfully sync user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      }
      const mockProfile = { id: 1, name: 'Test User' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
      })
      vi.mocked(axios).mockResolvedValue({ data: mockProfile })

      const result = await service.syncProfile()

      expect(result).toBe(true)
      expect(axios).toHaveBeenCalledWith({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/sync`,
        headers: expect.any(Object),
        data: {
          supabase_id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      })
    })

    it('should return false when no user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await service.syncProfile()
      expect(result).toBe(false)
      expect(axios).not.toHaveBeenCalled()
    })

    it('should return false when authenticatedRequest returns null', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: '123', email: 'test@test.com' } },
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      })
      vi.mocked(axios).mockResolvedValue({ data: null })

      const result = await service.syncProfile()
      expect(result).toBe(false)
    })

    it('should handle sync errors gracefully', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.syncProfile()
      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Profile sync failed:', expect.any(Error))
    })
  })
})
