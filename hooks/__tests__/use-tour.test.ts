/**
 * Tests for useTour hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTour } from '../use-tour'

// Create a mock TourManager class using vi.hoisted
const { MockTourManager } = vi.hoisted(() => {
  class MockTourManager {
    initialized = false
    started = false
    mode = 'quick'
    step = 0
    total = 4

    initialize(config: any) {
      this.initialized = true
      this.mode = config.mode || 'quick'
    }
    start(mode: string) {
      this.started = true
      this.mode = mode
    }
    stop() {
      this.started = false
      this.step = 0
    }
    moveNext() {
      if (this.step < this.total - 1) this.step++
    }
    movePrevious() {
      if (this.step > 0) this.step--
    }
    getCurrentStep() {
      return this.step
    }
    getTotalSteps() {
      return this.total
    }
    isLastStep() {
      return this.step === this.total - 1
    }
    hasNextStep() {
      return this.step < this.total - 1
    }
  }

  return { MockTourManager }
})

vi.mock('@/lib/services/tour-manager', () => ({
  TourManager: MockTourManager,
}))

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
  }),
}))

vi.mock('@/store/chat-store', () => ({
  useChatStore: () => ({
    messages: [],
  }),
}))

describe('useTour', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('returns inactive state by default', () => {
      const { result } = renderHook(() => useTour())

      expect(result.current.isActive).toBe(false)
      expect(result.current.currentStep).toBe(0)
      expect(result.current.totalSteps).toBe(0)
    })

    it('isFirstStep is true by default', () => {
      const { result } = renderHook(() => useTour())

      expect(result.current.isFirstStep).toBe(true)
    })
  })

  describe('startTour', () => {
    it('starts tour and updates state', () => {
      const { result } = renderHook(() => useTour())

      act(() => {
        result.current.startTour()
      })

      expect(result.current.isActive).toBe(true)
      expect(result.current.totalSteps).toBe(4)
    })

    it('starts tour with complete mode', () => {
      const { result } = renderHook(() => useTour())

      act(() => {
        result.current.startTour('complete')
      })

      expect(result.current.isActive).toBe(true)
    })
  })

  describe('skipTour', () => {
    it('stops tour and marks as skipped', () => {
      const onSkip = vi.fn()
      const { result } = renderHook(() => useTour({ onSkip }))

      act(() => {
        result.current.startTour()
      })

      act(() => {
        result.current.skipTour()
      })

      expect(result.current.isActive).toBe(false)
      expect(localStorage.getItem('tour-skipped')).toBe('true')
      expect(onSkip).toHaveBeenCalled()
    })
  })

  describe('hasSeenTour', () => {
    it('returns false when tour not completed', () => {
      const { result } = renderHook(() => useTour())

      expect(result.current.hasSeenTour()).toBe(false)
    })

    it('returns true when tour completed', () => {
      localStorage.setItem('tour-completed', 'true')

      const { result } = renderHook(() => useTour())

      expect(result.current.hasSeenTour()).toBe(true)
    })
  })

  describe('clearTourHistory', () => {
    it('clears all tour-related localStorage items', () => {
      localStorage.setItem('tour-completed', 'true')
      localStorage.setItem('tour-skipped', 'true')
      localStorage.setItem('tour-completed-date', '2025-12-15')

      const { result } = renderHook(() => useTour())

      act(() => {
        result.current.clearTourHistory()
      })

      expect(localStorage.getItem('tour-completed')).toBeNull()
      expect(localStorage.getItem('tour-skipped')).toBeNull()
      expect(localStorage.getItem('tour-completed-date')).toBeNull()
    })
  })

  describe('navigation', () => {
    it('provides nextStep function', () => {
      const { result } = renderHook(() => useTour())

      expect(typeof result.current.nextStep).toBe('function')
    })

    it('provides prevStep function', () => {
      const { result } = renderHook(() => useTour())

      expect(typeof result.current.prevStep).toBe('function')
    })

    it('provides restartTour function', () => {
      const { result } = renderHook(() => useTour())

      expect(typeof result.current.restartTour).toBe('function')
    })
  })

  describe('stepInfo', () => {
    it('returns undefined when tour not active', () => {
      const { result } = renderHook(() => useTour())

      expect(result.current.stepInfo).toBeUndefined()
    })

    it('returns step info when tour is active', () => {
      const { result } = renderHook(() => useTour())

      act(() => {
        result.current.startTour()
      })

      expect(result.current.stepInfo).toBeDefined()
      expect(result.current.stepInfo?.title).toBe('Começe por aqui!')
    })
  })
})
