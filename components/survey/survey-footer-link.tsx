'use client'

/**
 * Survey Footer Link Component
 *
 * Link to open the survey from the footer
 * Shows different text based on completion status
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { MessageSquareHeart, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSurvey } from '@/hooks/use-survey'

interface SurveyFooterLinkProps {
  locale?: 'pt' | 'en'
  className?: string
}

export function SurveyFooterLink({ locale = 'pt', className }: SurveyFooterLinkProps) {
  const { canTakeSurvey, hasCompleted, openFromFooter } = useSurvey()

  // If completed, show badge earned message
  if (hasCompleted) {
    return (
      <div className={cn('flex items-center gap-2 text-amber-600 dark:text-amber-400', className)}>
        <Medal className="w-4 h-4" />
        <span className="text-base">
          {locale === 'pt' ? 'Badge Conquistado!' : 'Badge Earned!'}
        </span>
      </div>
    )
  }

  // If can take survey, show call-to-action
  if (canTakeSurvey) {
    return (
      <button
        type="button"
        onClick={openFromFooter}
        className={cn(
          'flex items-center gap-2 text-base',
          'text-green-600 dark:text-green-400',
          'hover:text-green-500 dark:hover:text-green-300',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded',
          className
        )}
      >
        <MessageSquareHeart className="w-4 h-4" />
        <span>{locale === 'pt' ? 'Avalie sua experiência' : 'Rate your experience'}</span>
      </button>
    )
  }

  // Don't render if survey is currently open
  return null
}
