/**
 * Mobile Detection Utils Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Mobile Detection Utils', () => {
  // Save original values
  const originalWindow = global.window
  const originalNavigator = global.navigator

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('MOBILE_BREAKPOINT', () => {
    it('should export breakpoint constant', async () => {
      const { MOBILE_BREAKPOINT } = await import('./mobile-detection')
      expect(MOBILE_BREAKPOINT).toBe(1024)
    })
  })

  describe('isMobileViewport', () => {
    it('should return false on server (no window)', async () => {
      vi.stubGlobal('window', undefined)
      // Re-import to get fresh module
      const { isMobileViewport } = await import('./mobile-detection')
      expect(isMobileViewport()).toBe(false)
    })

    it('should return true for mobile viewport', async () => {
      vi.stubGlobal('window', { innerWidth: 375 })
      const { isMobileViewport } = await import('./mobile-detection')
      expect(isMobileViewport()).toBe(true)
    })

    it('should return false for desktop viewport', async () => {
      vi.stubGlobal('window', { innerWidth: 1440 })
      const { isMobileViewport } = await import('./mobile-detection')
      expect(isMobileViewport()).toBe(false)
    })

    it('should return true at breakpoint - 1', async () => {
      vi.stubGlobal('window', { innerWidth: 1023 })
      const { isMobileViewport } = await import('./mobile-detection')
      expect(isMobileViewport()).toBe(true)
    })

    it('should return false at breakpoint', async () => {
      vi.stubGlobal('window', { innerWidth: 1024 })
      const { isMobileViewport } = await import('./mobile-detection')
      expect(isMobileViewport()).toBe(false)
    })
  })

  describe('isMobileUserAgent', () => {
    it('should return false on server (no navigator)', async () => {
      vi.stubGlobal('navigator', undefined)
      const { isMobileUserAgent } = await import('./mobile-detection')
      expect(isMobileUserAgent()).toBe(false)
    })

    it('should return true for iPhone user agent', async () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      })
      const { isMobileUserAgent } = await import('./mobile-detection')
      expect(isMobileUserAgent()).toBe(true)
    })

    it('should return true for Android user agent', async () => {
      vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 12)' })
      const { isMobileUserAgent } = await import('./mobile-detection')
      expect(isMobileUserAgent()).toBe(true)
    })

    it('should return true for iPad user agent', async () => {
      vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)' })
      const { isMobileUserAgent } = await import('./mobile-detection')
      expect(isMobileUserAgent()).toBe(true)
    })

    it('should return false for desktop user agent', async () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0',
      })
      const { isMobileUserAgent } = await import('./mobile-detection')
      expect(isMobileUserAgent()).toBe(false)
    })
  })

  describe('isIOS', () => {
    it('should return false on server', async () => {
      vi.stubGlobal('navigator', undefined)
      const { isIOS } = await import('./mobile-detection')
      expect(isIOS()).toBe(false)
    })

    it('should return true for iPhone', async () => {
      vi.stubGlobal('navigator', { userAgent: 'iPhone' })
      vi.stubGlobal('window', { MSStream: undefined })
      const { isIOS } = await import('./mobile-detection')
      expect(isIOS()).toBe(true)
    })

    it('should return true for iPad', async () => {
      vi.stubGlobal('navigator', { userAgent: 'iPad' })
      vi.stubGlobal('window', { MSStream: undefined })
      const { isIOS } = await import('./mobile-detection')
      expect(isIOS()).toBe(true)
    })

    it('should return true for iPod', async () => {
      vi.stubGlobal('navigator', { userAgent: 'iPod' })
      vi.stubGlobal('window', { MSStream: undefined })
      const { isIOS } = await import('./mobile-detection')
      expect(isIOS()).toBe(true)
    })

    it('should return false for Android', async () => {
      vi.stubGlobal('navigator', { userAgent: 'Android' })
      vi.stubGlobal('window', { MSStream: undefined })
      const { isIOS } = await import('./mobile-detection')
      expect(isIOS()).toBe(false)
    })
  })

  describe('isAndroid', () => {
    it('should return false on server', async () => {
      vi.stubGlobal('navigator', undefined)
      const { isAndroid } = await import('./mobile-detection')
      expect(isAndroid()).toBe(false)
    })

    it('should return true for Android user agent', async () => {
      vi.stubGlobal('navigator', { userAgent: 'Android device' })
      const { isAndroid } = await import('./mobile-detection')
      expect(isAndroid()).toBe(true)
    })

    it('should return false for iOS', async () => {
      vi.stubGlobal('navigator', { userAgent: 'iPhone' })
      const { isAndroid } = await import('./mobile-detection')
      expect(isAndroid()).toBe(false)
    })
  })

  describe('isStandalonePWA', () => {
    it('should return false on server', async () => {
      vi.stubGlobal('window', undefined)
      const { isStandalonePWA } = await import('./mobile-detection')
      expect(isStandalonePWA()).toBe(false)
    })

    it('should return true for iOS standalone mode', async () => {
      vi.stubGlobal('navigator', { standalone: true })
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: false }),
      })
      const { isStandalonePWA } = await import('./mobile-detection')
      expect(isStandalonePWA()).toBe(true)
    })

    it('should return true for Android standalone mode', async () => {
      vi.stubGlobal('navigator', { standalone: false })
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: true }),
      })
      const { isStandalonePWA } = await import('./mobile-detection')
      expect(isStandalonePWA()).toBe(true)
    })

    it('should return false when not in standalone mode', async () => {
      vi.stubGlobal('navigator', { standalone: false })
      vi.stubGlobal('window', {
        matchMedia: () => ({ matches: false }),
      })
      const { isStandalonePWA } = await import('./mobile-detection')
      expect(isStandalonePWA()).toBe(false)
    })
  })

  describe('getDeviceType', () => {
    it('should return desktop on server', async () => {
      vi.stubGlobal('window', undefined)
      const { getDeviceType } = await import('./mobile-detection')
      expect(getDeviceType()).toBe('desktop')
    })

    it('should return mobile for width < 768', async () => {
      vi.stubGlobal('window', { innerWidth: 375 })
      const { getDeviceType } = await import('./mobile-detection')
      expect(getDeviceType()).toBe('mobile')
    })

    it('should return tablet for width 768-1023', async () => {
      vi.stubGlobal('window', { innerWidth: 800 })
      const { getDeviceType } = await import('./mobile-detection')
      expect(getDeviceType()).toBe('tablet')
    })

    it('should return desktop for width >= 1024', async () => {
      vi.stubGlobal('window', { innerWidth: 1920 })
      const { getDeviceType } = await import('./mobile-detection')
      expect(getDeviceType()).toBe('desktop')
    })
  })

  describe('getSafeAreaInsets', () => {
    it('should return zeros on server', async () => {
      vi.stubGlobal('window', undefined)
      const { getSafeAreaInsets } = await import('./mobile-detection')
      const insets = getSafeAreaInsets()
      expect(insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    })

    it('should return parsed insets from CSS', async () => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('document', {
        documentElement: {},
      })
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: (prop: string) => {
          const values: Record<string, string> = {
            'safe-area-inset-top': '44px',
            'safe-area-inset-right': '0px',
            'safe-area-inset-bottom': '34px',
            'safe-area-inset-left': '0px',
          }
          return values[prop] || ''
        },
      })
      vi.stubGlobal('getComputedStyle', mockGetComputedStyle)

      const { getSafeAreaInsets } = await import('./mobile-detection')
      const insets = getSafeAreaInsets()
      expect(insets.top).toBe(44)
      expect(insets.bottom).toBe(34)
    })
  })

  describe('isTouchDevice', () => {
    it('should return false on server', async () => {
      vi.stubGlobal('window', undefined)
      const { isTouchDevice } = await import('./mobile-detection')
      expect(isTouchDevice()).toBe(false)
    })

    it('should return true if ontouchstart exists', async () => {
      vi.stubGlobal('window', { ontouchstart: true })
      vi.stubGlobal('navigator', { maxTouchPoints: 0 })
      const { isTouchDevice } = await import('./mobile-detection')
      expect(isTouchDevice()).toBe(true)
    })

    it('should return true if maxTouchPoints > 0', async () => {
      const mockWindow = {} as any
      delete mockWindow.ontouchstart
      vi.stubGlobal('window', mockWindow)
      vi.stubGlobal('navigator', { maxTouchPoints: 5 })
      const { isTouchDevice } = await import('./mobile-detection')
      expect(isTouchDevice()).toBe(true)
    })

    it('should return false for desktop without touch', async () => {
      const mockWindow = {} as any
      delete mockWindow.ontouchstart
      vi.stubGlobal('window', mockWindow)
      vi.stubGlobal('navigator', { maxTouchPoints: 0 })
      const { isTouchDevice } = await import('./mobile-detection')
      expect(isTouchDevice()).toBe(false)
    })
  })

  describe('supportsVibration', () => {
    it('should return false on server', async () => {
      vi.stubGlobal('navigator', undefined)
      const { supportsVibration } = await import('./mobile-detection')
      expect(supportsVibration()).toBe(false)
    })

    it('should return true if vibrate exists', async () => {
      vi.stubGlobal('navigator', { vibrate: () => true })
      const { supportsVibration } = await import('./mobile-detection')
      expect(supportsVibration()).toBe(true)
    })

    it('should return false if vibrate does not exist', async () => {
      vi.stubGlobal('navigator', { userAgent: 'test' })
      const { supportsVibration } = await import('./mobile-detection')
      expect(supportsVibration()).toBe(false)
    })
  })
})
