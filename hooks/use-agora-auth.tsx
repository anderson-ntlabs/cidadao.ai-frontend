'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser, Provider } from '@supabase/supabase-js'
import { toast } from './use-toast'
import { createLogger } from '@/lib/logger'
import { useKidsStore } from '@/store/kids-store'
import { navigationSessionService } from '@/lib/services/navigation-session.service'

const logger = createLogger('AgoraAuth')

export interface AgoraUser {
  id: string
  name: string
  email: string
  avatar?: string
  githubUsername?: string
  matricula?: string
  curso?: string
  periodo?: number
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  totalTimeMinutes: number
  totalSessions: number
  hasAcceptedLgpd: boolean
  enrolledAt?: string
}

interface AgoraAuthContextType {
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithProvider: (provider: Provider) => Promise<void>
  logout: () => Promise<void>
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  checkLgpdConsent: () => Promise<boolean>
  refreshProfile: () => Promise<void>
}

const AgoraAuthContext = createContext<AgoraAuthContextType | undefined>(undefined)

export function AgoraAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AgoraUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Convert Supabase user to Ágora user
  const convertToAgoraUser = useCallback(
    async (supabaseUser: SupabaseUser): Promise<AgoraUser | null> => {
      const email = supabaseUser.email || ''
      const metadata = supabaseUser.user_metadata || {}

      // Extract name from various sources
      const name =
        metadata.full_name ||
        metadata.name ||
        metadata.user_name ||
        metadata.preferred_username ||
        email.split('@')[0] ||
        'Estudante'

      // Extract avatar from various sources (different OAuth providers use different fields)
      // GitHub: avatar_url, Google: picture, some: avatar
      // Also check identities array for raw provider data
      let avatar = metadata.avatar_url || metadata.picture || metadata.avatar || null

      // If no avatar in metadata, try to get from identities (raw OAuth data)
      if (!avatar && supabaseUser.identities && supabaseUser.identities.length > 0) {
        const identity = supabaseUser.identities[0]
        const identityData = identity.identity_data || {}
        avatar = identityData.avatar_url || identityData.picture || identityData.avatar || null
      }

      // Fallback to UI Avatars if no OAuth avatar found
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff&size=256`
      }

      logger.debug('Avatar extraction', {
        userId: supabaseUser.id,
        metadataAvatar: metadata.avatar_url || metadata.picture || 'none',
        identitiesCount: supabaseUser.identities?.length || 0,
        finalAvatar: avatar?.substring(0, 50) + '...',
      })

      // Extract GitHub username if available
      const githubUsername = metadata.user_name || metadata.preferred_username || null

      // Try to get existing profile from Supabase (with error handling)
      let profile = null
      let hasConsent = false

      // Fetch profile and consent in parallel to reduce latency
      try {
        const [profileResult, consentResult] = await Promise.all([
          supabase.from('agora_profiles').select('*').eq('user_id', supabaseUser.id).maybeSingle(),
          supabase.from('agora_consent').select('id').eq('user_id', supabaseUser.id).maybeSingle(),
        ])

        if (!profileResult.error && profileResult.data) {
          profile = profileResult.data
        }

        if (!consentResult.error && consentResult.data) {
          hasConsent = true
        }
      } catch (e) {
        // Tables might not exist yet - that's OK for new installations
        logger.debug('Agora tables not available yet', { error: e })
      }

      if (profile) {
        return {
          id: supabaseUser.id,
          email: email,
          name: profile.full_name || name,
          avatar: profile.avatar_url || avatar,
          githubUsername: profile.github_username || githubUsername,
          matricula: profile.matricula,
          curso: profile.curso,
          periodo: profile.periodo,
          totalXp: profile.total_xp || 0,
          currentLevel: profile.current_level || 1,
          currentRank: profile.current_rank || 'novato',
          currentStreak: profile.current_streak || 0,
          totalTimeMinutes: profile.total_time_minutes || 0,
          totalSessions: profile.total_sessions || 0,
          hasAcceptedLgpd: hasConsent,
          enrolledAt: profile.enrolled_at,
        }
      }

      // New user - will need to accept LGPD and complete profile
      return {
        id: supabaseUser.id,
        email: email,
        name: name,
        avatar: avatar,
        githubUsername: githubUsername,
        totalXp: 0,
        currentLevel: 1,
        currentRank: 'novato',
        currentStreak: 0,
        totalTimeMinutes: 0,
        totalSessions: 0,
        hasAcceptedLgpd: hasConsent,
      }
    },
    [supabase]
  )

  // Check session on mount
  useEffect(() => {
    let isMounted = true

    // Detect if we just came from OAuth callback (using URL param only)
    // Cookie oauth_session_ready is httpOnly and cannot be read by JS
    const isOAuthComplete =
      typeof window !== 'undefined' && window.location.search.includes('oauth_complete=')

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        logger.warn('Ágora auth check timeout (10s) - forcing loading state to false')
        setIsLoading(false)
      }
    }, 10000)

    const checkSession = async (retryCount = 0): Promise<boolean> => {
      try {
        logger.debug(`Ágora: Starting session check... (attempt ${retryCount + 1})`)

        // If coming from OAuth, add a small delay to let cookies propagate
        if (isOAuthComplete && retryCount === 0) {
          logger.debug('Ágora: OAuth detected, waiting 500ms for cookies to propagate...')
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // If coming from OAuth, try to refresh session first to ensure cookies are synced
        if (isOAuthComplete && retryCount <= 1) {
          logger.debug('Ágora: OAuth detected, attempting session refresh...')
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshData?.session?.user) {
              logger.debug('Ágora: Session refreshed successfully from OAuth')
              const agoraUser = await convertToAgoraUser(refreshData.session.user)
              if (agoraUser) {
                setUser(agoraUser)
                setIsAuthenticated(true)
                setIsLoading(false)

                // Clean up URL if it has oauth_complete param
                if (
                  typeof window !== 'undefined' &&
                  window.location.search.includes('oauth_complete=')
                ) {
                  const url = new URL(window.location.href)
                  url.searchParams.delete('oauth_complete')
                  window.history.replaceState({}, '', url.pathname + url.search)
                }
                return true
              }
            }
            if (refreshError) {
              logger.debug('Ágora: Session refresh failed, trying getUser...', {
                error: refreshError.message,
              })
            }
          } catch (refreshErr) {
            logger.debug('Ágora: Session refresh threw error, continuing with getUser...')
          }
        }

        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser()

        if (!isMounted) return false

        if (error) {
          // Token might not be ready yet after OAuth - retry with backoff
          if (isOAuthComplete && retryCount < 5) {
            const delay = 300 * (retryCount + 1)
            logger.debug(`Ágora: Auth error during OAuth flow, retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return checkSession(retryCount + 1)
          }
          logger.warn('Ágora: getUser error', { message: error.message })
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          return false
        }

        if (!supabaseUser) {
          // Retry with exponential backoff if OAuth just completed
          if (isOAuthComplete && retryCount < 5) {
            const delay = 300 * (retryCount + 1) // 300ms, 600ms, 900ms, 1200ms, 1500ms
            logger.debug(`Ágora: No session but OAuth completed, retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return checkSession(retryCount + 1)
          }

          logger.debug('Ágora: No user found')
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          return false
        }

        logger.debug('Ágora: User found, converting...', { userId: supabaseUser.id })

        const agoraUser = await convertToAgoraUser(supabaseUser)

        if (!isMounted) return false

        if (agoraUser) {
          setUser(agoraUser)
          setIsAuthenticated(true)
          logger.info('Ágora user authenticated', {
            userId: agoraUser.id,
            email: agoraUser.email,
            name: agoraUser.name,
          })

          // Clean up URL if it has oauth_complete param
          if (typeof window !== 'undefined' && window.location.search.includes('oauth_complete=')) {
            const url = new URL(window.location.href)
            url.searchParams.delete('oauth_complete')
            window.history.replaceState({}, '', url.pathname + url.search)
          }

          return true
        } else {
          logger.warn('Ágora: Failed to convert user')
          setUser(null)
          setIsAuthenticated(false)
          return false
        }
      } catch (error) {
        logger.error('Ágora session check failed', { error })
        if (isMounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
        return false
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth changes - this is crucial for OAuth completion
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Ágora auth state changed', { event, hasSession: !!session })

      if (!isMounted) return

      if (session?.user) {
        logger.debug('Ágora: Session user detected via auth change, converting...')
        const agoraUser = await convertToAgoraUser(session.user)
        if (isMounted && agoraUser) {
          setUser(agoraUser)
          setIsAuthenticated(true)
          setIsLoading(false)

          // Clean up URL if it has oauth_complete param
          if (typeof window !== 'undefined' && window.location.search.includes('oauth_complete=')) {
            const url = new URL(window.location.href)
            url.searchParams.delete('oauth_complete')
            window.history.replaceState({}, '', url.pathname + url.search)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)

        // Use centralized service for cleanup
        navigationSessionService.clearAllSessionStorage()

        // Legacy cleanup (kept for backwards compatibility)
        useKidsStore.getState().reset()

        logger.info('Auth session ended, all session data cleared')
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase, convertToAgoraUser])

  const loginWithProvider = useCallback(
    async (provider: Provider) => {
      setIsLoading(true)

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/pt/agora`,
            scopes: provider === 'github' ? 'read:user user:email' : undefined,
          },
        })

        if (error) throw error
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Tente novamente'
        logger.error(`${provider} login error`, { error })
        toast.error('Erro no login', errorMessage)
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

      setUser(null)
      setIsAuthenticated(false)

      // Legacy cleanup (kept for backwards compatibility)
      useKidsStore.getState().reset()

      toast.success('Logout realizado', 'Ate a proxima sessao de estudos!')
      window.location.href = '/pt/agora/login'
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente'
      logger.error('Logout error', { error })
      toast.error('Erro ao sair', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        // Upsert consent record (update if exists, insert if not)
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
          {
            onConflict: 'user_id',
          }
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
          {
            onConflict: 'user_id',
          }
        )

        if (profileError) throw profileError

        // Update local user state
        setUser({ ...user, hasAcceptedLgpd: true })

        toast.success('Termo aceito!', 'Bem-vindo(a) à Ágora Cidadão.AI!')

        logger.info('LGPD consent accepted', { userId: user.id })
      } catch (error: any) {
        logger.error('Failed to accept LGPD consent', { error })
        toast.error('Erro ao salvar aceite', 'Tente novamente')
        throw error
      }
    },
    [user, supabase]
  )

  const checkLgpdConsent = useCallback(async (): Promise<boolean> => {
    if (!user) return false

    const { data: consent } = await supabase
      .from('agora_consent')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return !!consent
  }, [user, supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('agora_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setUser({
          ...user,
          name: profile.full_name || user.name,
          avatar: profile.avatar_url || user.avatar,
          matricula: profile.matricula,
          curso: profile.curso,
          periodo: profile.periodo,
          totalXp: profile.total_xp || 0,
          currentLevel: profile.current_level || 1,
          currentRank: profile.current_rank || 'novato',
          currentStreak: profile.current_streak || 0,
          totalTimeMinutes: profile.total_time_minutes || 0,
          totalSessions: profile.total_sessions || 0,
          enrolledAt: profile.enrolled_at,
        })

        logger.debug('Profile refreshed', {
          userId: user.id,
          totalXp: profile.total_xp,
          currentLevel: profile.current_level,
        })
      }
    } catch (error) {
      logger.error('Failed to refresh profile', { error })
    }
  }, [user, supabase])

  return (
    <AgoraAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        loginWithProvider,
        logout,
        acceptLgpdConsent,
        checkLgpdConsent,
        refreshProfile,
      }}
    >
      {children}
    </AgoraAuthContext.Provider>
  )
}

export function useAgoraAuth() {
  const context = useContext(AgoraAuthContext)
  if (context === undefined) {
    throw new Error('useAgoraAuth must be used within an AgoraAuthProvider')
  }
  return context
}
