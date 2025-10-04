import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/lib/api/auth.service'

// Mock Next.js router
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock auth service
vi.mock('@/lib/api/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('useAuth Hook - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Authentication State', () => {
    it('initializes with unauthenticated state', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      // Initial state
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('loads mock user from localStorage on mount', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      }

      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(mockUser))
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('loads real user when authenticated with backend', async () => {
      const mockUserResponse = {
        id: '456',
        name: 'Backend User',
        email: 'backend@example.com',
        role: 'admin',
      }

      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toMatchObject({
        id: '456',
        name: 'Backend User',
        email: 'backend@example.com',
        role: 'admin',
      })
      expect(result.current.user?.avatar).toContain('ui-avatars.com')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('Login Flow', () => {
    it('successfully logs in with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: '789',
          name: 'Login User',
          email: 'login@example.com',
        },
        token: 'mock-jwt-token',
      }

      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('login@example.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user).toMatchObject({
          id: '789',
          name: 'Login User',
          email: 'login@example.com',
        })
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(authService.login).toHaveBeenCalledWith('login@example.com', 'password123')
    })

    it('throws error when authentication fails', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      vi.mocked(authService.login).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(act(async () => {
        await result.current.login('test@example.com', 'wrong-password')
      })).rejects.toThrow('Network error')
    })
  })

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      // Setup authenticated state
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test', email: 'test@test.com' }))

      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(localStorage.getItem('isAuthenticated')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('redirects to login page after logout', async () => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test', email: 'test@test.com' }))

      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt/login')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles authentication check errors gracefully', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('throws error and calls toast.error on login failure', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(act(async () => {
        await result.current.login('wrong@example.com', 'wrongpass')
      })).rejects.toThrow('Invalid credentials')

      // Verify toast.error was called
      const { toast } = await import('@/hooks/use-toast')
      expect(toast.error).toHaveBeenCalled()
    })
  })

  describe('OAuth Provider Login', () => {
    it('successfully logs in with OAuth provider', async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.loginWithProvider('google')
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      // Check that a user was stored with an email (mock auth uses default user)
      expect(storedUser.email).toBeTruthy()
    })
  })

  describe('Check Auth Method', () => {
    it('manually checks authentication state', async () => {
      const mockUser = {
        id: '999',
        name: 'Check User',
        email: 'check@example.com',
      }

      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(result.current.user).toMatchObject(mockUser)
    })
  })
})
