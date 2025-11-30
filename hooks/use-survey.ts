/**
 * Survey Hook
 *
 * Convenience hook for survey-related actions
 * Provides simple API to open survey from any component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useCallback } from 'react'
import { useSurveyStore } from '@/store/survey-store'
import { useBadgeStore } from '@/store/badge-store'

export function useSurvey() {
  const {
    isOpen,
    hasCompleted,
    showSuccess,
    currentStep,
    answers,
    openSurvey,
    closeSurvey,
    resetSurvey,
    dismissSuccess,
  } = useSurveyStore()

  const { badges, hasBadge } = useBadgeStore()

  // Open survey from footer link
  const openFromFooter = useCallback(() => {
    openSurvey('footer')
  }, [openSurvey])

  // Open survey from FAB
  const openFromFab = useCallback(() => {
    openSurvey('fab')
  }, [openSurvey])

  // Open survey from profile
  const openFromProfile = useCallback(() => {
    openSurvey('profile')
  }, [openSurvey])

  // Check if user can take survey
  const canTakeSurvey = !hasCompleted && !isOpen

  // Get progress info
  const progress = {
    step: currentStep + 1,
    total: Object.keys(answers).length,
    percent: hasCompleted ? 100 : Math.round((Object.keys(answers).length / 9) * 100),
  }

  // Check if user has collaborator badge
  const hasCollaboratorBadge = hasBadge('colaborador')

  return {
    // State
    isOpen,
    hasCompleted,
    showSuccess,
    canTakeSurvey,
    progress,
    hasCollaboratorBadge,
    badges,

    // Actions
    openFromFooter,
    openFromFab,
    openFromProfile,
    closeSurvey,
    resetSurvey,
    dismissSuccess,
  }
}
