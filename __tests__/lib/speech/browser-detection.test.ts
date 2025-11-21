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
      expect(message).toContain('Google Chrome ou Microsoft Edge')
    })

    it('should return Portuguese message when specified', () => {
      const message = getUnsupportedBrowserMessage('pt')
      expect(message).toContain('🎤 Entrada de voz não disponível')
      expect(message).toContain('Firefox')
      expect(message).toContain('Google Chrome ou Microsoft Edge')
    })

    it('should return English message when specified', () => {
      const message = getUnsupportedBrowserMessage('en')
      expect(message).toContain('🎤 Voice input not available')
      expect(message).toContain('Firefox')
      expect(message).toContain('Google Chrome or Microsoft Edge')
    })
  })
})
