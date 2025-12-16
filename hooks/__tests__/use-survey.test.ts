/**
 * Tests for useSurvey hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSurvey } from '../use-survey'

// Mock survey store
const mockOpenSurvey = vi.fn()
const mockCloseSurvey = vi.fn()
const mockResetSurvey = vi.fn()
const mockDismissSuccess = vi.fn()

const mockSurveyStore = {
  isOpen: false,
  hasCompleted: false,
  showSuccess: false,
  currentStep: 0,
  answers: {},
  openSurvey: mockOpenSurvey,
  closeSurvey: mockCloseSurvey,
  resetSurvey: mockResetSurvey,
  dismissSuccess: mockDismissSuccess,
}

vi.mock('@/store/survey-store', () => ({
  useSurveyStore: () => mockSurveyStore,
}))

// Mock badge store
const mockBadges: any[] = []
const mockHasBadge = vi.fn().mockReturnValue(false)

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => ({
    badges: mockBadges,
    hasBadge: mockHasBadge,
  }),
}))

describe('useSurvey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSurveyStore.isOpen = false
    mockSurveyStore.hasCompleted = false
    mockSurveyStore.currentStep = 0
    mockSurveyStore.answers = {}
    mockHasBadge.mockReturnValue(false)
  })

  describe('State', () => {
    it('returns isOpen from store', () => {
      mockSurveyStore.isOpen = true

      const { result } = renderHook(() => useSurvey())

      expect(result.current.isOpen).toBe(true)
    })

    it('returns hasCompleted from store', () => {
      mockSurveyStore.hasCompleted = true

      const { result } = renderHook(() => useSurvey())

      expect(result.current.hasCompleted).toBe(true)
    })

    it('returns showSuccess from store', () => {
      mockSurveyStore.showSuccess = true

      const { result } = renderHook(() => useSurvey())

      expect(result.current.showSuccess).toBe(true)
    })
  })

  describe('canTakeSurvey', () => {
    it('returns true when survey not completed and not open', () => {
      mockSurveyStore.isOpen = false
      mockSurveyStore.hasCompleted = false

      const { result } = renderHook(() => useSurvey())

      expect(result.current.canTakeSurvey).toBe(true)
    })

    it('returns false when survey is open', () => {
      mockSurveyStore.isOpen = true
      mockSurveyStore.hasCompleted = false

      const { result } = renderHook(() => useSurvey())

      expect(result.current.canTakeSurvey).toBe(false)
    })

    it('returns false when survey is completed', () => {
      mockSurveyStore.isOpen = false
      mockSurveyStore.hasCompleted = true

      const { result } = renderHook(() => useSurvey())

      expect(result.current.canTakeSurvey).toBe(false)
    })
  })

  describe('progress', () => {
    it('calculates step correctly', () => {
      mockSurveyStore.currentStep = 2

      const { result } = renderHook(() => useSurvey())

      expect(result.current.progress.step).toBe(3)
    })

    it('calculates total based on answers', () => {
      mockSurveyStore.answers = { q1: 'a', q2: 'b', q3: 'c' }

      const { result } = renderHook(() => useSurvey())

      expect(result.current.progress.total).toBe(3)
    })

    it('returns 100% when completed', () => {
      mockSurveyStore.hasCompleted = true

      const { result } = renderHook(() => useSurvey())

      expect(result.current.progress.percent).toBe(100)
    })

    it('calculates percent based on 9 questions', () => {
      mockSurveyStore.answers = { q1: 'a', q2: 'b', q3: 'c' }

      const { result } = renderHook(() => useSurvey())

      expect(result.current.progress.percent).toBe(33) // 3/9 rounded
    })
  })

  describe('hasCollaboratorBadge', () => {
    it('returns false when user does not have badge', () => {
      mockHasBadge.mockReturnValue(false)

      const { result } = renderHook(() => useSurvey())

      expect(result.current.hasCollaboratorBadge).toBe(false)
    })

    it('returns true when user has badge', () => {
      mockHasBadge.mockReturnValue(true)

      const { result } = renderHook(() => useSurvey())

      expect(result.current.hasCollaboratorBadge).toBe(true)
    })
  })

  describe('Actions', () => {
    it('openFromFooter calls openSurvey with footer source', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.openFromFooter()
      })

      expect(mockOpenSurvey).toHaveBeenCalledWith('footer')
    })

    it('openFromFab calls openSurvey with fab source', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.openFromFab()
      })

      expect(mockOpenSurvey).toHaveBeenCalledWith('fab')
    })

    it('openFromProfile calls openSurvey with profile source', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.openFromProfile()
      })

      expect(mockOpenSurvey).toHaveBeenCalledWith('profile')
    })

    it('closeSurvey calls store closeSurvey', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.closeSurvey()
      })

      expect(mockCloseSurvey).toHaveBeenCalled()
    })

    it('resetSurvey calls store resetSurvey', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.resetSurvey()
      })

      expect(mockResetSurvey).toHaveBeenCalled()
    })

    it('dismissSuccess calls store dismissSuccess', () => {
      const { result } = renderHook(() => useSurvey())

      act(() => {
        result.current.dismissSuccess()
      })

      expect(mockDismissSuccess).toHaveBeenCalled()
    })
  })

  describe('badges', () => {
    it('returns badges from store', () => {
      const testBadges = [{ id: '1', badge_type: 'colaborador' }]
      mockBadges.length = 0
      mockBadges.push(...testBadges)

      const { result } = renderHook(() => useSurvey())

      expect(result.current.badges).toEqual(testBadges)
    })
  })
})
