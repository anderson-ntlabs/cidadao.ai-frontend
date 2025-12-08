/**
 * Timeline Card Component
 *
 * Compact timeline preview for the Ágora dashboard.
 * Shows recent activity and opens full timeline modal.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-07
 */

'use client'

import { useMemo } from 'react'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Clock,
  Sparkles,
  BookOpen,
  Trophy,
  Play,
  ChevronRight,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import type { XpTransaction, DiaryEntry, StudySession, AgoraBadge } from '@/hooks/use-agora'

// Unified timeline event type
export interface TimelineEvent {
  id: string
  type: 'xp' | 'diary' | 'session' | 'badge' | 'milestone'
  title: string
  description: string
  emoji: string
  timestamp: string
  metadata?: {
    amount?: number
    duration?: number
    mood?: string
    badgeId?: string
  }
}

interface TimelineCardProps {
  xpTransactions: XpTransaction[]
  diaryEntries: DiaryEntry[]
  sessions: StudySession[]
  badges: AgoraBadge[]
  onOpenModal: () => void
  className?: string
}

// Convert all data to unified timeline events
export function createTimelineEvents(
  xpTransactions: XpTransaction[],
  diaryEntries: DiaryEntry[],
  sessions: StudySession[],
  badges: AgoraBadge[]
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // XP transactions
  xpTransactions.forEach((tx) => {
    events.push({
      id: `xp-${tx.id}`,
      type: 'xp',
      title: `+${tx.amount} XP`,
      description: tx.description,
      emoji: '⚡',
      timestamp: tx.createdAt,
      metadata: { amount: tx.amount },
    })
  })

  // Diary entries
  diaryEntries.forEach((entry) => {
    const moodEmojis: Record<string, string> = {
      great: '😊',
      good: '🙂',
      neutral: '😐',
      struggling: '😓',
    }
    events.push({
      id: `diary-${entry.id}`,
      type: 'diary',
      title: 'Entrada no Diario',
      description: entry.whatLearned || entry.content.slice(0, 100) + '...',
      emoji: moodEmojis[entry.mood] || '📝',
      timestamp: entry.createdAt,
      metadata: { mood: entry.mood },
    })
  })

  // Sessions
  sessions.forEach((session) => {
    if (session.status === 'completed' && session.endedAt) {
      events.push({
        id: `session-${session.id}`,
        type: 'session',
        title: 'Sessao Completada',
        description: `${session.durationMinutes} min de estudo${session.xpEarned ? ` • +${session.xpEarned} XP` : ''}`,
        emoji: '📖',
        timestamp: session.endedAt,
        metadata: { duration: session.durationMinutes, amount: session.xpEarned },
      })
    }
  })

  // Badges
  badges.forEach((badge) => {
    events.push({
      id: `badge-${badge.id}`,
      type: 'badge',
      title: `Badge: ${badge.name}`,
      description: badge.description,
      emoji: badge.emoji,
      timestamp: badge.earnedAt,
      metadata: { badgeId: badge.id },
    })
  })

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}min atras`
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// Get event icon color
function getEventColor(type: TimelineEvent['type']): string {
  const colors: Record<TimelineEvent['type'], string> = {
    xp: 'from-yellow-500 to-amber-600',
    diary: 'from-purple-500 to-violet-600',
    session: 'from-green-500 to-emerald-600',
    badge: 'from-blue-500 to-cyan-600',
    milestone: 'from-pink-500 to-rose-600',
  }
  return colors[type]
}

export function TimelineCard({
  xpTransactions,
  diaryEntries,
  sessions,
  badges,
  onOpenModal,
  className,
}: TimelineCardProps) {
  // Create and memoize timeline events
  const events = useMemo(
    () => createTimelineEvents(xpTransactions, diaryEntries, sessions, badges),
    [xpTransactions, diaryEntries, sessions, badges]
  )

  // Get recent events (last 5)
  const recentEvents = events.slice(0, 5)

  // Calculate stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEvents = events.filter((e) => new Date(e.timestamp) >= todayStart)
  const todayXp = todayEvents
    .filter((e) => e.type === 'xp')
    .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0)

  return (
    <GlassCard className={cn('h-full', className)}>
      <GlassCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Linha do Tempo</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Atividade recente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
              +{todayXp} XP hoje
            </div>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="pt-2">
        {recentEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma atividade ainda</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Comece uma sessao de estudo!
            </p>
          </div>
        ) : (
          <>
            {/* Mini timeline */}
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-3 relative',
                    index !== recentEvents.length - 1 && 'pb-3'
                  )}
                >
                  {/* Timeline line */}
                  {index !== recentEvents.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Event icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10',
                      'bg-gradient-to-br shadow-sm',
                      getEventColor(event.type)
                    )}
                  >
                    <span className="text-white drop-shadow-sm">{event.emoji}</span>
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View all button */}
            {events.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenModal}
                className="w-full mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver linha do tempo completa
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </>
        )}
      </GlassCardContent>
    </GlassCard>
  )
}
