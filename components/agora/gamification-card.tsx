/**
 * Gamification Card Component
 *
 * Displays daily bonus, streak multiplier, and challenges.
 * Encourages engagement through gamification elements.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import {
  Gift,
  Flame,
  Target,
  Calendar,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Timer,
  Trophy,
} from 'lucide-react'
import { useAgora, type DailyChallenge, type WeeklyChallenge } from '@/hooks/use-agora'

interface GamificationCardProps {
  className?: string
}

// Calculate time until reset
function getTimeUntilReset(isWeekly: boolean): { hours: number; minutes: number; seconds: number } {
  const now = new Date()

  if (isWeekly) {
    // Weekly reset on Monday at 00:00
    const dayOfWeek = now.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + daysUntilMonday)
    nextMonday.setHours(0, 0, 0, 0)
    const diff = nextMonday.getTime() - now.getTime()
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  } else {
    // Daily reset at midnight
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow.getTime() - now.getTime()
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }
}

// Format time as HH:MM:SS
function formatTimeUntilReset(time: { hours: number; minutes: number; seconds: number }): string {
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`
}

// Reset timer hook
function useResetTimer(isWeekly: boolean) {
  const [time, setTime] = useState(getTimeUntilReset(isWeekly))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilReset(isWeekly))
    }, 1000)
    return () => clearInterval(interval)
  }, [isWeekly])

  return time
}

// Challenge item component
function ChallengeItem({
  challenge,
  isWeekly = false,
  onClaim,
  isClaiming,
}: {
  challenge: DailyChallenge | WeeklyChallenge
  isWeekly?: boolean
  onClaim: (challengeId: string, periodStart: string, isWeekly: boolean) => Promise<void>
  isClaiming: boolean
}) {
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100)
  const canClaim = challenge.completed && !challenge.claimed

  const handleClaim = async () => {
    await onClaim(challenge.id, challenge.periodStart, isWeekly)
  }

  return (
    <div
      className={cn(
        'p-3 rounded-lg transition-all',
        challenge.claimed
          ? 'bg-[hsl(var(--academy-bg-secondary))] border border-[hsl(var(--academy-border))] opacity-75'
          : challenge.completed
            ? 'bg-[hsl(var(--academy-success)/0.1)] border border-[hsl(var(--academy-success)/0.3)]'
            : 'bg-[hsl(var(--academy-bg-secondary))]'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-sm truncate',
                challenge.claimed ? 'academy-text-muted' : 'academy-text'
              )}
            >
              {challenge.name}
            </span>
            {challenge.claimed && (
              <Trophy
                className="w-4 h-4 text-yellow-500 flex-shrink-0"
                aria-label="Recompensa resgatada"
              />
            )}
            {challenge.completed && !challenge.claimed && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs truncate academy-text-muted">{challenge.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {canClaim ? (
            <Button
              onClick={handleClaim}
              disabled={isClaiming}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
            >
              {isClaiming ? (
                <Sparkles className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Gift className="w-3 h-3 mr-1" />
                  Resgatar
                </>
              )}
            </Button>
          ) : challenge.claimed ? (
            <span className="text-xs font-medium academy-text-muted">Resgatado</span>
          ) : (
            <>
              <span
                className={cn(
                  'text-xs font-bold',
                  challenge.completed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                )}
              >
                +{challenge.xpReward} XP
              </span>
              <p className="text-[10px] text-gray-400">
                {challenge.progress}/{challenge.target}
              </p>
            </>
          )}
        </div>
      </div>
      {!challenge.completed && !challenge.claimed && (
        <Progress value={progress} className="h-1.5 mt-2" indicatorClassName="bg-yellow-500" />
      )}
    </div>
  )
}

// Reset timer display component
function ResetTimerDisplay({ isWeekly }: { isWeekly: boolean }) {
  const time = useResetTimer(isWeekly)

  return (
    <div className="flex items-center gap-1 text-xs academy-text-muted">
      <Timer className="w-3 h-3" />
      <span>Reinicia em {formatTimeUntilReset(time)}</span>
    </div>
  )
}

export function GamificationCard({ className }: GamificationCardProps) {
  const {
    user,
    hasDailyBonus,
    streakMultiplier,
    dailyChallenges,
    weeklyChallenges,
    claimDailyBonus,
    claimChallenge,
  } = useAgora()

  const [isClaimingBonus, setIsClaimingBonus] = useState(false)
  const [claimingChallengeId, setClaimingChallengeId] = useState<string | null>(null)
  const [showWeekly, setShowWeekly] = useState(false)

  if (!user) return null

  const handleClaimBonus = async () => {
    setIsClaimingBonus(true)
    try {
      await claimDailyBonus()
    } finally {
      setIsClaimingBonus(false)
    }
  }

  const handleClaimChallenge = async (
    challengeId: string,
    periodStart: string,
    isWeekly: boolean
  ) => {
    setClaimingChallengeId(challengeId)
    try {
      await claimChallenge(challengeId, periodStart, isWeekly)
    } finally {
      setClaimingChallengeId(null)
    }
  }

  const completedDaily = dailyChallenges.filter((c) => c.completed).length
  const claimedDaily = dailyChallenges.filter((c) => c.claimed).length
  const completedWeekly = weeklyChallenges.filter((c) => c.completed).length
  const claimedWeekly = weeklyChallenges.filter((c) => c.claimed).length
  const totalDailyXp = dailyChallenges.reduce((sum, c) => sum + c.xpReward, 0)
  const totalWeeklyXp = weeklyChallenges.reduce((sum, c) => sum + c.xpReward, 0)
  const unclaimedDailyXp = dailyChallenges
    .filter((c) => c.completed && !c.claimed)
    .reduce((sum, c) => sum + c.xpReward, 0)
  const unclaimedWeeklyXp = weeklyChallenges
    .filter((c) => c.completed && !c.claimed)
    .reduce((sum, c) => sum + c.xpReward, 0)

  return (
    <GlassCard className={cn('overflow-hidden', className)}>
      {/* Header */}
      <GlassCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Target className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="font-medium text-sm academy-text">Desafios</h3>
              <p className="text-[10px] academy-text-muted">Ganhe XP extra</p>
            </div>
          </div>

          {/* Streak Multiplier Badge */}
          {streakMultiplier > 1 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30">
              <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                +{Math.round((streakMultiplier - 1) * 100)}%
              </span>
            </div>
          )}
        </div>
      </GlassCardHeader>

      <GlassCardContent className="pt-2 space-y-4">
        {/* Daily Bonus */}
        {hasDailyBonus && (
          <div className="p-3 rounded-lg bg-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bonus Diario</p>
                  <p className="text-xs text-white/70">+{Math.round(5 * streakMultiplier)} XP</p>
                </div>
              </div>
              <Button
                onClick={handleClaimBonus}
                disabled={isClaimingBonus}
                className="bg-white/20 hover:bg-white/30 text-white border-0 h-8 text-xs"
                size="sm"
              >
                {isClaimingBonus ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Coletar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Daily Challenges Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium academy-text">Desafios Diarios</span>
            </div>
            <div className="flex items-center gap-3">
              <ResetTimerDisplay isWeekly={false} />
              <span className="text-xs academy-text-muted">
                {claimedDaily}/{completedDaily}/{dailyChallenges.length}
              </span>
            </div>
          </div>

          {/* Unclaimed XP indicator */}
          {unclaimedDailyXp > 0 && (
            <div className="mb-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-md text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>{unclaimedDailyXp} XP disponiveis para resgate!</span>
            </div>
          )}

          <div className="space-y-2">
            {dailyChallenges.map((challenge) => (
              <ChallengeItem
                key={challenge.id}
                challenge={challenge}
                isWeekly={false}
                onClaim={handleClaimChallenge}
                isClaiming={claimingChallengeId === challenge.id}
              />
            ))}
          </div>
        </div>

        {/* Weekly Challenges Toggle */}
        <button
          onClick={() => setShowWeekly(!showWeekly)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--academy-bg-secondary))] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium academy-text">Desafios Semanais</span>
            <span className="text-xs academy-text-muted">
              ({claimedWeekly}/{completedWeekly}/{weeklyChallenges.length})
            </span>
            {unclaimedWeeklyXp > 0 && (
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-[10px] text-green-700 dark:text-green-300">
                {unclaimedWeeklyXp} XP
              </span>
            )}
          </div>
          {showWeekly ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Weekly Challenges */}
        {showWeekly && (
          <div className="space-y-2 pt-2 border-t border-[hsl(var(--academy-border))]">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs academy-text-muted">Total disponivel: {totalWeeklyXp} XP</p>
              <ResetTimerDisplay isWeekly={true} />
            </div>
            {weeklyChallenges.map((challenge) => (
              <ChallengeItem
                key={challenge.id}
                challenge={challenge}
                isWeekly
                onClaim={handleClaimChallenge}
                isClaiming={claimingChallengeId === challenge.id}
              />
            ))}
          </div>
        )}

        {/* Streak Info */}
        {user.currentStreak > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium academy-text">
                {user.currentStreak} dias consecutivos
              </span>
            </div>
            {user.currentStreak >= 3 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                +{Math.round((streakMultiplier - 1) * 100)}% bonus
              </span>
            )}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
