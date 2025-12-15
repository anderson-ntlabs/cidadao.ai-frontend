/**
 * Browser Detection Tests
 *
 * Tests for browser compatibility detection utilities
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isSpeechRecognitionSupported,
  getSpeechRecognition,
  getBrowserName,
  getBrowserVersion,
  isMobileBrowser,
  getBrowserInfo,
  getUnsupportedBrowserMessage,
  logBrowserCompatibility,
  checkMicrophonePermission,
  requestMicrophonePermission,
  isIOSSafari,
  isAndroidChrome,
} from '@/lib/speech/browser-detection'

describe('Browser Detection', () => {
  // Save original values
  const originalWindow = global.window
  const originalNavigator = global.navigator

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('isSpeechRecognitionSupported', () => {
    it('should return false on server-side', () => {
      // @ts-ignore
      delete global.window
      expect(isSpeechRecognitionSupported()).toBe(false)
      global.window = originalWindow
    })

    it('should return true when SpeechRecognition is available', () => {
      // @ts-ignore
      global.window.SpeechRecognition = vi.fn()
      expect(isSpeechRecognitionSupported()).toBe(true)
    })

    it('should return true when webkitSpeechRecognition is available', () => {
      // @ts-ignore
      delete global.window.SpeechRecognition
      // @ts-ignore
      global.window.webkitSpeechRecognition = vi.fn()
      expect(isSpeechRecognitionSupported()).toBe(true)
    })

    it('should return false when neither API is available', () => {
      // @ts-ignore
      delete global.window.SpeechRecognition
      // @ts-ignore
      delete global.window.webkitSpeechRecognition
      expect(isSpeechRecognitionSupported()).toBe(false)
    })

    it('should return true for iOS Safari with working SpeechRecognition', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })

      const mockInstance = { abort: vi.fn() }
      const mockSpeechRecognition = vi.fn().mockReturnValue(mockInstance)
      // @ts-ignore
      global.window.webkitSpeechRecognition = mockSpeechRecognition

      expect(isSpeechRecognitionSupported()).toBe(true)
      expect(mockInstance.abort).toHaveBeenCalled()
    })

    it('should return false for iOS Safari when instantiation fails', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })

      const mockSpeechRecognition = vi.fn().mockImplementation(() => {
        throw new Error('Not available')
      })
      // @ts-ignore
      global.window.webkitSpeechRecognition = mockSpeechRecognition

      expect(isSpeechRecognitionSupported()).toBe(false)
    })
  })

  describe('getSpeechRecognition', () => {
    it('should return null on server-side', () => {
      // @ts-ignore
      delete global.window
      expect(getSpeechRecognition()).toBeNull()
      global.window = originalWindow
    })

    it('should return SpeechRecognition when available', () => {
      const mockSpeechRecognition = vi.fn()
      // @ts-ignore
      global.window.SpeechRecognition = mockSpeechRecognition
      expect(getSpeechRecognition()).toBe(mockSpeechRecognition)
    })

    it('should return webkitSpeechRecognition when available', () => {
      const mockWebkitSpeechRecognition = vi.fn()
      // @ts-ignore
      delete global.window.SpeechRecognition
      // @ts-ignore
      global.window.webkitSpeechRecognition = mockWebkitSpeechRecognition
      expect(getSpeechRecognition()).toBe(mockWebkitSpeechRecognition)
    })
  })

  describe('getBrowserName', () => {
    it('should detect Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      })
      expect(getBrowserName()).toBe('Chrome')
    })

    it('should detect Edge', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        configurable: true,
      })
      expect(getBrowserName()).toBe('Edge')
    })

    it('should detect Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        configurable: true,
      })
      expect(getBrowserName()).toBe('Firefox')
    })

    it('should detect Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        configurable: true,
      })
      expect(getBrowserName()).toBe('Safari')
    })

    it('should return Unknown for unrecognized browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Some unknown browser',
        configurable: true,
      })
      expect(getBrowserName()).toBe('Unknown')
    })
  })

  describe('getBrowserVersion', () => {
    it('should get Chrome version', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      })
      expect(getBrowserVersion()).toBe('120.0')
    })

    it('should get Edge version', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Edg/119.0.0.0',
        configurable: true,
      })
      expect(getBrowserVersion()).toBe('119.0')
    })

    it('should return Unknown when version cannot be determined', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Some browser without version',
        configurable: true,
      })
      expect(getBrowserVersion()).toBe('Unknown')
    })
  })

  describe('isMobileBrowser', () => {
    it('should detect Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
        configurable: true,
      })
      expect(isMobileBrowser()).toBe(true)
    })

    it('should detect iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        configurable: true,
      })
      expect(isMobileBrowser()).toBe(true)
    })

    it('should detect iPad', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        configurable: true,
      })
      expect(isMobileBrowser()).toBe(true)
    })

    it('should return false for desktop browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        configurable: true,
      })
      expect(isMobileBrowser()).toBe(false)
    })
  })

  describe('getBrowserInfo', () => {
    it('should return complete browser information', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      })
      // @ts-ignore
      global.window.webkitSpeechRecognition = vi.fn()

      const info = getBrowserInfo()
      expect(info).toMatchObject({
        name: 'Chrome',
        version: '120.0',
        isMobile: false,
        supportsSpeechRecognition: true,
        userAgent: expect.stringContaining('Chrome'),
      })
    })
  })

  describe('getUnsupportedBrowserMessage', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Firefox/120.0',
        configurable: true,
      })
    })

    it('should return Portuguese message by default', () => {
      const message = getUnsupportedBrowserMessage()
      expect(message).toContain('🎤 Entrada de voz não disponível')
      expect(message).toContain('Firefox')
      expect(message).toContain('Google Chrome')
      expect(message).toContain('Microsoft Edge')
    })

    it('should return Portuguese message when specified', () => {
      const message = getUnsupportedBrowserMessage('pt')
      expect(message).toContain('🎤 Entrada de voz não disponível')
      expect(message).toContain('Firefox')
      expect(message).toContain('Google Chrome')
      expect(message).toContain('Safari')
    })

    it('should return English message when specified', () => {
      const message = getUnsupportedBrowserMessage('en')
      expect(message).toContain('🎤 Voice input not available')
      expect(message).toContain('Firefox')
      expect(message).toContain('Google Chrome')
      expect(message).toContain('Safari')
    })

    it('should return mobile-specific Portuguese message on mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13) Firefox/120.0',
        configurable: true,
      })
      const message = getUnsupportedBrowserMessage('pt')
      expect(message).toContain('Chrome (Android)')
      expect(message).toContain('Safari (iOS 14.5+)')
    })

    it('should return mobile-specific English message on mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Firefox/120.0',
        configurable: true,
      })
      const message = getUnsupportedBrowserMessage('en')
      expect(message).toContain('Chrome (Android)')
      expect(message).toContain('Safari (iOS 14.5+)')
    })
  })

  describe('isIOSSafari', () => {
    it('should return false on server-side', () => {
      // @ts-ignore
      delete global.window
      expect(isIOSSafari()).toBe(false)
      global.window = originalWindow
    })

    it('should detect iPhone Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })
      expect(isIOSSafari()).toBe(true)
    })

    it('should detect iPad Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })
      expect(isIOSSafari()).toBe(true)
    })

    it('should detect iPadOS Safari (MacIntel)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      })
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      })
      expect(isIOSSafari()).toBe(true)
    })

    it('should return false for iOS Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/537.36 CriOS/120.0.0.0',
        configurable: true,
      })
      expect(isIOSSafari()).toBe(false)
    })

    it('should return false for desktop Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        configurable: true,
      })
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      })
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      })
      expect(isIOSSafari()).toBe(false)
    })
  })

  describe('isAndroidChrome', () => {
    it('should return false on server-side', () => {
      // @ts-ignore
      delete global.window
      expect(isAndroidChrome()).toBe(false)
      global.window = originalWindow
    })

    it('should detect Android Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        configurable: true,
      })
      expect(isAndroidChrome()).toBe(true)
    })

    it('should return false for Android Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
        configurable: true,
      })
      expect(isAndroidChrome()).toBe(false)
    })

    it('should return false for desktop Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      })
      expect(isAndroidChrome()).toBe(false)
    })
  })

  describe('logBrowserCompatibility', () => {
    it('should not throw on server-side', () => {
      // @ts-ignore
      delete global.window
      expect(() => logBrowserCompatibility()).not.toThrow()
      global.window = originalWindow
    })

    it('should log compatibility info when speech recognition is supported', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      })
      // @ts-ignore
      global.window.webkitSpeechRecognition = vi.fn()

      expect(() => logBrowserCompatibility()).not.toThrow()
    })

    it('should log recommendation when speech recognition is not supported', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 Firefox/120.0',
        configurable: true,
      })
      // @ts-ignore
      delete global.window.SpeechRecognition
      // @ts-ignore
      delete global.window.webkitSpeechRecognition

      expect(() => logBrowserCompatibility()).not.toThrow()
    })

    it('should log mobile recommendation on unsupported mobile browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 13) Firefox/120.0',
        configurable: true,
      })
      // @ts-ignore
      delete global.window.SpeechRecognition
      // @ts-ignore
      delete global.window.webkitSpeechRecognition

      expect(() => logBrowserCompatibility()).not.toThrow()
    })
  })

  describe('checkMicrophonePermission', () => {
    it('should return unsupported on server-side', async () => {
      // @ts-ignore
      delete global.window
      const result = await checkMicrophonePermission()
      expect(result).toBe('unsupported')
      global.window = originalWindow
    })

    it('should return permission state when permissions API is available', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ state: 'granted' })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        configurable: true,
      })

      const result = await checkMicrophonePermission()
      expect(result).toBe('granted')
      expect(mockQuery).toHaveBeenCalledWith({ name: 'microphone' })
    })

    it('should handle permissions API query rejection', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Not supported'))
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        configurable: true,
      })
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      })

      const result = await checkMicrophonePermission()
      expect(result).toBe('prompt')
    })

    it('should return prompt when getUserMedia is available', async () => {
      // @ts-ignore
      delete navigator.permissions
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      })

      const result = await checkMicrophonePermission()
      expect(result).toBe('prompt')
    })

    it('should return unsupported when neither API is available', async () => {
      // @ts-ignore
      delete navigator.permissions
      // @ts-ignore
      delete navigator.mediaDevices

      const result = await checkMicrophonePermission()
      expect(result).toBe('unsupported')
    })

    it('should return denied when permissions API returns denied', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ state: 'denied' })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        configurable: true,
      })

      const result = await checkMicrophonePermission()
      expect(result).toBe('denied')
    })

    it('should return prompt when permissions API returns prompt', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ state: 'prompt' })
      Object.defineProperty(navigator, 'permissions', {
        value: { query: mockQuery },
        configurable: true,
      })

      const result = await checkMicrophonePermission()
      expect(result).toBe('prompt')
    })
  })

  describe('requestMicrophonePermission', () => {
    it('should return false on server-side', async () => {
      // @ts-ignore
      delete global.window
      const result = await requestMicrophonePermission()
      expect(result).toBe(false)
      global.window = originalWindow
    })

    it('should return true when permission is granted', async () => {
      const mockTrack = { stop: vi.fn() }
      const mockStream = { getTracks: vi.fn().mockReturnValue([mockTrack]) }
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream)

      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
      })

      const result = await requestMicrophonePermission()
      expect(result).toBe(true)
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
      expect(mockTrack.stop).toHaveBeenCalled()
    })

    it('should return false when permission is denied', async () => {
      const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'))

      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
      })

      const result = await requestMicrophonePermission()
      expect(result).toBe(false)
      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
    })

    it('should stop all tracks after successful permission', async () => {
      const mockTrack1 = { stop: vi.fn() }
      const mockTrack2 = { stop: vi.fn() }
      const mockStream = { getTracks: vi.fn().mockReturnValue([mockTrack1, mockTrack2]) }
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream)

      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
      })

      const result = await requestMicrophonePermission()
      expect(result).toBe(true)
      expect(mockTrack1.stop).toHaveBeenCalled()
      expect(mockTrack2.stop).toHaveBeenCalled()
    })
  })
})
