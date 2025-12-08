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

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
} from 'lucide-react'
import { useAgora, type DailyChallenge, type WeeklyChallenge } from '@/hooks/use-agora'

interface GamificationCardProps {
  className?: string
}

// Compact challenge item
function ChallengeItem({
  challenge,
  isWeekly = false,
}: {
  challenge: DailyChallenge | WeeklyChallenge
  isWeekly?: boolean
}) {
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100)

  return (
    <div
      className={cn(
        'p-3 rounded-lg transition-all',
        challenge.completed
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-800/50'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {challenge.name}
            </span>
            {challenge.completed && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {challenge.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
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
        </div>
      </div>
      {!challenge.completed && (
        <Progress value={progress} className="h-1.5 mt-2" indicatorClassName="bg-yellow-500" />
      )}
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
  } = useAgora()

  const [isClaimingBonus, setIsClaimingBonus] = useState(false)
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

  const completedDaily = dailyChallenges.filter((c) => c.completed).length
  const completedWeekly = weeklyChallenges.filter((c) => c.completed).length
  const totalDailyXp = dailyChallenges.reduce((sum, c) => sum + c.xpReward, 0)
  const totalWeeklyXp = weeklyChallenges.reduce((sum, c) => sum + c.xpReward, 0)

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
              <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Desafios</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ganhe XP extra!</p>
            </div>
          </div>

          {/* Streak Multiplier Badge */}
          {streakMultiplier > 1 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {Math.round((streakMultiplier - 1) * 100)}% bonus
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Daily Bonus */}
        {hasDailyBonus && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Bonus Diario</p>
                  <p className="text-xs text-white/80">
                    +{Math.round(5 * streakMultiplier)} XP disponivel!
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClaimBonus}
                disabled={isClaimingBonus}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                size="sm"
              >
                {isClaimingBonus ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desafios Diarios
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {completedDaily}/{dailyChallenges.length} ({totalDailyXp} XP)
            </span>
          </div>
          <div className="space-y-2">
            {dailyChallenges.map((challenge) => (
              <ChallengeItem key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>

        {/* Weekly Challenges Toggle */}
        <button
          onClick={() => setShowWeekly(!showWeekly)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Desafios Semanais
            </span>
            <span className="text-xs text-gray-500">
              ({completedWeekly}/{weeklyChallenges.length})
            </span>
          </div>
          {showWeekly ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Weekly Challenges */}
        {showWeekly && (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
              Total disponivel: {totalWeeklyXp} XP
            </p>
            {weeklyChallenges.map((challenge) => (
              <ChallengeItem key={challenge.id} challenge={challenge} isWeekly />
            ))}
          </div>
        )}

        {/* Streak Info */}
        {user.currentStreak > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {user.currentStreak} dias consecutivos!
              </span>
            </div>
            {user.currentStreak >= 3 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Bonus {Math.round((streakMultiplier - 1) * 100)}% ativo
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
