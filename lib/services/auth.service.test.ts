/**
 * Auth Service Tests
 *
 * Tests for the unified authentication service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mock functions (executed before imports)
const {
  mockSignInWithPassword,
  mockSignInWithOAuth,
  mockSignUp,
  mockSignOut,
  mockGetUser,
  mockGetSession,
  mockRefreshSession,
  mockOnAuthStateChange,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetUser: vi.fn(),
  mockGetSession: vi.fn(),
  mockRefreshSession: vi.fn(),
  mockOnAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}))

// Mock logger before imports
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock navigation-session.service
vi.mock('./navigation-session.service', () => ({
  navigationSessionService: {
    initAuthSession: vi.fn().mockResolvedValue(undefined),
    clearAllSessionStorage: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getUser: mockGetUser,
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}))

// Import after mocks are set up
import { authService, type AuthUser } from './auth.service'

describe('AuthService', () => {
  const mockSupabaseUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    app_metadata: {
      role: 'user',
      provider: 'github',
    },
    identities: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock returns
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUser', () => {
    it('should return null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const user = await authService.getUser()

      expect(user).toBeNull()
    })

    it('should return user when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockSupabaseUser }, error: null })

      const user = await authService.getUser()

      expect(user).not.toBeNull()
      expect(user?.id).toBe('user-123')
      expect(user?.email).toBe('test@example.com')
      expect(user?.name).toBe('Test User')
    })

    it('should return null on error', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error'),
      })

      const user = await authService.getUser()

      expect(user).toBeNull()
    })

    it('should return null when getUser throws', async () => {
      mockGetUser.mockRejectedValue(new Error('Network error'))

      const user = await authService.getUser()

      expect(user).toBeNull()
    })
  })

  describe('getSession', () => {
    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })

      const session = await authService.getSession()

      expect(session).toBeNull()
    })

    it('should return session when exists', async () => {
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        user: mockSupabaseUser,
      }
      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null })

      const session = await authService.getSession()

      expect(session).not.toBeNull()
      expect(session?.access_token).toBe('token-123')
    })

    it('should return null on error', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      })

      const session = await authService.getSession()

      expect(session).toBeNull()
    })

    it('should return null when getSession throws', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'))

      const session = await authService.getSession()

      expect(session).toBeNull()
    })
  })

  describe('loginWithPassword', () => {
    it('should login successfully', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockSupabaseUser, session: {} },
        error: null,
      })

      const result = await authService.loginWithPassword('test@example.com', 'password123')

      expect(result.user).not.toBeNull()
      expect(result.error).toBeNull()
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should return error on failed login', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      })

      const result = await authService.loginWithPassword('test@example.com', 'wrongpassword')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Invalid credentials')
    })

    it('should return error when no user returned', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const result = await authService.loginWithPassword('test@example.com', 'password')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Login failed')
    })

    it('should handle exceptions', async () => {
      mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

      const result = await authService.loginWithPassword('test@example.com', 'password')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Network error')
    })
  })

  describe('loginWithProvider', () => {
    it('should initiate OAuth login successfully', async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

      const result = await authService.loginWithProvider('github')

      expect(result.error).toBeNull()
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: expect.objectContaining({
          scopes: 'read:user user:email',
        }),
      })
    })

    it('should add next param to redirect URL', async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

      await authService.loginWithProvider('google', 'http://localhost/auth/callback', '/pt/agora')

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('next=%2Fpt%2Fagora'),
        }),
      })
    })

    it('should return error on OAuth failure', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' },
      })

      const result = await authService.loginWithProvider('github')

      expect(result.error).toBe('OAuth failed')
    })

    it('should handle exceptions', async () => {
      mockSignInWithOAuth.mockRejectedValue(new Error('Network error'))

      const result = await authService.loginWithProvider('github')

      expect(result.error).toBe('Network error')
    })
  })

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: mockSupabaseUser, session: null },
        error: null,
      })

      const result = await authService.signUp('test@example.com', 'password123', {
        name: 'Test User',
      })

      expect(result.user).not.toBeNull()
      expect(result.error).toBeNull()
    })

    it('should return error on sign up failure', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      })

      const result = await authService.signUp('existing@example.com', 'password123')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Email already exists')
    })

    it('should return error when no user returned', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const result = await authService.signUp('test@example.com', 'password')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Sign up failed')
    })

    it('should handle exceptions', async () => {
      mockSignUp.mockRejectedValue(new Error('Network error'))

      const result = await authService.signUp('test@example.com', 'password')

      expect(result.user).toBeNull()
      expect(result.error).toBe('Network error')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { navigationSessionService } = await import('./navigation-session.service')

      await authService.logout()

      expect(navigationSessionService.logout).toHaveBeenCalled()
    })

    it('should handle logout errors gracefully', async () => {
      const { navigationSessionService } = await import('./navigation-session.service')
      vi.mocked(navigationSessionService.logout).mockRejectedValue(new Error('Logout error'))

      // Should not throw
      await expect(authService.logout()).resolves.not.toThrow()
    })
  })

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { user: mockSupabaseUser, session: {} },
        error: null,
      })

      const result = await authService.refreshSession()

      expect(result.user).not.toBeNull()
      expect(result.error).toBeNull()
    })

    it('should return error on refresh failure', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Token expired' },
      })

      const result = await authService.refreshSession()

      expect(result.user).toBeNull()
      expect(result.error).toBe('Token expired')
    })

    it('should return error when no user after refresh', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      const result = await authService.refreshSession()

      expect(result.user).toBeNull()
      expect(result.error).toBe('Session refresh failed')
    })

    it('should handle exceptions', async () => {
      mockRefreshSession.mockRejectedValue(new Error('Network error'))

      const result = await authService.refreshSession()

      expect(result.user).toBeNull()
      expect(result.error).toBe('Network error')
    })
  })

  describe('Redirect URL Management', () => {
    beforeEach(() => {
      // Create mock window.localStorage
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            origin: 'http://localhost:3000',
          },
        },
        writable: true,
      })
    })

    it('should save valid redirect URL', () => {
      const mockStorage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value
        },
        removeItem: (key: string) => {
          delete mockStorage[key]
        },
        clear: () => {
          Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        },
      })

      authService.saveRedirectUrl('/pt/app/dashboard')

      expect(mockStorage['redirectAfterLogin']).toBe('/pt/app/dashboard')

      vi.unstubAllGlobals()
    })

    it('should not save invalid redirect URLs', () => {
      const mockStorage: Record<string, string> = {}
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value
        },
        removeItem: (key: string) => {
          delete mockStorage[key]
        },
        clear: () => {
          Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        },
      })

      authService.saveRedirectUrl('/pt/login')

      expect(mockStorage['redirectAfterLogin']).toBeUndefined()

      vi.unstubAllGlobals()
    })

    it('should get and clear redirect URL', () => {
      const mockStorage: Record<string, string> = {
        redirectAfterLogin: '/pt/app/chat',
      }
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value
        },
        removeItem: (key: string) => {
          delete mockStorage[key]
        },
        clear: () => {
          Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        },
      })

      const url = authService.getAndClearRedirectUrl()

      expect(url).toBe('/pt/app/chat')
      expect(mockStorage['redirectAfterLogin']).toBeUndefined()

      vi.unstubAllGlobals()
    })

    it('should return null and clear invalid stored URL', () => {
      const mockStorage: Record<string, string> = {
        redirectAfterLogin: '/pt/login',
      }
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value
        },
        removeItem: (key: string) => {
          delete mockStorage[key]
        },
        clear: () => {
          Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
        },
      })

      const url = authService.getAndClearRedirectUrl()

      expect(url).toBeNull()
      expect(mockStorage['redirectAfterLogin']).toBeUndefined()

      vi.unstubAllGlobals()
    })
  })

  describe('getDefaultRedirect', () => {
    it('should return agora path when coming from agora', () => {
      const redirect = authService.getDefaultRedirect('/pt/agora/dashboard')

      expect(redirect).toBe('/pt/agora')
    })

    it('should return app path by default', () => {
      const redirect = authService.getDefaultRedirect('/some/other/path')

      expect(redirect).toBe('/pt/app')
    })

    it('should return app path when origin is undefined', () => {
      const redirect = authService.getDefaultRedirect()

      expect(redirect).toBe('/pt/app')
    })
  })

  describe('subscribe', () => {
    it('should add callback to listeners', () => {
      const callback = vi.fn()

      const unsubscribe = authService.subscribe(callback)

      expect(typeof unsubscribe).toBe('function')
    })

    it('should unsubscribe when function is called', () => {
      const callback = vi.fn()

      const unsubscribe = authService.subscribe(callback)
      unsubscribe()

      // Second unsubscribe should not throw
      expect(() => unsubscribe()).not.toThrow()
    })
  })

  describe('Utility Methods', () => {
    it('isAuthenticatedSync should return authentication state', () => {
      // Initially should be false
      const isAuth = authService.isAuthenticatedSync()
      expect(typeof isAuth).toBe('boolean')
    })

    it('getCurrentUser should return cached user', () => {
      const user = authService.getCurrentUser()
      // May be null or AuthUser depending on state
      expect(user === null || typeof user === 'object').toBe(true)
    })

    it('isReady should return initialization state', () => {
      const isReady = authService.isReady()
      expect(typeof isReady).toBe('boolean')
    })

    it('getSupabaseClient should return supabase client', () => {
      const client = authService.getSupabaseClient()
      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
    })
  })

  describe('User Conversion', () => {
    it('should convert user with full metadata', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-456',
            email: 'full@example.com',
            user_metadata: {
              full_name: 'Full User',
              avatar_url: 'https://example.com/full.jpg',
              user_name: 'fulluser',
            },
            app_metadata: {
              role: 'admin',
              provider: 'github',
            },
            identities: [],
          },
        },
        error: null,
      })

      const user = await authService.getUser()

      expect(user?.name).toBe('Full User')
      expect(user?.avatar).toBe('https://example.com/full.jpg')
      expect(user?.role).toBe('admin')
      expect(user?.githubUsername).toBe('fulluser')
    })

    it('should fallback to email prefix for name', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-789',
            email: 'noname@example.com',
            user_metadata: {},
            app_metadata: {},
            identities: [],
          },
        },
        error: null,
      })

      const user = await authService.getUser()

      expect(user?.name).toBe('noname')
    })

    it('should generate avatar URL when not provided', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-999',
            email: 'noavatar@example.com',
            user_metadata: {
              full_name: 'No Avatar',
            },
            app_metadata: {},
            identities: [],
          },
        },
        error: null,
      })

      const user = await authService.getUser()

      expect(user?.avatar).toContain('ui-avatars.com')
      expect(user?.avatar).toContain('No%20Avatar')
    })

    it('should use identity data for avatar fallback', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-identity',
            email: 'identity@example.com',
            user_metadata: {},
            app_metadata: {},
            identities: [
              {
                identity_data: {
                  avatar_url: 'https://github.com/avatar.jpg',
                },
              },
            ],
          },
        },
        error: null,
      })

      const user = await authService.getUser()

      expect(user?.avatar).toBe('https://github.com/avatar.jpg')
    })
  })
})
