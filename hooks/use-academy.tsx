'use client'

import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react'
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
 * Unified Academy Hook - Full Supabase Integration
 *
 * Automatically selects between real auth (Supabase) and demo mode (localStorage)
 * based on:
 * 1. URL parameter ?demo=true -> Demo mode
 * 2. Authenticated via OAuth -> Real auth mode
 * 3. Not authenticated -> Falls back to demo mode
 *
 * Real auth integrates with:
 * - academy_profiles (XP, level, rank, streak, badges)
 * - academy_xp_transactions (XP history)
 * - academy_sessions (study sessions)
 * - academy_diary_entries (learning diary)
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
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void | Promise<void>
  startSession: () => void | Promise<void>
  endSession: (xpEarned?: number, agentsUsed?: string[]) => void | Promise<void>
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  acceptInternshipContract: (
    ipAddress?: string,
    userAgent?: string,
    contractId?: string
  ) => Promise<void>
  checkAndAwardBadges: () => void | Promise<void>
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

// Badge definitions for checking eligibility
// Using internal type since AcademyBadge has different structure
interface BadgeDefinition {
  id: string
  type: AcademyBadge['type']
  name: string
  description: string
  emoji: string
  criteria: string
  xpReward: number
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'pioneiro',
    type: 'pioneiro',
    name: 'Pioneiro',
    description: 'Fez login pela primeira vez na Academy',
    emoji: '🎉',
    criteria: 'Primeiro login',
    xpReward: 10,
  },
  {
    id: 'dedicado',
    type: 'dedicado',
    name: 'Dedicado',
    description: '7 dias seguidos de estudo',
    emoji: '⚡',
    criteria: '7+ dias de streak',
    xpReward: 50,
  },
  {
    id: 'explorador',
    type: 'explorador',
    name: 'Explorador',
    description: 'Completou 5 sessoes de estudo',
    emoji: '🧭',
    criteria: '5+ sessoes',
    xpReward: 30,
  },
  {
    id: 'japaguri',
    type: 'japaguri',
    name: 'Japaguri',
    description: 'Assiduo: 3+ dias seguidos, 5+ sessoes ou 3+ diarios',
    emoji: '🍜',
    criteria: '3+ streak OU 5+ sessoes OU 3+ diarios',
    xpReward: 50,
  },
]

