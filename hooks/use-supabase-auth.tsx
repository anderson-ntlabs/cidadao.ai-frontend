'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { toast } from './use-toast'
import { createLogger } from '@/lib/logger'
import { navigationSessionService } from '@/lib/services/navigation-session.service'

const logger = createLogger('SupabaseAuth')

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Convert Supabase user to our User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    // Google OAuth provides: full_name, avatar_url, email, provider_id
    // GitHub OAuth provides: user_name, avatar_url, email, preferred_username
    const metadata = supabaseUser.user_metadata || {}

    // Get name from different possible fields
    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      metadata.preferred_username ||
      supabaseUser.email!.split('@')[0]

    // Get avatar with fallback
    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`

    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: name,
      role: supabaseUser.app_metadata?.role || 'user',
      avatar: avatar,
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    // Detect if we just came from OAuth callback (using URL param only)
    // Cookie oauth_session_ready is httpOnly and cannot be read by JS
    const isOAuthComplete =
      typeof window !== 'undefined' && window.location.search.includes('oauth_complete=')

    const checkSession = async (retryCount = 0): Promise<boolean> => {
      try {
        logger.debug(`Checking session... (attempt ${retryCount + 1})`)

        // Use getUser() instead of getSession() for more reliable auth check
        // getUser() validates the token with the server
        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          // Token might not be ready yet after OAuth
          if (isOAuthComplete && retryCount < 5) {
            logger.debug(`Auth error during OAuth flow, retrying in ${300 * (retryCount + 1)}ms...`)
            await new Promise((resolve) => setTimeout(resolve, 300 * (retryCount + 1)))
            return checkSession(retryCount + 1)
          }
          logger.error('Session error', { error })
          setUser(null)
          setIsAuthenticated(false)
          return false
        }

        if (supabaseUser) {
          const user = convertSupabaseUser(supabaseUser)
          logger.info('Session found', {
            userId: user.id,
            email: user.email,
            name: user.name,
          })
          setUser(user)
          setIsAuthenticated(true)

          // Clean up URL if it has oauth_complete param
          if (typeof window !== 'undefined' && window.location.search.includes('oauth_complete=')) {
            const url = new URL(window.location.href)
            url.searchParams.delete('oauth_complete')
            window.history.replaceState({}, '', url.pathname + url.search)
          }

          return true
        } else {
          // Retry with exponential backoff if OAuth just completed
          if (isOAuthComplete && retryCount < 5) {
            const delay = 300 * (retryCount + 1) // 300ms, 600ms, 900ms, 1200ms, 1500ms
            logger.debug(`No session but OAuth completed, retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return checkSession(retryCount + 1)
          }

          logger.debug('No session found')
          setUser(null)
          setIsAuthenticated(false)
          return false
        }
      } catch (error) {
        logger.error('Unexpected auth error', { error })
        setUser(null)
        setIsAuthenticated(false)
        return false
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      logger.warn('Check timeout (8s) - forcing loading state to false')
      setIsLoading(false)
    }, 8000)

    checkSession().finally(() => {
      clearTimeout(timeout)
      setIsLoading(false)
      logger.debug('Session check finalized')
    })

    // Listen for auth changes - this catches OAuth completion reliably
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed', { event, hasSession: !!session })

      if (session?.user) {
        setUser(convertSupabaseUser(session.user))
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          const convertedUser = convertSupabaseUser(data.user)
          setUser(convertedUser)
          setIsAuthenticated(true)

          toast.success(`Bem-vindo(a), ${convertedUser.name}!`, 'Login realizado com sucesso')

          // Handle redirect
          const redirectUrl = localStorage.getItem('redirectAfterLogin')
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin')
            router.push(redirectUrl)
          } else {
            router.push('/pt/app')
          }
        }
      } catch (error: any) {
        logger.error('Login error', { error })
        toast.error('Falha no login', error.message || 'Verifique suas credenciais')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router]
  )

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
          },
        })

        if (error) throw error

        if (data.user) {
          toast.success(
            'Conta criada com sucesso!',
            'Verifique seu email para confirmar o cadastro'
          )
        }
      } catch (error: any) {
        logger.error('Signup error', { error })
        toast.error('Erro ao criar conta', error.message || 'Tente novamente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  const loginWithProvider = useCallback(
    async (provider: 'google' | 'github') => {
      setIsLoading(true)

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
          },
        })

        if (error) throw error
      } catch (error: any) {
        logger.error('OAuth login error', { error })
        toast.error('Erro no login social', error.message || 'Tente novamente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      // Use centralized navigation session service for complete cleanup
      await navigationSessionService.logout()

      // Clear state
      setUser(null)
      setIsAuthenticated(false)

      // Clear any auth-related local storage (legacy cleanup)
      localStorage.removeItem('redirectAfterLogin')
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()

      // Show success message
      toast.success('Logout realizado com sucesso', 'Até logo!')

      // Force redirect to landing page with full page reload
      // Using window.location instead of router to ensure clean state
      window.location.href = '/pt'
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente'
      logger.error('Logout error', { error })
      toast.error('Erro ao sair', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()
      if (error) throw error

      if (session?.user) {
        setUser(convertSupabaseUser(session.user))
        setIsAuthenticated(true)
      }
    } catch (error) {
      logger.error('Session refresh error', { error })
      await logout()
    }
  }, [supabase, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithProvider,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
