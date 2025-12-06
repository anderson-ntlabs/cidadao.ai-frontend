'use client'

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAcademyAuth } from './use-academy-auth'
import {
  useAcademyDemo,
  AcademyDemoUser,
  AcademyTrack,
  XpTransaction,
  DiaryEntry,
  StudySession,
  AcademyBadge,
  OnboardingData,
  LgpdConsent,
  InternshipContract,
  TRACK_REPOS,
} from './use-academy-demo'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AcademyUnified')

/**
 * Unified Academy Hook
 *
 * Automatically selects between real auth (Supabase) and demo mode (localStorage)
 * based on:
 * 1. URL parameter ?demo=true -> Demo mode
 * 2. Authenticated via OAuth -> Real auth mode
 * 3. Not authenticated -> Falls back to demo mode
 *
 * This ensures consistent behavior across all Academy pages.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-06
 */

export type AcademyMode = 'real' | 'demo'

interface UnifiedAcademyUser {
  id: string
  name: string
  email: string
  avatar: string
  totalXp: number
  currentLevel: number
  currentRank: string
  tracks: AcademyTrack[]
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalTimeMinutes: number
  hasAcceptedLgpd: boolean
  hasAcceptedInternshipContract: boolean
  hasCompletedOnboarding: boolean
  enrolledAt: string
  // Real auth specific
  githubUsername?: string
  matricula?: string
  curso?: string
  periodo?: number
}

interface UnifiedAcademyContextType {
  // Mode information
  mode: AcademyMode
  isRealAuth: boolean
  isDemoMode: boolean

  // Common data
  user: UnifiedAcademyUser
  isAuthenticated: boolean
  isLoading: boolean
  xpTransactions: XpTransaction[]
  diaryEntries: DiaryEntry[]
  sessions: StudySession[]
  currentSession: StudySession | null
  badges: AcademyBadge[]
  onboarding: OnboardingData | null
  lgpdConsent: LgpdConsent | null
  internshipContract: InternshipContract | null

  // Common actions
  updateProfile: (updates: Partial<UnifiedAcademyUser>) => void
  addXp: (amount: number, sourceType: string, description: string) => void | Promise<void>
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void
  startSession: () => void
  endSession: (xpEarned?: number, agentsUsed?: string[]) => void
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  acceptInternshipContract: (
    ipAddress?: string,
    userAgent?: string,
    contractId?: string
  ) => Promise<void>
  checkAndAwardBadges: () => void
  logout: () => Promise<void>

  // Onboarding actions
  initOnboarding: () => void
  updateOnboarding: (updates: Partial<OnboardingData>) => void
  toggleTrack: (track: AcademyTrack) => void
  confirmTracks: () => void
  setGitHubUsername: (username: string) => Promise<void>
  verifyGitHubFork: () => Promise<{ success: boolean; message: string }>
  completeOnboarding: () => void
}

const UnifiedAcademyContext = createContext<UnifiedAcademyContextType | undefined>(undefined)

