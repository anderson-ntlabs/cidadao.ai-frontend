'use client'

/**
 * Badge Showcase Component
 *
 * Full display of user badges with details
 * Used in profile page and badge modal
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { Medal, Calendar, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBadgeStore } from '@/store/badge-store'
import { BADGES } from '@/data/badges'
import type { UserBadge, BadgeType } from '@/types/badge'

interface BadgeShowcaseProps {
  locale?: 'pt' | 'en'
  showEmpty?: boolean
  compact?: boolean
}

export function BadgeShowcase({
  locale = 'pt',
  showEmpty = true,
  compact = false,
}: BadgeShowcaseProps) {
  const { badges, isLoading } = useBadgeStore()

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get badge info
  const getBadgeInfo = (type: BadgeType) => BADGES[type]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Empty state
  if (badges.length === 0 && showEmpty) {
    return (
      <div
        className={cn(
          'text-center py-8 px-4',
          'bg-gray-50 dark:bg-gray-800/50 rounded-xl',
          'border-2 border-dashed border-gray-200 dark:border-gray-700'
        )}
      >
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          {locale === 'pt' ? 'Nenhum badge ainda' : 'No badges yet'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {locale === 'pt'
            ? 'Complete tarefas para ganhar badges exclusivos!'
            : 'Complete tasks to earn exclusive badges!'}
        </p>
      </div>
    )
  }

  if (badges.length === 0) return null

  return (
    <div className={cn('w-full', compact ? 'space-y-3' : 'space-y-4')}>
      {/* Title */}
      {!compact && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-500" />
          {locale === 'pt' ? 'Seus Badges' : 'Your Badges'}
          <span className="text-sm font-normal text-gray-500">({badges.length})</span>
        </h3>
      )}

      {/* Badge list */}
      <div className={cn('grid gap-3', compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            info={getBadgeInfo(badge.badge_type)}
            locale={locale}
            compact={compact}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  )
}

// Badge Card Component
interface BadgeCardProps {
  badge: UserBadge
  info: (typeof BADGES)[BadgeType]
  locale: 'pt' | 'en'
  compact: boolean
  formatDate: (date: string) => string
}

function BadgeCard({ badge, info, locale, compact, formatDate }: BadgeCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20',
          'bg-gradient-to-br from-amber-400 to-yellow-500'
        )}
        aria-hidden="true"
      />

      <div className={cn('relative flex', compact ? 'flex-col items-center text-center' : 'gap-4')}>
        {/* Badge icon */}
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center rounded-full',
            'bg-gradient-to-br from-amber-400 to-yellow-500',
            'shadow-lg shadow-amber-500/20',
            compact ? 'w-12 h-12 mb-2' : 'w-14 h-14'
          )}
        >
          <Medal className={cn('text-white', compact ? 'w-6 h-6' : 'w-7 h-7')} />
        </div>

        {/* Badge info */}
        <div className={cn('flex-1', compact ? '' : 'min-w-0')}>
          <h4
            className={cn(
              'font-semibold text-gray-900 dark:text-white',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {locale === 'pt' ? info.name_pt : info.name_en}
          </h4>

          {!compact && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {locale === 'pt' ? info.description_pt : info.description_en}
            </p>
          )}

          {/* Earned date */}
          <div
            className={cn(
              'flex items-center gap-1 text-gray-500 dark:text-gray-400',
              compact ? 'justify-center mt-1 text-xs' : 'mt-2 text-sm'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {locale === 'pt' ? 'Conquistado em' : 'Earned on'} {formatDate(badge.earned_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
