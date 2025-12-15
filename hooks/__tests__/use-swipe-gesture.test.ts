/**
 * Tests for useSwipeGesture hook
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSwipeGesture } from '../use-swipe-gesture'
import { RefObject } from 'react'

describe('useSwipeGesture', () => {
  let mockElement: HTMLDivElement
  let elementRef: RefObject<HTMLDivElement>

  beforeEach(() => {
    mockElement = document.createElement('div')
    elementRef = { current: mockElement }
    document.body.appendChild(mockElement)
  })

  afterEach(() => {
    document.body.removeChild(mockElement)
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSwipeGesture(elementRef))

      expect(result.current.isSwiping).toBe(false)
      expect(result.current.swipeDistance).toBe(0)
      expect(result.current.swipeDirection).toBe(null)
    })

    it('should accept custom threshold options', () => {
      const { result } = renderHook(() =>
        useSwipeGesture(elementRef, {
          threshold: 150,
          timeThreshold: 500,
        })
      )

      expect(result.current.isSwiping).toBe(false)
    })

    it('should handle null element ref', () => {
      const nullRef: RefObject<HTMLDivElement> = { current: null }

      expect(() => {
        renderHook(() => useSwipeGesture(nullRef))
      }).not.toThrow()
    })
  })

  describe('horizontal swipe - left', () => {
    it('should detect left swipe', () => {
      const onSwipeLeft = vi.fn()
      const { result } = renderHook(() => useSwipeGesture(elementRef, { onSwipeLeft }))

      // Touch start
      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      expect(result.current.isSwiping).toBe(true)

      // Touch move
      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('left')
      expect(result.current.swipeDistance).toBe(-100)

      // Touch end
      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeLeft).toHaveBeenCalled()
      expect(result.current.isSwiping).toBe(false)
    })

    it('should not trigger callback if swipe is below threshold', () => {
      const onSwipeLeft = vi.fn()
      const { result } = renderHook(() =>
        useSwipeGesture(elementRef, { onSwipeLeft, threshold: 100 })
      )

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 60, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('horizontal swipe - right', () => {
    it('should detect right swipe', () => {
      const onSwipeRight = vi.fn()
      const { result } = renderHook(() => useSwipeGesture(elementRef, { onSwipeRight }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('right')
      expect(result.current.swipeDistance).toBe(100)

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeRight).toHaveBeenCalled()
    })

    it('should not trigger right swipe if below threshold', () => {
      const onSwipeRight = vi.fn()
      renderHook(() => useSwipeGesture(elementRef, { onSwipeRight, threshold: 100 }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 150, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeRight).not.toHaveBeenCalled()
    })
  })

  describe('vertical swipe - up', () => {
    it('should detect up swipe', () => {
      const onSwipeUp = vi.fn()
      const { result } = renderHook(() => useSwipeGesture(elementRef, { onSwipeUp }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 200 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('up')
      expect(result.current.swipeDistance).toBe(-100)

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeUp).toHaveBeenCalled()
    })

    it('should not trigger up swipe if below threshold', () => {
      const onSwipeUp = vi.fn()
      renderHook(() => useSwipeGesture(elementRef, { onSwipeUp, threshold: 100 }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 150 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeUp).not.toHaveBeenCalled()
    })
  })

  describe('vertical swipe - down', () => {
    it('should detect down swipe', () => {
      const onSwipeDown = vi.fn()
      const { result } = renderHook(() => useSwipeGesture(elementRef, { onSwipeDown }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 200 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('down')
      expect(result.current.swipeDistance).toBe(100)

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 200 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeDown).toHaveBeenCalled()
    })

    it('should not trigger down swipe if below threshold', () => {
      const onSwipeDown = vi.fn()
      renderHook(() => useSwipeGesture(elementRef, { onSwipeDown, threshold: 100 }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 150 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeDown).not.toHaveBeenCalled()
    })
  })

  describe('swipe lifecycle callbacks', () => {
    it('should call onSwipeStart when touch starts', () => {
      const onSwipeStart = vi.fn()
      const { result } = renderHook(() => useSwipeGesture(elementRef, { onSwipeStart }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      expect(onSwipeStart).toHaveBeenCalled()
      expect(result.current.isSwiping).toBe(true)
    })

    it('should call onSwipeEnd when touch ends', () => {
      const onSwipeEnd = vi.fn()
      renderHook(() => useSwipeGesture(elementRef, { onSwipeEnd }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeEnd).toHaveBeenCalled()
    })

    it('should call all lifecycle callbacks in order', () => {
      const calls: string[] = []
      const onSwipeStart = vi.fn(() => calls.push('start'))
      const onSwipeRight = vi.fn(() => calls.push('right'))
      const onSwipeEnd = vi.fn(() => calls.push('end'))

      renderHook(() =>
        useSwipeGesture(elementRef, {
          onSwipeStart,
          onSwipeRight,
          onSwipeEnd,
          threshold: 50,
        })
      )

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(calls).toEqual(['start', 'right', 'end'])
    })
  })

  describe('time threshold', () => {
    it('should not trigger callback if swipe takes too long', () => {
      const onSwipeRight = vi.fn()
      renderHook(() =>
        useSwipeGesture(elementRef, {
          onSwipeRight,
          timeThreshold: 100,
        })
      )

      const startTime = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(startTime)

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      // Simulate time passing (200ms > 100ms threshold)
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200)

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 250, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeRight).not.toHaveBeenCalled()

      vi.restoreAllMocks()
    })

    it('should trigger callback if swipe is within time threshold', () => {
      const onSwipeRight = vi.fn()
      renderHook(() =>
        useSwipeGesture(elementRef, {
          onSwipeRight,
          timeThreshold: 300,
        })
      )

      const startTime = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(startTime)

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      // Within threshold
      vi.spyOn(Date, 'now').mockReturnValue(startTime + 200)

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 250, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeRight).toHaveBeenCalled()

      vi.restoreAllMocks()
    })
  })

  describe('preventDefault option', () => {
    it('should preventDefault when option is true', () => {
      renderHook(() => useSwipeGesture(elementRef, { preventDefault: true }))

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const preventDefaultSpy = vi.spyOn(touchStart, 'preventDefault')

      act(() => {
        mockElement.dispatchEvent(touchStart)
      })

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not preventDefault when option is false', () => {
      renderHook(() => useSwipeGesture(elementRef, { preventDefault: false }))

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const preventDefaultSpy = vi.spyOn(touchStart, 'preventDefault')

      act(() => {
        mockElement.dispatchEvent(touchStart)
      })

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('state reset', () => {
    it('should reset state after swipe completes', () => {
      const { result } = renderHook(() => useSwipeGesture(elementRef))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.isSwiping).toBe(true)
      expect(result.current.swipeDistance).toBe(100)
      expect(result.current.swipeDirection).toBe('right')

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(result.current.isSwiping).toBe(false)
      expect(result.current.swipeDistance).toBe(0)
      expect(result.current.swipeDirection).toBe(null)
    })
  })

  describe('diagonal swipes', () => {
    it('should prefer horizontal direction for diagonal swipe', () => {
      const { result } = renderHook(() => useSwipeGesture(elementRef))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      // Diagonal swipe with more horizontal movement
      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 130 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('right')
    })

    it('should prefer vertical direction when vertical movement is larger', () => {
      const { result } = renderHook(() => useSwipeGesture(elementRef))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      // Diagonal swipe with more vertical movement
      act(() => {
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 130, clientY: 200 } as Touch],
        })
        mockElement.dispatchEvent(touchMove)
      })

      expect(result.current.swipeDirection).toBe('down')
    })
  })

  describe('edge cases', () => {
    it('should handle touch without movement', () => {
      const onSwipeRight = vi.fn()
      renderHook(() => useSwipeGesture(elementRef, { onSwipeRight }))

      act(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchStart)
      })

      act(() => {
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
        })
        mockElement.dispatchEvent(touchEnd)
      })

      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('should handle touchmove without touchstart', () => {
      const { result } = renderHook(() => useSwipeGesture(elementRef))

      expect(() => {
        act(() => {
          const touchMove = new TouchEvent('touchmove', {
            touches: [{ clientX: 200, clientY: 100 } as Touch],
          })
          mockElement.dispatchEvent(touchMove)
        })
      }).not.toThrow()

      expect(result.current.swipeDirection).toBe(null)
    })

    it('should handle touchend without touchstart', () => {
      expect(() => {
        renderHook(() => useSwipeGesture(elementRef))

        act(() => {
          const touchEnd = new TouchEvent('touchend', {
            changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
          })
          mockElement.dispatchEvent(touchEnd)
        })
      }).not.toThrow()
    })
  })

  describe('cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener')
      const { unmount } = renderHook(() => useSwipeGesture(elementRef))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function))
    })
  })
})
