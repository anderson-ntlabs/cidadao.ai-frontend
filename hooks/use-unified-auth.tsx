/**
 * Unified Auth Hook
 *
 * Single React hook for all authentication needs across the application.
 * Wraps AuthService with React state management and Context.
 *
 * Usage:
 * - Wrap your app with <UnifiedAuthProvider>
 * - Use useUnifiedAuth() in components
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Provider } from '@supabase/supabase-js'
import { authService, AuthUser } from '@/lib/services/auth.service'
import { createLogger } from '@/lib/logger'

const logger = createLogger('UnifiedAuth')

// ============================================
// Types
// ============================================

export interface UseUnifiedAuthReturn {
  // State
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  loginWithProvider: (provider: 'google' | 'github', redirectTo?: string) => Promise<boolean>
  signUp: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// ============================================
// Context
// ============================================

const UnifiedAuthContext = createContext<UseUnifiedAuthReturn | undefined>(undefined)

// ============================================
// Provider Component
// ============================================

interface UnifiedAuthProviderProps {
  children: React.ReactNode
  redirectOnLogout?: string
}

export function UnifiedAuthProvider({
  children,
  redirectOnLogout = '/pt',
}: UnifiedAuthProviderProps) {
  const router = useRouter()

  // State
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const isAuthenticated = user !== null

  // Initialize - check for existing session
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const currentUser = await authService.getUser()
        if (isMounted) {
          setUser(currentUser)
          setIsLoading(false)
        }
      } catch (err) {
        logger.error('Failed to initialize auth', { error: err })
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((event, authUser) => {
      if (!isMounted) return

      logger.debug('Auth event received', { event, hasUser: !!authUser })

      if (event === 'SIGNED_IN' && authUser) {
        setUser(authUser)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && authUser) {
        setUser(authUser)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // Login with email/password
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    const result = await authService.loginWithPassword(email, password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return false
    }

    if (result.user) {
      setUser(result.user)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }, [])

  // Login with OAuth provider
  const loginWithProvider = useCallback(
    async (provider: 'google' | 'github', redirectTo?: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      const result = await authService.loginWithProvider(provider as Provider, redirectTo)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return false
      }

      // OAuth redirects, so we keep loading state
      return true
    },
    []
  )

  // Sign up
  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      const result = await authService.signUp(email, password, name ? { name } : undefined)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return false
      }

      setIsLoading(false)
      return true
    },
    []
  )

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    await authService.logout()

    setUser(null)
    setIsLoading(false)

    // Redirect after logout
    if (redirectOnLogout) {
      router.push(redirectOnLogout)
    }
  }, [router, redirectOnLogout])

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    const result = await authService.refreshSession()

    if (result.user) {
      setUser(result.user)
    } else if (result.error) {
      // Session expired, logout
      await logout()
    }
  }, [logout])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Memoized context value
  const contextValue = useMemo(
    (): UseUnifiedAuthReturn => ({
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      loginWithProvider,
      signUp,
      logout,
      refreshSession,
      clearError,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      loginWithProvider,
      signUp,
      logout,
      refreshSession,
      clearError,
    ]
  )

  return <UnifiedAuthContext.Provider value={contextValue}>{children}</UnifiedAuthContext.Provider>
}

// ============================================
// Hook
// ============================================

export function useUnifiedAuth(): UseUnifiedAuthReturn {
  const context = useContext(UnifiedAuthContext)

  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider')
  }

  return context
}

// ============================================
// Convenience Exports
// ============================================

// Re-export types
export type { AuthUser }
