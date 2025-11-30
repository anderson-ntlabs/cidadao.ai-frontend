'use client'

/**
 * Survey FAB (Floating Action Button) Component
 *
 * Floating button to trigger the survey
 * Positioned in bottom-right corner
 * Only shows when survey is not completed
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useState, useEffect } from 'react'
import { MessageSquareHeart, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSurveyStore } from '@/store/survey-store'

interface SurveyFABProps {
  locale?: 'pt' | 'en'
  delay?: number // Delay before showing (ms)
  position?: 'bottom-right' | 'bottom-left'
}

export function SurveyFAB({
  locale = 'pt',
  delay = 3000,
  position = 'bottom-right',
}: SurveyFABProps) {
  const { hasCompleted, isOpen, openSurvey } = useSurveyStore()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Show FAB after delay
  useEffect(() => {
    // Don't show if survey is completed or dismissed
    if (hasCompleted || isDismissed) {
      setIsVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, hasCompleted, isDismissed])

  // Show tooltip periodically to attract attention
  useEffect(() => {
    if (!isVisible || isOpen) return

    const tooltipTimer = setInterval(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 5000)
    }, 30000) // Show every 30 seconds

    // Show tooltip once after 5 seconds
    const initialTooltip = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 5000)
    }, 5000)

    return () => {
      clearInterval(tooltipTimer)
      clearTimeout(initialTooltip)
    }
  }, [isVisible, isOpen])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleOpen = () => {
    setShowTooltip(false)
    openSurvey('fab')
  }

  // Don't render if completed, dismissed, or during survey
  if (hasCompleted || isDismissed || isOpen) return null

  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-20 left-4 sm:bottom-6 sm:left-6',
  }

  const tooltipPosition = {
    'bottom-right': 'right-0 mr-16',
    'bottom-left': 'left-0 ml-16',
  }

  return (
    <div
      className={cn(
        'fixed z-40 transition-all duration-500',
        positionClasses[position],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            'absolute bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
            tooltipPosition[position]
          )}
          role="tooltip"
        >
          <div
            className={cn(
              'px-4 py-3 rounded-xl shadow-lg',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'max-w-[250px]'
            )}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {locale === 'pt'
                ? 'Sua opinião é importante! Responda nossa pesquisa e ganhe um badge exclusivo.'
                : 'Your opinion matters! Answer our survey and earn an exclusive badge.'}
            </p>
            {/* Arrow */}
            <div
              className={cn(
                'absolute bottom-0 w-3 h-3 -mb-1.5 rotate-45',
                'bg-white dark:bg-gray-800',
                'border-r border-b border-gray-200 dark:border-gray-700',
                position === 'bottom-right' ? 'right-6' : 'left-6'
              )}
            />
          </div>
        </div>
      )}

      {/* Main FAB */}
      <div className="relative group">
        {/* Pulse animation ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-green-500/30 animate-ping',
            'group-hover:animate-none'
          )}
        />

        {/* Button */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label={locale === 'pt' ? 'Abrir pesquisa de experiência' : 'Open experience survey'}
          className={cn(
            'relative flex items-center justify-center',
            'w-14 h-14 sm:w-16 sm:h-16 rounded-full',
            'bg-gradient-to-br from-green-500 to-emerald-600',
            'text-white shadow-lg shadow-green-500/30',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl hover:shadow-green-500/40',
            'active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          )}
        >
          <MessageSquareHeart className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={locale === 'pt' ? 'Dispensar pesquisa' : 'Dismiss survey'}
          className={cn(
            'absolute -top-1 -right-1',
            'w-6 h-6 rounded-full',
            'bg-gray-100 dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'flex items-center justify-center',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'opacity-0 group-hover:opacity-100',
            'transition-all duration-200',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-green-500'
          )}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
