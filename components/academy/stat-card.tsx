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
        'relative overflow-hidden group',
        'hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-800/50 rounded-bl-[100px] -z-0" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br shadow-lg',
                'group-hover:scale-110 transition-transform duration-300',
                iconColorClasses[iconColor]
              )}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>

            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>

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

        {/* Progress bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>{progress.current.toLocaleString()}</span>
              <span>{progress.max.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full bg-gradient-to-r rounded-full transition-all duration-500',
                  progressColorClasses[iconColor]
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progress.label && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
                {progress.label}
              </p>
            )}
          </div>
        )}

        {sublabel && !progress && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{sublabel}</p>
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