export function UnifiedAcademyProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isDemoParam = searchParams.get('demo') === 'true'

  // Get both auth contexts
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // State for real auth data
  const [realXpTransactions, setRealXpTransactions] = useState<XpTransaction[]>([])
  const [realDiaryEntries, setRealDiaryEntries] = useState<DiaryEntry[]>([])
  const [realSessions, setRealSessions] = useState<StudySession[]>([])
  const [realCurrentSession, setRealCurrentSession] = useState<StudySession | null>(null)
  const [realBadges, setRealBadges] = useState<AcademyBadge[]>([])

  // Ref to track current session ID in Supabase
  const currentSessionIdRef = useRef<string | null>(null)

  // Determine the mode
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

  // Load real data from Supabase when authenticated
  useEffect(() => {
    if (!isRealAuth || !realAuth.user) return

    const loadRealData = async () => {
      const supabase = createClient()
      const userId = realAuth.user!.id

      try {
        // Load XP transactions
        const { data: xpData } = await supabase
          .from('academy_xp_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (xpData) {
          setRealXpTransactions(
            xpData.map((t) => ({
              id: t.id,
              amount: t.amount,
              balanceAfter: t.balance_after,
              sourceType: t.source_type,
              description: t.description,
              createdAt: t.created_at,
            }))
          )
        }

        // Load diary entries
        const { data: diaryData } = await supabase
          .from('academy_diary_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (diaryData) {
          setRealDiaryEntries(
            diaryData.map((d) => ({
              id: d.id,
              content: d.content,
              mood: d.mood || 'neutral',
              whatLearned: d.what_learned || '',
              whatStruggled: d.what_struggled || '',
              nextSteps: d.next_steps || '',
              entryDate: d.entry_date || d.created_at?.split('T')[0] || '',
              createdAt: d.created_at,
            }))
          )
        }

        // Load sessions
        const { data: sessionsData } = await supabase
          .from('academy_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(50)

        if (sessionsData) {
          setRealSessions(
            sessionsData.map((s) => ({
              id: s.id,
              startedAt: s.started_at,
              endedAt: s.ended_at,
              durationMinutes: s.duration_minutes,
              xpEarned: s.xp_earned,
              agentsUsed: s.conversations?.map((c: { agent_name: string }) => c.agent_name) || [],
            }))
          )

          // Check for active session
          const activeSession = sessionsData.find((s) => s.status === 'active')
          if (activeSession) {
            currentSessionIdRef.current = activeSession.id
            setRealCurrentSession({
              id: activeSession.id,
              startedAt: activeSession.started_at,
              durationMinutes: activeSession.duration_minutes,
              xpEarned: activeSession.xp_earned,
              agentsUsed: [],
            })
          }
        }

        // Load badges from profile
        const { data: profileData } = await supabase
          .from('academy_profiles')
          .select('badges')
          .eq('user_id', userId)
          .single()

        if (profileData?.badges) {
          const earnedBadgeIds = profileData.badges as string[]
          setRealBadges(
            BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.includes(b.id)).map((badge) => ({
              id: badge.id,
              type: badge.type,
              name: badge.name,
              description: badge.description,
              emoji: badge.emoji,
              earnedAt: new Date().toISOString(),
              criteria: badge.criteria,
            }))
          )
        } else {
          setRealBadges([])
        }

        logger.info('Loaded real data from Supabase', {
          xpTransactions: xpData?.length || 0,
          diaryEntries: diaryData?.length || 0,
          sessions: sessionsData?.length || 0,
        })
      } catch (error) {
        logger.error('Failed to load real data', { error })
      }
    }

    loadRealData()
  }, [isRealAuth, realAuth.user])

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
        tracks: demoAuth.user.tracks,
        currentStreak: realAuth.user.currentStreak,
        longestStreak: realAuth.user.currentStreak, // Will be updated from DB
        totalSessions: realAuth.user.totalSessions,
        totalTimeMinutes: realAuth.user.totalTimeMinutes,
        hasAcceptedLgpd: realAuth.user.hasAcceptedLgpd,
        hasAcceptedInternshipContract: demoAuth.user.hasAcceptedInternshipContract,
        hasCompletedOnboarding: demoAuth.user.hasCompletedOnboarding,
        enrolledAt: realAuth.user.enrolledAt || demoAuth.user.enrolledAt,
        githubUsername: realAuth.user.githubUsername,
        matricula: realAuth.user.matricula,
        curso: realAuth.user.curso,
        periodo: realAuth.user.periodo,
      }
    }

    return {
      ...demoAuth.user,
      githubUsername: undefined,
      matricula: undefined,
      curso: undefined,
      periodo: undefined,
    }
  }, [isRealAuth, realAuth.user, demoAuth.user])

  // === UNIFIED ACTIONS ===

  const updateProfile = useCallback(
    (updates: Partial<UnifiedAcademyUser>) => {
      if (isRealAuth) {
        realAuth.refreshProfile()
      }
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

  // === ADD XP - Full Supabase integration ===
  const addXp = useCallback(
    async (amount: number, sourceType: string, description: string) => {
      // Always update local state for immediate UI feedback
      demoAuth.addXp(amount, sourceType, description)

      if (isRealAuth && realAuth.user) {
        try {
          const supabase = createClient()
          const newXp = (realAuth.user.totalXp || 0) + amount
          const newLevel = Math.floor(newXp / 100) + 1

          let newRank = 'novato'
          if (newXp >= 5000) newRank = 'arquiteto'
          else if (newXp >= 2000) newRank = 'mentor'
          else if (newXp >= 500) newRank = 'contribuidor'
          else if (newXp >= 100) newRank = 'aprendiz'

          // Update profile
          await supabase
            .from('academy_profiles')
            .update({
              total_xp: newXp,
              current_level: newLevel,
              current_rank: newRank,
              last_activity_date: new Date().toISOString().split('T')[0],
            })
            .eq('user_id', realAuth.user.id)

          // Insert XP transaction
          const { data: txData } = await supabase
            .from('academy_xp_transactions')
            .insert({
              user_id: realAuth.user.id,
              amount,
              balance_after: newXp,
              source_type: sourceType,
              description,
            })
            .select()
            .single()

          if (txData) {
            setRealXpTransactions((prev) => [
              {
                id: txData.id,
                amount: txData.amount,
                balanceAfter: txData.balance_after,
                sourceType: txData.source_type,
                description: txData.description,
                createdAt: txData.created_at,
              },
              ...prev,
            ])
          }

          logger.info('XP added to Supabase', { amount, newXp, sourceType })
          realAuth.refreshProfile()
        } catch (error) {
          logger.error('Error adding XP to Supabase', { error })
        }
      }
    },
    [isRealAuth, realAuth, demoAuth]
  )

  // === START SESSION - Full Supabase integration ===
  const startSession = useCallback(async () => {
    // Always update local state
    demoAuth.startSession()

    if (isRealAuth && realAuth.user) {
      try {
        const supabase = createClient()

        // Create session in Supabase
        const { data, error } = await supabase
          .from('academy_sessions')
          .insert({
            user_id: realAuth.user.id,
            started_at: new Date().toISOString(),
            status: 'active',
          })
          .select()
          .single()

        if (error) {
          logger.error('Failed to create session in Supabase', { error })
          return
        }

        currentSessionIdRef.current = data.id
        setRealCurrentSession({
          id: data.id,
          startedAt: data.started_at,
          durationMinutes: 0,
          xpEarned: 0,
          agentsUsed: [],
        })

        // Update streak
        await updateStreak()

        logger.info('Session started in Supabase', { sessionId: data.id })
      } catch (error) {
        logger.error('Error starting session', { error })
      }
    }
  }, [isRealAuth, realAuth, demoAuth])

  // === END SESSION - Full Supabase integration ===
  const endSession = useCallback(
    async (xpEarned?: number, agentsUsed?: string[]) => {
      // Always update local state
      demoAuth.endSession(xpEarned, agentsUsed)

      if (isRealAuth && realAuth.user && currentSessionIdRef.current) {
        try {
          const supabase = createClient()
          const sessionId = currentSessionIdRef.current
          const startedAt = realCurrentSession?.startedAt || new Date().toISOString()
          const durationMinutes = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)

          // Update session
          await supabase
            .from('academy_sessions')
            .update({
              ended_at: new Date().toISOString(),
              duration_minutes: durationMinutes,
              xp_earned: xpEarned || 0,
              conversations: agentsUsed?.map((a) => ({ agent_name: a })) || [],
              status: 'completed',
            })
            .eq('id', sessionId)

          // Update profile stats
          await supabase
            .from('academy_profiles')
            .update({
              total_sessions: (realAuth.user.totalSessions || 0) + 1,
              total_time_minutes: (realAuth.user.totalTimeMinutes || 0) + durationMinutes,
            })
            .eq('user_id', realAuth.user.id)

          // Add to local state
          setRealSessions((prev) => [
            {
              id: sessionId,
              startedAt,
              endedAt: new Date().toISOString(),
              durationMinutes,
              xpEarned: xpEarned || 0,
              agentsUsed: agentsUsed || [],
            },
            ...prev,
          ])

          currentSessionIdRef.current = null
          setRealCurrentSession(null)

          logger.info('Session ended in Supabase', { sessionId, durationMinutes, xpEarned })
          realAuth.refreshProfile()
        } catch (error) {
          logger.error('Error ending session', { error })
        }
      }
    },
    [isRealAuth, realAuth, demoAuth, realCurrentSession]
  )

  // === ADD DIARY ENTRY - Full Supabase integration ===
  const addDiaryEntry = useCallback(
    async (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
      // Always update local state
      demoAuth.addDiaryEntry(entry)

      if (isRealAuth && realAuth.user) {
        try {
          const supabase = createClient()

          const { data, error } = await supabase
            .from('academy_diary_entries')
            .insert({
              user_id: realAuth.user.id,
              session_id: currentSessionIdRef.current,
              content: entry.content,
              mood: entry.mood,
              what_learned: entry.whatLearned,
              what_struggled: entry.whatStruggled,
              next_steps: entry.nextSteps,
              entry_date: entry.entryDate,
            })
            .select()
            .single()

          if (error) {
            logger.error('Failed to create diary entry', { error })
            return
          }

          setRealDiaryEntries((prev) => [
            {
              id: data.id,
              content: data.content,
              mood: data.mood || 'neutral',
              whatLearned: data.what_learned || '',
              whatStruggled: data.what_struggled || '',
              nextSteps: data.next_steps || '',
              entryDate: data.entry_date || '',
              createdAt: data.created_at,
            },
            ...prev,
          ])

          // Award XP for diary entry
          await addXp(10, 'diary', 'Entrada no diario de aprendizado')

          logger.info('Diary entry created in Supabase', { entryId: data.id })
        } catch (error) {
          logger.error('Error creating diary entry', { error })
        }
      }
    },
    [isRealAuth, realAuth, demoAuth, addXp]
  )

  // === UPDATE STREAK - Helper function ===
  const updateStreak = useCallback(async () => {
    if (!isRealAuth || !realAuth.user) return

    try {
      const supabase = createClient()

      // Get current profile
      const { data: profile } = await supabase
        .from('academy_profiles')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', realAuth.user.id)
        .single()

      if (!profile) return

      const today = new Date().toISOString().split('T')[0]
      const lastActivity = profile.last_activity_date

      let newStreak = profile.current_streak || 0
      let newLongestStreak = profile.longest_streak || 0

      if (!lastActivity) {
        // First activity ever
        newStreak = 1
      } else {
        const lastDate = new Date(lastActivity)
        const todayDate = new Date(today)
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 0) {
          // Same day, no change
        } else if (diffDays === 1) {
          // Consecutive day
          newStreak = (profile.current_streak || 0) + 1
        } else {
          // Streak broken
          newStreak = 1
        }
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }

      await supabase
        .from('academy_profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', realAuth.user.id)

      logger.info('Streak updated', { newStreak, newLongestStreak })
      realAuth.refreshProfile()
    } catch (error) {
      logger.error('Error updating streak', { error })
    }
  }, [isRealAuth, realAuth])

  // === CHECK AND AWARD BADGES - Full Supabase integration ===
  const checkAndAwardBadges = useCallback(async () => {
    // Always check demo
    demoAuth.checkAndAwardBadges()

    if (!isRealAuth || !realAuth.user) return

    try {
      const supabase = createClient()

      // Get current badges
      const { data: profile } = await supabase
        .from('academy_profiles')
        .select('badges, current_streak, total_sessions, total_xp')
        .eq('user_id', realAuth.user.id)
        .single()

      if (!profile) return

      const currentBadges: string[] = (profile.badges as string[]) || []
      const newBadgeIds: string[] = []
      let bonusXp = 0

      // Check each badge
      for (const badge of BADGE_DEFINITIONS) {
        if (currentBadges.includes(badge.id)) continue

        let earned = false

        switch (badge.id) {
          case 'pioneiro':
            earned = true // If they're here, they logged in
            break
          case 'dedicado':
            earned = (profile.current_streak || 0) >= 7
            break
          case 'explorador':
            earned = (profile.total_sessions || 0) >= 5
            break
          case 'japaguri':
            // Assiduous: 3+ streak OR 5+ sessions OR 3+ diary entries
            earned =
              (profile.current_streak || 0) >= 3 ||
              (profile.total_sessions || 0) >= 5 ||
              realDiaryEntries.length >= 3
            break
        }

        if (earned) {
          newBadgeIds.push(badge.id)
          bonusXp += badge.xpReward
          logger.info('Badge earned', { badgeId: badge.id, badgeName: badge.name })
        }
      }

      if (newBadgeIds.length > 0) {
        // Update badges in profile
        await supabase
          .from('academy_profiles')
          .update({
            badges: [...currentBadges, ...newBadgeIds],
          })
          .eq('user_id', realAuth.user.id)

        // Award bonus XP
        if (bonusXp > 0) {
          await addXp(bonusXp, 'badge', `Badges conquistados: ${newBadgeIds.join(', ')}`)
        }

        // Update local state - add new badges
        const newBadges: AcademyBadge[] = BADGE_DEFINITIONS.filter((b) =>
          newBadgeIds.includes(b.id)
        ).map((badge) => ({
          id: badge.id,
          type: badge.type,
          name: badge.name,
          description: badge.description,
          emoji: badge.emoji,
          earnedAt: new Date().toISOString(),
          criteria: badge.criteria,
        }))

        setRealBadges((prev) => [...prev, ...newBadges])

        realAuth.refreshProfile()
      }
    } catch (error) {
      logger.error('Error checking badges', { error })
    }
  }, [isRealAuth, realAuth, demoAuth, realDiaryEntries, addXp])

  // Context value
  const contextValue = useMemo(
    (): UnifiedAcademyContextType => ({
      // Mode info
      mode,
      isRealAuth,
      isDemoMode,

      // Common data - use real data if authenticated
      user,
      isAuthenticated: isRealAuth ? realAuth.isAuthenticated : true,
      isLoading,
      xpTransactions: isRealAuth ? realXpTransactions : demoAuth.xpTransactions,
      diaryEntries: isRealAuth ? realDiaryEntries : demoAuth.diaryEntries,
      sessions: isRealAuth ? realSessions : demoAuth.sessions,
      currentSession: isRealAuth ? realCurrentSession : demoAuth.currentSession,
      badges: isRealAuth ? realBadges : demoAuth.badges,
      onboarding: demoAuth.onboarding,
      lgpdConsent: demoAuth.lgpdConsent,
      internshipContract: demoAuth.internshipContract,

      // Actions - all unified
      updateProfile,
      addXp,
      addDiaryEntry,
      startSession,
      endSession,
      acceptLgpdConsent,
      acceptInternshipContract: demoAuth.acceptInternshipContract,
      checkAndAwardBadges,
      logout,

      // Onboarding (still demo only)
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
      realXpTransactions,
      realDiaryEntries,
      realSessions,
      realCurrentSession,
      realBadges,
      demoAuth,
      updateProfile,
      addXp,
      addDiaryEntry,
      startSession,
      endSession,
      acceptLgpdConsent,
      checkAndAwardBadges,
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
