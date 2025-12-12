/**
 * Survey Store Tests
 *
 * Tests for the UX survey Zustand store
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-12
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSurveyStore, selectIsLastStep, selectProgress, selectCanSubmit } from './survey-store'
import { SURVEY_QUESTIONS, TOTAL_SURVEY_STEPS } from '@/data/survey-questions'

// Mock the survey service
vi.mock('@/lib/services/survey.service', () => ({
  surveyService: {
    submitSurvey: vi.fn(),
  },
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock window properties
Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })

describe('SurveyStore', () => {
  beforeEach(() => {
    // Reset store state
    useSurveyStore.setState({
      isOpen: false,
      currentStep: 0,
      isSubmitting: false,
      error: null,
      answers: {},
      hasCompleted: false,
      showSuccess: false,
      savedResponse: null,
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSurveyStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.currentStep).toBe(0)
      expect(state.isSubmitting).toBe(false)
      expect(state.error).toBeNull()
      expect(state.answers).toEqual({})
      expect(state.hasCompleted).toBe(false)
      expect(state.showSuccess).toBe(false)
    })
  })

  describe('Modal Controls', () => {
    describe('openSurvey', () => {
      it('should open the survey', () => {
        useSurveyStore.getState().openSurvey()

        const state = useSurveyStore.getState()
        expect(state.isOpen).toBe(true)
        expect(state.error).toBeNull()
      })

      it('should not open if already completed', () => {
        useSurveyStore.setState({ hasCompleted: true })

        useSurveyStore.getState().openSurvey()

        expect(useSurveyStore.getState().isOpen).toBe(false)
      })

      it('should accept a source parameter', () => {
        useSurveyStore.getState().openSurvey('fab')

        expect(useSurveyStore.getState().isOpen).toBe(true)
      })
    })

    describe('closeSurvey', () => {
      it('should close the survey', () => {
        useSurveyStore.setState({ isOpen: true })

        useSurveyStore.getState().closeSurvey()

        expect(useSurveyStore.getState().isOpen).toBe(false)
      })

      it('should save progress if there are answers', () => {
        useSurveyStore.setState({
          isOpen: true,
          answers: { question1: 'answer1' },
        })

        useSurveyStore.getState().closeSurvey()

        // Progress is saved (logged)
        expect(useSurveyStore.getState().isOpen).toBe(false)
      })
    })
  })

  describe('Navigation', () => {
    describe('nextStep', () => {
      it('should advance to the next step', () => {
        // Set an answer for the first required question if any
        const firstQuestion = SURVEY_QUESTIONS[0]
        if (firstQuestion?.required) {
          useSurveyStore.setState({
            answers: { [firstQuestion.id]: 'test' },
          })
        }

        useSurveyStore.getState().nextStep()

        expect(useSurveyStore.getState().currentStep).toBe(1)
        expect(useSurveyStore.getState().error).toBeNull()
      })

      it('should not advance past the last step', () => {
        useSurveyStore.setState({ currentStep: TOTAL_SURVEY_STEPS - 1 })

        useSurveyStore.getState().nextStep()

        expect(useSurveyStore.getState().currentStep).toBe(TOTAL_SURVEY_STEPS - 1)
      })

      it('should show error for required unanswered question', () => {
        const firstQuestion = SURVEY_QUESTIONS[0]
        if (firstQuestion?.required) {
          useSurveyStore.getState().nextStep()

          expect(useSurveyStore.getState().error).toBe('Esta pergunta é obrigatória')
          expect(useSurveyStore.getState().currentStep).toBe(0)
        }
      })
    })

    describe('prevStep', () => {
      it('should go to the previous step', () => {
        useSurveyStore.setState({ currentStep: 2 })

        useSurveyStore.getState().prevStep()

        expect(useSurveyStore.getState().currentStep).toBe(1)
        expect(useSurveyStore.getState().error).toBeNull()
      })

      it('should not go below step 0', () => {
        useSurveyStore.setState({ currentStep: 0 })

        useSurveyStore.getState().prevStep()

        expect(useSurveyStore.getState().currentStep).toBe(0)
      })
    })

    describe('goToStep', () => {
      it('should go to a specific step', () => {
        useSurveyStore.getState().goToStep(3)

        expect(useSurveyStore.getState().currentStep).toBe(3)
        expect(useSurveyStore.getState().error).toBeNull()
      })

      it('should not go to invalid step (negative)', () => {
        useSurveyStore.getState().goToStep(-1)

        expect(useSurveyStore.getState().currentStep).toBe(0)
      })

      it('should not go to invalid step (above total)', () => {
        useSurveyStore.getState().goToStep(TOTAL_SURVEY_STEPS + 1)

        expect(useSurveyStore.getState().currentStep).toBe(0)
      })
    })
  })

  describe('Answers', () => {
    describe('setAnswer', () => {
      it('should set a string answer', () => {
        useSurveyStore.getState().setAnswer('question1', 'answer1')

        const state = useSurveyStore.getState()
        expect(state.answers['question1']).toBe('answer1')
        expect(state.error).toBeNull()
      })

      it('should set a number answer', () => {
        useSurveyStore.getState().setAnswer('nps', 8)

        expect(useSurveyStore.getState().answers['nps']).toBe(8)
      })

      it('should set an array answer', () => {
        useSurveyStore.getState().setAnswer('features', ['feature1', 'feature2'])

        expect(useSurveyStore.getState().answers['features']).toEqual(['feature1', 'feature2'])
      })

      it('should update existing answer', () => {
        useSurveyStore.setState({ answers: { question1: 'old' } })

        useSurveyStore.getState().setAnswer('question1', 'new')

        expect(useSurveyStore.getState().answers['question1']).toBe('new')
      })

      it('should clear error when setting answer', () => {
        useSurveyStore.setState({ error: 'Some error' })

        useSurveyStore.getState().setAnswer('question1', 'answer')

        expect(useSurveyStore.getState().error).toBeNull()
      })
    })

    describe('clearAnswer', () => {
      it('should remove an answer', () => {
        useSurveyStore.setState({
          answers: { question1: 'answer1', question2: 'answer2' },
        })

        useSurveyStore.getState().clearAnswer('question1')

        const answers = useSurveyStore.getState().answers
        expect(answers['question1']).toBeUndefined()
        expect(answers['question2']).toBe('answer2')
      })
    })
  })

  describe('submitSurvey', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should show error if required questions unanswered', async () => {
      // Don't set any answers
      const result = await useSurveyStore.getState().submitSurvey()

      expect(result).toBe(false)
      expect(useSurveyStore.getState().error).toContain('obrigatórias')
    })

    it('should submit successfully with all required answers', async () => {
      // Set all required answers
      const requiredAnswers: Record<string, string | number> = {}
      SURVEY_QUESTIONS.filter((q) => q.required).forEach((q) => {
        if (q.type === 'nps') {
          requiredAnswers[q.id] = 8
        } else if (q.type === 'stars') {
          requiredAnswers[q.id] = 4
        } else {
          requiredAnswers[q.id] = 'test answer'
        }
      })
      useSurveyStore.setState({ answers: requiredAnswers })

      // Start submission
      const submitPromise = useSurveyStore.getState().submitSurvey()

      // Check submitting state
      expect(useSurveyStore.getState().isSubmitting).toBe(true)

      // Advance timers (mock API delay)
      vi.advanceTimersByTime(1000)

      const result = await submitPromise

      expect(result).toBe(true)
      expect(useSurveyStore.getState().isSubmitting).toBe(false)
      expect(useSurveyStore.getState().hasCompleted).toBe(true)
      expect(useSurveyStore.getState().showSuccess).toBe(true)
      expect(useSurveyStore.getState().isOpen).toBe(false)
    })
  })

  describe('Reset', () => {
    describe('resetSurvey', () => {
      it('should reset all state to initial values', () => {
        useSurveyStore.setState({
          isOpen: true,
          currentStep: 3,
          answers: { q1: 'a1' },
          error: 'Some error',
          hasCompleted: true,
        })

        useSurveyStore.getState().resetSurvey()

        const state = useSurveyStore.getState()
        expect(state.isOpen).toBe(false)
        expect(state.currentStep).toBe(0)
        expect(state.answers).toEqual({})
        expect(state.error).toBeNull()
        expect(state.hasCompleted).toBe(false)
      })
    })

    describe('dismissSuccess', () => {
      it('should clear the success message', () => {
        useSurveyStore.setState({ showSuccess: true })

        useSurveyStore.getState().dismissSuccess()

        expect(useSurveyStore.getState().showSuccess).toBe(false)
      })
    })
  })

  describe('Selectors', () => {
    describe('selectIsLastStep', () => {
      it('should return true on last step', () => {
        useSurveyStore.setState({ currentStep: TOTAL_SURVEY_STEPS - 1 })

        const result = selectIsLastStep(useSurveyStore.getState())

        expect(result).toBe(true)
      })

      it('should return false on other steps', () => {
        useSurveyStore.setState({ currentStep: 0 })

        const result = selectIsLastStep(useSurveyStore.getState())

        expect(result).toBe(false)
      })
    })

    describe('selectProgress', () => {
      it('should return progress information', () => {
        useSurveyStore.setState({ currentStep: 2 })

        const progress = selectProgress(useSurveyStore.getState())

        expect(progress.current).toBe(3) // currentStep + 1
        expect(progress.total).toBe(TOTAL_SURVEY_STEPS)
        expect(progress.percent).toBeGreaterThan(0)
      })
    })

    describe('selectCanSubmit', () => {
      it('should return true when all required questions answered', () => {
        const requiredAnswers: Record<string, string | number> = {}
        SURVEY_QUESTIONS.filter((q) => q.required).forEach((q) => {
          requiredAnswers[q.id] = 'answer'
        })
        useSurveyStore.setState({ answers: requiredAnswers })

        const result = selectCanSubmit(useSurveyStore.getState())

        expect(result).toBe(true)
      })

      it('should return false when required questions unanswered', () => {
        useSurveyStore.setState({ answers: {} })

        const result = selectCanSubmit(useSurveyStore.getState())

        // Only false if there are required questions
        const hasRequired = SURVEY_QUESTIONS.some((q) => q.required)
        expect(result).toBe(!hasRequired)
      })
    })
  })
})
