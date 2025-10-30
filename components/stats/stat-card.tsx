/**
 * Stat Card Component
 *
 * Reusable statistics card with icon, value, label, and optional trend indicator
 * Supports glass morphism design with customizable colors
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { LucideIcon } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  /** Icon to display */
  icon: LucideIcon
  /** Main statistic value */
  value: string | number
  /** Label describing the statistic */
  label: string
  /** Optional subtitle */
  subtitle?: string
  /** Color theme for icon background */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'indigo'
  /** Optional trend value (e.g., "+12%") */
  trend?: string
  /** Trend direction */
  trendDirection?: 'up' | 'down' | 'neutral'
  /** Click handler */
  onClick?: () => void
  /** Loading state */
  isLoading?: boolean
  /** Custom class name */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const colorThemes = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    trend: 'text-yellow-600 dark:text-yellow-400'
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    icon: 'text-pink-600 dark:text-pink-400',
    trend: 'text-pink-600 dark:text-pink-400'
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    trend: 'text-indigo-600 dark:text-indigo-400'
  }
}

const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconSize: 'w-5 h-5',
    iconPadding: 'p-2',
    valueSize: 'text-xl',
    labelSize: 'text-xs'
  },
  md: {
    padding: 'p-6',
    iconSize: 'w-6 h-6',
    iconPadding: 'p-3',
    valueSize: 'text-2xl',
    labelSize: 'text-sm'
  },
  lg: {
    padding: 'p-8',
    iconSize: 'w-8 h-8',
    iconPadding: 'p-4',
    valueSize: 'text-3xl',
    labelSize: 'text-base'
  }
}

export function StatCard({
  icon: Icon,
  value,
  label,
  subtitle,
  color = 'blue',
  trend,
  trendDirection = 'neutral',
  onClick,
  isLoading = false,
  className,
  size = 'md'
}: StatCardProps) {
  const theme = colorThemes[color]
  const sizing = sizeConfig[size]

  const getTrendIcon = () => {
    if (!trend) return null

    if (trendDirection === 'up') {
      return (
        <span className={cn('text-xs font-medium', theme.trend)}>
          ↑ {trend}
        </span>
      )
    }

    if (trendDirection === 'down') {
      return (
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          ↓ {trend}
        </span>
      )
    }

    return (
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        → {trend}
      </span>
    )
  }

  if (isLoading) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className={sizing.padding}>
          <div className="flex items-center gap-4 animate-pulse">
            <div className={cn('rounded-lg', theme.bg, sizing.iconPadding)}>
              <div className={cn('bg-gray-300 dark:bg-gray-600 rounded', sizing.iconSize)} />
            </div>
            <div className="flex-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  const content = (
    <GlassCardContent className={sizing.padding}>
      <div className="flex items-center gap-4">
        <div className={cn('rounded-lg flex-shrink-0', theme.bg, sizing.iconPadding)}>
          <Icon className={cn(theme.icon, sizing.iconSize)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className={cn('font-bold text-gray-900 dark:text-white', sizing.valueSize)}>
              {value}
            </p>
            {getTrendIcon()}
          </div>
          <p className={cn('text-gray-600 dark:text-gray-400 truncate', sizing.labelSize)}>
            {label}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </GlassCardContent>
  )

  if (onClick) {
    return (
      <GlassCard
        className={cn(
          'cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]',
          className
        )}
        onClick={onClick}
      >
        {content}
      </GlassCard>
    )
  }

  return (
    <GlassCard className={className}>
      {content}
    </GlassCard>
  )
}

/**
 * Stats Grid Component
 *
 * Responsive grid for displaying multiple stat cards
 */

interface StatsGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}