export function UnifiedAcademyProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isDemoParam = searchParams.get('demo') === 'true'

  // Get both auth contexts
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Determine the mode
  // Priority: 1. URL param demo=true -> demo, 2. OAuth authenticated -> real, 3. Default -> demo
  const [mode, setMode] = useState<AcademyMode>('demo')

  useEffect(() => {
    if (isDemoParam) {
      setMode('demo')
      logger.debug('Mode: demo (URL param)')
    } else if (realAuth.isAuthenticated) {
      setMode('real')
      logger.debug('Mode: real (OAuth authenticated)', {
        userId: realAuth.user?.id,
        email: realAuth.user?.email,
      })
    } else {
      setMode('demo')
      logger.debug('Mode: demo (not authenticated)')
    }
  }, [isDemoParam, realAuth.isAuthenticated, realAuth.user?.id, realAuth.user?.email])

  const isRealAuth = mode === 'real'
  const isDemoMode = mode === 'demo'

  // Loading state
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading || demoAuth.isLoading

  // Unified user object
  const user = useMemo((): UnifiedAcademyUser => {
    if (isRealAuth && realAuth.user) {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user.name)}&background=16a34a&color=fff`
      return {
        id: realAuth.user.id,
        name: realAuth.user.name,
        email: realAuth.user.email,
        avatar: realAuth.user.avatar || defaultAvatar,
        totalXp: realAuth.user.totalXp,
        currentLevel: realAuth.user.currentLevel,
        currentRank: realAuth.user.currentRank,
        tracks: demoAuth.user.tracks, // Use demo tracks for now (can migrate later)
        currentStreak: realAuth.user.currentStreak,
        longestStreak: demoAuth.user.longestStreak, // Demo only field
        totalSessions: realAuth.user.totalSessions,
        totalTimeMinutes: realAuth.user.totalTimeMinutes,
        hasAcceptedLgpd: realAuth.user.hasAcceptedLgpd,
        hasAcceptedInternshipContract: demoAuth.user.hasAcceptedInternshipContract, // Demo only for now
        hasCompletedOnboarding: demoAuth.user.hasCompletedOnboarding, // Demo only for now
        enrolledAt: realAuth.user.enrolledAt || demoAuth.user.enrolledAt,
        githubUsername: realAuth.user.githubUsername,
        matricula: realAuth.user.matricula,
        curso: realAuth.user.curso,
        periodo: realAuth.user.periodo,
      }
    }

    // Demo mode user
    return {
      ...demoAuth.user,
      githubUsername: undefined,
      matricula: undefined,
      curso: undefined,
      periodo: undefined,
    }
  }, [isRealAuth, realAuth.user, demoAuth.user])

  // Unified actions
  const updateProfile = useCallback(
    (updates: Partial<UnifiedAcademyUser>) => {
      if (isRealAuth) {
        // Real auth: update Supabase (via refresh)
        realAuth.refreshProfile()
      }
      // Always update demo as fallback for local state
      demoAuth.updateProfile(updates as Partial<AcademyDemoUser>)
    },
    [isRealAuth, realAuth, demoAuth]
  )

  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (isRealAuth) {
        logger.info('Accepting LGPD consent via real auth (Supabase)')
        await realAuth.acceptLgpdConsent(ipAddress, userAgent)
      } else {
        logger.info('Accepting LGPD consent via demo mode (localStorage)')
        await demoAuth.acceptLgpdConsent(ipAddress, userAgent)
      }
    },
    [isRealAuth, realAuth, demoAuth]
  )

  const logout = useCallback(async () => {
    if (isRealAuth) {
      await realAuth.logout()
    } else {
      demoAuth.resetDemo()
    }
  }, [isRealAuth, realAuth, demoAuth])

  // Unified addXp that syncs to Supabase for real auth
  const addXp = useCallback(
    async (amount: number, sourceType: string, description: string) => {
      // Always update local state for immediate UI feedback
      demoAuth.addXp(amount, sourceType, description)

      // For real auth, also update Supabase
      if (isRealAuth && realAuth.user) {
        try {
          const supabase = createClient()
          const newXp = (realAuth.user.totalXp || 0) + amount

          // Calculate new level (every 100 XP = 1 level)
          const newLevel = Math.floor(newXp / 100) + 1

          // Calculate new rank based on XP
          let newRank = 'novato'
          if (newXp >= 5000) newRank = 'arquiteto'
          else if (newXp >= 2000) newRank = 'mentor'
          else if (newXp >= 500) newRank = 'contribuidor'
          else if (newXp >= 100) newRank = 'aprendiz'

          const { error } = await supabase
            .from('academy_profiles')
            .update({
              total_xp: newXp,
              current_level: newLevel,
              current_rank: newRank,
            })
            .eq('user_id', realAuth.user.id)

          if (error) {
            logger.error('Failed to update XP in Supabase', { error })
          } else {
            logger.info('XP updated in Supabase', { amount, newXp, sourceType })
            // Refresh profile to sync state
            realAuth.refreshProfile()
          }
        } catch (error) {
          logger.error('Error updating XP', { error })
        }
      }
    },
    [isRealAuth, realAuth, demoAuth]
  )

  // Context value
  const contextValue = useMemo(
    (): UnifiedAcademyContextType => ({
      // Mode info
      mode,
      isRealAuth,
      isDemoMode,

      // Common data
      user,
      isAuthenticated: isRealAuth ? realAuth.isAuthenticated : true,
      isLoading,
      xpTransactions: demoAuth.xpTransactions, // Demo only for now
      diaryEntries: demoAuth.diaryEntries, // Demo only for now
      sessions: demoAuth.sessions, // Demo only for now
      currentSession: demoAuth.currentSession, // Demo only for now
      badges: demoAuth.badges, // Demo only for now
      onboarding: demoAuth.onboarding, // Demo only for now
      lgpdConsent: demoAuth.lgpdConsent, // Demo only for now
      internshipContract: demoAuth.internshipContract, // Demo only for now

      // Actions
      updateProfile,
      addXp, // Unified - syncs to Supabase for real auth
      addDiaryEntry: demoAuth.addDiaryEntry, // Demo only for now
      startSession: demoAuth.startSession, // Demo only for now
      endSession: demoAuth.endSession, // Demo only for now
      acceptLgpdConsent,
      acceptInternshipContract: demoAuth.acceptInternshipContract, // Demo only for now
      checkAndAwardBadges: demoAuth.checkAndAwardBadges, // Demo only for now
      logout,

      // Onboarding
      initOnboarding: demoAuth.initOnboarding,
      updateOnboarding: demoAuth.updateOnboarding,
      toggleTrack: demoAuth.toggleTrack,
      confirmTracks: demoAuth.confirmTracks,
      setGitHubUsername: demoAuth.setGitHubUsername,
      verifyGitHubFork: demoAuth.verifyGitHubFork,
      completeOnboarding: demoAuth.completeOnboarding,
    }),
    [
      mode,
      isRealAuth,
      isDemoMode,
      user,
      realAuth.isAuthenticated,
      isLoading,
      demoAuth,
      updateProfile,
      addXp,
      acceptLgpdConsent,
      logout,
    ]
  )

  return (
    <UnifiedAcademyContext.Provider value={contextValue}>{children}</UnifiedAcademyContext.Provider>
  )
}

export function useAcademy() {
  const context = useContext(UnifiedAcademyContext)
  if (context === undefined) {
    throw new Error('useAcademy must be used within a UnifiedAcademyProvider')
  }
  return context
}

// Re-export for convenience
export { TRACK_REPOS }
export type {
  AcademyDemoUser,
  AcademyTrack,
  XpTransaction,
  DiaryEntry,
  StudySession,
  AcademyBadge,
  OnboardingData,
  LgpdConsent,
  InternshipContract,
  UnifiedAcademyUser,
}
