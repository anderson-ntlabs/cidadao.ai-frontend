/**
 * Tests for Micro-Interaction Hooks
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useScalePress,
  useHoverLift,
  useRipple,
  useCountAnimation,
  useFadeIn,
  useShake,
  usePulse,
} from './use-micro-interaction'

describe('Micro-Interaction Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useScalePress', () => {
    it('should return initial scale of 1', () => {
      const { result } = renderHook(() => useScalePress())
      expect(result.current.scale).toBe(1)
    })

    it('should return initial isPressed false', () => {
      const { result } = renderHook(() => useScalePress())
      expect(result.current.isPressed).toBe(false)
    })

    it('should use custom initial scale', () => {
      const { result } = renderHook(() => useScalePress(1.1, 0.9))
      expect(result.current.scale).toBe(1.1)
    })

    it('should scale down on pointer down', () => {
      const { result } = renderHook(() => useScalePress(1, 0.95))

      act(() => {
        result.current.scaleProps.onPointerDown()
      })

      expect(result.current.scale).toBe(0.95)
      expect(result.current.isPressed).toBe(true)
    })

    it('should return to initial scale on pointer up', () => {
      const { result } = renderHook(() => useScalePress(1, 0.95))

      act(() => {
        result.current.scaleProps.onPointerDown()
      })
      act(() => {
        result.current.scaleProps.onPointerUp()
      })

      expect(result.current.scale).toBe(1)
      expect(result.current.isPressed).toBe(false)
    })

    it('should return to initial scale on pointer leave', () => {
      const { result } = renderHook(() => useScalePress(1, 0.95))

      act(() => {
        result.current.scaleProps.onPointerDown()
      })
      act(() => {
        result.current.scaleProps.onPointerLeave()
      })

      expect(result.current.scale).toBe(1)
    })

    it('should have style with transform and transition', () => {
      const { result } = renderHook(() => useScalePress(1, 0.95, 150))

      expect(result.current.scaleProps.style.transform).toBe('scale(1)')
      expect(result.current.scaleProps.style.transition).toContain('150ms')
    })
  })

  describe('useHoverLift', () => {
    it('should return initial isHovered false', () => {
      const { result } = renderHook(() => useHoverLift())
      expect(result.current.isHovered).toBe(false)
    })

    it('should set isHovered true on mouse enter', () => {
      const { result } = renderHook(() => useHoverLift())

      act(() => {
        result.current.hoverProps.onMouseEnter()
      })

      expect(result.current.isHovered).toBe(true)
    })

    it('should set isHovered false on mouse leave', () => {
      const { result } = renderHook(() => useHoverLift())

      act(() => {
        result.current.hoverProps.onMouseEnter()
        result.current.hoverProps.onMouseLeave()
      })

      expect(result.current.isHovered).toBe(false)
    })

    it('should have transform style for hover', () => {
      const { result } = renderHook(() => useHoverLift(4))

      expect(result.current.hoverProps.style.transform).toBe('translateY(0)')

      act(() => {
        result.current.hoverProps.onMouseEnter()
      })

      expect(result.current.hoverProps.style.transform).toBe('translateY(-4px)')
    })

    it('should use custom lift distance', () => {
      const { result } = renderHook(() => useHoverLift(8))

      act(() => {
        result.current.hoverProps.onMouseEnter()
      })

      expect(result.current.hoverProps.style.transform).toBe('translateY(-8px)')
    })

    it('should include transition style', () => {
      const { result } = renderHook(() => useHoverLift(4, 200))

      expect(result.current.hoverProps.style.transition).toContain('200ms')
    })
  })

  describe('useRipple', () => {
    it('should start with empty ripples array', () => {
      const { result } = renderHook(() => useRipple())
      expect(result.current.ripples).toHaveLength(0)
    })

    it('should add ripple on click', () => {
      const { result } = renderHook(() => useRipple())

      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        clientX: 50,
        clientY: 50,
      } as unknown as React.MouseEvent<HTMLElement>

      act(() => {
        result.current.addRipple(mockEvent)
      })

      expect(result.current.ripples).toHaveLength(1)
      expect(result.current.ripples[0].x).toBe(50)
      expect(result.current.ripples[0].y).toBe(50)
    })

    it('should calculate ripple position relative to element', () => {
      const { result } = renderHook(() => useRipple())

      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 100, top: 100 }),
        },
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent<HTMLElement>

      act(() => {
        result.current.addRipple(mockEvent)
      })

      expect(result.current.ripples[0].x).toBe(50)
      expect(result.current.ripples[0].y).toBe(50)
    })

    it('should remove ripple after 600ms', () => {
      const { result } = renderHook(() => useRipple())

      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        clientX: 50,
        clientY: 50,
      } as unknown as React.MouseEvent<HTMLElement>

      act(() => {
        result.current.addRipple(mockEvent)
      })

      expect(result.current.ripples).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(600)
      })

      expect(result.current.ripples).toHaveLength(0)
    })

    it('should support multiple ripples', () => {
      const { result } = renderHook(() => useRipple())

      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        clientX: 50,
        clientY: 50,
      } as unknown as React.MouseEvent<HTMLElement>

      act(() => {
        result.current.addRipple(mockEvent)
        vi.advanceTimersByTime(100) // Advance a bit to get different IDs
        result.current.addRipple(mockEvent)
      })

      expect(result.current.ripples).toHaveLength(2)
    })
  })

  describe('useCountAnimation', () => {
    it('should start at 0', () => {
      const { result } = renderHook(() => useCountAnimation(100, 1000))
      expect(result.current).toBe(0)
    })

    it('should animate to target value', () => {
      const { result } = renderHook(() => useCountAnimation(100, 1000))

      act(() => {
        // Add extra time to ensure animation completes
        vi.advanceTimersByTime(1100)
      })

      expect(result.current).toBe(100)
    })

    it('should increment progressively', () => {
      const { result } = renderHook(() => useCountAnimation(100, 1000))

      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Should be somewhere in between
      expect(result.current).toBeGreaterThan(0)
      expect(result.current).toBeLessThan(100)
    })

    it('should not exceed target value', () => {
      const { result } = renderHook(() => useCountAnimation(50, 500))

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current).toBe(50)
    })
  })

  describe('useFadeIn', () => {
    it('should start with isVisible false', () => {
      const { result } = renderHook(() => useFadeIn(100))
      expect(result.current.isVisible).toBe(false)
    })

    it('should become visible after delay', () => {
      const { result } = renderHook(() => useFadeIn(100))

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.isVisible).toBe(true)
    })

    it('should have opacity 0 initially', () => {
      const { result } = renderHook(() => useFadeIn(100))
      expect(result.current.fadeProps.style.opacity).toBe(0)
    })

    it('should have opacity 1 after visible', () => {
      const { result } = renderHook(() => useFadeIn(100))

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.fadeProps.style.opacity).toBe(1)
    })

    it('should default to 0 delay', () => {
      const { result } = renderHook(() => useFadeIn())

      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(result.current.isVisible).toBe(true)
    })
  })

  describe('useShake', () => {
    it('should not shake when trigger is false', () => {
      const { result } = renderHook(() => useShake(false))
      expect(result.current.isShaking).toBe(false)
    })

    it('should shake when trigger is true', () => {
      const { result } = renderHook(() => useShake(true))
      expect(result.current.isShaking).toBe(true)
    })

    it('should stop shaking after 500ms', () => {
      const { result } = renderHook(() => useShake(true))

      expect(result.current.isShaking).toBe(true)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.isShaking).toBe(false)
    })

    it('should have animate-shake class when shaking', () => {
      const { result } = renderHook(() => useShake(true))
      expect(result.current.shakeProps.className).toBe('animate-shake')
    })

    it('should have empty class when not shaking', () => {
      const { result } = renderHook(() => useShake(false))
      expect(result.current.shakeProps.className).toBe('')
    })
  })

  describe('usePulse', () => {
    it('should not pulse when trigger is false', () => {
      const { result } = renderHook(() => usePulse(false))
      expect(result.current.isPulsing).toBe(false)
    })

    it('should pulse when trigger is true', () => {
      const { result } = renderHook(() => usePulse(true))
      expect(result.current.isPulsing).toBe(true)
    })

    it('should stop pulsing after duration', () => {
      const { result } = renderHook(() => usePulse(true, 1000))

      expect(result.current.isPulsing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.isPulsing).toBe(false)
    })

    it('should use default duration of 1000ms', () => {
      const { result } = renderHook(() => usePulse(true))

      act(() => {
        vi.advanceTimersByTime(999)
      })
      expect(result.current.isPulsing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current.isPulsing).toBe(false)
    })

    it('should have animate-pulse-once class when pulsing', () => {
      const { result } = renderHook(() => usePulse(true))
      expect(result.current.pulseProps.className).toBe('animate-pulse-once')
    })

    it('should have empty class when not pulsing', () => {
      const { result } = renderHook(() => usePulse(false))
      expect(result.current.pulseProps.className).toBe('')
    })
  })
})
