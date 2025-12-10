'use client'

/**
 * Kids Progress Timeline
 *
 * Visual timeline showing child's progress with friendly icons and colors.
 * No numbers or scores - just visual milestones and encouragement.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-09
 */

import { useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  calculateKidsLevel,
  getEncouragementMessage,
  formatKidsTime,
  type KidsTelemetryData,
  type KidsMilestone,
  KIDS_CERTIFICATE_LEVELS,
} from '@/lib/agora/kids-certificate-requirements'
import { Star, Trophy, Sparkles } from 'lucide-react'

interface KidsProgressTimelineProps {
  telemetry: KidsTelemetryData
  childName: string
  className?: string
}

export function KidsProgressTimeline({
  telemetry,
  childName,
  className,
}: KidsProgressTimelineProps) {
  const { currentLevel, nextLevel, progress, milestones } = useMemo(
    () => calculateKidsLevel(telemetry),
    [telemetry]
  )

  const encouragement = getEncouragementMessage(progress, currentLevel)

  // Get completed milestones count
  const completedMilestones = milestones.filter((m) => m.isCompleted).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with child name and encouragement */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Olá, {childName}! {currentLevel?.emoji || '🌟'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">{encouragement}</p>
      </div>

      {/* Current Level Badge */}
      {currentLevel && (
        <div
          className="mx-auto max-w-sm p-6 rounded-3xl text-center shadow-lg"
          style={{ backgroundColor: `${currentLevel.color}20` }}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3"
            style={{ backgroundColor: currentLevel.color }}
          >
            {currentLevel.emoji}
          </div>
          <h3 className="text-xl font-bold" style={{ color: currentLevel.color }}>
            {currentLevel.label}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentLevel.description}
          </p>
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/50 dark:bg-black/20">
            <Trophy className="w-4 h-4" style={{ color: currentLevel.color }} />
            <span className="text-sm font-medium" style={{ color: currentLevel.color }}>
              {currentLevel.version}
            </span>
          </div>
        </div>
      )}

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Próximo: {nextLevel.label}
            </span>
            <span className="text-2xl">{nextLevel.emoji}</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: nextLevel.color,
              }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            {progress < 100 ? 'Continue assim!' : 'Quase lá!'}
          </p>
        </div>
      )}

      {/* Visual Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Sua Jornada
        </h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

          {/* Milestones */}
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                isLast={index === milestones.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-[#4ECDC4]">{completedMilestones}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Conquistas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FF6B6B]">{telemetry.videosWatched}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Vídeos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFE66D]">{telemetry.daysActive}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Dias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time spent (friendly format) */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Você já estudou por {formatKidsTime(telemetry.totalTimeMinutes)}! 🎉
      </div>
    </div>
  )
}

interface MilestoneItemProps {
  milestone: KidsMilestone
  isLast: boolean
}

function MilestoneItem({ milestone, isLast }: MilestoneItemProps) {
  return (
    <div className="relative flex items-start gap-4 pl-2">
      {/* Icon circle */}
      <div
        className={cn(
          'relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all',
          milestone.isCompleted
            ? 'bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] shadow-lg scale-110'
            : 'bg-gray-200 dark:bg-gray-700 opacity-50'
        )}
      >
        {milestone.icon}
      </div>

      {/* Content */}
      <div
        className={cn('flex-1 pb-4', !isLast && 'border-b border-gray-100 dark:border-gray-700/50')}
      >
        <h4
          className={cn(
            'font-semibold',
            milestone.isCompleted
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {milestone.label}
        </h4>
        <p
          className={cn(
            'text-sm',
            milestone.isCompleted
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-400 dark:text-gray-600'
          )}
        >
          {milestone.description}
        </p>
        {milestone.isCompleted && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#4ECDC4]">
            <Star className="w-3 h-3 fill-current" />
            Conquistado!
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Level badges display (horizontal)
 */
export function KidsLevelBadges({ telemetry }: { telemetry: KidsTelemetryData }) {
  const { currentLevel } = calculateKidsLevel(telemetry)

  return (
    <div className="flex justify-center gap-4">
      {KIDS_CERTIFICATE_LEVELS.map((level) => {
        const isAchieved =
          currentLevel &&
          KIDS_CERTIFICATE_LEVELS.indexOf(level) <= KIDS_CERTIFICATE_LEVELS.indexOf(currentLevel)

        return (
          <div
            key={level.id}
            className={cn(
              'flex flex-col items-center p-3 rounded-xl transition-all',
              isAchieved ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'
            )}
          >
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-2xl',
                isAchieved ? 'shadow-lg' : ''
              )}
              style={{ backgroundColor: isAchieved ? level.color : '#e5e7eb' }}
            >
              {level.emoji}
            </div>
            <span
              className="text-xs font-medium mt-1"
              style={{ color: isAchieved ? level.color : '#9ca3af' }}
            >
              {level.version}
            </span>
          </div>
        )
      })}
    </div>
  )
}
