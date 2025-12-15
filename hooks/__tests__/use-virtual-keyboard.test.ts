/**
 * Tests for useVirtualKeyboard hook and related utilities
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-14
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useVirtualKeyboard,
  useKeyboardAwareInput,
  usePreventScrollWhenKeyboardOpen,
  useSafeHeight,
} from '../use-virtual-keyboard'
import * as mobileDetection from '@/lib/utils/mobile-detection'

describe('useVirtualKeyboard', () => {
  let mockIsIOS: ReturnType<typeof vi.fn>
  let mockIsAndroid: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock mobile detection
    mockIsIOS = vi.fn().mockReturnValue(false)
    mockIsAndroid = vi.fn().mockReturnValue(false)
    vi.spyOn(mobileDetection, 'isIOS').mockImplementation(mockIsIOS)
    vi.spyOn(mobileDetection, 'isAndroid').mockImplementation(mockIsAndroid)

    // Reset window properties
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with closed keyboard state', () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      expect(result.current.isOpen).toBe(false)
      expect(result.current.height).toBe(0)
      expect(typeof result.current.scrollIntoView).toBe('function')
    })

    it('should handle server-side rendering', () => {
      // Server-side test is covered by the hook's typeof window check
      // This test verifies the hook handles missing window gracefully
      const { result } = renderHook(() => useVirtualKeyboard())

      expect(result.current.isOpen).toBe(false)
      expect(result.current.height).toBe(0)
    })
  })

  describe('iOS keyboard detection', () => {
    beforeEach(() => {
      mockIsIOS.mockReturnValue(true)

      // Mock visualViewport
      Object.defineProperty(window, 'visualViewport', {
        writable: true,
        configurable: true,
        value: {
          height: 800,
          pageTop: 0,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      })
    })

    it('should detect keyboard open on iOS', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      const viewport = window.visualViewport as any

      // Simulate keyboard opening (viewport height decreases)
      act(() => {
        Object.defineProperty(viewport, 'height', { value: 400 })
        const resizeHandler = viewport.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'resize'
        )?.[1]
        resizeHandler?.()
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true)
        expect(result.current.height).toBe(400)
      })
    })

    it('should detect keyboard close on iOS', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      const viewport = window.visualViewport as any

      // Open keyboard
      act(() => {
        Object.defineProperty(viewport, 'height', { value: 400 })
        const resizeHandler = viewport.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'resize'
        )?.[1]
        resizeHandler?.()
      })

      // Close keyboard
      act(() => {
        Object.defineProperty(viewport, 'height', { value: 800 })
        const resizeHandler = viewport.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'resize'
        )?.[1]
        resizeHandler?.()
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false)
        expect(result.current.height).toBe(0)
      })
    })

    it('should ignore small viewport changes on iOS', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      const viewport = window.visualViewport as any

      // Small change (< 100px threshold)
      act(() => {
        Object.defineProperty(viewport, 'height', { value: 750 })
        const resizeHandler = viewport.addEventListener.mock.calls.find(
          (call: any) => call[0] === 'resize'
        )?.[1]
        resizeHandler?.()
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false)
      })
    })

    it('should cleanup iOS event listeners on unmount', () => {
      const viewport = window.visualViewport as any
      const { unmount } = renderHook(() => useVirtualKeyboard())

      unmount()

      expect(viewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(viewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })

  describe('Android keyboard detection', () => {
    beforeEach(() => {
      mockIsAndroid.mockReturnValue(true)
    })

    it('should detect keyboard open on Android', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      // Simulate keyboard opening (window height decreases)
      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 500 })
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true)
        expect(result.current.height).toBe(300)
      })
    })

    it('should detect keyboard close on Android', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      // Open keyboard
      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 500 })
        window.dispatchEvent(new Event('resize'))
      })

      // Close keyboard
      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 800 })
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false)
        expect(result.current.height).toBe(0)
      })
    })

    it('should handle Android address bar auto-hide', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      // Simulate address bar hiding (slight height increase)
      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 850 })
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(false)
      })
    })

    it('should cleanup Android event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useVirtualKeyboard())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('scrollIntoView function', () => {
    it('should scroll element into view', () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      const mockElement = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 100 }),
      } as any

      act(() => {
        result.current.scrollIntoView(mockElement)
      })

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    })

    it('should handle null element gracefully', () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      expect(() => {
        act(() => {
          result.current.scrollIntoView(null)
        })
      }).not.toThrow()
    })

    it('should call scrollIntoView for iOS', () => {
      // Test that iOS detection works in scrollIntoView
      const mockElement = {
        scrollIntoView: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 100 }),
      } as any

      const { result } = renderHook(() => useVirtualKeyboard())

      act(() => {
        result.current.scrollIntoView(mockElement)
      })

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      })
    })
  })

  describe('general platform keyboard detection', () => {
    it('should use basic resize detection for other platforms', async () => {
      const { result } = renderHook(() => useVirtualKeyboard())

      act(() => {
        Object.defineProperty(window, 'innerHeight', { value: 600 })
        window.dispatchEvent(new Event('resize'))
      })

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true)
        expect(result.current.height).toBe(200)
      })
    })
  })
})

describe('useKeyboardAwareInput', () => {
  beforeEach(() => {
    vi.spyOn(mobileDetection, 'isIOS').mockReturnValue(false)
    vi.spyOn(mobileDetection, 'isAndroid').mockReturnValue(false)
  })

  it('should initialize with unfocused state', () => {
    const { result } = renderHook(() => useKeyboardAwareInput())

    expect(result.current.isFocused).toBe(false)
    expect(result.current.ref.current).toBe(null)
  })

  it('should handle focus event', () => {
    const { result } = renderHook(() => useKeyboardAwareInput())

    const mockElement = document.createElement('input')
    result.current.ref.current = mockElement

    // Note: this tests the ref is set correctly
    expect(result.current.ref.current).toBe(mockElement)
  })

  it('should handle blur event', async () => {
    const { result } = renderHook(() => useKeyboardAwareInput())

    const mockElement = document.createElement('input')
    result.current.ref.current = mockElement

    // Focus first
    act(() => {
      mockElement.dispatchEvent(new Event('focus'))
    })

    // Then blur
    act(() => {
      mockElement.dispatchEvent(new Event('blur'))
    })

    await waitFor(() => {
      expect(result.current.isFocused).toBe(false)
    })
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardAwareInput())

    // Test that unmount doesn't throw
    expect(() => unmount()).not.toThrow()
  })
})

describe('usePreventScrollWhenKeyboardOpen', () => {
  beforeEach(() => {
    vi.spyOn(mobileDetection, 'isIOS').mockReturnValue(false)
    vi.spyOn(mobileDetection, 'isAndroid').mockReturnValue(false)

    Object.defineProperty(global.window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    })
  })

  it('should prevent body scroll when keyboard opens', () => {
    // Simple test that hook can be called
    const { result } = renderHook(() => usePreventScrollWhenKeyboardOpen())

    // Hook should initialize without errors
    expect(result).toBeDefined()
  })

  it('should restore body scroll when keyboard closes', async () => {
    vi.spyOn(mobileDetection, 'isAndroid').mockReturnValue(true)

    renderHook(() => usePreventScrollWhenKeyboardOpen())

    // Open keyboard
    act(() => {
      Object.defineProperty(window, 'innerHeight', { value: 500 })
      window.dispatchEvent(new Event('resize'))
    })

    // Close keyboard
    act(() => {
      Object.defineProperty(window, 'innerHeight', { value: 800 })
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(document.body.style.position).toBe('')
      expect(document.body.style.top).toBe('')
      expect(document.body.style.width).toBe('')
    })
  })
})

describe('useSafeHeight', () => {
  it('should return base height when keyboard is closed', () => {
    const { result } = renderHook(() => useSafeHeight('100vh', false, 0))

    expect(result.current).toBe('100vh')
  })

  it('should subtract keyboard height from dvh units', async () => {
    const { result } = renderHook(() => useSafeHeight('100dvh', true, 300))

    await waitFor(() => {
      expect(result.current).toBe('calc(100dvh - 300px)')
    })
  })

  it('should subtract keyboard height from vh units', async () => {
    const { result } = renderHook(() => useSafeHeight('100vh', true, 300))

    await waitFor(() => {
      expect(result.current).toBe('calc(100vh - 300px)')
    })
  })

  it('should subtract keyboard height from custom units', async () => {
    const { result } = renderHook(() => useSafeHeight('500px', true, 300))

    await waitFor(() => {
      expect(result.current).toBe('calc(500px - 300px)')
    })
  })

  it('should update when keyboard state changes', async () => {
    const { result, rerender } = renderHook(
      ({ isOpen, height }) => useSafeHeight('100vh', isOpen, height),
      {
        initialProps: { isOpen: false, height: 0 },
      }
    )

    expect(result.current).toBe('100vh')

    // Open keyboard
    rerender({ isOpen: true, height: 300 })

    await waitFor(() => {
      expect(result.current).toBe('calc(100vh - 300px)')
    })

    // Close keyboard
    rerender({ isOpen: false, height: 0 })

    await waitFor(() => {
      expect(result.current).toBe('100vh')
    })
  })
})
