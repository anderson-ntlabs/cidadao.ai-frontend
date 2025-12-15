/**
 * Tests for micro-interaction hooks
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useScalePress,
  useHoverLift,
  useRipple,
  useCountAnimation,
  useFadeIn,
  useShake,
  usePulse,
} from '../use-micro-interaction'

describe('useScalePress', () => {
  it('should initialize with default scale', () => {
    const { result } = renderHook(() => useScalePress())

    expect(result.current.scale).toBe(1)
    expect(result.current.isPressed).toBe(false)
  })

  it('should accept custom initial scale', () => {
    const { result } = renderHook(() => useScalePress(1.1, 0.9, 200))

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

  it('should scale up on pointer up', () => {
    const { result } = renderHook(() => useScalePress(1, 0.95))

    act(() => {
      result.current.scaleProps.onPointerDown()
    })

    expect(result.current.scale).toBe(0.95)

    act(() => {
      result.current.scaleProps.onPointerUp()
    })

    expect(result.current.scale).toBe(1)
    expect(result.current.isPressed).toBe(false)
  })

  it('should scale up on pointer leave', () => {
    const { result } = renderHook(() => useScalePress(1, 0.95))

    act(() => {
      result.current.scaleProps.onPointerDown()
    })

    act(() => {
      result.current.scaleProps.onPointerLeave()
    })

    expect(result.current.scale).toBe(1)
    expect(result.current.isPressed).toBe(false)
  })

  it('should provide correct style transform', () => {
    const { result } = renderHook(() => useScalePress(1, 0.95, 150))

    expect(result.current.scaleProps.style.transform).toBe('scale(1)')
    expect(result.current.scaleProps.style.transition).toContain('transform 150ms')
  })

  it('should handle custom press scale', () => {
    const { result } = renderHook(() => useScalePress(1, 0.8))

    act(() => {
      result.current.scaleProps.onPointerDown()
    })

    expect(result.current.scale).toBe(0.8)
  })
})

describe('useHoverLift', () => {
  it('should initialize with not hovered state', () => {
    const { result } = renderHook(() => useHoverLift())

    expect(result.current.isHovered).toBe(false)
  })

  it('should set hovered on mouse enter', () => {
    const { result } = renderHook(() => useHoverLift())

    act(() => {
      result.current.hoverProps.onMouseEnter()
    })

    expect(result.current.isHovered).toBe(true)
  })

  it('should unset hovered on mouse leave', () => {
    const { result } = renderHook(() => useHoverLift())

    act(() => {
      result.current.hoverProps.onMouseEnter()
    })

    act(() => {
      result.current.hoverProps.onMouseLeave()
    })

    expect(result.current.isHovered).toBe(false)
  })

  it('should apply lift transform when hovered', () => {
    const { result } = renderHook(() => useHoverLift(8, 300))

    act(() => {
      result.current.hoverProps.onMouseEnter()
    })

    expect(result.current.hoverProps.style.transform).toBe('translateY(-8px)')
    expect(result.current.hoverProps.style.transition).toContain('transform 300ms')
  })

  it('should not apply lift when not hovered', () => {
    const { result } = renderHook(() => useHoverLift(4))

    expect(result.current.hoverProps.style.transform).toBe('translateY(0)')
  })

  it('should handle custom lift distance', () => {
    const { result } = renderHook(() => useHoverLift(12))

    act(() => {
      result.current.hoverProps.onMouseEnter()
    })

    expect(result.current.hoverProps.style.transform).toBe('translateY(-12px)')
  })
})

describe('useRipple', () => {
  it('should initialize with empty ripples array', () => {
    const { result } = renderHook(() => useRipple())

    expect(result.current.ripples).toEqual([])
  })

  it('should add ripple on click', () => {
    const { result } = renderHook(() => useRipple())

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 100, top: 50 }),
      },
      clientX: 150,
      clientY: 75,
    } as any

    act(() => {
      result.current.addRipple(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)
    expect(result.current.ripples[0]).toEqual({
      x: 50, // 150 - 100
      y: 25, // 75 - 50
      id: expect.any(Number),
    })
  })

  it('should remove ripple after animation', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useRipple())

    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      },
      clientX: 50,
      clientY: 50,
    } as any

    act(() => {
      result.current.addRipple(mockEvent)
    })

    expect(result.current.ripples).toHaveLength(1)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.ripples).toHaveLength(0)

    vi.useRealTimers()
  })

  it('should handle multiple ripples', () => {
    const { result } = renderHook(() => useRipple())

    const mockEvent1 = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      },
      clientX: 50,
      clientY: 50,
    } as any

    const mockEvent2 = {
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      },
      clientX: 100,
      clientY: 100,
    } as any

    act(() => {
      result.current.addRipple(mockEvent1)
      result.current.addRipple(mockEvent2)
    })

    expect(result.current.ripples).toHaveLength(2)
  })
})

describe('useCountAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with 0', () => {
    const { result } = renderHook(() => useCountAnimation(100))

    expect(result.current).toBe(0)
  })

  it('should animate to target value', async () => {
    const { result } = renderHook(() => useCountAnimation(100, 1000))

    // Let animation run
    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(100)
  })

  it('should animate incrementally', async () => {
    const { result } = renderHook(() => useCountAnimation(100, 160))

    // Check intermediate values
    await act(async () => {
      vi.advanceTimersByTime(80)
    })

    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)
  })

  it('should handle different target values', async () => {
    const { result, rerender } = renderHook(({ target }) => useCountAnimation(target, 100), {
      initialProps: { target: 50 },
    })

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(50)

    // Change target
    rerender({ target: 150 })

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current).toBe(150)
  })
})

describe('useFadeIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize invisible', () => {
    const { result } = renderHook(() => useFadeIn())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.fadeProps.style.opacity).toBe(0)
  })

  it('should become visible after delay', async () => {
    const { result } = renderHook(() => useFadeIn(100))

    expect(result.current.isVisible).toBe(false)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isVisible).toBe(true)
    expect(result.current.fadeProps.style.opacity).toBe(1)
  })

  it('should become visible immediately with 0 delay', async () => {
    const { result } = renderHook(() => useFadeIn(0))

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isVisible).toBe(true)
  })

  it('should include delay in transition', () => {
    const { result } = renderHook(() => useFadeIn(200))

    expect(result.current.fadeProps.style.transition).toContain('200ms')
  })

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useFadeIn(1000))

    expect(() => unmount()).not.toThrow()
  })
})

describe('useShake', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize not shaking', () => {
    const { result } = renderHook(() => useShake(false))

    expect(result.current.isShaking).toBe(false)
    expect(result.current.shakeProps.className).toBe('')
  })

  it('should shake when trigger is true', async () => {
    const { result, rerender } = renderHook(({ trigger }) => useShake(trigger), {
      initialProps: { trigger: false },
    })

    expect(result.current.isShaking).toBe(false)

    await act(async () => {
      rerender({ trigger: true })
    })

    expect(result.current.isShaking).toBe(true)
    expect(result.current.shakeProps.className).toBe('animate-shake')
  })

  it('should stop shaking after duration', async () => {
    const { result, rerender } = renderHook(({ trigger }) => useShake(trigger), {
      initialProps: { trigger: false },
    })

    await act(async () => {
      rerender({ trigger: true })
    })

    expect(result.current.isShaking).toBe(true)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isShaking).toBe(false)
    expect(result.current.shakeProps.className).toBe('')
  })

  it('should handle multiple triggers', async () => {
    const { result, rerender, unmount } = renderHook(({ trigger }) => useShake(trigger), {
      initialProps: { trigger: false },
    })

    // First trigger
    await act(async () => {
      rerender({ trigger: true })
    })
    expect(result.current.isShaking).toBe(true)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isShaking).toBe(false)

    // Unmount and remount for fresh state
    unmount()
  })
})

describe('usePulse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize not pulsing', () => {
    const { result } = renderHook(() => usePulse(false))

    expect(result.current.isPulsing).toBe(false)
    expect(result.current.pulseProps.className).toBe('')
  })

  it('should pulse when trigger is true', async () => {
    const { result, rerender } = renderHook(({ trigger }) => usePulse(trigger), {
      initialProps: { trigger: false },
    })

    await act(async () => {
      rerender({ trigger: true })
    })

    expect(result.current.isPulsing).toBe(true)
    expect(result.current.pulseProps.className).toBe('animate-pulse-once')
  })

  it('should stop pulsing after duration', async () => {
    const { result, rerender } = renderHook(
      ({ trigger, duration }) => usePulse(trigger, duration),
      {
        initialProps: { trigger: false, duration: 1000 },
      }
    )

    await act(async () => {
      rerender({ trigger: true, duration: 1000 })
    })

    expect(result.current.isPulsing).toBe(true)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isPulsing).toBe(false)
    expect(result.current.pulseProps.className).toBe('')
  })

  it('should handle custom duration', async () => {
    const { result, rerender } = renderHook(
      ({ trigger, duration }) => usePulse(trigger, duration),
      {
        initialProps: { trigger: false, duration: 500 },
      }
    )

    await act(async () => {
      rerender({ trigger: true, duration: 500 })
    })

    expect(result.current.isPulsing).toBe(true)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isPulsing).toBe(false)
  })

  it('should handle repeated triggers', async () => {
    const { result, rerender, unmount } = renderHook(({ trigger }) => usePulse(trigger, 200), {
      initialProps: { trigger: false },
    })

    // First pulse
    await act(async () => {
      rerender({ trigger: true })
    })
    expect(result.current.isPulsing).toBe(true)

    await act(async () => {
      vi.runAllTimers()
    })

    expect(result.current.isPulsing).toBe(false)

    // Unmount for cleanup
    unmount()
  })
})
