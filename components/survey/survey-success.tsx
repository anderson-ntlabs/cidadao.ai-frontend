'use client'

/**
 * Survey Success Component
 *
 * Celebration screen shown after completing the survey
 * Displays badge award with confetti animation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useEffect, useState, useCallback } from 'react'
import { X, PartyPopper, Medal, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSurveyStore } from '@/store/survey-store'
import { useBadgeStore } from '@/store/badge-store'
import { BADGES } from '@/data/badges'

interface SurveySuccessProps {
  locale?: 'pt' | 'en'
}

// Confetti particle type
interface Particle {
  id: number
  x: number
  y: number
  color: string
  delay: number
  duration: number
}

// Generate random confetti particles
const generateConfetti = (count: number): Particle[] => {
  const colors = [
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#3b82f6', // blue-500
    '#a855f7', // purple-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 2,
  }))
}

export function SurveySuccess({ locale = 'pt' }: SurveySuccessProps) {
  const { showSuccess, dismissSuccess } = useSurveyStore()
  const { loadBadges } = useBadgeStore()
  const [confetti, setConfetti] = useState<Particle[]>([])
  const [showBadge, setShowBadge] = useState(false)

  const collaboratorBadge = BADGES.colaborador

  // Trigger animations on mount
  useEffect(() => {
    if (showSuccess) {
      // Generate confetti
      setConfetti(generateConfetti(50))

      // Show badge after delay
      const badgeTimer = setTimeout(() => {
        setShowBadge(true)
      }, 500)

      // Reload badges to get the new one
      loadBadges()

      return () => {
        clearTimeout(badgeTimer)
      }
    }
  }, [showSuccess, loadBadges])

  // Handle keyboard navigation
  useEffect(() => {
    if (!showSuccess) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        dismissSuccess()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSuccess, dismissSuccess])

  const handleShare = useCallback(() => {
    const shareText =
      locale === 'pt'
        ? 'Acabei de ganhar o badge Colaborador no Cidadão.AI por contribuir com meu feedback!'
        : 'I just earned the Collaborator badge on Cidadão.AI for contributing my feedback!'

    if (navigator.share) {
      navigator.share({
        title: 'Cidadão.AI',
        text: shareText,
        url: window.location.origin,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
    }
  }, [locale])

  if (!showSuccess) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismissSuccess}
        aria-hidden="true"
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-10px',
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md mx-4',
          'bg-white dark:bg-gray-900 rounded-3xl shadow-2xl',
          'overflow-hidden animate-in fade-in zoom-in-95 duration-500'
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={dismissSuccess}
          aria-label={locale === 'pt' ? 'Fechar' : 'Close'}
          className={cn(
            'absolute top-4 right-4 p-2 rounded-full z-20',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 p-8 text-center">
          <div className="flex justify-center mb-4">
            <PartyPopper className="w-16 h-16 text-white animate-bounce" />
          </div>
          <h2 id="success-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {locale === 'pt' ? 'Parabéns!' : 'Congratulations!'}
          </h2>
          <p className="text-white/90 text-lg">
            {locale === 'pt'
              ? 'Obrigado por compartilhar sua experiência!'
              : 'Thank you for sharing your experience!'}
          </p>
        </div>

        {/* Badge showcase */}
        <div className="p-8 text-center">
          {/* Badge animation */}
          <div
            className={cn(
              'mb-6 transition-all duration-700',
              showBadge ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-8'
            )}
          >
            {/* Badge container */}
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />

              {/* Badge icon */}
              <div
                className={cn(
                  'relative w-24 h-24 mx-auto mb-4',
                  'bg-gradient-to-br from-amber-400 to-yellow-500',
                  'rounded-full flex items-center justify-center',
                  'shadow-lg shadow-amber-500/30',
                  'ring-4 ring-amber-300/50'
                )}
              >
                <Medal className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Badge name */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {locale === 'pt' ? collaboratorBadge.name_pt : collaboratorBadge.name_en}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'pt'
                ? collaboratorBadge.description_pt
                : collaboratorBadge.description_en}
            </p>
          </div>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {locale === 'pt'
              ? 'Você ganhou um badge exclusivo! Ele aparecerá no seu perfil e em todas as páginas.'
              : 'You earned an exclusive badge! It will appear on your profile and across all pages.'}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleShare}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                'text-sm font-medium transition-all duration-200',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              )}
            >
              <Share2 className="w-4 h-4" />
              {locale === 'pt' ? 'Compartilhar' : 'Share'}
            </button>

            <button
              type="button"
              onClick={dismissSuccess}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
                'text-sm font-semibold transition-all duration-200',
                'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
                'hover:from-green-600 hover:to-emerald-600',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              )}
            >
              {locale === 'pt' ? 'Continuar' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}
