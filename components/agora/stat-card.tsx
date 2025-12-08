/**
 * Academy Stat Card Component
 *
 * Reusable statistics card following the design system with:
 * - Icon display with gradient background
 * - Value and label
 * - Optional progress bar
 * - Optional trend indicator
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  sublabel?: string
  progress?: {
    current: number
    max: number
    label?: string
  }
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor?: 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'red'
  className?: string
}

const iconColorClasses = {
  green: 'from-green-500 to-emerald-600 shadow-green-500/25',
  blue: 'from-blue-500 to-indigo-600 shadow-blue-500/25',
  purple: 'from-purple-500 to-violet-600 shadow-purple-500/25',
  orange: 'from-orange-500 to-amber-600 shadow-orange-500/25',
  yellow: 'from-yellow-400 to-amber-500 shadow-yellow-400/25',
  red: 'from-red-500 to-rose-600 shadow-red-500/25',
}

const progressColorClasses = {
  green: 'from-green-500 to-emerald-500',
  blue: 'from-blue-500 to-indigo-500',
  purple: 'from-purple-500 to-violet-500',
  orange: 'from-orange-500 to-amber-500',
  yellow: 'from-yellow-400 to-amber-400',
  red: 'from-red-500 to-rose-500',
}

export function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  progress,
  trend,
  iconColor = 'green',
  className,
}: StatCardProps) {
  const progressPercent = progress ? Math.min((progress.current / progress.max) * 100, 100) : 0

  return (
    <Card
      variant="elevated"
      padding="md"
      className={cn(
        'relative overflow-hidden group h-full min-h-[160px]',
        'hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(var(--academy-bg-secondary)/0.5)] to-transparent rounded-bl-[80px] -z-0" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br shadow-lg',
              'group-hover:scale-105 transition-transform duration-300',
              iconColorClasses[iconColor]
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                trend.isPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value and Label */}
        <div className="flex-1">
          <p className="text-2xl sm:text-3xl font-bold academy-text leading-tight">{value}</p>
          <p className="text-sm academy-text-muted mt-1">{label}</p>

          {/* Sublabel */}
          {sublabel && !progress && <p className="text-xs academy-text-muted mt-1">{sublabel}</p>}
        </div>

        {/* Progress bar */}
        {progress && (
          <div className="mt-4 pt-3 border-t border-[hsl(var(--academy-border))]">
            <div className="h-2 bg-[hsl(var(--academy-bg-secondary))] rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  'h-full bg-gradient-to-r rounded-full transition-all duration-500',
                  progressColorClasses[iconColor]
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs academy-text-muted">
              <span>{progress.current.toLocaleString()} XP</span>
              <span>{progress.max.toLocaleString()} XP</span>
            </div>
            {progress.label && (
              <p className="text-xs academy-text-muted mt-1 truncate">{progress.label}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom gradient line */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity',
          progressColorClasses[iconColor]
        )}
      />
    </Card>
  )
}
