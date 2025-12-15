import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from '../use-onboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('shows onboarding when not completed', () => {
      const { result } = renderHook(() => useOnboarding())

      // After effect runs
      expect(result.current.hasCompletedOnboarding).toBe(false)
      expect(result.current.shouldShowOnboarding).toBe(true)
    })

    it('hides onboarding when completed', () => {
      localStorage.setItem('onboardingComplete', 'true')
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.hasCompletedOnboarding).toBe(true)
      expect(result.current.shouldShowOnboarding).toBe(false)
    })

    it('shows tour not completed initially', () => {
      const { result } = renderHook(() => useOnboarding())
      expect(result.current.hasSeenTour).toBe(false)
    })

    it('shows tour completed when stored', () => {
      localStorage.setItem('tourComplete', 'true')
      const { result } = renderHook(() => useOnboarding())

      expect(result.current.hasSeenTour).toBe(true)
    })

    it('does not show tour by default', () => {
      const { result } = renderHook(() => useOnboarding())
      expect(result.current.shouldShowTour).toBe(false)
    })
  })

  describe('completeOnboarding', () => {
    it('marks onboarding as complete', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeOnboarding()
      })

      expect(result.current.hasCompletedOnboarding).toBe(true)
      expect(result.current.shouldShowOnboarding).toBe(false)
    })

    it('saves to localStorage', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeOnboarding()
      })

      expect(localStorage.getItem('onboardingComplete')).toBe('true')
    })

    it('shows tour after onboarding if not seen', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeOnboarding()
      })

      expect(result.current.shouldShowTour).toBe(true)
    })

    it('does not show tour if already seen', () => {
      localStorage.setItem('tourComplete', 'true')
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeOnboarding()
      })

      expect(result.current.shouldShowTour).toBe(false)
    })
  })

  describe('completeTour', () => {
    it('marks tour as complete', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeTour()
      })

      expect(result.current.hasSeenTour).toBe(true)
    })

    it('saves to localStorage', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.completeTour()
      })

      expect(localStorage.getItem('tourComplete')).toBe('true')
    })

    it('hides tour', () => {
      const { result } = renderHook(() => useOnboarding())

      // Start tour first
      act(() => {
        result.current.startTour()
      })

      expect(result.current.shouldShowTour).toBe(true)

      act(() => {
        result.current.completeTour()
      })

      expect(result.current.shouldShowTour).toBe(false)
    })
  })

  describe('resetOnboarding', () => {
    it('resets all state', () => {
      localStorage.setItem('onboardingComplete', 'true')
      localStorage.setItem('tourComplete', 'true')
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.resetOnboarding()
      })

      expect(result.current.hasCompletedOnboarding).toBe(false)
      expect(result.current.hasSeenTour).toBe(false)
      expect(result.current.shouldShowTour).toBe(false)
    })

    it('removes from localStorage', () => {
      localStorage.setItem('onboardingComplete', 'true')
      localStorage.setItem('tourComplete', 'true')
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.resetOnboarding()
      })

      expect(localStorage.getItem('onboardingComplete')).toBeNull()
      expect(localStorage.getItem('tourComplete')).toBeNull()
    })
  })

  describe('startTour', () => {
    it('shows tour', () => {
      const { result } = renderHook(() => useOnboarding())

      act(() => {
        result.current.startTour()
      })

      expect(result.current.shouldShowTour).toBe(true)
    })
  })

  describe('full flow', () => {
    it('completes onboarding then tour', () => {
      const { result } = renderHook(() => useOnboarding())

      // Initially show onboarding
      expect(result.current.shouldShowOnboarding).toBe(true)
      expect(result.current.shouldShowTour).toBe(false)

      // Complete onboarding
      act(() => {
        result.current.completeOnboarding()
      })

      // Should now show tour
      expect(result.current.shouldShowOnboarding).toBe(false)
      expect(result.current.shouldShowTour).toBe(true)

      // Complete tour
      act(() => {
        result.current.completeTour()
      })

      // Should show nothing
      expect(result.current.shouldShowOnboarding).toBe(false)
      expect(result.current.shouldShowTour).toBe(false)
    })
  })
})
