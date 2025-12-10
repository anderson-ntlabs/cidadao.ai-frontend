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

import { memo, useMemo } from 'react'
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
    criteria: '3+ dias seguidos, 5+ sessões ou 3+ diários',
  },
  {
    id: 'pioneiro',
    name: 'Pioneiro',
    emoji: '🚀',
    criteria: 'Aceitar os Termos de Uso',
  },
  {
    id: 'explorador',
    name: 'Explorador',
    emoji: '🧭',
    criteria: 'Interagir com 3+ agentes diferentes',
  },
  {
    id: 'dedicado',
    name: 'Dedicado',
    emoji: '⭐',
    criteria: '7 dias de streak ou 10+ sessões',
  },
  {
    id: 'cinefilo',
    name: 'Cinéfilo',
    emoji: '🎬',
    criteria: 'Assistir 10 vídeos',
  },
  {
    id: 'leitor',
    name: 'Leitor Voraz',
    emoji: '📚',
    criteria: 'Completar todas as leituras obrigatórias',
  },
]

export const BadgeShowcase = memo(function BadgeShowcase({
  badges,
  showLocked = true,
  className,
}: BadgeShowcaseProps) {
  // Memoize earned IDs Set and locked badges calculation
  const earnedIds = useMemo(() => new Set(badges.map((b) => b.id)), [badges])
  const lockedBadges = useMemo(
    () => availableBadges.filter((b) => !earnedIds.has(b.id)),
    [earnedIds]
  )
  const nextBadges = useMemo(() => lockedBadges.slice(0, 4), [lockedBadges])

  return (
    <Card variant="elevated" padding="md" className={className}>
      <CardHeader className="mb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badges Conquistados
          {badges.length > 0 && (
            <span className="text-sm font-normal academy-text-muted">({badges.length})</span>
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
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--academy-card))] flex items-center justify-center text-3xl shadow-md">
                  {badge.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold academy-text">{badge.name}</p>
                  <p className="text-xs academy-text-muted truncate">{badge.criteria}</p>
                </div>
                <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--academy-accent)/0.2)] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍜</span>
            </div>
            <p className="text-sm font-medium academy-text">
              Seja assíduo para ganhar o badge Japaguri!
            </p>
            <p className="text-xs academy-text-muted mt-1">
              3+ dias seguidos, 5+ sessões ou 3+ diários
            </p>
          </div>
        )}

        {/* Locked badges preview */}
        {showLocked && lockedBadges.length > 0 && badges.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[hsl(var(--academy-border)/0.5)]">
            <p className="text-xs font-medium academy-text-muted uppercase tracking-wider mb-3">
              Próximos badges
            </p>
            <div className="grid grid-cols-4 gap-2">
              {nextBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="relative group"
                  title={`${badge.name}: ${badge.criteria}`}
                >
                  <div className="w-full aspect-square rounded-xl bg-[hsl(var(--academy-bg-secondary))] flex items-center justify-center text-2xl opacity-40 grayscale">
                    {badge.emoji}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-4 h-4 academy-text-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
