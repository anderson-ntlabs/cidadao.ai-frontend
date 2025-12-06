/**
 * Academy Activity Feed Component
 *
 * Displays recent XP transactions and activities with:
 * - Animated list items
 * - XP amount display
 * - Activity descriptions
 * - Empty state handling
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles, Trophy, MessageSquare, BookOpen, Video, FileText } from 'lucide-react'

interface Activity {
  id: string
  amount: number
  description: string
  sourceType?: string
  createdAt: string
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  className?: string
}

const sourceIcons: Record<string, React.ReactNode> = {
  conversation: <MessageSquare className="w-3 h-3" />,
  diary: <BookOpen className="w-3 h-3" />,
  video: <Video className="w-3 h-3" />,
  reading: <FileText className="w-3 h-3" />,
  badge: <Trophy className="w-3 h-3" />,
  default: <Sparkles className="w-3 h-3" />,
}

export function ActivityFeed({ activities, maxItems = 5, className }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <Card variant="elevated" padding="md" className={className}>
      <CardHeader className="mb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Atividade Recente
        </CardTitle>
      </CardHeader>

      <CardContent>
        {displayedActivities.length > 0 ? (
          <div className="space-y-3">
            {displayedActivities.map((activity, index) => {
              const icon = sourceIcons[activity.sourceType || 'default'] || sourceIcons.default

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    'bg-gray-50/50 dark:bg-gray-800/50',
                    'hover:bg-gray-100/50 dark:hover:bg-gray-700/50',
                    'transition-colors duration-200',
                    'animate-fade-in'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    {icon}
                  </div>

                  {/* Description */}
                  <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>

                  {/* XP Amount */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100/80 dark:bg-green-900/30">
                    <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      +{activity.amount}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma atividade ainda.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Comece conversando com um agente!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
