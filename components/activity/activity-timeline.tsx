/**
 * Activity Timeline Component
 *
 * Displays user activity history in a timeline format
 * with icons, descriptions, and timestamps
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { LucideIcon, MessageSquare, FileSearch, Users, Download, Settings, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { UserActivity } from '@/lib/services/user-profile.service'

export interface ActivityTimelineProps {
  /** Activities to display */
  activities: UserActivity[]
  /** Whether to show loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Maximum number of items to show */
  maxItems?: number
  /** Whether to show full timestamps or relative time */
  showFullTimestamp?: boolean
  /** Custom class name */
  className?: string
}

const activityConfig: Record<UserActivity['type'], {
  icon: LucideIcon
  color: string
  bgColor: string
  label: string
}> = {
  chat: {
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Conversa'
  },
  investigation: {
    icon: FileSearch,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    label: 'Investigação'
  },
  agent_interaction: {
    icon: Users,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Agente IA'
  },
  export: {
    icon: Download,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Exportação'
  },
  settings_update: {
    icon: Settings,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Configuração'
  }
}

export function ActivityTimeline({
  activities,
  isLoading = false,
  emptyMessage = 'Nenhuma atividade recente',
  maxItems,
  showFullTimestamp = false,
  className
}: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const displayActivities = maxItems ? activities.slice(0, maxItems) : activities

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {displayActivities.map((activity, index) => {
        const config = activityConfig[activity.type]
        const Icon = config.icon
        const isLast = index === displayActivities.length - 1

        return (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-full', config.bgColor)}>
                <Icon className={cn('w-5 h-5', config.color)} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1', !isLast && 'pb-6')}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                    {config.label}
                  </span>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.title}
                  </h4>
                </div>
              </div>

              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {activity.description}
                </p>
              )}

              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {showFullTimestamp ? (
                  format(new Date(activity.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })
                ) : (
                  formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Activity Timeline Item Component (for standalone use)
 */
export interface ActivityTimelineItemProps {
  activity: UserActivity
  showFullTimestamp?: boolean
  isLast?: boolean
}

export function ActivityTimelineItem({
  activity,
  showFullTimestamp = false,
  isLast = false
}: ActivityTimelineItemProps) {
  const config = activityConfig[activity.type]
  const Icon = config.icon

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('flex items-center justify-center w-10 h-10 rounded-full', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
        )}
      </div>

      <div className={cn('flex-1', !isLast && 'pb-6')}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
              {config.label}
            </span>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {activity.title}
            </h4>
          </div>
        </div>

        {activity.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          {showFullTimestamp ? (
            format(new Date(activity.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })
          ) : (
            formatDistanceToNow(new Date(activity.created_at), {
              addSuffix: true,
              locale: ptBR
            })
          )}
        </div>
      </div>
    </div>
  )
}
