'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api/auth.service'
import { createLogger } from '@/lib/logger'
import { toast } from './use-toast'

const logger = createLogger('Auth')

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      // First check backend auth
      if (authService.isAuthenticated()) {
        // Try to get current user from backend
        const userInfo = await authService.getCurrentUser()
        setUser({
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=16a34a&color=fff`,
        })
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // Then check Supabase session (for OAuth users)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const metadata = session.user.user_metadata || {}
        const name =
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          metadata.preferred_username ||
          session.user.email!.split('@')[0]

        const avatar =
          metadata.avatar_url ||
          metadata.picture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`

        setUser({
          id: session.user.id,
          name: name,
          email: session.user.email!,
          role: session.user.app_metadata?.role || 'user',
          avatar: avatar,
        })
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      logger.error('Auth check failed', { error })
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        // Try real authentication first
        const response = await authService.login(email, password)

        setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=16a34a&color=fff`,
        })
        setIsAuthenticated(true)

        toast.success(`Bem-vindo(a), ${response.user.name}!`, 'Login realizado com sucesso')

        // Handle redirect
        const redirectUrl = localStorage.getItem('redirectAfterLogin')
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin')
          router.push(redirectUrl)
        } else {
          router.push('/pt/app')
        }
      } catch (error) {
        logger.error('Login failed', { error })
        toast.error('Falha no login', 'Verifique suas credenciais e tente novamente')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const loginWithProvider = useCallback(
    async (provider: string) => {
      setIsLoading(true)

      try {
        // Real OAuth flow using Supabase
        // Dynamic import to avoid SSR issues
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as 'google' | 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
          },
        })

        if (error) throw error

        // OAuth will redirect to provider, then back to callback
        // So we don't set user state here - it happens after redirect
      } catch (error) {
        logger.error('Provider login failed', { error })
        toast.error('Falha no login', 'Tente novamente mais tarde')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      // Try real logout if authenticated with backend
      if (authService.isAuthenticated()) {
        await authService.logout()
      }

      // Also logout from Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      logger.error('Logout error', { error })
    } finally {
      // Always clear local state
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('redirectAfterLogin')
      localStorage.removeItem('supabase.auth.token')

      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)

      router.push('/pt/login')
    }
  }, [router])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithProvider,
    logout,
    checkAuth,
  }
}
