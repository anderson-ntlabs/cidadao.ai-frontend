'use client'

import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { trackBadgeEarned, trackLevelUp, trackRankUp } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import {
  syncChallengeProgress,
  getChallengeProgress,
  claimChallengeReward,
} from '@/app/pt/agora/actions'

const logger = createLogger('Agora')

/**
 * Agora Hook - Real Auth Only
 *
 * Full Supabase integration for the Agora platform.
 * No demo mode - requires OAuth authentication.
 *
 * Tables used:
 * - agora_profiles (XP, level, rank, streak, badges, tracks)
 * - agora_xp_transactions (XP history)
 * - agora_sessions (study sessions)
 * - agora_diary_entries (learning diary)
 * - agora_consent (LGPD)
 * - agora_calendar_events (agenda)
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

export type AgoraTrack = 'backend' | 'frontend' | 'ia' | 'devops'

export interface AgoraUser {
  id: string
  name: string
  email: string
  avatar: string
  githubUsername?: string
  matricula?: string
  curso?: string
  periodo?: number
  totalXp: number
  currentLevel: number
  currentRank: string
  tracks: AgoraTrack[]
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalTimeMinutes: number
  totalVideosCompleted: number
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean
  hasAcceptedInternshipContract: boolean // Alias for hasAcceptedTerms (backwards compat)
  hasCompletedOnboarding: boolean
  onboardingStep: number
  isSuperuser: boolean
  enrolledAt: string
  lastActivityDate?: string
  lastDailyBonusDate?: string // Track daily login bonus
}

// Daily challenges configuration
export interface DailyChallenge {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: 'session' | 'diary' | 'time'
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  periodStart: string // For server sync
}

// Weekly challenges configuration
export interface WeeklyChallenge {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: 'sessions' | 'xp' | 'streak'
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  periodStart: string // For server sync
  expiresAt: string
}

export interface XpTransaction {
  id: string
  amount: number
  balanceAfter: number
  sourceType: string
  description: string
  createdAt: string
}

export interface DiaryEntry {
  id: string
  content: string
  mood: 'great' | 'good' | 'neutral' | 'struggling'
  whatLearned: string
  whatStruggled: string
  nextSteps: string
  entryDate: string
  createdAt: string
}

export interface StudySession {
  id: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  xpEarned: number
  agentsUsed: string[]
  status: 'active' | 'completed' | 'abandoned'
}

export interface AgoraBadge {
  id: string
  type: string
  name: string
  description: string
  emoji: string
  earnedAt: string
  criteria: string
}

export interface GitHubContribution {
  username: string
  hasForked: boolean
  forkUrl?: string
  commitCount: number
  lastCommitDate?: string
  lastChecked: string
}

export interface OnboardingData {
  currentStep: number
  completedSteps: number[]
  selectedTracks: AgoraTrack[]
  githubUsername?: string
  githubForkVerified: boolean
  completedAt?: string
  github: GitHubContribution | null
}

// Badge definitions
const BADGE_DEFINITIONS = [
  // Tier 1 - Iniciante (facilmente alcançáveis)
  {
    id: 'pioneiro',
    type: 'pioneiro',
    name: 'Pioneiro',
    description: 'Primeiro login na Agora',
    emoji: '🚀',
    criteria: 'Primeiro login',
    xpReward: 25,
    check: () => true,
  },
  {
    id: 'curioso',
    type: 'curioso',
    name: 'Curioso',
    description: 'Acumulou 100 XP',
    emoji: '🔍',
    criteria: '100+ XP',
    xpReward: 15,
    check: (user: AgoraUser) => user.totalXp >= 100,
  },
  {
    id: 'primeiro-passo',
    type: 'primeiro-passo',
    name: 'Primeiro Passo',
    description: 'Completou a primeira sessao de estudo',
    emoji: '👣',
    criteria: '1+ sessao',
    xpReward: 20,
    check: (user: AgoraUser) => user.totalSessions >= 1,
  },

  // Tier 2 - Intermediário
  {
    id: 'explorador',
    type: 'explorador',
    name: 'Explorador',
    description: 'Completou 5 sessoes de estudo',
    emoji: '🧭',
    criteria: '5+ sessoes',
    xpReward: 30,
    check: (user: AgoraUser) => user.totalSessions >= 5,
  },
  {
    id: 'japaguri',
    type: 'japaguri',
    name: 'Japaguri',
    description: 'Assiduo: 3+ dias seguidos ou 5+ sessoes',
    emoji: '🍜',
    criteria: '3+ streak OU 5+ sessoes',
    xpReward: 50,
    check: (user: AgoraUser) => user.currentStreak >= 3 || user.totalSessions >= 5,
  },
  {
    id: 'estudioso',
    type: 'estudioso',
    name: 'Estudioso',
    description: 'Acumulou 500 XP',
    emoji: '📚',
    criteria: '500+ XP',
    xpReward: 40,
    check: (user: AgoraUser) => user.totalXp >= 500,
  },
  {
    id: 'maratonista',
    type: 'maratonista',
    name: 'Maratonista',
    description: '60 minutos de estudo acumulado',
    emoji: '🏃',
    criteria: '60+ minutos',
    xpReward: 35,
    check: (user: AgoraUser) => user.totalTimeMinutes >= 60,
  },

  // Tier 3 - Avançado
  {
    id: 'dedicado',
    type: 'dedicado',
    name: 'Dedicado',
    description: '7 dias seguidos de estudo',
    emoji: '⭐',
    criteria: '7+ dias de streak',
    xpReward: 75,
    check: (user: AgoraUser) => user.currentStreak >= 7,
  },
  {
    id: 'veterano',
    type: 'veterano',
    name: 'Veterano',
    description: 'Completou 20 sessoes de estudo',
    emoji: '🎖️',
    criteria: '20+ sessoes',
    xpReward: 60,
    check: (user: AgoraUser) => user.totalSessions >= 20,
  },
  {
    id: 'scholar',
    type: 'scholar',
    name: 'Scholar',
    description: 'Acumulou 1000 XP',
    emoji: '🎓',
    criteria: '1000+ XP',
    xpReward: 75,
    check: (user: AgoraUser) => user.totalXp >= 1000,
  },
  {
    id: 'persistente',
    type: 'persistente',
    name: 'Persistente',
    description: '14 dias seguidos de estudo',
    emoji: '💪',
    criteria: '14+ dias de streak',
    xpReward: 100,
    check: (user: AgoraUser) => user.currentStreak >= 14,
  },

  // Tier 4 - Elite
  {
    id: 'mestre',
    type: 'mestre',
    name: 'Mestre',
    description: 'Acumulou 2500 XP',
    emoji: '👑',
    criteria: '2500+ XP',
    xpReward: 150,
    check: (user: AgoraUser) => user.totalXp >= 2500,
  },
  {
    id: 'lenda',
    type: 'lenda',
    name: 'Lenda',
    description: '30 dias seguidos de estudo',
    emoji: '🏆',
    criteria: '30+ dias de streak',
    xpReward: 200,
    check: (user: AgoraUser) => user.currentStreak >= 30,
  },
  {
    id: 'centuriao',
    type: 'centuriao',
    name: 'Centuriao',
    description: '100 sessoes completadas',
    emoji: '⚔️',
    criteria: '100+ sessoes',
    xpReward: 250,
    check: (user: AgoraUser) => user.totalSessions >= 100,
  },
  {
    id: 'iluminado',
    type: 'iluminado',
    name: 'Iluminado',
    description: 'Acumulou 5000 XP',
    emoji: '✨',
    criteria: '5000+ XP',
    xpReward: 300,
    check: (user: AgoraUser) => user.totalXp >= 5000,
  },
]

// GitHub repos by track
export const TRACK_REPOS: Record<string, { owner: string; repo: string }> = {
  backend: { owner: 'anderson-ufrj', repo: 'cidadao.ai-backend' },
  frontend: { owner: 'anderson-ufrj', repo: 'cidadao.ai-frontend' },
  ia: { owner: 'anderson-ufrj', repo: 'cidadao.ai-ml' },
  devops: { owner: 'anderson-ufrj', repo: 'cidadao.ai-infra' },
}

// Gamification constants
export const GAMIFICATION = {
  DAILY_LOGIN_BONUS: 5,
  STREAK_MULTIPLIERS: {
    3: 1.1, // 10% bonus after 3 days
    7: 1.25, // 25% bonus after 7 days
    14: 1.5, // 50% bonus after 14 days
    30: 2.0, // 100% bonus after 30 days
  } as Record<number, number>,
  STREAK_MILESTONES: [3, 7, 14, 21, 30, 60, 90, 180, 365] as const,
}

// Get streak multiplier based on current streak
export function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(GAMIFICATION.STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a) // Sort descending

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return GAMIFICATION.STREAK_MULTIPLIERS[threshold]
    }
  }
  return 1.0 // No multiplier
}

// Daily challenge types
type DailyChallengeType = 'session' | 'diary' | 'time'

// Weekly challenge types
type WeeklyChallengeType = 'sessions' | 'xp' | 'streak'

// Daily challenges templates
export const DAILY_CHALLENGE_TEMPLATES: Array<{
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: DailyChallengeType
  target: number
}> = [
  {
    id: 'daily-session',
    name: 'Sessao Diaria',
    description: 'Complete 1 sessao de estudo hoje',
    emoji: '🎯',
    xpReward: 15,
    type: 'session',
    target: 1,
  },
  {
    id: 'daily-diary',
    name: 'Reflexao Diaria',
    description: 'Escreva uma entrada no diario',
    emoji: '📝',
    xpReward: 10,
    type: 'diary',
    target: 1,
  },
  {
    id: 'daily-time',
    name: 'Tempo Dedicado',
    description: 'Estude por 30 minutos hoje',
    emoji: '⏱️',
    xpReward: 20,
    type: 'time',
    target: 30,
  },
]

// Weekly challenges templates
export const WEEKLY_CHALLENGE_TEMPLATES: Array<{
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: WeeklyChallengeType
  target: number
}> = [
  {
    id: 'weekly-sessions',
    name: 'Maratonista Semanal',
    description: 'Complete 5 sessoes esta semana',
    emoji: '🏃',
    xpReward: 100,
    type: 'sessions',
    target: 5,
  },
  {
    id: 'weekly-xp',
    name: 'Cacador de XP',
    description: 'Ganhe 200 XP esta semana',
    emoji: '⭐',
    xpReward: 75,
    type: 'xp',
    target: 200,
  },
  {
    id: 'weekly-streak',
    name: 'Consistencia',
    description: 'Mantenha um streak de 5 dias',
    emoji: '🔥',
    xpReward: 150,
    type: 'streak',
    target: 5,
  },
]

interface AgoraContextType {
  // State
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isSuperuser: boolean
  xpTransactions: XpTransaction[]
  diaryEntries: DiaryEntry[]
  sessions: StudySession[]
  currentSession: StudySession | null
  badges: AgoraBadge[]
  onboarding: OnboardingData | null

  // Gamification state
  dailyChallenges: DailyChallenge[]
  weeklyChallenges: WeeklyChallenge[]
  hasDailyBonus: boolean
  streakMultiplier: number

  // Backwards compatibility (always real auth now)
  mode: 'real'
  isDemoMode: false
  isRealAuth: true

  // Actions
  refreshUser: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<AgoraUser>) => Promise<void>
  addXp: (amount: number, sourceType: string, description: string) => Promise<void>
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => Promise<void>
  startSession: () => Promise<void>
  endSession: (xpEarned?: number, agentsUsed?: string[]) => Promise<void>
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  acceptTerms: (ipAddress?: string, userAgent?: string, contractId?: string) => Promise<void>
  acceptInternshipContract: (
    ipAddress?: string,
    userAgent?: string,
    contractId?: string
  ) => Promise<void>
  checkAndAwardBadges: () => Promise<void>
  logout: () => Promise<void>

  // Gamification actions
  claimDailyBonus: () => Promise<boolean>
  claimChallenge: (
    challengeId: string,
    periodStart: string,
    isWeekly?: boolean
  ) => Promise<{ success: boolean; xpAwarded?: number; error?: string }>
  refreshChallenges: () => void

  // Onboarding
  initOnboarding: () => void
  updateOnboarding: (updates: Partial<OnboardingData>) => void
  toggleTrack: (track: AgoraTrack) => void
  confirmTracks: () => Promise<void>
  setOnboardingStep: (step: number) => Promise<void>
  selectTracks: (tracks: AgoraTrack[]) => Promise<void>
  setGitHubUsername: (username: string) => Promise<void>
  verifyGitHubFork: () => Promise<{ success: boolean; message: string }>
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => Promise<void>
}

const AgoraContext = createContext<AgoraContextType | undefined>(undefined)

const DEFAULT_USER: AgoraUser = {
  id: '',
  name: '',
  email: '',
  avatar: '',
  totalXp: 0,
  currentLevel: 1,
  currentRank: 'novato',
  tracks: [],
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  totalTimeMinutes: 0,
  totalVideosCompleted: 0,
  hasAcceptedLgpd: false,
  hasAcceptedTerms: false,
  hasAcceptedInternshipContract: false,
  hasCompletedOnboarding: false,
  onboardingStep: 0,
  isSuperuser: false,
  enrolledAt: new Date().toISOString(),
}

export function AgoraProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<AgoraUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([])
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [badges, setBadges] = useState<AgoraBadge[]>([])

  // Gamification state
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])
  const [hasDailyBonus, setHasDailyBonus] = useState(false)

  // Ref for current session ID
  const currentSessionIdRef = useRef<string | null>(null)

  // Derived state
  const isAuthenticated = !!user
  const isSuperuser = user?.isSuperuser ?? false
  const streakMultiplier = user ? getStreakMultiplier(user.currentStreak) : 1.0

  // Track state for toggleTrack
  const [selectedTracks, setSelectedTracks] = useState<AgoraTrack[]>([])

  // Sync selectedTracks with user.tracks when user changes
  useEffect(() => {
    if (user) {
      setSelectedTracks(user.tracks)
    }
  }, [user?.tracks])

  // Onboarding data derived from user - memoized to prevent infinite re-renders
  const onboarding: OnboardingData | null = useMemo(() => {
    if (!user) return null
    return {
      currentStep: user.onboardingStep,
      completedSteps: Array.from({ length: user.onboardingStep }, (_, i) => i + 1),
      selectedTracks: selectedTracks,
      githubUsername: user.githubUsername,
      githubForkVerified: false,
      completedAt: user.hasCompletedOnboarding ? user.enrolledAt : undefined,
      github: user.githubUsername
        ? {
            username: user.githubUsername,
            hasForked: false,
            commitCount: 0,
            lastChecked: user.enrolledAt || '', // Use stable value instead of new Date()
          }
        : null,
    }
  }, [
    user?.onboardingStep,
    user?.githubUsername,
    user?.hasCompletedOnboarding,
    user?.enrolledAt,
    selectedTracks,
  ])

  // Load user data on mount
  useEffect(() => {
    loadUserData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setXpTransactions([])
        setDiaryEntries([])
        setSessions([])
        setBadges([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load all user data from Supabase
  const loadUserData = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      // Load profile (use maybeSingle to handle case where profile doesn't exist)
      let { data: profile } = await supabase
        .from('agora_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle()

      // Auto-create profile if it doesn't exist (first login)
      if (!profile) {
        const metadata = authUser.user_metadata || {}
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.full_name || metadata.name || 'User')}&background=16a34a&color=fff&size=128`

        const { data: newProfile, error: createError } = await supabase
          .from('agora_profiles')
          .insert({
            user_id: authUser.id,
            email: authUser.email || '',
            full_name: metadata.full_name || metadata.name || 'Estudante',
            avatar_url: metadata.avatar_url || defaultAvatar,
            github_username: metadata.user_name || null,
            total_xp: 0,
            current_level: 1,
            current_rank: 'novato',
            tracks: [],
            current_streak: 0,
            longest_streak: 0,
            total_sessions: 0,
            total_time_minutes: 0,
            total_videos_completed: 0,
            has_accepted_terms: false,
            has_completed_onboarding: false,
            onboarding_step: 0,
            is_superuser: false,
            is_active: true,
            enrolled_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          logger.error('Failed to create Agora profile', { error: createError })
        } else {
          profile = newProfile
          logger.info('Created new Agora profile', { userId: authUser.id })
        }
      }

      // Load consent (use maybeSingle - consent may not exist yet)
      const { data: consent } = await supabase
        .from('agora_consent')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle()

      // Build user object
      const metadata = authUser.user_metadata || {}
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.full_name || metadata.name || 'User')}&background=16a34a&color=fff&size=128`

      const hasTerms = profile?.has_accepted_terms || false
      const userData: AgoraUser = {
        id: authUser.id,
        name: profile?.full_name || metadata.full_name || metadata.name || 'Estudante',
        email: authUser.email || '',
        avatar: profile?.avatar_url || metadata.avatar_url || defaultAvatar,
        githubUsername: profile?.github_username || metadata.user_name,
        matricula: profile?.matricula,
        curso: profile?.curso,
        periodo: profile?.periodo,
        totalXp: profile?.total_xp || 0,
        currentLevel: profile?.current_level || 1,
        currentRank: profile?.current_rank || 'novato',
        tracks: profile?.tracks || [],
        currentStreak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        totalSessions: profile?.total_sessions || 0,
        totalTimeMinutes: profile?.total_time_minutes || 0,
        totalVideosCompleted: profile?.total_videos_completed || 0,
        hasAcceptedLgpd: !!consent,
        hasAcceptedTerms: hasTerms,
        hasAcceptedInternshipContract: hasTerms, // Alias
        hasCompletedOnboarding: profile?.has_completed_onboarding || false,
        onboardingStep: profile?.onboarding_step || 0,
        isSuperuser: profile?.is_superuser || false,
        enrolledAt: profile?.enrolled_at || authUser.created_at || new Date().toISOString(),
        lastActivityDate: profile?.last_activity_date,
        lastDailyBonusDate: profile?.last_daily_bonus_date,
      }

      setUser(userData)

      // Check if daily bonus was already claimed today
      const today = new Date().toISOString().split('T')[0]
      const bonusClaimed = profile?.last_daily_bonus_date === today
      setHasDailyBonus(!bonusClaimed)

      // Load XP transactions
      const { data: xpData } = await supabase
        .from('agora_xp_transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (xpData) {
        setXpTransactions(
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
        .from('agora_diary_entries')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (diaryData) {
        setDiaryEntries(
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
        .from('agora_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('started_at', { ascending: false })
        .limit(50)

      if (sessionsData) {
        setSessions(
          sessionsData.map((s) => ({
            id: s.id,
            startedAt: s.started_at,
            endedAt: s.ended_at,
            durationMinutes: s.duration_minutes || 0,
            xpEarned: s.xp_earned || 0,
            agentsUsed: s.conversations?.map((c: { agent_name: string }) => c.agent_name) || [],
            status: s.status || 'completed',
          }))
        )

        // Check for active session
        const activeSession = sessionsData.find((s) => s.status === 'active')
        if (activeSession) {
          currentSessionIdRef.current = activeSession.id
          setCurrentSession({
            id: activeSession.id,
            startedAt: activeSession.started_at,
            durationMinutes: activeSession.duration_minutes || 0,
            xpEarned: activeSession.xp_earned || 0,
            agentsUsed: [],
            status: 'active',
          })
        }
      }

      // Load badges from profile
      if (profile?.badges) {
        const earnedBadgeIds = profile.badges as string[]
        setBadges(
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
      }

      logger.info('User data loaded', {
        userId: authUser.id,
        totalXp: userData.totalXp,
        isSuperuser: userData.isSuperuser,
      })
    } catch (error) {
      logger.error('Failed to load user data', { error })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadUserData()
  }, [loadUserData])

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<AgoraUser>) => {
      if (!user) return

      try {
        const dbUpdates: Record<string, unknown> = {}

        if (updates.name !== undefined) dbUpdates.full_name = updates.name
        if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar
        if (updates.githubUsername !== undefined) dbUpdates.github_username = updates.githubUsername
        if (updates.matricula !== undefined) dbUpdates.matricula = updates.matricula
        if (updates.curso !== undefined) dbUpdates.curso = updates.curso
        if (updates.periodo !== undefined) dbUpdates.periodo = updates.periodo
        if (updates.tracks !== undefined) dbUpdates.tracks = updates.tracks
        if (updates.onboardingStep !== undefined) dbUpdates.onboarding_step = updates.onboardingStep
        if (updates.hasCompletedOnboarding !== undefined)
          dbUpdates.has_completed_onboarding = updates.hasCompletedOnboarding
        if (updates.hasAcceptedTerms !== undefined)
          dbUpdates.has_accepted_terms = updates.hasAcceptedTerms

        await supabase.from('agora_profiles').update(dbUpdates).eq('user_id', user.id)

        setUser((prev) => (prev ? { ...prev, ...updates } : null))
        logger.debug('Profile updated', { updates })
      } catch (error) {
        logger.error('Failed to update profile', { error })
      }
    },
    [user, supabase]
  )

  // Add XP
  const addXp = useCallback(
    async (amount: number, sourceType: string, description: string) => {
      if (!user) return

      try {
        const newXp = user.totalXp + amount
        const newLevel = Math.floor(newXp / 100) + 1
        const oldLevel = user.currentLevel
        const oldRank = user.currentRank

        let newRank = 'novato'
        if (newXp >= 5000) newRank = 'arquiteto'
        else if (newXp >= 2000) newRank = 'mentor'
        else if (newXp >= 500) newRank = 'contribuidor'
        else if (newXp >= 100) newRank = 'aprendiz'

        // Update profile
        await supabase
          .from('agora_profiles')
          .update({
            total_xp: newXp,
            current_level: newLevel,
            current_rank: newRank,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', user.id)

        // Insert XP transaction
        const { data: txData } = await supabase
          .from('agora_xp_transactions')
          .insert({
            user_id: user.id,
            amount,
            balance_after: newXp,
            source_type: sourceType,
            description,
          })
          .select()
          .single()

        if (txData) {
          setXpTransactions((prev) => [
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

        // Track milestones and trigger celebrations
        if (newLevel > oldLevel) {
          trackLevelUp(oldLevel, newLevel, newXp)
          // Trigger level up celebration
          useCelebrationStore.getState().celebrateLevelUp(newLevel)
        }
        if (newRank !== oldRank) {
          trackRankUp(oldRank, newRank, newLevel)
          // Trigger rank up celebration
          useCelebrationStore.getState().celebrateRankUp(newRank)
        }

        setUser((prev) =>
          prev
            ? {
                ...prev,
                totalXp: newXp,
                currentLevel: newLevel,
                currentRank: newRank,
              }
            : null
        )

        logger.info('XP added', { amount, newXp, sourceType })
      } catch (error) {
        logger.error('Failed to add XP', { error })
      }
    },
    [user, supabase]
  )

  // Start session
  const startSession = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('agora_sessions')
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      currentSessionIdRef.current = data.id
      setCurrentSession({
        id: data.id,
        startedAt: data.started_at,
        durationMinutes: 0,
        xpEarned: 0,
        agentsUsed: [],
        status: 'active',
      })

      // Update streak
      await updateStreak()

      logger.info('Session started', { sessionId: data.id })
    } catch (error) {
      logger.error('Failed to start session', { error })
    }
  }, [user, supabase])

  // End session
  const endSession = useCallback(
    async (xpEarned = 0, agentsUsed: string[] = []) => {
      if (!user || !currentSessionIdRef.current) return

      try {
        const sessionId = currentSessionIdRef.current
        const startedAt = currentSession?.startedAt || new Date().toISOString()
        const durationMinutes = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)

        await supabase
          .from('agora_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_minutes: durationMinutes,
            xp_earned: xpEarned,
            conversations: agentsUsed.map((a) => ({ agent_name: a })),
            status: 'completed',
          })
          .eq('id', sessionId)

        // Update profile stats
        await supabase
          .from('agora_profiles')
          .update({
            total_sessions: user.totalSessions + 1,
            total_time_minutes: user.totalTimeMinutes + durationMinutes,
          })
          .eq('user_id', user.id)

        setSessions((prev) => [
          {
            id: sessionId,
            startedAt,
            endedAt: new Date().toISOString(),
            durationMinutes,
            xpEarned,
            agentsUsed,
            status: 'completed',
          },
          ...prev,
        ])

        currentSessionIdRef.current = null
        setCurrentSession(null)

        setUser((prev) =>
          prev
            ? {
                ...prev,
                totalSessions: prev.totalSessions + 1,
                totalTimeMinutes: prev.totalTimeMinutes + durationMinutes,
              }
            : null
        )

        logger.info('Session ended', { sessionId, durationMinutes, xpEarned })
      } catch (error) {
        logger.error('Failed to end session', { error })
      }
    },
    [user, currentSession, supabase]
  )

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const lastActivity = user.lastActivityDate

      let newStreak = user.currentStreak
      let newLongestStreak = user.longestStreak

      if (!lastActivity) {
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
          newStreak = user.currentStreak + 1
        } else {
          newStreak = 1
        }
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak
      }

      await supabase
        .from('agora_profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id)

      setUser((prev) =>
        prev
          ? {
              ...prev,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              lastActivityDate: today,
            }
          : null
      )

      logger.info('Streak updated', { newStreak, newLongestStreak })
    } catch (error) {
      logger.error('Failed to update streak', { error })
    }
  }, [user, supabase])

  // Add diary entry
  const addDiaryEntry = useCallback(
    async (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('agora_diary_entries')
          .insert({
            user_id: user.id,
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

        if (error) throw error

        setDiaryEntries((prev) => [
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

        // Award XP
        await addXp(10, 'diary', 'Entrada no diario de aprendizado')

        logger.info('Diary entry created', { entryId: data.id })
      } catch (error) {
        logger.error('Failed to create diary entry', { error })
      }
    },
    [user, supabase, addXp]
  )

  // Accept LGPD consent
  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (!user) return

      try {
        // Use upsert to avoid 409 conflict if consent already exists
        await supabase.from('agora_consent').upsert(
          {
            user_id: user.id,
            consent_version: 'v1.0',
            tracking_consent: true,
            data_processing_consent: true,
            certificate_consent: true,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
          { onConflict: 'user_id' }
        )

        setUser((prev) => (prev ? { ...prev, hasAcceptedLgpd: true } : null))
        logger.info('LGPD consent accepted', { ipAddress })
      } catch (error) {
        logger.error('Failed to accept LGPD consent', { error })
      }
    },
    [user, supabase]
  )

  // Accept terms
  const acceptTerms = useCallback(
    async (_ipAddress?: string, _userAgent?: string, _contractId?: string) => {
      if (!user) return

      try {
        await supabase
          .from('agora_profiles')
          .update({ has_accepted_terms: true })
          .eq('user_id', user.id)

        setUser((prev) =>
          prev
            ? {
                ...prev,
                hasAcceptedTerms: true,
                hasAcceptedInternshipContract: true,
              }
            : null
        )

        // Award welcome bonus
        await addXp(100, 'terms_accept', 'Bonus de boas-vindas - Aceite dos Termos de Uso')

        logger.info('Terms accepted')
      } catch (error) {
        logger.error('Failed to accept terms', { error })
      }
    },
    [user, supabase, addXp]
  )

  // Check and award badges
  const checkAndAwardBadges = useCallback(async () => {
    if (!user) return

    try {
      const { data: profile } = await supabase
        .from('agora_profiles')
        .select('badges')
        .eq('user_id', user.id)
        .single()

      const currentBadges: string[] = (profile?.badges as string[]) || []
      const newBadgeIds: string[] = []
      let bonusXp = 0

      for (const badge of BADGE_DEFINITIONS) {
        if (currentBadges.includes(badge.id)) continue
        if (badge.check(user)) {
          newBadgeIds.push(badge.id)
          bonusXp += badge.xpReward
          trackBadgeEarned(badge.id, badge.name)
          logger.info('Badge earned', { badgeId: badge.id })
        }
      }

      if (newBadgeIds.length > 0) {
        await supabase
          .from('agora_profiles')
          .update({ badges: [...currentBadges, ...newBadgeIds] })
          .eq('user_id', user.id)

        if (bonusXp > 0) {
          await addXp(bonusXp, 'badge', `Badges conquistados: ${newBadgeIds.join(', ')}`)
        }

        const newBadges = BADGE_DEFINITIONS.filter((b) => newBadgeIds.includes(b.id)).map(
          (badge) => ({
            id: badge.id,
            type: badge.type,
            name: badge.name,
            description: badge.description,
            emoji: badge.emoji,
            earnedAt: new Date().toISOString(),
            criteria: badge.criteria,
          })
        )

        setBadges((prev) => [...prev, ...newBadges])

        // Trigger celebration for each new badge (queued if multiple)
        for (const badge of newBadges) {
          useCelebrationStore.getState().celebrateBadge(badge.name, badge.emoji, 0) // XP already added
        }
      }
    } catch (error) {
      logger.error('Failed to check badges', { error })
    }
  }, [user, supabase, addXp])

  // Claim daily login bonus
  const claimDailyBonus = useCallback(async (): Promise<boolean> => {
    if (!user || !hasDailyBonus) return false

    try {
      const today = new Date().toISOString().split('T')[0]

      // Update the last daily bonus date
      await supabase
        .from('agora_profiles')
        .update({ last_daily_bonus_date: today })
        .eq('user_id', user.id)

      // Calculate bonus with streak multiplier
      const baseBonus = GAMIFICATION.DAILY_LOGIN_BONUS
      const multiplier = getStreakMultiplier(user.currentStreak)
      const bonusAmount = Math.round(baseBonus * multiplier)

      // Award XP with potential streak bonus
      const bonusDescription =
        multiplier > 1
          ? `Bonus diario de login (+${Math.round((multiplier - 1) * 100)}% streak bonus!)`
          : 'Bonus diario de login'

      await addXp(bonusAmount, 'daily_login', bonusDescription)

      // Update local state
      setUser((prev) => (prev ? { ...prev, lastDailyBonusDate: today } : null))
      setHasDailyBonus(false)

      logger.info('Daily bonus claimed', { amount: bonusAmount, multiplier })
      return true
    } catch (error) {
      logger.error('Failed to claim daily bonus', { error })
      return false
    }
  }, [user, hasDailyBonus, supabase, addXp])

  // Refresh daily and weekly challenges (with server sync)
  const refreshChallenges = useCallback(async () => {
    if (!user) return

    // Calculate period dates
    const today = new Date().toISOString().split('T')[0]

    // Week starts on Monday for consistency with server
    const weekStart = new Date()
    const dayOfWeek = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)) // Monday
    weekStart.setHours(0, 0, 0, 0)
    const weekStartStr = weekStart.toISOString().split('T')[0]

    // Fetch claimed status from server
    let serverClaimed: Record<string, boolean> = {}
    try {
      const result = await getChallengeProgress()
      if (result.success && result.data) {
        result.data.forEach((cp) => {
          serverClaimed[cp.challenge_id] = cp.xp_claimed || false
        })
      }
    } catch (error) {
      logger.warn('Failed to fetch challenge progress from server', { error })
    }

    // Calculate today's sessions and diary entries
    const todaySessions = sessions.filter(
      (s) => s.startedAt.split('T')[0] === today && s.status === 'completed'
    ).length
    const todayDiaryEntries = diaryEntries.filter((d) => d.entryDate === today).length
    const todayMinutes = sessions
      .filter((s) => s.startedAt.split('T')[0] === today && s.status === 'completed')
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

    // Generate daily challenges
    const daily: DailyChallenge[] = DAILY_CHALLENGE_TEMPLATES.map((template) => {
      let progress = 0
      let completed = false

      switch (template.type) {
        case 'session':
          progress = todaySessions
          completed = todaySessions >= template.target
          break
        case 'diary':
          progress = todayDiaryEntries
          completed = todayDiaryEntries >= template.target
          break
        case 'time':
          progress = todayMinutes
          completed = todayMinutes >= template.target
          break
      }

      return {
        ...template,
        progress,
        completed,
        claimed: serverClaimed[template.id] || false,
        periodStart: today,
      }
    })

    setDailyChallenges(daily)

    // Calculate weekly stats
    const weekSessions = sessions.filter(
      (s) => s.startedAt >= weekStart.toISOString() && s.status === 'completed'
    ).length
    const weekXp = xpTransactions
      .filter((tx) => tx.createdAt >= weekStart.toISOString())
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Calculate week end date
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6) // Sunday

    // Generate weekly challenges
    const weekly: WeeklyChallenge[] = WEEKLY_CHALLENGE_TEMPLATES.map((template) => {
      let progress = 0
      let completed = false

      switch (template.type) {
        case 'sessions':
          progress = weekSessions
          completed = weekSessions >= template.target
          break
        case 'xp':
          progress = weekXp
          completed = weekXp >= template.target
          break
        case 'streak':
          progress = user.currentStreak
          completed = user.currentStreak >= template.target
          break
      }

      return {
        ...template,
        progress,
        completed,
        claimed: serverClaimed[template.id] || false,
        periodStart: weekStartStr,
        expiresAt: weekEnd.toISOString(),
      }
    })

    setWeeklyChallenges(weekly)

    logger.debug('Challenges refreshed', {
      dailyCompleted: daily.filter((d) => d.completed).length,
      weeklyCompleted: weekly.filter((w) => w.completed).length,
      dailyClaimed: daily.filter((d) => d.claimed).length,
      weeklyClaimed: weekly.filter((w) => w.claimed).length,
    })

    // Sync challenges with server (non-blocking)
    try {
      const challengesToSync = [
        ...daily.map((d) => ({
          challengeId: d.id,
          challengeType: 'daily' as const,
          currentProgress: d.progress,
          targetValue: d.target,
          xpReward: d.xpReward,
        })),
        ...weekly.map((w) => ({
          challengeId: w.id,
          challengeType: 'weekly' as const,
          currentProgress: w.progress,
          targetValue: w.target,
          xpReward: w.xpReward,
        })),
      ]
      await syncChallengeProgress(challengesToSync)
      logger.debug('Challenges synced to server')
    } catch (error) {
      logger.warn('Failed to sync challenges to server', { error })
    }
  }, [user, sessions, diaryEntries, xpTransactions, badges])

  // Initialize challenges when user data loads
  useEffect(() => {
    if (user && !isLoading) {
      refreshChallenges()
    }
  }, [user, isLoading, sessions, diaryEntries, badges])

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/pt/agora/login')
  }, [supabase, router])

  // Claim challenge reward
  const claimChallenge = useCallback(
    async (
      challengeId: string,
      periodStart: string,
      isWeekly: boolean = false
    ): Promise<{ success: boolean; xpAwarded?: number; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' }

      try {
        const result = await claimChallengeReward(challengeId, periodStart)

        if (result.error) {
          if (result.alreadyClaimed) {
            return { success: true, xpAwarded: 0 }
          }
          return { success: false, error: result.error }
        }

        // Update local state
        if (isWeekly) {
          setWeeklyChallenges((prev) =>
            prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
          )
        } else {
          setDailyChallenges((prev) =>
            prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
          )
        }

        // Trigger celebration
        const xpAwarded = result.xpAwarded || 0
        if (xpAwarded > 0) {
          useCelebrationStore
            .getState()
            .celebrateMilestone('Desafio Concluido!', `+${xpAwarded} XP`, '🎯', xpAwarded)
        }

        // Refresh profile to update XP
        await refreshProfile()

        logger.info('Challenge reward claimed', { challengeId, xpAwarded })
        return { success: true, xpAwarded }
      } catch (error) {
        logger.error('Failed to claim challenge reward', { error, challengeId })
        return { success: false, error: 'Erro ao resgatar recompensa' }
      }
    },
    [user, refreshProfile]
  )

  // Onboarding: Set step
  const setOnboardingStep = useCallback(
    async (step: number) => {
      if (!user) return
      await updateProfile({ onboardingStep: step })
    },
    [user, updateProfile]
  )

  // Onboarding: Select tracks
  const selectTracks = useCallback(
    async (tracks: AgoraTrack[]) => {
      if (!user) return
      // Set onboardingStep to 3 (GitHub step) when tracks are confirmed
      await updateProfile({ tracks, onboardingStep: 3 })
      await addXp(25 * tracks.length, 'onboarding', `Trilhas selecionadas: ${tracks.join(', ')}`)
    },
    [user, updateProfile, addXp]
  )

  // Onboarding: Set GitHub username
  const setGitHubUsername = useCallback(
    async (username: string) => {
      if (!user) return
      // Advance to step 4 (Fork verification) after setting GitHub username
      await updateProfile({
        githubUsername: username,
        onboardingStep: 4,
      })
    },
    [user, updateProfile]
  )

  // Onboarding: Verify GitHub fork (real verification via GitHub API)
  const verifyGitHubForkFn = useCallback(async (): Promise<{
    success: boolean
    message: string
  }> => {
    if (!user || !user.githubUsername || user.tracks.length === 0) {
      return { success: false, message: 'Usuario ou trilhas nao definidos' }
    }

    try {
      // Import and call the real verification function
      const { verifyGitHubFork: verifyFork } = await import('@/lib/agora/github')
      const result = await verifyFork(user.githubUsername)

      if (result.success) {
        // Update database with verified status
        await supabase
          .from('agora_profiles')
          .update({
            github_fork_verified: true,
            github_fork_url: result.forkUrl || null,
          })
          .eq('user_id', user.id)

        await addXp(50, 'onboarding', 'Fork do repositorio verificado!')
        await updateProfile({ onboardingStep: 4 })
      }

      return result
    } catch (error) {
      logger.error('GitHub fork verification failed', { error })
      // On error, allow user to proceed (graceful degradation)
      await supabase
        .from('agora_profiles')
        .update({ github_fork_verified: true })
        .eq('user_id', user.id)

      await addXp(50, 'onboarding', 'Fork aceito provisoriamente')
      await updateProfile({ onboardingStep: 4 })

      return {
        success: true,
        message: 'Fork aceito provisoriamente. Verifique manualmente depois.',
      }
    }
  }, [user, supabase, addXp, updateProfile])

  // Onboarding: Complete
  const completeOnboarding = useCallback(async () => {
    if (!user) return
    await updateProfile({ hasCompletedOnboarding: true, onboardingStep: 5 })
    await addXp(100, 'onboarding', 'Onboarding concluido! Bem-vindo a Agora!')
    await checkAndAwardBadges()
  }, [user, updateProfile, addXp, checkAndAwardBadges])

  // Onboarding: Reset (for testing)
  const resetOnboarding = useCallback(async () => {
    if (!user) return
    await supabase
      .from('agora_profiles')
      .update({
        has_completed_onboarding: false,
        has_accepted_terms: false,
        onboarding_step: 0,
        tracks: [],
        github_fork_verified: false,
      })
      .eq('user_id', user.id)

    setSelectedTracks([])
    await refreshProfile()
    logger.info('Onboarding reset')
  }, [user, supabase, refreshProfile])

  // Backwards compatibility: initOnboarding (no-op, onboarding is always initialized)
  const initOnboarding = useCallback(() => {
    logger.debug('initOnboarding called (no-op in real auth mode)')
  }, [])

  // Backwards compatibility: updateOnboarding
  const updateOnboarding = useCallback(
    (updates: Partial<OnboardingData>) => {
      if (updates.selectedTracks) {
        setSelectedTracks(updates.selectedTracks)
      }
      if (updates.currentStep !== undefined && user) {
        updateProfile({ onboardingStep: updates.currentStep })
      }
    },
    [user, updateProfile]
  )

  // Backwards compatibility: toggleTrack
  const toggleTrack = useCallback((track: AgoraTrack) => {
    setSelectedTracks((prev) => {
      if (prev.includes(track)) {
        return prev.filter((t) => t !== track)
      } else {
        return [...prev, track]
      }
    })
  }, [])

  // Backwards compatibility: confirmTracks
  const confirmTracks = useCallback(async () => {
    if (!user || selectedTracks.length === 0) return
    // selectTracks already advances to step 3
    await selectTracks(selectedTracks)
  }, [user, selectedTracks, selectTracks])

  // Backwards compatibility: acceptInternshipContract (alias for acceptTerms)
  const acceptInternshipContract = useCallback(
    async (ipAddress?: string, userAgent?: string, contractId?: string) => {
      await acceptTerms(ipAddress, userAgent, contractId)
    },
    [acceptTerms]
  )

  const contextValue = useMemo(
    (): AgoraContextType => ({
      user,
      isAuthenticated,
      isLoading,
      isSuperuser,
      xpTransactions,
      diaryEntries,
      sessions,
      currentSession,
      badges,
      onboarding,
      // Gamification state
      dailyChallenges,
      weeklyChallenges,
      hasDailyBonus,
      streakMultiplier,
      // Backwards compatibility
      mode: 'real',
      isDemoMode: false,
      isRealAuth: true,
      // Actions
      refreshUser: loadUserData,
      refreshProfile,
      updateProfile,
      addXp,
      addDiaryEntry,
      startSession,
      endSession,
      acceptLgpdConsent,
      acceptTerms,
      acceptInternshipContract,
      checkAndAwardBadges,
      logout,
      // Gamification actions
      claimDailyBonus,
      claimChallenge,
      refreshChallenges,
      // Onboarding
      initOnboarding,
      updateOnboarding,
      toggleTrack,
      confirmTracks,
      setOnboardingStep,
      selectTracks,
      setGitHubUsername,
      verifyGitHubFork: verifyGitHubForkFn,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      isSuperuser,
      xpTransactions,
      diaryEntries,
      sessions,
      currentSession,
      badges,
      onboarding,
      dailyChallenges,
      weeklyChallenges,
      hasDailyBonus,
      streakMultiplier,
      loadUserData,
      refreshProfile,
      updateProfile,
      addXp,
      addDiaryEntry,
      startSession,
      endSession,
      acceptLgpdConsent,
      acceptTerms,
      acceptInternshipContract,
      checkAndAwardBadges,
      logout,
      claimDailyBonus,
      claimChallenge,
      refreshChallenges,
      initOnboarding,
      updateOnboarding,
      toggleTrack,
      confirmTracks,
      setOnboardingStep,
      selectTracks,
      setGitHubUsername,
      verifyGitHubForkFn,
      completeOnboarding,
      resetOnboarding,
    ]
  )

  return <AgoraContext.Provider value={contextValue}>{children}</AgoraContext.Provider>
}

export function useAgora() {
  const context = useContext(AgoraContext)
  if (context === undefined) {
    throw new Error('useAgora must be used within an AgoraProvider')
  }
  return context
}

// Re-export types
export type { AgoraContextType }
