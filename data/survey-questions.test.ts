/**
 * Tests for Survey Questions Data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  SURVEY_VERSION,
  SURVEY_QUESTIONS,
  TOTAL_SURVEY_STEPS,
  getQuestionById,
  getQuestionsByType,
} from './survey-questions'

describe('Survey Questions Data', () => {
  describe('SURVEY_VERSION', () => {
    it('should be defined', () => {
      expect(SURVEY_VERSION).toBeDefined()
      expect(typeof SURVEY_VERSION).toBe('string')
    })

    it('should be v1', () => {
      expect(SURVEY_VERSION).toBe('v1')
    })
  })

  describe('SURVEY_QUESTIONS', () => {
    it('should be an array', () => {
      expect(Array.isArray(SURVEY_QUESTIONS)).toBe(true)
    })

    it('should have questions', () => {
      expect(SURVEY_QUESTIONS.length).toBeGreaterThan(0)
    })

    it('should have unique IDs', () => {
      const ids = SURVEY_QUESTIONS.map((q) => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have required properties for each question', () => {
      SURVEY_QUESTIONS.forEach((question) => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('question_pt')
        expect(question).toHaveProperty('question_en')
        expect(question).toHaveProperty('required')
      })
    })

    it('should have valid question types', () => {
      const validTypes = ['nps', 'stars', 'multiple_single', 'multiple_multi', 'text']

      SURVEY_QUESTIONS.forEach((question) => {
        expect(validTypes).toContain(question.type)
      })
    })

    it('should have non-empty Portuguese questions', () => {
      SURVEY_QUESTIONS.forEach((question) => {
        expect(question.question_pt.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty English questions', () => {
      SURVEY_QUESTIONS.forEach((question) => {
        expect(question.question_en.length).toBeGreaterThan(0)
      })
    })

    it('should have NPS question', () => {
      const npsQuestion = SURVEY_QUESTIONS.find((q) => q.id === 'nps')
      expect(npsQuestion).toBeDefined()
      expect(npsQuestion?.type).toBe('nps')
      expect(npsQuestion?.min).toBe(0)
      expect(npsQuestion?.max).toBe(10)
    })

    it('should have overall_experience question', () => {
      const question = SURVEY_QUESTIONS.find((q) => q.id === 'overall_experience')
      expect(question).toBeDefined()
      expect(question?.type).toBe('stars')
    })

    it('should have ease_of_use question', () => {
      const question = SURVEY_QUESTIONS.find((q) => q.id === 'ease_of_use')
      expect(question).toBeDefined()
      expect(question?.type).toBe('stars')
    })

    it('should have agents_usefulness question', () => {
      const question = SURVEY_QUESTIONS.find((q) => q.id === 'agents_usefulness')
      expect(question).toBeDefined()
    })

    it('should have most_used_features question with options', () => {
      const question = SURVEY_QUESTIONS.find((q) => q.id === 'most_used_features')
      expect(question).toBeDefined()
      expect(question?.type).toBe('multiple_multi')
      expect(question?.options).toBeDefined()
      expect(question?.options?.length).toBeGreaterThan(0)
    })

    it('should have text questions with maxLength', () => {
      const textQuestions = SURVEY_QUESTIONS.filter((q) => q.type === 'text')
      textQuestions.forEach((question) => {
        expect(question.maxLength).toBeDefined()
        expect(question.maxLength).toBeGreaterThan(0)
      })
    })

    it('should have placeholders for text questions', () => {
      const textQuestions = SURVEY_QUESTIONS.filter((q) => q.type === 'text')
      textQuestions.forEach((question) => {
        expect(question.placeholder_pt).toBeDefined()
        expect(question.placeholder_en).toBeDefined()
      })
    })

    it('should have min/max for stars questions', () => {
      const starsQuestions = SURVEY_QUESTIONS.filter((q) => q.type === 'stars')
      starsQuestions.forEach((question) => {
        expect(question.min).toBe(1)
        expect(question.max).toBe(5)
      })
    })

    it('should have options with both labels for multiple choice questions', () => {
      const multipleQuestions = SURVEY_QUESTIONS.filter(
        (q) => q.type === 'multiple_single' || q.type === 'multiple_multi'
      )
      multipleQuestions.forEach((question) => {
        expect(question.options).toBeDefined()
        question.options?.forEach((option) => {
          expect(option.value).toBeDefined()
          expect(option.label_pt).toBeDefined()
          expect(option.label_en).toBeDefined()
        })
      })
    })
  })

  describe('TOTAL_SURVEY_STEPS', () => {
    it('should equal the number of questions', () => {
      expect(TOTAL_SURVEY_STEPS).toBe(SURVEY_QUESTIONS.length)
    })
  })

  describe('getQuestionById', () => {
    it('should return question when found', () => {
      const question = getQuestionById('nps')
      expect(question).toBeDefined()
      expect(question?.id).toBe('nps')
    })

    it('should return undefined for non-existent ID', () => {
      const question = getQuestionById('nonexistent')
      expect(question).toBeUndefined()
    })

    it('should return correct question for each ID', () => {
      SURVEY_QUESTIONS.forEach((q) => {
        const found = getQuestionById(q.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(q.id)
      })
    })
  })

  describe('getQuestionsByType', () => {
    it('should return NPS questions', () => {
      const npsQuestions = getQuestionsByType('nps')
      expect(npsQuestions.length).toBeGreaterThan(0)
      npsQuestions.forEach((q) => {
        expect(q.type).toBe('nps')
      })
    })

    it('should return stars questions', () => {
      const starsQuestions = getQuestionsByType('stars')
      expect(starsQuestions.length).toBeGreaterThan(0)
      starsQuestions.forEach((q) => {
        expect(q.type).toBe('stars')
      })
    })

    it('should return text questions', () => {
      const textQuestions = getQuestionsByType('text')
      expect(textQuestions.length).toBeGreaterThan(0)
      textQuestions.forEach((q) => {
        expect(q.type).toBe('text')
      })
    })

    it('should return multiple_single questions', () => {
      const questions = getQuestionsByType('multiple_single')
      expect(questions.length).toBeGreaterThan(0)
      questions.forEach((q) => {
        expect(q.type).toBe('multiple_single')
      })
    })

    it('should return multiple_multi questions', () => {
      const questions = getQuestionsByType('multiple_multi')
      expect(questions.length).toBeGreaterThan(0)
      questions.forEach((q) => {
        expect(q.type).toBe('multiple_multi')
      })
    })

    it('should return empty array for non-existent type', () => {
      const questions = getQuestionsByType('nonexistent' as any)
      expect(questions).toEqual([])
    })
  })
})
