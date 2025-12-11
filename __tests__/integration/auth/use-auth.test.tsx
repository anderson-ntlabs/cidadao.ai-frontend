/**
 * Auth Hook Integration Tests
 *
 * Tests for the consolidated useAuth hook from use-supabase-auth.tsx
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/hooks/use-supabase-auth'
import React from 'react'

// Mock Next.js router
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
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

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock navigation session service
vi.mock('@/lib/services/navigation-session.service', () => ({
  navigationSessionService: {
    logout: vi.fn().mockResolvedValue(undefined),
    clearAllSessionStorage: vi.fn(),
  },
}))

// Mock Supabase client
const mockGetUser = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  }),
}))

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useAuth Hook - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Default mock implementations
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  describe('Authentication State', () => {
    it('initializes with loading state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Initial loading state
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('shows unauthenticated state when no user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('shows authenticated state when user exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
        app_metadata: { role: 'user' },
      }

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).not.toBeNull()
      expect(result.current.user?.id).toBe('user-123')
      expect(result.current.user?.email).toBe('test@example.com')
      expect(result.current.user?.name).toBe('Test User')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('OAuth Provider Login', () => {
    it('initiates OAuth flow with provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.loginWithProvider('github')

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback'),
        }),
      })
    })
  })

  describe('Throws error when used outside provider', () => {
    it('throws error when useAuth is used without AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})
