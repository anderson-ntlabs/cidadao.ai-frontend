/**
 * Celebration Modal Component
 *
 * Shows achievement celebrations with confetti animation.
 * Used for badges, level ups, and milestone achievements.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles, Star, Trophy, Award, Zap } from 'lucide-react'

export type CelebrationType = 'badge' | 'level_up' | 'rank_up' | 'streak' | 'milestone'

interface CelebrationData {
  type: CelebrationType
  title: string
  subtitle: string
  emoji: string
  xpReward?: number
  description?: string
}

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  celebration: CelebrationData | null
}

// Generate random confetti particles
function generateConfetti(count: number) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  const shapes = ['circle', 'square', 'triangle']

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 8,
  }))
}

// Confetti particle component
function ConfettiParticle({
  color,
  shape,
  left,
  delay,
  duration,
  size,
}: {
  color: string
  shape: string
  left: number
  delay: number
  duration: number
  size: number
}) {
  const shapeStyles: Record<string, React.CSSProperties> = {
    circle: { borderRadius: '50%' },
    square: { borderRadius: '2px' },
    triangle: {
      width: 0,
      height: 0,
      background: 'transparent',
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
    },
  }

  const baseStyle: React.CSSProperties =
    shape === 'triangle'
      ? shapeStyles.triangle
      : {
          width: size,
          height: size,
          backgroundColor: color,
          ...shapeStyles[shape],
        }

  return (
    <div
      className="absolute animate-confetti-fall"
      style={{
        left: `${left}%`,
        top: '-20px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        ...baseStyle,
      }}
    />
  )
}

// Get celebration icon based on type
function getCelebrationIcon(type: CelebrationType) {
  switch (type) {
    case 'badge':
      return Award
    case 'level_up':
      return Zap
    case 'rank_up':
      return Trophy
    case 'streak':
      return Sparkles
    case 'milestone':
      return Star
    default:
      return Star
  }
}

// Get celebration gradient based on type
function getCelebrationGradient(type: CelebrationType) {
  switch (type) {
    case 'badge':
      return 'from-yellow-400 via-amber-500 to-orange-500'
    case 'level_up':
      return 'from-blue-400 via-cyan-500 to-teal-500'
    case 'rank_up':
      return 'from-purple-400 via-pink-500 to-rose-500'
    case 'streak':
      return 'from-orange-400 via-red-500 to-pink-500'
    case 'milestone':
      return 'from-green-400 via-emerald-500 to-teal-500'
    default:
      return 'from-yellow-400 to-orange-500'
  }
}

export function CelebrationModal({ isOpen, onClose, celebration }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ReturnType<typeof generateConfetti>>([])
  const [showContent, setShowContent] = useState(false)

  // Generate confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfetti(generateConfetti(50))
      // Delay content for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 200)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
      setConfetti([])
    }
  }, [isOpen])

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!celebration) return null

  const Icon = getCelebrationIcon(celebration.type)
  const gradient = getCelebrationGradient(celebration.type)

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        size="sm"
        className="overflow-hidden border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        {/* Confetti container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <ConfettiParticle key={particle.id} {...particle} />
          ))}
        </div>

        {/* Main content */}
        <div
          className={cn(
            'relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-500',
            showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          )}
        >
          {/* Gradient header */}
          <div className={cn('h-2 bg-gradient-to-r', gradient)} />

          <div className="p-6 text-center">
            {/* Emoji with pulse animation */}
            <div className="relative inline-block mb-4">
              <div
                className={cn(
                  'w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto',
                  gradient
                )}
              >
                <span className="text-5xl animate-bounce-slow">{celebration.emoji}</span>
              </div>
              {/* Sparkle decorations */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Star className="w-4 h-4 text-yellow-800 fill-yellow-800" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center animate-pulse delay-100">
                <Sparkles className="w-3 h-3 text-pink-800" />
              </div>
            </div>

            {/* Title */}
            <h2
              className={cn(
                'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2',
                gradient
              )}
            >
              {celebration.title}
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">{celebration.subtitle}</p>

            {/* Description */}
            {celebration.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {celebration.description}
              </p>
            )}

            {/* XP Reward */}
            {celebration.xpReward && celebration.xpReward > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-bold text-yellow-700 dark:text-yellow-300">
                  +{celebration.xpReward} XP
                </span>
              </div>
            )}

            {/* Action button */}
            <div>
              <Button
                onClick={onClose}
                className={cn('bg-gradient-to-r text-white border-0 px-8', gradient)}
              >
                <Icon className="w-4 h-4 mr-2" />
                Incrivel!
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

// Hook to manage celebration state
export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationData | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const showCelebration = useCallback((data: CelebrationData) => {
    setCelebration(data)
    setIsOpen(true)
  }, [])

  const hideCelebration = useCallback(() => {
    setIsOpen(false)
    // Clear celebration after animation
    setTimeout(() => setCelebration(null), 300)
  }, [])

  // Helper functions for common celebration types
  const celebrateBadge = useCallback(
    (badgeName: string, badgeEmoji: string, xpReward?: number) => {
      showCelebration({
        type: 'badge',
        title: 'Badge Conquistado!',
        subtitle: badgeName,
        emoji: badgeEmoji,
        xpReward,
        description: 'Continue assim! Voce esta no caminho certo.',
      })
    },
    [showCelebration]
  )

  const celebrateLevelUp = useCallback(
    (newLevel: number, xpReward?: number) => {
      showCelebration({
        type: 'level_up',
        title: 'Level Up!',
        subtitle: `Nivel ${newLevel}`,
        emoji: '🚀',
        xpReward,
        description: 'Seu conhecimento esta crescendo!',
      })
    },
    [showCelebration]
  )

  const celebrateRankUp = useCallback(
    (newRank: string, xpReward?: number) => {
      const rankEmojis: Record<string, string> = {
        aprendiz: '📚',
        contribuidor: '🔧',
        mentor: '🎓',
        arquiteto: '🏛️',
      }
      showCelebration({
        type: 'rank_up',
        title: 'Novo Rank!',
        subtitle: newRank,
        emoji: rankEmojis[newRank.toLowerCase()] || '⭐',
        xpReward,
        description: 'Sua dedicacao esta sendo reconhecida!',
      })
    },
    [showCelebration]
  )

  const celebrateStreak = useCallback(
    (days: number, xpReward?: number) => {
      showCelebration({
        type: 'streak',
        title: 'Streak Incrivel!',
        subtitle: `${days} dias consecutivos!`,
        emoji: '🔥',
        xpReward,
        description: 'A consistencia e a chave do sucesso!',
      })
    },
    [showCelebration]
  )

  const celebrateMilestone = useCallback(
    (title: string, subtitle: string, emoji: string, xpReward?: number) => {
      showCelebration({
        type: 'milestone',
        title,
        subtitle,
        emoji,
        xpReward,
      })
    },
    [showCelebration]
  )

  return {
    celebration,
    isOpen,
    showCelebration,
    hideCelebration,
    celebrateBadge,
    celebrateLevelUp,
    celebrateRankUp,
    celebrateStreak,
    celebrateMilestone,
  }
}
