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

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
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

    it('does not load user when both backend and Supabase auth fail', async () => {
      // Note: The new auth implementation checks backend first, then Supabase
      // localStorage is no longer checked directly during checkAuth
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        })
      )
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // New behavior: without backend or Supabase session, user is null
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
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

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong-password')
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      // Setup authenticated state via backend
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'user' }

      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      // Wait for user to be authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      // Verify logout cleared state
      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(localStorage.getItem('isAuthenticated')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('redirects to login page after logout', async () => {
      // Setup authenticated state via backend
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'user' }

      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuth())

      // Wait for user to be authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      // Verify redirect happened
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

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass')
        })
      ).rejects.toThrow('Invalid credentials')

      // Verify toast.error was called
      const { toast } = await import('@/hooks/use-toast')
      expect(toast.error).toHaveBeenCalled()
    })
  })

  describe('OAuth Provider Login', () => {
    it('initiates OAuth flow without immediate authentication', async () => {
      // OAuth is handled by Supabase which redirects to provider
      // The actual authentication happens after callback
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call loginWithProvider - it should not throw
      await act(async () => {
        await result.current.loginWithProvider('google')
      })

      // OAuth doesn't set authentication state immediately
      // User stays unauthenticated until callback completes
      expect(result.current.isAuthenticated).toBe(false)
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
