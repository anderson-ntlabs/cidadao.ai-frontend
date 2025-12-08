/**
 * Timeline Modal Component
 *
 * Full timeline view with filtering, grouping, and detailed activity.
 * Shows XP transactions, diary entries, sessions, and badges.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-07
 */

'use client'

import { useMemo, useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Clock,
  Calendar,
  TrendingUp,
  Zap,
  FileText,
  Play,
  Award,
  Trophy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { createTimelineEvents, type TimelineEvent } from './timeline-card'
import type { XpTransaction, DiaryEntry, StudySession, AgoraBadge } from '@/hooks/use-agora'

interface TimelineModalProps {
  isOpen: boolean
  onClose: () => void
  xpTransactions: XpTransaction[]
  diaryEntries: DiaryEntry[]
  sessions: StudySession[]
  badges: AgoraBadge[]
  userName?: string
}

type FilterType = 'all' | 'xp' | 'diary' | 'session' | 'badge'

// Group events by date
function groupEventsByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>()

  events.forEach((event) => {
    const date = new Date(event.timestamp)
    const dateKey = date.toISOString().split('T')[0]

    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(event)
  })

  return groups
}

// Format date header
function formatDateHeader(dateKey: string): string {
  const date = new Date(dateKey)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateOnly = new Date(dateKey)
  dateOnly.setHours(0, 0, 0, 0)

  if (dateOnly.getTime() === today.getTime()) {
    return 'Hoje'
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Ontem'
  }

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Format time
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get event styling
function getEventStyle(type: TimelineEvent['type']) {
  const styles: Record<TimelineEvent['type'], { bg: string; border: string; icon: typeof Zap }> = {
    xp: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Zap,
    },
    diary: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: FileText,
    },
    session: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: Play,
    },
    badge: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Award,
    },
    milestone: {
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      border: 'border-pink-200 dark:border-pink-800',
      icon: Trophy,
    },
  }
  return styles[type]
}

// Filter buttons config
const filterButtons: { type: FilterType; label: string; icon: typeof Zap }[] = [
  { type: 'all', label: 'Todos', icon: Clock },
  { type: 'xp', label: 'XP', icon: Zap },
  { type: 'session', label: 'Sessoes', icon: Play },
  { type: 'diary', label: 'Diario', icon: FileText },
  { type: 'badge', label: 'Badges', icon: Award },
]

export function TimelineModal({
  isOpen,
  onClose,
  xpTransactions,
  diaryEntries,
  sessions,
  badges,
  userName,
}: TimelineModalProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Listen for modal close event
  useEffect(() => {
    const handleClose = () => onClose()
    window.addEventListener('modal-close', handleClose)
    return () => window.removeEventListener('modal-close', handleClose)
  }, [onClose])

  // Create all events
  const allEvents = useMemo(
    () => createTimelineEvents(xpTransactions, diaryEntries, sessions, badges),
    [xpTransactions, diaryEntries, sessions, badges]
  )

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return allEvents
    return allEvents.filter((e) => e.type === filter)
  }, [allEvents, filter])

  // Group by date
  const groupedEvents = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents])

  // Calculate stats
  const stats = useMemo(() => {
    const totalXp = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalSessions = sessions.filter((s) => s.status === 'completed').length
    const totalDiaryEntries = diaryEntries.length
    const totalBadges = badges.length
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

    return { totalXp, totalSessions, totalDiaryEntries, totalBadges, totalMinutes }
  }, [xpTransactions, sessions, diaryEntries, badges])

  // Toggle day expansion
  const toggleDay = (dateKey: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey)
    } else {
      newExpanded.add(dateKey)
    }
    setExpandedDays(newExpanded)
  }

  // Auto-expand today and yesterday
  const isExpanded = (dateKey: string) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    return dateKey === today || dateKey === yesterday || expandedDays.has(dateKey)
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" className="max-h-[85vh]">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span>Linha do Tempo</span>
              {userName && (
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Jornada de {userName.split(' ')[0]}
                </p>
              )}
            </div>
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats.totalXp.toLocaleString()}
              </div>
              <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">XP Total</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70">Sessoes</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {stats.totalDiaryEntries}
              </div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70">Anotacoes</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.totalBadges}
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Badges</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {filterButtons.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant={filter === type ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(type)}
                className="flex-shrink-0"
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
                {type !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">
                    (
                    {type === 'xp'
                      ? xpTransactions.length
                      : type === 'session'
                        ? sessions.length
                        : type === 'diary'
                          ? diaryEntries.length
                          : badges.length}
                    )
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Nenhuma atividade encontrada</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  {filter !== 'all' ? 'Tente outro filtro' : 'Comece sua jornada!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(groupedEvents.entries()).map(([dateKey, events]) => {
                  const expanded = isExpanded(dateKey)
                  const dayXp = events
                    .filter((e) => e.type === 'xp')
                    .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0)

                  return (
                    <div key={dateKey} className="relative">
                      {/* Date Header */}
                      <button
                        onClick={() => toggleDay(dateKey)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {formatDateHeader(dateKey)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {events.length} atividade{events.length !== 1 ? 's' : ''}
                              {dayXp > 0 && (
                                <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                                  +{dayXp} XP
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {expanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {/* Events List */}
                      {expanded && (
                        <div className="mt-3 ml-5 pl-5 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                          {events.map((event) => {
                            const style = getEventStyle(event.type)
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  'relative p-3 rounded-lg border',
                                  style.bg,
                                  style.border
                                )}
                              >
                                {/* Timeline dot */}
                                <div className="absolute -left-[27px] top-4 w-3 h-3 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600" />

                                <div className="flex items-start gap-3">
                                  <div className="text-2xl">{event.emoji}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {event.title}
                                      </p>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        {formatTime(event.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                      {event.description}
                                    </p>

                                    {/* Extra metadata */}
                                    {event.type === 'session' && event.metadata?.duration && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" size="sm">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {event.metadata.duration} min
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.totalMinutes > 0 && (
                  <span>
                    Total: {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}min de
                    estudo
                  </span>
                )}
              </p>
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
