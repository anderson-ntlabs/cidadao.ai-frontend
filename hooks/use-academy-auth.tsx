'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser, Provider } from '@supabase/supabase-js'
import { toast } from './use-toast'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AcademyAuth')

export interface AcademyUser {
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

interface AcademyAuthContextType {
  user: AcademyUser | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithProvider: (provider: Provider) => Promise<void>
  logout: () => Promise<void>
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  checkLgpdConsent: () => Promise<boolean>
  refreshProfile: () => Promise<void>
}

const AcademyAuthContext = createContext<AcademyAuthContextType | undefined>(undefined)

export function AcademyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AcademyUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Convert Supabase user to Academy user
  const convertToAcademyUser = useCallback(
    async (supabaseUser: SupabaseUser): Promise<AcademyUser | null> => {
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

      // Extract avatar from various sources
      const avatar =
        metadata.avatar_url ||
        metadata.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`

      // Extract GitHub username if available
      const githubUsername = metadata.user_name || metadata.preferred_username || null

      // Try to get existing profile from Supabase
      const { data: profile } = await supabase
        .from('academy_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()

      // Check LGPD consent
      const { data: consent } = await supabase
        .from('academy_consent')
        .select('id')
        .eq('user_id', supabaseUser.id)
        .single()

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
          hasAcceptedLgpd: !!consent,
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
        hasAcceptedLgpd: !!consent,
      }
    },
    [supabase]
  )

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser()

        if (error || !supabaseUser) {
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        const academyUser = await convertToAcademyUser(supabaseUser)
        if (academyUser) {
          setUser(academyUser)
          setIsAuthenticated(true)
          logger.info('Academy user authenticated', {
            userId: academyUser.id,
            email: academyUser.email,
          })
        }
      } catch (error) {
        logger.error('Session check failed', { error })
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('Auth state changed', { event, hasSession: !!session })

      if (session?.user) {
        const academyUser = await convertToAcademyUser(session.user)
        if (academyUser) {
          setUser(academyUser)
          setIsAuthenticated(true)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, convertToAcademyUser])

  const loginWithProvider = useCallback(
    async (provider: Provider) => {
      setIsLoading(true)

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=/pt/academy`,
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setIsAuthenticated(false)

      toast.success('Logout realizado', 'Ate a proxima sessao de estudos!')
      window.location.href = '/pt/academy/login'
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente'
      logger.error('Logout error', { error })
      toast.error('Erro ao sair', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        // Insert consent record
        const { error: consentError } = await supabase.from('academy_consent').insert({
          user_id: user.id,
          consent_version: 'v1.0',
          ip_address: ipAddress,
          user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
          tracking_consent: true,
          data_processing_consent: true,
          certificate_consent: true,
        })

        if (consentError) throw consentError

        // Create profile if not exists
        const { error: profileError } = await supabase.from('academy_profiles').upsert(
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

        toast.success('Termo aceito!', 'Bem-vindo(a) à Academy Cidadão.AI!')

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
      .from('academy_consent')
      .select('id')
      .eq('user_id', user.id)
      .single()

    return !!consent
  }, [user, supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('academy_profiles')
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
          enrolledAt: profile.enrolled_at,
        })
      }
    } catch (error) {
      logger.error('Failed to refresh profile', { error })
    }
  }, [user, supabase])

  return (
    <AcademyAuthContext.Provider
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
    </AcademyAuthContext.Provider>
  )
}

export function useAcademyAuth() {
  const context = useContext(AcademyAuthContext)
  if (context === undefined) {
    throw new Error('useAcademyAuth must be used within an AcademyAuthProvider')
  }
  return context
}
