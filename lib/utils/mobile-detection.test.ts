/**
 * Tests for Mobile Detection Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  MOBILE_BREAKPOINT,
  isMobileViewport,
  isMobileUserAgent,
  isIOS,
  isAndroid,
  isStandalonePWA,
  getDeviceType,
  useMobileDetection,
  useDeviceType,
  usePlatform,
  getSafeAreaInsets,
  isTouchDevice,
  supportsVibration,
} from './mobile-detection'

// Helper to restore globals after tests
const saveGlobals = () => ({
  window: global.window,
  navigator: global.navigator,
  document: global.document,
})

describe('MOBILE_BREAKPOINT', () => {
  it('should be set to 1024px', () => {
    expect(MOBILE_BREAKPOINT).toBe(1024)
  })
})

describe('isMobileViewport', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { innerWidth: 1920 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return false for window undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(isMobileViewport()).toBe(false)
  })

  it('should return true for mobile width (375px)', () => {
    vi.stubGlobal('window', { innerWidth: 375 })
    expect(isMobileViewport()).toBe(true)
  })

  it('should return true for small mobile width (320px)', () => {
    vi.stubGlobal('window', { innerWidth: 320 })
    expect(isMobileViewport()).toBe(true)
  })

  it('should return true for tablet width (768px)', () => {
    vi.stubGlobal('window', { innerWidth: 768 })
    expect(isMobileViewport()).toBe(true)
  })

  it('should return true for width exactly at breakpoint minus 1 (1023px)', () => {
    vi.stubGlobal('window', { innerWidth: 1023 })
    expect(isMobileViewport()).toBe(true)
  })

  it('should return false for width at breakpoint (1024px)', () => {
    vi.stubGlobal('window', { innerWidth: 1024 })
    expect(isMobileViewport()).toBe(false)
  })

  it('should return false for desktop width (1920px)', () => {
    vi.stubGlobal('window', { innerWidth: 1920 })
    expect(isMobileViewport()).toBe(false)
  })

  it('should return false for large desktop width (2560px)', () => {
    vi.stubGlobal('window', { innerWidth: 2560 })
    expect(isMobileViewport()).toBe(false)
  })
})

describe('isMobileUserAgent', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: '' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('should return false for navigator undefined (SSR)', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(isMobileUserAgent()).toBe(false)
  })

  it('should detect Android user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect Android 11', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect iPhone user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect iPad user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect iPod user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0 like Mac OS X)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect webOS user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (webOS/1.4.0; U; en-US)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect BlackBerry user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect IEMobile user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; IEMobile/10.0)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect Opera Mini user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect generic Mobile user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Mobile; rv:26.0) Gecko/26.0 Firefox/26.0',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect lowercase mobile user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (mobile; rv:26.0)',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should detect Chrome iOS (CriOS) user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) CriOS/91.0',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(true)
  })

  it('should return false for desktop Chrome user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(false)
  })

  it('should return false for desktop Firefox user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(false)
  })

  it('should return false for desktop Safari user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(false)
  })

  it('should return false for Linux desktop user agent', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      writable: true,
    })
    expect(isMobileUserAgent()).toBe(false)
  })
})

describe('isIOS', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: '' },
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
    vi.unstubAllGlobals()
  })

  it('should return false for navigator undefined (SSR)', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(isIOS()).toBe(false)
  })

  it('should detect iPhone', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      writable: true,
    })
    expect(isIOS()).toBe(true)
  })

  it('should detect iPhone with newer iOS version', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      writable: true,
    })
    expect(isIOS()).toBe(true)
  })

  it('should detect iPad', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)',
      writable: true,
    })
    expect(isIOS()).toBe(true)
  })

  it('should detect iPod', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0 like Mac OS X)',
      writable: true,
    })
    expect(isIOS()).toBe(true)
  })

  it('should return false for Android', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10)',
      writable: true,
    })
    expect(isIOS()).toBe(false)
  })

  it('should return false for Windows', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
    })
    expect(isIOS()).toBe(false)
  })

  it('should return false for macOS', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      writable: true,
    })
    expect(isIOS()).toBe(false)
  })

  it('should exclude MSStream (IE on Windows)', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)',
      writable: true,
    })
    ;(window as any).MSStream = {}
    expect(isIOS()).toBe(false)
  })
})

describe('isAndroid', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: '' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('should return false for navigator undefined (SSR)', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(isAndroid()).toBe(false)
  })

  it('should detect Android', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
      writable: true,
    })
    expect(isAndroid()).toBe(true)
  })

  it('should detect Android with Chrome', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/91.0',
      writable: true,
    })
    expect(isAndroid()).toBe(true)
  })

  it('should detect Android 12', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 12)',
      writable: true,
    })
    expect(isAndroid()).toBe(true)
  })

  it('should return false for iOS', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      writable: true,
    })
    expect(isAndroid()).toBe(false)
  })

  it('should return false for Windows', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
    })
    expect(isAndroid()).toBe(false)
  })
})

describe('isStandalonePWA', () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
    vi.unstubAllGlobals()
  })

  it('should return false for window undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(isStandalonePWA()).toBe(false)
  })

  it('should detect iOS standalone PWA', () => {
    ;(navigator as any).standalone = true
    expect(isStandalonePWA()).toBe(true)
  })

  it('should detect Android standalone PWA via matchMedia', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    expect(isStandalonePWA()).toBe(true)
  })

  it('should return false when not in standalone mode', () => {
    ;(navigator as any).standalone = false
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    })
    expect(isStandalonePWA()).toBe(false)
  })

  it('should return false for regular browser', () => {
    expect(isStandalonePWA()).toBe(false)
  })

  it('should prioritize iOS standalone over Android', () => {
    ;(navigator as any).standalone = true
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })
    expect(isStandalonePWA()).toBe(true)
  })
})

describe('getDeviceType', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { innerWidth: 1920 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return desktop for window undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(getDeviceType()).toBe('desktop')
  })

  it('should return mobile for width 320px', () => {
    vi.stubGlobal('window', { innerWidth: 320 })
    expect(getDeviceType()).toBe('mobile')
  })

  it('should return mobile for width 375px', () => {
    vi.stubGlobal('window', { innerWidth: 375 })
    expect(getDeviceType()).toBe('mobile')
  })

  it('should return mobile for width < 768px', () => {
    vi.stubGlobal('window', { innerWidth: 600 })
    expect(getDeviceType()).toBe('mobile')
  })

  it('should return mobile for width at 767px', () => {
    vi.stubGlobal('window', { innerWidth: 767 })
    expect(getDeviceType()).toBe('mobile')
  })

  it('should return tablet for width at 768px', () => {
    vi.stubGlobal('window', { innerWidth: 768 })
    expect(getDeviceType()).toBe('tablet')
  })

  it('should return tablet for width between 768px and 1023px', () => {
    vi.stubGlobal('window', { innerWidth: 900 })
    expect(getDeviceType()).toBe('tablet')
  })

  it('should return tablet for width at 1023px', () => {
    vi.stubGlobal('window', { innerWidth: 1023 })
    expect(getDeviceType()).toBe('tablet')
  })

  it('should return desktop for width at 1024px', () => {
    vi.stubGlobal('window', { innerWidth: 1024 })
    expect(getDeviceType()).toBe('desktop')
  })

  it('should return desktop for width > 1024px', () => {
    vi.stubGlobal('window', { innerWidth: 1920 })
    expect(getDeviceType()).toBe('desktop')
  })

  it('should return desktop for large screens (2560px)', () => {
    vi.stubGlobal('window', { innerWidth: 2560 })
    expect(getDeviceType()).toBe('desktop')
  })
})

describe('useMobileDetection', () => {
  it('should return false for desktop viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(false)
  })

  it('should return true for mobile viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(true)
  })

  it('should return true for tablet viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(true)
  })

  it('should add resize listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    renderHook(() => useMobileDetection())

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    addEventListenerSpy.mockRestore()
  })

  it('should remove resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    const { unmount } = renderHook(() => useMobileDetection())
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})

describe('useDeviceType', () => {
  it('should return desktop for desktop viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('desktop')
  })

  it('should return mobile for mobile viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('mobile')
  })

  it('should return tablet for tablet viewport initially', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('tablet')
  })

  it('should add resize listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    renderHook(() => useDeviceType())

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    addEventListenerSpy.mockRestore()
  })

  it('should remove resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    })

    const { unmount } = renderHook(() => useDeviceType())
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})

describe('usePlatform', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('should detect iOS platform', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)' },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())

    await waitFor(() => {
      expect(result.current).toBe('ios')
    })
  })

  it('should detect Android platform', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Linux; Android 10)' },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())

    await waitFor(() => {
      expect(result.current).toBe('android')
    })
  })

  it('should return other for non-mobile platforms', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())

    await waitFor(() => {
      expect(result.current).toBe('other')
    })
  })

  it('should return other for macOS', async () => {
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())

    await waitFor(() => {
      expect(result.current).toBe('other')
    })
  })
})

describe('getSafeAreaInsets', () => {
  const originalGetComputedStyle = window.getComputedStyle

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle
  })

  it('should return zeros for window undefined (SSR)', () => {
    const savedWindow = global.window
    // @ts-ignore - Testing SSR
    delete global.window

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })

    global.window = savedWindow
  })

  it('should return zeros when no safe area insets', () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(''),
    }) as any

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })

  it('should parse safe area insets from CSS variables', () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn((variable: string) => {
        const values: Record<string, string> = {
          'safe-area-inset-top': '44',
          'safe-area-inset-right': '0',
          'safe-area-inset-bottom': '34',
          'safe-area-inset-left': '0',
        }
        return values[variable] || ''
      }),
    }) as any

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 44,
      right: 0,
      bottom: 34,
      left: 0,
    })
  })

  it('should parse safe area insets with px suffix', () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn((variable: string) => {
        const values: Record<string, string> = {
          'safe-area-inset-top': '44px',
          'safe-area-inset-right': '20px',
          'safe-area-inset-bottom': '34px',
          'safe-area-inset-left': '20px',
        }
        return values[variable] || ''
      }),
    }) as any

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 44,
      right: 20,
      bottom: 34,
      left: 20,
    })
  })

  it('should handle invalid CSS variable values', () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('invalid'),
    }) as any

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })

  it('should handle empty string values', () => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(''),
    }) as any

    const insets = getSafeAreaInsets()

    expect(insets).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })
})

describe('isTouchDevice', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('should return false for window undefined (SSR)', () => {
    const savedWindow = global.window
    // @ts-ignore - Testing SSR
    delete global.window

    expect(isTouchDevice()).toBe(false)

    global.window = savedWindow
  })

  it('should detect touch via ontouchstart', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: null,
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(true)

    // @ts-ignore - Cleanup
    delete window.ontouchstart
  })

  it('should detect touch via maxTouchPoints', () => {
    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 5 },
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(true)
  })

  it('should detect touch via maxTouchPoints = 1', () => {
    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 1 },
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(true)
  })

  it('should detect touch via msMaxTouchPoints', () => {
    Object.defineProperty(global, 'navigator', {
      value: { msMaxTouchPoints: 10, maxTouchPoints: 0 },
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(true)
  })

  it('should detect touch via msMaxTouchPoints = 1', () => {
    Object.defineProperty(global, 'navigator', {
      value: { msMaxTouchPoints: 1, maxTouchPoints: 0 },
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(true)
  })

  it('should return false for non-touch device', () => {
    Object.defineProperty(global, 'navigator', {
      value: { maxTouchPoints: 0 },
      writable: true,
      configurable: true,
    })

    expect(isTouchDevice()).toBe(false)
  })
})

describe('supportsVibration', () => {
  const originalNavigator = global.navigator

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  it('should return false for navigator undefined (SSR)', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    expect(supportsVibration()).toBe(false)
  })

  it('should detect vibration support', () => {
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vi.fn() },
      writable: true,
      configurable: true,
    })

    expect(supportsVibration()).toBe(true)
  })

  it('should return true when vibrate is a function', () => {
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: () => true },
      writable: true,
      configurable: true,
    })

    expect(supportsVibration()).toBe(true)
  })

  it('should return false when vibration not supported', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    })

    expect(supportsVibration()).toBe(false)
  })
})
