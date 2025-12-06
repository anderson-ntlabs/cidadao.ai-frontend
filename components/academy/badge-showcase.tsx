/**
 * Academy Badge Showcase Component
 *
 * Displays earned badges with:
 * - Badge grid/list display
 * - Animated badge reveals
 * - Empty state with motivation
 * - Badge details on hover
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Trophy, Sparkles, Lock } from 'lucide-react'

interface BadgeItem {
  id: string
  name: string
  emoji: string
  criteria: string
  earnedAt?: string
}

interface BadgeShowcaseProps {
  badges: BadgeItem[]
  showLocked?: boolean
  className?: string
}

// Available badges in the system
const availableBadges: Omit<BadgeItem, 'earnedAt'>[] = [
  {
    id: 'japaguri',
    name: 'Japaguri',
    emoji: '🍜',
    criteria: '3+ dias seguidos, 5+ sessoes ou 3+ diarios',
  },
  {
    id: 'first-chat',
    name: 'Primeira Conversa',
    emoji: '💬',
    criteria: 'Enviar primeira mensagem para um agente',
  },
  {
    id: 'video-master',
    name: 'Cinefilo',
    emoji: '🎬',
    criteria: 'Assistir 10 videos',
  },
  {
    id: 'reader',
    name: 'Leitor Voraz',
    emoji: '📚',
    criteria: 'Completar todas as leituras obrigatorias',
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    emoji: '⭐',
    criteria: '7 dias de streak',
  },
]

export function BadgeShowcase({ badges, showLocked = true, className }: BadgeShowcaseProps) {
  // Merge earned badges with available badges
  const earnedIds = new Set(badges.map((b) => b.id))
  const lockedBadges = availableBadges.filter((b) => !earnedIds.has(b.id))

  return (
    <Card variant="elevated" padding="md" className={className}>
      <CardHeader className="mb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badges Conquistados
          {badges.length > 0 && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({badges.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {badges.length > 0 ? (
          <div className="space-y-3">
            {badges.map((badge, index) => (
              <div
                key={badge.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  'bg-gradient-to-r from-yellow-50/80 to-amber-50/80',
                  'dark:from-yellow-900/20 dark:to-amber-900/20',
                  'border border-yellow-200/50 dark:border-yellow-700/30',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-md">
                  {badge.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{badge.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {badge.criteria}
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100/50 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍜</span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Seja assiduo para ganhar o badge Japaguri!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              3+ dias seguidos, 5+ sessoes ou 3+ diarios
            </p>
          </div>
        )}

        {/* Locked badges preview */}
        {showLocked && lockedBadges.length > 0 && badges.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Proximos badges
            </p>
            <div className="grid grid-cols-4 gap-2">
              {lockedBadges.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="relative group"
                  title={`${badge.name}: ${badge.criteria}`}
                >
                  <div className="w-full aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl opacity-40 grayscale">
                    {badge.emoji}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
