/**
 * Tests for useHaptic hook
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useHaptic } from '../use-haptic'

describe('useHaptic', () => {
  let mockVibrate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock navigator.vibrate
    mockVibrate = vi.fn()
    Object.defineProperty(global.navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should detect vibration support correctly', () => {
      const { result } = renderHook(() => useHaptic())

      expect(result.current.canVibrate).toBe(true)
      expect(typeof result.current.vibrate).toBe('function')
      expect(typeof result.current.cancel).toBe('function')
      expect(typeof result.current.vibrateCustom).toBe('function')
    })

    it('should detect lack of vibration support', () => {
      // Remove vibrate from navigator
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      expect(result.current.canVibrate).toBe(false)
    })
  })

  describe('vibrate function', () => {
    it('should trigger light haptic feedback', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('light')
      })

      expect(mockVibrate).toHaveBeenCalledWith(10)
      expect(mockVibrate).toHaveBeenCalledTimes(1)
    })

    it('should trigger medium haptic feedback', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('medium')
      })

      expect(mockVibrate).toHaveBeenCalledWith(20)
    })

    it('should trigger heavy haptic feedback', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('heavy')
      })

      expect(mockVibrate).toHaveBeenCalledWith(30)
    })

    it('should trigger selection haptic feedback', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('selection')
      })

      expect(mockVibrate).toHaveBeenCalledWith(5)
    })

    it('should trigger success haptic feedback pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('success')
      })

      expect(mockVibrate).toHaveBeenCalledWith([10, 50, 10])
    })

    it('should trigger warning haptic feedback pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('warning')
      })

      expect(mockVibrate).toHaveBeenCalledWith([20, 100, 20])
    })

    it('should trigger error haptic feedback pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('error')
      })

      expect(mockVibrate).toHaveBeenCalledWith([30, 100, 30, 100, 30])
    })

    it('should default to light haptic when no type specified', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate()
      })

      expect(mockVibrate).toHaveBeenCalledWith(10)
    })

    it('should not vibrate when device does not support vibration', () => {
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('medium')
      })

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle vibration errors gracefully', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Vibration not supported')
      })

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('light')
      })

      expect(consoleSpy).toHaveBeenCalledWith('Haptic feedback not supported:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('cancel function', () => {
    it('should cancel ongoing vibration', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.cancel()
      })

      expect(mockVibrate).toHaveBeenCalledWith(0)
    })

    it('should not cancel when device does not support vibration', () => {
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.cancel()
      })

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle cancel errors gracefully', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Cannot cancel')
      })

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.cancel()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Cannot cancel vibration:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('vibrateCustom function', () => {
    it('should trigger custom vibration pattern', () => {
      const { result } = renderHook(() => useHaptic())
      const customPattern = [50, 100, 50]

      act(() => {
        result.current.vibrateCustom(customPattern)
      })

      expect(mockVibrate).toHaveBeenCalledWith(customPattern)
    })

    it('should handle complex custom patterns', () => {
      const { result } = renderHook(() => useHaptic())
      const complexPattern = [100, 50, 100, 50, 200, 100, 50]

      act(() => {
        result.current.vibrateCustom(complexPattern)
      })

      expect(mockVibrate).toHaveBeenCalledWith(complexPattern)
    })

    it('should not vibrate custom pattern when device does not support vibration', () => {
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrateCustom([50, 100, 50])
      })

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle custom vibration errors gracefully', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Custom vibration failed')
      })

      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrateCustom([50, 100, 50])
      })

      expect(consoleSpy).toHaveBeenCalledWith('Custom vibration failed:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('should handle rapid consecutive vibrations', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('light')
        result.current.vibrate('medium')
        result.current.vibrate('heavy')
      })

      expect(mockVibrate).toHaveBeenCalledTimes(3)
      expect(mockVibrate).toHaveBeenNthCalledWith(1, 10)
      expect(mockVibrate).toHaveBeenNthCalledWith(2, 20)
      expect(mockVibrate).toHaveBeenNthCalledWith(3, 30)
    })

    it('should maintain canVibrate state correctly', () => {
      const { result, rerender } = renderHook(() => useHaptic())

      expect(result.current.canVibrate).toBe(true)

      // Rerender should maintain state
      rerender()

      expect(result.current.canVibrate).toBe(true)
    })

    it('should handle empty vibration pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrateCustom([])
      })

      expect(mockVibrate).toHaveBeenCalledWith([])
    })

    it('should handle single element custom pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrateCustom([100])
      })

      expect(mockVibrate).toHaveBeenCalledWith([100])
    })
  })

  describe('callback stability', () => {
    it('should maintain stable vibrate reference', () => {
      const { result, rerender } = renderHook(() => useHaptic())

      const firstVibrate = result.current.vibrate

      rerender()

      expect(result.current.vibrate).toBe(firstVibrate)
    })

    it('should maintain stable cancel reference', () => {
      const { result, rerender } = renderHook(() => useHaptic())

      const firstCancel = result.current.cancel

      rerender()

      expect(result.current.cancel).toBe(firstCancel)
    })

    it('should maintain stable vibrateCustom reference', () => {
      const { result, rerender } = renderHook(() => useHaptic())

      const firstVibrateCustom = result.current.vibrateCustom

      rerender()

      expect(result.current.vibrateCustom).toBe(firstVibrateCustom)
    })
  })
})
