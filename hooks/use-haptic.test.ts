/**
 * Tests for Haptic Feedback Hook
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHaptic, type HapticFeedbackType } from './use-haptic'

describe('useHaptic', () => {
  const mockVibrate = vi.fn()
  const originalNavigator = global.navigator

  beforeEach(() => {
    // Mock navigator.vibrate
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        vibrate: mockVibrate,
      },
      writable: true,
      configurable: true,
    })
    mockVibrate.mockClear()
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  describe('canVibrate', () => {
    it('should return true when vibrate is available', () => {
      const { result } = renderHook(() => useHaptic())
      expect(result.current.canVibrate).toBe(true)
    })

    it('should return false when vibrate is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...originalNavigator, vibrate: undefined },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())
      expect(result.current.canVibrate).toBe(false)
    })
  })

  describe('vibrate', () => {
    it('should call navigator.vibrate with light pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('light')
      })

      expect(mockVibrate).toHaveBeenCalledWith(10)
    })

    it('should call navigator.vibrate with medium pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('medium')
      })

      expect(mockVibrate).toHaveBeenCalledWith(20)
    })

    it('should call navigator.vibrate with heavy pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('heavy')
      })

      expect(mockVibrate).toHaveBeenCalledWith(30)
    })

    it('should call navigator.vibrate with selection pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('selection')
      })

      expect(mockVibrate).toHaveBeenCalledWith(5)
    })

    it('should call navigator.vibrate with success pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('success')
      })

      expect(mockVibrate).toHaveBeenCalledWith([10, 50, 10])
    })

    it('should call navigator.vibrate with warning pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('warning')
      })

      expect(mockVibrate).toHaveBeenCalledWith([20, 100, 20])
    })

    it('should call navigator.vibrate with error pattern', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('error')
      })

      expect(mockVibrate).toHaveBeenCalledWith([30, 100, 30, 100, 30])
    })

    it('should default to light pattern when no type provided', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate()
      })

      expect(mockVibrate).toHaveBeenCalledWith(10)
    })

    it('should not call vibrate when not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...originalNavigator, vibrate: undefined },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrate('light')
      })

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle vibrate errors gracefully', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Vibration failed')
      })

      const { result } = renderHook(() => useHaptic())

      // Should not throw
      expect(() => {
        act(() => {
          result.current.vibrate('light')
        })
      }).not.toThrow()
    })
  })

  describe('cancel', () => {
    it('should call navigator.vibrate with 0 to cancel', () => {
      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.cancel()
      })

      expect(mockVibrate).toHaveBeenCalledWith(0)
    })

    it('should not call cancel when not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...originalNavigator, vibrate: undefined },
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
        throw new Error('Cancel failed')
      })

      const { result } = renderHook(() => useHaptic())

      expect(() => {
        act(() => {
          result.current.cancel()
        })
      }).not.toThrow()
    })
  })

  describe('vibrateCustom', () => {
    it('should call navigator.vibrate with custom pattern', () => {
      const { result } = renderHook(() => useHaptic())
      const customPattern = [50, 100, 50, 100, 50]

      act(() => {
        result.current.vibrateCustom(customPattern)
      })

      expect(mockVibrate).toHaveBeenCalledWith(customPattern)
    })

    it('should not call vibrateCustom when not supported', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...originalNavigator, vibrate: undefined },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useHaptic())

      act(() => {
        result.current.vibrateCustom([100, 100])
      })

      expect(mockVibrate).not.toHaveBeenCalled()
    })

    it('should handle vibrateCustom errors gracefully', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Custom vibration failed')
      })

      const { result } = renderHook(() => useHaptic())

      expect(() => {
        act(() => {
          result.current.vibrateCustom([100])
        })
      }).not.toThrow()
    })
  })

  describe('HapticFeedbackType', () => {
    it('should support all feedback types', () => {
      const types: HapticFeedbackType[] = [
        'light',
        'medium',
        'heavy',
        'selection',
        'success',
        'warning',
        'error',
      ]

      const { result } = renderHook(() => useHaptic())

      types.forEach((type) => {
        act(() => {
          result.current.vibrate(type)
        })
        expect(mockVibrate).toHaveBeenCalled()
        mockVibrate.mockClear()
      })
    })
  })
})
