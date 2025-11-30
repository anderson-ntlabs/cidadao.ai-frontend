'use client'

/**
 * Survey Modal Component
 *
 * Main wizard container for the UX survey
 * Handles navigation between questions and submission
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSurveyStore } from '@/store/survey-store'
import { SURVEY_QUESTIONS } from '@/data/survey-questions'
import { SurveyProgress } from './survey-progress'
import { NPSQuestion, StarRatingQuestion, MultipleChoiceQuestion, TextQuestion } from './questions'

interface SurveyModalProps {
  locale?: 'pt' | 'en'
  onComplete?: () => void
}

export function SurveyModal({ locale = 'pt', onComplete }: SurveyModalProps) {
  const {
    isOpen,
    currentStep,
    answers,
    isSubmitting,
    closeSurvey,
    nextStep,
    prevStep,
    setAnswer,
    submitSurvey,
  } = useSurveyStore()

  const totalSteps = SURVEY_QUESTIONS.length
  const currentQuestion = SURVEY_QUESTIONS[currentStep]
  const currentAnswer = answers[currentQuestion?.id]

  // Check if current question is answered
  const isCurrentAnswered = useCallback(() => {
    if (!currentQuestion) return false
    if (!currentQuestion.required) return true
    if (currentAnswer === undefined || currentAnswer === null) return false
    if (typeof currentAnswer === 'string' && currentAnswer.trim() === '') return false
    if (Array.isArray(currentAnswer) && currentAnswer.length === 0) return false
    return true
  }, [currentQuestion, currentAnswer])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSurvey()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeSurvey])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = useCallback(async () => {
    const success = await submitSurvey()
    if (success && onComplete) {
      onComplete()
    }
  }, [submitSurvey, onComplete])

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps - 1) {
      handleSubmit()
    } else {
      nextStep()
    }
  }, [currentStep, totalSteps, nextStep, handleSubmit])

  if (!isOpen || !currentQuestion) return null

  const getQuestionText = () =>
    locale === 'pt' ? currentQuestion.question_pt : currentQuestion.question_en

  const isLastStep = currentStep === totalSteps - 1
  const canProceed = isCurrentAnswered() || !currentQuestion.required

  // Get labels for NPS question
  const getNPSLabels = () =>
    locale === 'pt'
      ? { min: 'Muito improvável', max: 'Muito provável' }
      : { min: 'Very unlikely', max: 'Very likely' }

  // Get labels for star rating
  const getStarLabels = () =>
    locale === 'pt'
      ? ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']
      : ['Very bad', 'Bad', 'Average', 'Good', 'Excellent']

  // Check if multiple selection is allowed
  const isMultipleSelection = currentQuestion.type === 'multiple_multi'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="survey-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeSurvey}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4',
          'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
          'overflow-hidden animate-in fade-in zoom-in-95 duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="survey-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            {locale === 'pt' ? 'Pesquisa de Experiência' : 'Experience Survey'}
          </h2>
          <button
            type="button"
            onClick={closeSurvey}
            aria-label={locale === 'pt' ? 'Fechar pesquisa' : 'Close survey'}
            className={cn(
              'p-2 rounded-lg transition-colors duration-200',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <SurveyProgress currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Question Content */}
        <div className="p-6 min-h-[300px]">
          {/* Question Text */}
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 text-center">
            {getQuestionText()}
            {currentQuestion.required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </h3>

          {/* Question Input */}
          <div className="flex justify-center">
            {currentQuestion.type === 'nps' && (
              <NPSQuestion
                value={currentAnswer as number | undefined}
                onChange={(value) => setAnswer(currentQuestion.id, value)}
                labelMin={getNPSLabels().min}
                labelMax={getNPSLabels().max}
              />
            )}

            {currentQuestion.type === 'stars' && (
              <StarRatingQuestion
                value={currentAnswer as number | undefined}
                onChange={(value) => setAnswer(currentQuestion.id, value)}
                labels={getStarLabels()}
              />
            )}

            {(currentQuestion.type === 'multiple_single' ||
              currentQuestion.type === 'multiple_multi') &&
              currentQuestion.options && (
                <MultipleChoiceQuestion
                  value={currentAnswer as string | string[] | undefined}
                  onChange={(value) => setAnswer(currentQuestion.id, value)}
                  options={currentQuestion.options}
                  multiple={isMultipleSelection}
                  locale={locale}
                />
              )}

            {currentQuestion.type === 'text' && (
              <TextQuestion
                value={currentAnswer as string | undefined}
                onChange={(value) => setAnswer(currentQuestion.id, value)}
                placeholder={
                  locale === 'pt'
                    ? currentQuestion.placeholder_pt || 'Compartilhe sua opinião...'
                    : currentQuestion.placeholder_en || 'Share your thoughts...'
                }
                required={currentQuestion.required}
              />
            )}
          </div>
        </div>

        {/* Footer / Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {/* Back Button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
              currentStep === 0
                ? 'opacity-0 cursor-default'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            {locale === 'pt' ? 'Voltar' : 'Back'}
          </button>

          {/* Step indicator (mobile) */}
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
            {currentStep + 1}/{totalSteps}
          </span>

          {/* Next/Submit Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg',
              'text-sm font-semibold transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isLastStep
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            )}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {locale === 'pt' ? 'Enviando...' : 'Sending...'}
              </>
            ) : isLastStep ? (
              <>
                {locale === 'pt' ? 'Enviar' : 'Submit'}
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                {locale === 'pt' ? 'Próxima' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
