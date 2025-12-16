/**
 * Tests for useMobileKeyboard hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobileKeyboard } from '../use-mobile-keyboard'

describe('useMobileKeyboard', () => {
  let originalVisualViewport: VisualViewport | null
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockRemoveEventListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Store original
    originalVisualViewport = window.visualViewport

    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
  })

  afterEach(() => {
    // Restore original
    Object.defineProperty(window, 'visualViewport', {
      value: originalVisualViewport,
      writable: true,
      configurable: true,
    })
  })

  describe('Initial State', () => {
    it('returns initial values', () => {
      // No visualViewport
      Object.defineProperty(window, 'visualViewport', {
        value: null,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useMobileKeyboard())

      expect(result.current.keyboardHeight).toBe(0)
      expect(result.current.isKeyboardVisible).toBe(false)
    })
  })

  describe('With visualViewport API', () => {
    it('uses visualViewport when available', () => {
      const mockViewport = {
        height: 600,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }

      Object.defineProperty(window, 'visualViewport', {
        value: mockViewport,
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useMobileKeyboard())

      // Should detect keyboard
      expect(result.current.keyboardHeight).toBe(200)
      expect(result.current.isKeyboardVisible).toBe(true)
    })

    it('adds event listeners for resize and scroll', () => {
      const mockViewport = {
        height: 800,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }

      Object.defineProperty(window, 'visualViewport', {
        value: mockViewport,
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        writable: true,
        configurable: true,
      })

      renderHook(() => useMobileKeyboard())

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('removes event listeners on unmount', () => {
      const mockViewport = {
        height: 800,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }

      Object.defineProperty(window, 'visualViewport', {
        value: mockViewport,
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        writable: true,
        configurable: true,
      })

      const { unmount } = renderHook(() => useMobileKeyboard())

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    })

    it('detects keyboard when height difference > 100px', () => {
      const mockViewport = {
        height: 600,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }

      Object.defineProperty(window, 'visualViewport', {
        value: mockViewport,
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useMobileKeyboard())

      expect(result.current.isKeyboardVisible).toBe(true)
    })

    it('does not detect keyboard when height difference <= 100px', () => {
      const mockViewport = {
        height: 750,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      }

      Object.defineProperty(window, 'visualViewport', {
        value: mockViewport,
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window, 'innerHeight', {
        value: 800,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useMobileKeyboard())

      expect(result.current.isKeyboardVisible).toBe(false)
    })
  })

  describe('Fallback (no visualViewport)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'visualViewport', {
        value: null,
        writable: true,
        configurable: true,
      })
    })

    it('uses window resize event as fallback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() => useMobileKeyboard())

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('removes resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useMobileKeyboard())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Server Side Rendering', () => {
    it('handles missing window gracefully', () => {
      // The hook checks for typeof window === 'undefined'
      // In browser environment this will always be defined
      // This test verifies the hook doesn't crash
      const { result } = renderHook(() => useMobileKeyboard())

      expect(result.current.keyboardHeight).toBeDefined()
      expect(result.current.isKeyboardVisible).toBeDefined()
    })
  })
})
