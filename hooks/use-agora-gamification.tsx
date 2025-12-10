/**
 * Ágora Gamification Hook
 *
 * Manages XP, levels, ranks, badges, challenges, and streaks.
 * Separated from main auth for better code organization.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { trackBadgeEarned, trackLevelUp, trackRankUp } from '@/lib/analytics/agora-tracker'
import { useCelebrationStore } from '@/store/celebration-store'
import {
  syncChallengeProgress,
  getChallengeProgress,
  claimChallengeReward,
} from '@/app/pt/agora/actions'

const logger = createLogger('AgoraGamification')

// ============================================
// Types
// ============================================

export interface AgoraBadge {
  id: string
  type: string
  name: string
  description: string
  emoji: string
  earnedAt: string
  criteria: string
}

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
  periodStart: string
}

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
  periodStart: string
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

// Gamification user data (subset of full user)
export interface GamificationUser {
  id: string
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalTimeMinutes: number
  lastDailyBonusDate?: string
}

// ============================================
// Constants
// ============================================

export const GAMIFICATION = {
  DAILY_LOGIN_BONUS: 5,
  STREAK_MULTIPLIERS: {
    3: 1.1,
    7: 1.25,
    14: 1.5,
    30: 2.0,
  } as Record<number, number>,
  STREAK_MILESTONES: [3, 7, 14, 21, 30, 60, 90, 180, 365] as const,
}

// Badge definitions
const BADGE_DEFINITIONS = [
  // Tier 1 - Beginner
  {
    id: 'pioneiro',
    type: 'pioneiro',
    name: 'Pioneiro',
    description: 'Primeiro login na Ágora',
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
    check: (u: GamificationUser) => u.totalXp >= 100,
  },
  {
    id: 'primeiro-passo',
    type: 'primeiro-passo',
    name: 'Primeiro Passo',
    description: 'Completou a primeira sessão de estudo',
    emoji: '👣',
    criteria: '1+ sessão',
    xpReward: 20,
    check: (u: GamificationUser) => u.totalSessions >= 1,
  },

  // Tier 2 - Intermediate
  {
    id: 'explorador',
    type: 'explorador',
    name: 'Explorador',
    description: 'Completou 5 sessões de estudo',
    emoji: '🧭',
    criteria: '5+ sessões',
    xpReward: 30,
    check: (u: GamificationUser) => u.totalSessions >= 5,
  },
  {
    id: 'japaguri',
    type: 'japaguri',
    name: 'Japaguri',
    description: 'Assíduo: 3+ dias seguidos ou 5+ sessões',
    emoji: '🍜',
    criteria: '3+ streak OU 5+ sessões',
    xpReward: 50,
    check: (u: GamificationUser) => u.currentStreak >= 3 || u.totalSessions >= 5,
  },
  {
    id: 'estudioso',
    type: 'estudioso',
    name: 'Estudioso',
    description: 'Acumulou 500 XP',
    emoji: '📚',
    criteria: '500+ XP',
    xpReward: 40,
    check: (u: GamificationUser) => u.totalXp >= 500,
  },
  {
    id: 'maratonista',
    type: 'maratonista',
    name: 'Maratonista',
    description: '60 minutos de estudo acumulado',
    emoji: '🏃',
    criteria: '60+ minutos',
    xpReward: 35,
    check: (u: GamificationUser) => u.totalTimeMinutes >= 60,
  },

  // Tier 3 - Advanced
  {
    id: 'dedicado',
    type: 'dedicado',
    name: 'Dedicado',
    description: '7 dias seguidos de estudo',
    emoji: '⭐',
    criteria: '7+ dias de streak',
    xpReward: 75,
    check: (u: GamificationUser) => u.currentStreak >= 7,
  },
  {
    id: 'veterano',
    type: 'veterano',
    name: 'Veterano',
    description: 'Completou 20 sessões de estudo',
    emoji: '🎖️',
    criteria: '20+ sessões',
    xpReward: 60,
    check: (u: GamificationUser) => u.totalSessions >= 20,
  },
  {
    id: 'scholar',
    type: 'scholar',
    name: 'Scholar',
    description: 'Acumulou 1000 XP',
    emoji: '🎓',
    criteria: '1000+ XP',
    xpReward: 75,
    check: (u: GamificationUser) => u.totalXp >= 1000,
  },
  {
    id: 'persistente',
    type: 'persistente',
    name: 'Persistente',
    description: '14 dias seguidos de estudo',
    emoji: '💪',
    criteria: '14+ dias de streak',
    xpReward: 100,
    check: (u: GamificationUser) => u.currentStreak >= 14,
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
    check: (u: GamificationUser) => u.totalXp >= 2500,
  },
  {
    id: 'lenda',
    type: 'lenda',
    name: 'Lenda',
    description: '30 dias seguidos de estudo',
    emoji: '🏆',
    criteria: '30+ dias de streak',
    xpReward: 200,
    check: (u: GamificationUser) => u.currentStreak >= 30,
  },
  {
    id: 'centuriao',
    type: 'centuriao',
    name: 'Centurião',
    description: '100 sessões completadas',
    emoji: '⚔️',
    criteria: '100+ sessões',
    xpReward: 250,
    check: (u: GamificationUser) => u.totalSessions >= 100,
  },
  {
    id: 'iluminado',
    type: 'iluminado',
    name: 'Iluminado',
    description: 'Acumulou 5000 XP',
    emoji: '✨',
    criteria: '5000+ XP',
    xpReward: 300,
    check: (u: GamificationUser) => u.totalXp >= 5000,
  },
]

// Challenge templates
const DAILY_CHALLENGE_TEMPLATES = [
  {
    id: 'daily-session',
    name: 'Sessão Diária',
    description: 'Complete 1 sessão de estudo hoje',
    emoji: '🎯',
    xpReward: 15,
    type: 'session' as const,
    target: 1,
  },
  {
    id: 'daily-diary',
    name: 'Reflexão Diária',
    description: 'Escreva uma entrada no diário',
    emoji: '📝',
    xpReward: 10,
    type: 'diary' as const,
    target: 1,
  },
  {
    id: 'daily-time',
    name: 'Tempo Dedicado',
    description: 'Estude por 30 minutos hoje',
    emoji: '⏱️',
    xpReward: 20,
    type: 'time' as const,
    target: 30,
  },
]

const WEEKLY_CHALLENGE_TEMPLATES = [
  {
    id: 'weekly-sessions',
    name: 'Maratonista Semanal',
    description: 'Complete 5 sessões esta semana',
    emoji: '🏃',
    xpReward: 100,
    type: 'sessions' as const,
    target: 5,
  },
  {
    id: 'weekly-xp',
    name: 'Caçador de XP',
    description: 'Ganhe 200 XP esta semana',
    emoji: '⭐',
    xpReward: 75,
    type: 'xp' as const,
    target: 200,
  },
  {
    id: 'weekly-streak',
    name: 'Consistência',
    description: 'Mantenha um streak de 5 dias',
    emoji: '🔥',
    xpReward: 150,
    type: 'streak' as const,
    target: 5,
  },
]

// ============================================
// Utility Functions
// ============================================

export function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(GAMIFICATION.STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a)

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return GAMIFICATION.STREAK_MULTIPLIERS[threshold]
    }
  }
  return 1.0
}

function calculateRank(totalXp: number): string {
  if (totalXp >= 5000) return 'arquiteto'
  if (totalXp >= 2000) return 'mentor'
  if (totalXp >= 500) return 'contribuidor'
  if (totalXp >= 100) return 'aprendiz'
  return 'novato'
}

function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1
}

// ============================================
// Context & Hook
// ============================================

export interface UseAgoraGamificationReturn {
  // State
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  longestStreak: number
  streakMultiplier: number
  badges: AgoraBadge[]
  xpTransactions: XpTransaction[]
  dailyChallenges: DailyChallenge[]
  weeklyChallenges: WeeklyChallenge[]
  hasDailyBonus: boolean
  isLoading: boolean

  // Actions
  addXp: (amount: number, sourceType: string, description: string) => Promise<void>
  checkAndAwardBadges: () => Promise<void>
  claimDailyBonus: () => Promise<boolean>
  claimChallenge: (
    challengeId: string,
    periodStart: string,
    isWeekly?: boolean
  ) => Promise<{ success: boolean; xpAwarded?: number; error?: string }>
  refreshChallenges: () => Promise<void>
  updateStreak: () => Promise<void>
}

interface AgoraGamificationProviderProps {
  children: React.ReactNode
  userId: string | null
}

const AgoraGamificationContext = createContext<UseAgoraGamificationReturn | undefined>(undefined)

export function AgoraGamificationProvider({ children, userId }: AgoraGamificationProviderProps) {
  const supabase = createClient()

  // State
  const [gamificationUser, setGamificationUser] = useState<GamificationUser | null>(null)
  const [badges, setBadges] = useState<AgoraBadge[]>([])
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([])
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])
  const [hasDailyBonus, setHasDailyBonus] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // For challenge calculation
  const [sessions, setSessions] = useState<
    { startedAt: string; status: string; durationMinutes: number }[]
  >([])
  const [diaryEntries, setDiaryEntries] = useState<{ entryDate: string }[]>([])

  // Derived
  const streakMultiplier = gamificationUser
    ? getStreakMultiplier(gamificationUser.currentStreak)
    : 1.0

  // Load gamification data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load profile
        const { data: profile } = await supabase
          .from('agora_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (profile) {
          setGamificationUser({
            id: userId,
            totalXp: profile.total_xp || 0,
            currentLevel: profile.current_level || 1,
            currentRank: profile.current_rank || 'novato',
            currentStreak: profile.current_streak || 0,
            longestStreak: profile.longest_streak || 0,
            totalSessions: profile.total_sessions || 0,
            totalTimeMinutes: profile.total_time_minutes || 0,
            lastDailyBonusDate: profile.last_daily_bonus_date,
          })

          // Check daily bonus
          const today = new Date().toISOString().split('T')[0]
          setHasDailyBonus(profile.last_daily_bonus_date !== today)

          // Load badges
          if (profile.badges) {
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
        }

        // Load XP transactions
        const { data: xpData } = await supabase
          .from('agora_xp_transactions')
          .select('*')
          .eq('user_id', userId)
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

        // Load sessions for challenge tracking
        const { data: sessionsData } = await supabase
          .from('agora_sessions')
          .select('started_at, status, duration_minutes')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(50)

        if (sessionsData) {
          setSessions(
            sessionsData.map((s) => ({
              startedAt: s.started_at,
              status: s.status || 'completed',
              durationMinutes: s.duration_minutes || 0,
            }))
          )
        }

        // Load diary entries for challenge tracking
        const { data: diaryData } = await supabase
          .from('agora_diary_entries')
          .select('entry_date')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (diaryData) {
          setDiaryEntries(diaryData.map((d) => ({ entryDate: d.entry_date || '' })))
        }
      } catch (error) {
        logger.error('Failed to load gamification data', { error })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, supabase])

  // Add XP
  const addXp = useCallback(
    async (amount: number, sourceType: string, description: string) => {
      if (!userId || !gamificationUser) return

      try {
        const newXp = gamificationUser.totalXp + amount
        const newLevel = calculateLevel(newXp)
        const oldLevel = gamificationUser.currentLevel
        const oldRank = gamificationUser.currentRank
        const newRank = calculateRank(newXp)

        // Update profile
        await supabase
          .from('agora_profiles')
          .update({
            total_xp: newXp,
            current_level: newLevel,
            current_rank: newRank,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', userId)

        // Insert XP transaction
        const { data: txData } = await supabase
          .from('agora_xp_transactions')
          .insert({
            user_id: userId,
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

        // Track milestones
        if (newLevel > oldLevel) {
          trackLevelUp(oldLevel, newLevel, newXp)
          useCelebrationStore.getState().celebrateLevelUp(newLevel)
        }
        if (newRank !== oldRank) {
          trackRankUp(oldRank, newRank, newLevel)
          useCelebrationStore.getState().celebrateRankUp(newRank)
        }

        setGamificationUser((prev) =>
          prev ? { ...prev, totalXp: newXp, currentLevel: newLevel, currentRank: newRank } : null
        )

        logger.info('XP added', { amount, newXp, sourceType })
      } catch (error) {
        logger.error('Failed to add XP', { error })
      }
    },
    [userId, gamificationUser, supabase]
  )

  // Check and award badges
  const checkAndAwardBadges = useCallback(async () => {
    if (!userId || !gamificationUser) return

    try {
      const { data: profile } = await supabase
        .from('agora_profiles')
        .select('badges')
        .eq('user_id', userId)
        .single()

      const currentBadges: string[] = (profile?.badges as string[]) || []
      const newBadgeIds: string[] = []
      let bonusXp = 0

      for (const badge of BADGE_DEFINITIONS) {
        if (currentBadges.includes(badge.id)) continue
        if (badge.check(gamificationUser)) {
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
          .eq('user_id', userId)

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

        // Celebrate badges
        for (const badge of newBadges) {
          useCelebrationStore.getState().celebrateBadge(badge.name, badge.emoji, 0)
        }
      }
    } catch (error) {
      logger.error('Failed to check badges', { error })
    }
  }, [userId, gamificationUser, supabase, addXp])

  // Claim daily bonus
  const claimDailyBonus = useCallback(async (): Promise<boolean> => {
    if (!userId || !gamificationUser || !hasDailyBonus) return false

    try {
      const today = new Date().toISOString().split('T')[0]

      await supabase
        .from('agora_profiles')
        .update({ last_daily_bonus_date: today })
        .eq('user_id', userId)

      const baseBonus = GAMIFICATION.DAILY_LOGIN_BONUS
      const multiplier = getStreakMultiplier(gamificationUser.currentStreak)
      const bonusAmount = Math.round(baseBonus * multiplier)

      const bonusDescription =
        multiplier > 1
          ? `Bônus diário de login (+${Math.round((multiplier - 1) * 100)}% streak bonus!)`
          : 'Bônus diário de login'

      await addXp(bonusAmount, 'daily_login', bonusDescription)

      setGamificationUser((prev) => (prev ? { ...prev, lastDailyBonusDate: today } : null))
      setHasDailyBonus(false)

      logger.info('Daily bonus claimed', { amount: bonusAmount, multiplier })
      return true
    } catch (error) {
      logger.error('Failed to claim daily bonus', { error })
      return false
    }
  }, [userId, gamificationUser, hasDailyBonus, supabase, addXp])

  // Refresh challenges
  const refreshChallenges = useCallback(async () => {
    if (!userId || !gamificationUser) return

    const today = new Date().toISOString().split('T')[0]

    // Week start (Monday)
    const weekStart = new Date()
    const dayOfWeek = weekStart.getDay()
    weekStart.setDate(weekStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
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
      logger.warn('Failed to fetch challenge progress', { error })
    }

    // Calculate today's stats
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

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

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
          progress = gamificationUser.currentStreak
          completed = gamificationUser.currentStreak >= template.target
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

    // Sync with server
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
    } catch (error) {
      logger.warn('Failed to sync challenges', { error })
    }
  }, [userId, gamificationUser, sessions, diaryEntries, xpTransactions])

  // Claim challenge
  const claimChallenge = useCallback(
    async (
      challengeId: string,
      periodStart: string,
      isWeekly: boolean = false
    ): Promise<{ success: boolean; xpAwarded?: number; error?: string }> => {
      if (!userId) return { success: false, error: 'Not authenticated' }

      try {
        const result = await claimChallengeReward(challengeId, periodStart)

        if (result.error) {
          if (result.alreadyClaimed) return { success: true, xpAwarded: 0 }
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

        const xpAwarded = result.xpAwarded || 0
        if (xpAwarded > 0) {
          useCelebrationStore
            .getState()
            .celebrateMilestone('Desafio Concluído!', `+${xpAwarded} XP`, '🎯', xpAwarded)
        }

        logger.info('Challenge claimed', { challengeId, xpAwarded })
        return { success: true, xpAwarded }
      } catch (error) {
        logger.error('Failed to claim challenge', { error, challengeId })
        return { success: false, error: 'Erro ao resgatar recompensa' }
      }
    },
    [userId]
  )

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!userId || !gamificationUser) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const lastActivity = gamificationUser.lastDailyBonusDate

      let newStreak = gamificationUser.currentStreak
      let newLongestStreak = gamificationUser.longestStreak

      if (!lastActivity) {
        newStreak = 1
      } else {
        const lastDate = new Date(lastActivity)
        const todayDate = new Date(today)
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 0) {
          // Same day
        } else if (diffDays === 1) {
          newStreak = gamificationUser.currentStreak + 1
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
        .eq('user_id', userId)

      setGamificationUser((prev) =>
        prev ? { ...prev, currentStreak: newStreak, longestStreak: newLongestStreak } : null
      )

      logger.info('Streak updated', { newStreak, newLongestStreak })
    } catch (error) {
      logger.error('Failed to update streak', { error })
    }
  }, [userId, gamificationUser, supabase])

  // Initialize challenges when data loads
  useEffect(() => {
    if (gamificationUser && !isLoading) {
      refreshChallenges()
    }
  }, [gamificationUser, isLoading, sessions, diaryEntries])

  // Context value
  const contextValue = useMemo(
    (): UseAgoraGamificationReturn => ({
      totalXp: gamificationUser?.totalXp || 0,
      currentLevel: gamificationUser?.currentLevel || 1,
      currentRank: gamificationUser?.currentRank || 'novato',
      currentStreak: gamificationUser?.currentStreak || 0,
      longestStreak: gamificationUser?.longestStreak || 0,
      streakMultiplier,
      badges,
      xpTransactions,
      dailyChallenges,
      weeklyChallenges,
      hasDailyBonus,
      isLoading,
      addXp,
      checkAndAwardBadges,
      claimDailyBonus,
      claimChallenge,
      refreshChallenges,
      updateStreak,
    }),
    [
      gamificationUser,
      streakMultiplier,
      badges,
      xpTransactions,
      dailyChallenges,
      weeklyChallenges,
      hasDailyBonus,
      isLoading,
      addXp,
      checkAndAwardBadges,
      claimDailyBonus,
      claimChallenge,
      refreshChallenges,
      updateStreak,
    ]
  )

  return (
    <AgoraGamificationContext.Provider value={contextValue}>
      {children}
    </AgoraGamificationContext.Provider>
  )
}

export function useAgoraGamification(): UseAgoraGamificationReturn {
  const context = useContext(AgoraGamificationContext)

  if (context === undefined) {
    throw new Error('useAgoraGamification must be used within an AgoraGamificationProvider')
  }

  return context
}
