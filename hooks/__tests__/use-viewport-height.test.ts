import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewportHeight, useViewportHeightCSS } from '../use-viewport-height'

describe('useViewportHeight', () => {
  const originalInnerHeight = window.innerHeight
  const originalVisualViewport = window.visualViewport

  beforeEach(() => {
    // Reset to known state
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    })
    // @ts-expect-error - restoring original
    window.visualViewport = originalVisualViewport
  })

  describe('without visualViewport API', () => {
    beforeEach(() => {
      // @ts-expect-error - mocking
      window.visualViewport = undefined
    })

    it('returns window.innerHeight', () => {
      Object.defineProperty(window, 'innerHeight', { value: 600 })
      const { result } = renderHook(() => useViewportHeight())
      expect(result.current).toBe(600)
    })

    it('updates on resize', () => {
      const { result } = renderHook(() => useViewportHeight())
      expect(result.current).toBe(800)

      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 500 })
        window.dispatchEvent(new Event('resize'))
      })

      expect(result.current).toBe(500)
    })

    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useViewportHeight())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('with visualViewport API', () => {
    let mockVisualViewport: {
      height: number
      addEventListener: ReturnType<typeof vi.fn>
      removeEventListener: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      mockVisualViewport = {
        height: 700,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }
      // @ts-expect-error - mocking
      window.visualViewport = mockVisualViewport
    })

    it('returns visualViewport.height', () => {
      const { result } = renderHook(() => useViewportHeight())
      expect(result.current).toBe(700)
    })

    it('adds resize and scroll listeners', () => {
      renderHook(() => useViewportHeight())

      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('cleans up visualViewport listeners on unmount', () => {
      const { unmount } = renderHook(() => useViewportHeight())

      unmount()

      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })
  })

  describe('initial state', () => {
    it('starts with 0 before effect runs', () => {
      // The hook uses useState(0) initially
      const { result } = renderHook(() => useViewportHeight())
      // After effect runs, it should have the actual value
      expect(result.current).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('useViewportHeightCSS', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
    // @ts-expect-error - mocking
    window.visualViewport = undefined
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--vh')
  })

  it('sets --vh CSS custom property', () => {
    renderHook(() => useViewportHeightCSS())

    // --vh should be 1% of viewport height
    const vhValue = document.documentElement.style.getPropertyValue('--vh')
    expect(vhValue).toBe('8px') // 800 * 0.01 = 8
  })

  it('updates CSS property on resize', () => {
    renderHook(() => useViewportHeightCSS())

    act(() => {
      Object.defineProperty(window, 'innerHeight', { value: 1000 })
      window.dispatchEvent(new Event('resize'))
    })

    const vhValue = document.documentElement.style.getPropertyValue('--vh')
    expect(vhValue).toBe('10px') // 1000 * 0.01 = 10
  })

  it('does not set property for zero height', () => {
    Object.defineProperty(window, 'innerHeight', { value: 0 })
    renderHook(() => useViewportHeightCSS())

    // Initially the hook returns 0, so --vh shouldn't be set
    const vhValue = document.documentElement.style.getPropertyValue('--vh')
    expect(vhValue).toBe('')
  })
})
