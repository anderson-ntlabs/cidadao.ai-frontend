'use client'

/**
 * Unified Auth Hook
 *
 * Single hook for authentication state across the entire application.
 * Wraps authService singleton to provide React state management.
 *
 * This hook should be used instead of:
 * - use-supabase-auth.tsx (for /pt/app/*)
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-10
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Provider, AuthChangeEvent } from '@supabase/supabase-js'
import { authService, AuthUser } from '@/lib/services/auth.service'
import { createLogger } from '@/lib/logger'
import { toast } from './use-toast'

const logger = createLogger('useAuth')

export interface UseAuthReturn {
  // State
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: Provider | string, nextPath?: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: (redirectTo?: string) => Promise<void>
  refreshSession: () => Promise<void>
  checkAuth: () => Promise<void>

  // Utilities
  saveRedirectUrl: (url: string) => void
  getDefaultRedirect: (origin?: string) => string
}

/**
 * Hook for authentication state and actions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, loginWithProvider } = useAuth()
 *
 *   if (isLoading) return <Loading />
 *   if (!user) return <LoginButton onClick={() => loginWithProvider('github')} />
 *
 *   return <div>Welcome, {user.name}!</div>
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize and subscribe to auth changes
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        // Wait for auth service to initialize
        const initialUser = await authService.waitForInit()

        if (mounted) {
          setUser(initialUser)
          setIsLoading(false)
          logger.debug('Auth hook initialized', { hasUser: !!initialUser })
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize auth')
          setIsLoading(false)
          logger.error('Auth initialization failed', { error: err })
        }
      }
    }

    initialize()

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(
      (event: AuthChangeEvent, authUser: AuthUser | null) => {
        if (!mounted) return

        logger.debug('Auth state update received', { event, hasUser: !!authUser })

        if (event === 'SIGNED_IN' && authUser) {
          setUser(authUser)
          setError(null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && authUser) {
          setUser(authUser)
        }

        // Always set loading to false after auth events
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  // Check auth manually (useful for re-checking after OAuth)
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      const currentUser = await authService.getUser()
      setUser(currentUser)
    } catch (err) {
      logger.error('Auth check failed', { error: err })
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login with email/password
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await authService.loginWithPassword(email, password)

        if (result.error) {
          setError(result.error)
          toast.error('Falha no login', result.error)
          throw new Error(result.error)
        }

        if (result.user) {
          setUser(result.user)
          toast.success(`Bem-vindo(a), ${result.user.name}!`, 'Login realizado com sucesso')

          // Handle redirect
          const redirectUrl = authService.getAndClearRedirectUrl()
          if (redirectUrl) {
            router.push(redirectUrl)
          } else {
            router.push('/pt/app')
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  // Login with OAuth provider
  const loginWithProvider = useCallback(async (provider: Provider | string, nextPath?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const result = await authService.loginWithProvider(
        provider as Provider,
        redirectTo,
        nextPath || '/pt/app'
      )

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        toast.error('Erro no login social', result.error)
        throw new Error(result.error)
      }

      // OAuth redirects to provider, page will navigate away
      // Loading stays true until redirect happens
    } catch (err) {
      setIsLoading(false)
      throw err
    }
  }, [])

  // Sign up with email/password
  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authService.signUp(email, password, name ? { name } : undefined)

      if (result.error) {
        setError(result.error)
        toast.error('Erro ao criar conta', result.error)
        throw new Error(result.error)
      }

      toast.success('Conta criada com sucesso!', 'Verifique seu email para confirmar o cadastro')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async (redirectTo?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.logout()
      setUser(null)
      toast.success('Logout realizado com sucesso', 'Ate logo!')

      // Redirect
      const finalRedirect = redirectTo || '/pt'
      window.location.href = finalRedirect
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      toast.error('Erro ao sair', message)
      logger.error('Logout failed', { error: err })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const result = await authService.refreshSession()

      if (result.user) {
        setUser(result.user)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      logger.error('Session refresh failed', { error: err })
    }
  }, [])

  // Utility: Save redirect URL
  const saveRedirectUrl = useCallback((url: string) => {
    authService.saveRedirectUrl(url)
  }, [])

  // Utility: Get default redirect
  const getDefaultRedirect = useCallback((origin?: string) => {
    return authService.getDefaultRedirect(origin)
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    loginWithProvider,
    signup,
    logout,
    refreshSession,
    checkAuth,
    saveRedirectUrl,
    getDefaultRedirect,
  }
}

// Re-export types for convenience
export type { AuthUser } from '@/lib/services/auth.service'
