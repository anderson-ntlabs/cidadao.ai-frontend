/**
 * Survey Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const { mockFrom, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockNot } = vi.hoisted(
  () => {
    const mockSingle = vi.fn()
    const mockNot = vi.fn()
    const mockEq = vi.fn()
    const mockSelect = vi.fn()
    const mockInsert = vi.fn()
    const mockUpdate = vi.fn()

    return {
      mockSingle,
      mockNot,
      mockEq,
      mockSelect,
      mockInsert,
      mockUpdate,
      mockFrom: vi.fn(),
    }
  }
)

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock survey-questions
vi.mock('@/data/survey-questions', () => ({
  SURVEY_VERSION: '1.0',
  TOTAL_SURVEY_STEPS: 5,
}))

// Mock badge service
vi.mock('./badge.service', () => ({
  badgeService: {
    awardBadge: vi.fn().mockResolvedValue(true),
  },
}))

describe('SurveyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain setup
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle, not: mockNot })
    mockNot.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })
  })

  describe('hasCompletedSurvey', () => {
    it('should return true when survey is completed', async () => {
      mockSingle.mockResolvedValue({
        data: { completed_at: '2025-01-01T00:00:00Z' },
        error: null,
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.hasCompletedSurvey('user-123')

      expect(result).toBe(true)
    })

    it('should return false when survey not completed', async () => {
      mockSingle.mockResolvedValue({
        data: { completed_at: null },
        error: null,
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.hasCompletedSurvey('user-123')

      expect(result).toBe(false)
    })

    it('should return false when no survey found (PGRST116)', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.hasCompletedSurvey('user-123')

      expect(result).toBe(false)
    })

    it('should return false on other errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Error' },
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.hasCompletedSurvey('user-123')

      expect(result).toBe(false)
    })
  })

  describe('getSurveyResponse', () => {
    it('should return survey response when found', async () => {
      const mockResponse = {
        id: '1',
        user_id: 'user-123',
        answers: { q1: 'a' },
        current_step: 2,
      }
      mockSingle.mockResolvedValue({ data: mockResponse, error: null })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.getSurveyResponse('user-123')

      expect(response).toEqual(mockResponse)
    })

    it('should return null when not found (PGRST116)', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.getSurveyResponse('user-123')

      expect(response).toBeNull()
    })

    it('should return null on error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Error' },
      })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.getSurveyResponse('user-123')

      expect(response).toBeNull()
    })
  })

  describe('startSurvey', () => {
    it('should start new survey', async () => {
      const mockResponse = {
        id: '1',
        user_id: 'user-123',
        answers: {},
        current_step: 0,
      }
      mockSingle.mockResolvedValue({ data: mockResponse, error: null })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.startSurvey('user-123')

      expect(response).toEqual(mockResponse)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should return existing survey on unique violation', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: '23505' } })
      mockSingle.mockResolvedValueOnce({
        data: { id: '1', user_id: 'user-123' },
        error: null,
      })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.startSurvey('user-123')

      expect(response).toBeDefined()
    })

    it('should return null on error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Error' },
      })

      const { surveyService } = await import('./survey.service')
      const response = await surveyService.startSurvey('user-123')

      expect(response).toBeNull()
    })
  })

  describe('saveSurveyProgress', () => {
    it('should save progress successfully', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.saveSurveyProgress('user-123', { q1: 'a' }, 2)

      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Error' } }),
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.saveSurveyProgress('user-123', { q1: 'a' }, 2)

      expect(result).toBe(false)
    })
  })

  describe('submitSurvey', () => {
    it('should submit survey and award badge', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.submitSurvey('user-123', { q1: 'a', q2: 'b' })

      expect(result.success).toBe(true)
      expect(result.badgeAwarded).toBe(true)
    })

    it('should return failure on error', async () => {
      mockEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Error' } }),
      })

      const { surveyService } = await import('./survey.service')
      const result = await surveyService.submitSurvey('user-123', { q1: 'a' })

      expect(result.success).toBe(false)
      expect(result.badgeAwarded).toBe(false)
    })
  })

  describe('getSurveyStats', () => {
    it('should return survey statistics', async () => {
      mockEq.mockReturnValue({
        not: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      })
      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      const { surveyService } = await import('./survey.service')
      const stats = await surveyService.getSurveyStats()

      expect(stats).toHaveProperty('totalResponses')
      expect(stats).toHaveProperty('completedResponses')
      expect(stats).toHaveProperty('abandonedResponses')
      expect(stats).toHaveProperty('completionRate')
    })

    it('should return zeros on error', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('DB Error')
      })

      const { surveyService } = await import('./survey.service')
      const stats = await surveyService.getSurveyStats()

      expect(stats.totalResponses).toBe(0)
      expect(stats.completedResponses).toBe(0)
      expect(stats.completionRate).toBe(0)
    })
  })

  describe('singleton export', () => {
    it('should export surveyService singleton', async () => {
      const { surveyService } = await import('./survey.service')
      expect(surveyService).toBeDefined()
    })
  })
})
