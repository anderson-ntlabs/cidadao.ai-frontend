'use client'

/**
 * Unified Auth Hook
 *
 * Single source of truth for authentication in the Agora platform.
 * Combines functionality from:
 * - use-agora-auth.tsx (AgoraAuthProvider)
 * - auth.service.ts (AuthService)
 *
 * Key improvements:
 * - Uses unified AgoraUser type from types/agora.ts
 * - Uses user-converter.ts for consistent user conversion
 * - Single logout implementation via navigationSessionService
 * - Integrates profile loading for full Agora user data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 * @updated 2025-12-12 - Sprint 3: Unified with AgoraUser type
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Provider } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { authService } from '@/lib/services/auth.service'
import { navigationSessionService } from '@/lib/services/navigation-session.service'
import { convertToAgoraUser, type AgoraProfileRow } from '@/lib/agora/user-converter'
import { createLogger } from '@/lib/logger'
import { toast } from './use-toast'
import { useKidsStore } from '@/store/kids-store'
import type { AgoraUser, AuthUser } from '@/types/agora'

const logger = createLogger('UnifiedAuth')

// ============================================
// Types
// ============================================

export interface UseUnifiedAuthReturn {
  // State
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>
  loginWithProvider: (provider: 'google' | 'github', redirectTo?: string) => Promise<boolean>
  signUp: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void

  // Agora-specific Actions
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  checkLgpdConsent: () => Promise<boolean>
  refreshProfile: () => Promise<void>
  updateUser: (updates: Partial<AgoraUser>) => void
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
  redirectOnLogout = '/pt/agora/login',
}: UnifiedAuthProviderProps) {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<AgoraUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const isAuthenticated = user !== null

  // -------------------------
  // Load full user profile from database
  // -------------------------
  const loadUserProfile = useCallback(
    async (userId: string): Promise<AgoraUser | null> => {
      try {
        // Get Supabase user
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (!supabaseUser) return null

        // Fetch profile and consent in parallel
        const [profileResult, consentResult] = await Promise.all([
          supabase.from('agora_profiles').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('agora_consent').select('id').eq('user_id', userId).maybeSingle(),
        ])

        const profile = profileResult.data as AgoraProfileRow | null
        const hasConsent = !consentResult.error && consentResult.data !== null

        // Convert to AgoraUser using unified converter
        return convertToAgoraUser(supabaseUser, profile, hasConsent)
      } catch (e) {
        logger.error('Failed to load user profile', { error: e, userId })
        return null
      }
    },
    [supabase]
  )

  // -------------------------
  // Initialize auth state
  // -------------------------
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        // Wait for auth service to initialize
        const authUser = await authService.waitForInit()

        if (!isMounted) return

        if (authUser) {
          // Load full Agora profile
          const agoraUser = await loadUserProfile(authUser.id)
          if (isMounted && agoraUser) {
            setUser(agoraUser)
            logger.info('Auth initialized with profile', { userId: agoraUser.id })
          }
        }
        setIsLoading(false)
      } catch (err) {
        logger.error('Failed to initialize auth', { error: err })
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        logger.warn('Auth init timeout (10s)')
        setIsLoading(false)
      }
    }, 10000)

    initAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(async (event, authUser) => {
      if (!isMounted) return

      logger.debug('Auth event received', { event, hasUser: !!authUser })

      if (event === 'SIGNED_IN' && authUser) {
        const agoraUser = await loadUserProfile(authUser.id)
        if (isMounted && agoraUser) {
          setUser(agoraUser)
          setIsLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
        // Cleanup via centralized service
        navigationSessionService.clearAllSessionStorage()
        useKidsStore.getState().reset()
      } else if (event === 'TOKEN_REFRESHED' && authUser) {
        const agoraUser = await loadUserProfile(authUser.id)
        if (isMounted && agoraUser) {
          setUser(agoraUser)
        }
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [loadUserProfile])

  // -------------------------
  // Login with email/password
  // -------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      const result = await authService.loginWithPassword(email, password)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return false
      }

      if (result.user) {
        const agoraUser = await loadUserProfile(result.user.id)
        if (agoraUser) {
          setUser(agoraUser)
        }
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    },
    [loadUserProfile]
  )

  // -------------------------
  // Login with OAuth provider
  // -------------------------
  const loginWithProvider = useCallback(
    async (provider: 'google' | 'github', redirectTo?: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      const finalRedirect = redirectTo || `${window.location.origin}/auth/callback?next=/pt/agora`

      const result = await authService.loginWithProvider(provider as Provider, finalRedirect)

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

  // -------------------------
  // Sign up
  // -------------------------
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

  // -------------------------
  // Logout - SINGLE IMPLEMENTATION
  // -------------------------
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    try {
      // Use centralized navigation session service for complete cleanup
      await navigationSessionService.logout()

      // Clear local state
      setUser(null)

      // Legacy cleanup (backwards compatibility)
      useKidsStore.getState().reset()

      toast.success('Logout realizado', 'Ate a proxima sessao de estudos!')

      // Redirect after logout
      if (redirectOnLogout) {
        window.location.href = redirectOnLogout
      }
    } catch (e) {
      logger.error('Logout error', { error: e })
      // Even on error, clear local state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [redirectOnLogout])

  // -------------------------
  // Refresh session
  // -------------------------
  const refreshSession = useCallback(async (): Promise<void> => {
    const result = await authService.refreshSession()

    if (result.user) {
      const agoraUser = await loadUserProfile(result.user.id)
      if (agoraUser) {
        setUser(agoraUser)
      }
    } else if (result.error) {
      // Session expired, logout
      await logout()
    }
  }, [logout, loadUserProfile])

  // -------------------------
  // Clear error
  // -------------------------
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // -------------------------
  // Accept LGPD consent (Agora-specific)
  // -------------------------
  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        // Upsert consent record
        const { error: consentError } = await supabase.from('agora_consent').upsert(
          {
            user_id: user.id,
            consent_version: 'v1.0',
            ip_address: ipAddress,
            user_agent:
              userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
            tracking_consent: true,
            data_processing_consent: true,
            certificate_consent: true,
          },
          { onConflict: 'user_id' }
        )

        if (consentError) throw consentError

        // Create profile if not exists
        const { error: profileError } = await supabase.from('agora_profiles').upsert(
          {
            user_id: user.id,
            full_name: user.name,
            email: user.email,
            avatar_url: user.avatar,
            github_username: user.githubUsername,
            main_track: 'backend',
            program_start_date: new Date().toISOString().split('T')[0],
          },
          { onConflict: 'user_id' }
        )

        if (profileError) throw profileError

        // Update local state
        setUser({ ...user, hasAcceptedLgpd: true })

        toast.success('Termo aceito!', 'Bem-vindo(a) a Agora Cidadao.AI!')
        logger.info('LGPD consent accepted', { userId: user.id })
      } catch (e) {
        logger.error('Failed to accept LGPD consent', { error: e })
        toast.error('Erro ao salvar aceite', 'Tente novamente')
        throw e
      }
    },
    [user, supabase]
  )

  // -------------------------
  // Check LGPD consent
  // -------------------------
  const checkLgpdConsent = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    const { data: consent } = await supabase
      .from('agora_consent')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return !!consent
  }, [user, supabase])

  // -------------------------
  // Refresh profile
  // -------------------------
  const refreshProfile = useCallback(async () => {
    if (!user) return

    try {
      const agoraUser = await loadUserProfile(user.id)
      if (agoraUser) {
        setUser(agoraUser)
        logger.debug('Profile refreshed', {
          userId: user.id,
          totalXp: agoraUser.totalXp,
          currentLevel: agoraUser.currentLevel,
        })
      }
    } catch (e) {
      logger.error('Failed to refresh profile', { error: e })
    }
  }, [user, loadUserProfile])

  // -------------------------
  // Update user locally (optimistic updates)
  // -------------------------
  const updateUser = useCallback((updates: Partial<AgoraUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  // -------------------------
  // Memoized context value
  // -------------------------
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
      acceptLgpdConsent,
      checkLgpdConsent,
      refreshProfile,
      updateUser,
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
      acceptLgpdConsent,
      checkLgpdConsent,
      refreshProfile,
      updateUser,
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
// Re-exports for backwards compatibility
// ============================================

export type { AgoraUser, AuthUser }

/**
 * @deprecated Use useUnifiedAuth directly
 */
export const useAgoraAuthNew = useUnifiedAuth
