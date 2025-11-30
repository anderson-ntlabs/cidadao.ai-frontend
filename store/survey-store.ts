/**
 * Survey Store
 *
 * Zustand store for managing UX survey state
 * Handles survey progress, answers, and UI state
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SurveyStore, SurveyAnswers, SurveyMetadata } from '@/types/survey'
import { SURVEY_QUESTIONS, TOTAL_SURVEY_STEPS, SURVEY_VERSION } from '@/data/survey-questions'
import { surveyService } from '@/lib/services/survey.service'
import { logger } from '@/lib/utils/logger'

// Initial state
const initialState = {
  isOpen: false,
  currentStep: 0,
  isSubmitting: false,
  error: null as string | null,
  answers: {} as SurveyAnswers,
  hasCompleted: false,
  showSuccess: false,
  savedResponse: null,
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // =====================
      // Modal Controls
      // =====================

      openSurvey: (source?: 'fab' | 'footer' | 'profile') => {
        const { hasCompleted } = get()

        // Don't open if already completed
        if (hasCompleted) {
          logger.info('Survey already completed, not opening')
          return
        }

        set({
          isOpen: true,
          error: null,
        })

        logger.info('Survey opened', { source })
      },

      closeSurvey: () => {
        const { currentStep, answers } = get()

        // Save progress before closing (if any answers)
        if (Object.keys(answers).length > 0) {
          get().saveSurveyProgress()
        }

        set({ isOpen: false })
        logger.info('Survey closed', { currentStep, answersCount: Object.keys(answers).length })
      },

      // =====================
      // Navigation
      // =====================

      nextStep: () => {
        const { currentStep, answers } = get()
        const currentQuestion = SURVEY_QUESTIONS[currentStep]

        // Validate required questions
        if (currentQuestion?.required && !answers[currentQuestion.id]) {
          set({ error: 'Esta pergunta é obrigatória' })
          return
        }

        // Clear error and advance
        if (currentStep < TOTAL_SURVEY_STEPS - 1) {
          set({
            currentStep: currentStep + 1,
            error: null,
          })

          // Auto-save progress
          get().saveSurveyProgress()
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({
            currentStep: currentStep - 1,
            error: null,
          })
        }
      },

      goToStep: (step: number) => {
        if (step >= 0 && step < TOTAL_SURVEY_STEPS) {
          set({
            currentStep: step,
            error: null,
          })
        }
      },

      // =====================
      // Answers
      // =====================

      setAnswer: (questionId: string, value: string | number | string[]) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
          error: null,
        }))
      },

      clearAnswer: (questionId: string) => {
        set((state) => {
          const newAnswers = { ...state.answers }
          delete newAnswers[questionId]
          return { answers: newAnswers }
        })
      },

      // =====================
      // Persistence
      // =====================

      loadSurveyProgress: async () => {
        try {
          // This would need user ID from auth context
          // For now, we rely on localStorage persistence
          logger.debug('Survey progress loaded from localStorage')
        } catch (error) {
          logger.error('Failed to load survey progress', { error })
        }
      },

      saveSurveyProgress: async () => {
        try {
          const { answers, currentStep } = get()
          // Progress is auto-saved to localStorage via persist middleware
          logger.debug('Survey progress saved', {
            currentStep,
            answersCount: Object.keys(answers).length,
          })
        } catch (error) {
          logger.error('Failed to save survey progress', { error })
        }
      },

      submitSurvey: async () => {
        const { answers, currentStep } = get()

        // Validate all required questions
        const unansweredRequired = SURVEY_QUESTIONS.filter((q) => q.required && !answers[q.id])

        if (unansweredRequired.length > 0) {
          set({ error: `Por favor, responda todas as perguntas obrigatórias` })
          return false
        }

        set({ isSubmitting: true, error: null })

        try {
          // Get device metadata
          const metadata: SurveyMetadata = {
            device_type: getDeviceType(),
            browser: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
          }

          // Note: In real implementation, this would use userId from auth
          // For demo purposes, we'll just update local state
          // const result = await surveyService.submitSurvey(userId, answers, metadata)

          // Simulate successful submission
          await new Promise((resolve) => setTimeout(resolve, 1000))

          set({
            isSubmitting: false,
            hasCompleted: true,
            showSuccess: true,
            isOpen: false,
          })

          logger.info('Survey submitted successfully', {
            surveyVersion: SURVEY_VERSION,
            answersCount: Object.keys(answers).length,
          })

          return true
        } catch (error) {
          logger.error('Failed to submit survey', { error })
          set({
            isSubmitting: false,
            error: 'Falha ao enviar pesquisa. Tente novamente.',
          })
          return false
        }
      },

      // =====================
      // Reset
      // =====================

      resetSurvey: () => {
        set({
          ...initialState,
          hasCompleted: false, // Reset completion status
        })
        logger.info('Survey reset')
      },

      dismissSuccess: () => {
        set({ showSuccess: false })
      },
    }),
    {
      name: 'cidadao-ai-survey',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        hasCompleted: state.hasCompleted,
      }),
    }
  )
)

// Helper function to detect device type
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Selectors for common use cases
export const selectIsLastStep = (state: SurveyStore) => state.currentStep === TOTAL_SURVEY_STEPS - 1

export const selectProgress = (state: SurveyStore) => ({
  current: state.currentStep + 1,
  total: TOTAL_SURVEY_STEPS,
  percent: Math.round(((state.currentStep + 1) / TOTAL_SURVEY_STEPS) * 100),
})

export const selectCurrentQuestion = (state: SurveyStore) => SURVEY_QUESTIONS[state.currentStep]

export const selectCanSubmit = (state: SurveyStore) => {
  const requiredQuestions = SURVEY_QUESTIONS.filter((q) => q.required)
  return requiredQuestions.every((q) => state.answers[q.id] !== undefined)
}
