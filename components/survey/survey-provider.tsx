'use client'

/**
 * Survey Provider Component
 *
 * Wrapper component that provides survey UI elements
 * Should be placed in the main layout to enable survey globally
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useEffect } from 'react'
import { SurveyModal } from './survey-modal'
import { SurveySuccess } from './survey-success'
import { SurveyFAB } from './survey-fab'
import { useBadgeStore } from '@/store/badge-store'
import { useSurveyStore } from '@/store/survey-store'

interface SurveyProviderProps {
  locale?: 'pt' | 'en'
  showFab?: boolean
  fabDelay?: number
  children?: React.ReactNode
}

export function SurveyProvider({
  locale = 'pt',
  showFab = true,
  fabDelay = 3000,
  children,
}: SurveyProviderProps) {
  const { hasCompleted } = useSurveyStore()
  const { showNewBadgeAnimation } = useBadgeStore()

  // Award badge when survey is completed
  useEffect(() => {
    if (hasCompleted) {
      // Trigger the badge animation
      showNewBadgeAnimation('colaborador')
    }
  }, [hasCompleted, showNewBadgeAnimation])

  return (
    <>
      {children}

      {/* Survey Modal - renders when isOpen is true */}
      <SurveyModal locale={locale} />

      {/* Success Modal - renders when showSuccess is true */}
      <SurveySuccess locale={locale} />

      {/* FAB - shows after delay if survey not completed */}
      {showFab && <SurveyFAB locale={locale} delay={fabDelay} />}
    </>
  )
}
