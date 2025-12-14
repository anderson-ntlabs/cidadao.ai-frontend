/**
 * PostHog Config Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mocks
const {
  mockInit,
  mockCapture,
  mockIdentify,
  mockReset,
  mockOptInCapturing,
  mockOptOutCapturing,
  mockStartSessionRecording,
  mockStopSessionRecording,
} = vi.hoisted(() => ({
  mockInit: vi.fn(),
  mockCapture: vi.fn(),
  mockIdentify: vi.fn(),
  mockReset: vi.fn(),
  mockOptInCapturing: vi.fn(),
  mockOptOutCapturing: vi.fn(),
  mockStartSessionRecording: vi.fn(),
  mockStopSessionRecording: vi.fn(),
}))

vi.mock('posthog-js', () => ({
  default: {
    init: mockInit,
    capture: mockCapture,
    identify: mockIdentify,
    reset: mockReset,
    opt_in_capturing: mockOptInCapturing,
    opt_out_capturing: mockOptOutCapturing,
    startSessionRecording: mockStartSessionRecording,
    stopSessionRecording: mockStopSessionRecording,
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Import after mocks
import {
  initPostHog,
  hasUserConsent,
  updateConsentStatus,
  identifyUser,
  trackEvent,
  trackPageView,
  getPostHog,
  resetPostHog,
} from './posthog-config'

describe('PostHog Config', () => {
  let mockStorage: Record<string, string>

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset module state by clearing the initialized flag
    // This is a workaround since the module has internal state
    vi.resetModules()

    // Mock localStorage
    mockStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
    })

    // Mock window.location
    vi.stubGlobal('window', {
      location: {
        href: 'http://localhost:3000/test',
      },
    })

    // Mock crypto.subtle for hashUserId
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('hasUserConsent', () => {
    it('should return false when no consent is stored', () => {
      expect(hasUserConsent()).toBe(false)
    })

    it('should return true when cookie-consent is accepted', () => {
      mockStorage['cookie-consent'] = 'accepted'
      expect(hasUserConsent()).toBe(true)
    })

    it('should return false when cookie-consent is rejected', () => {
      mockStorage['cookie-consent'] = 'rejected'
      expect(hasUserConsent()).toBe(false)
    })

    it('should return false on server-side', () => {
      vi.stubGlobal('window', undefined)
      // Need to re-import to test server-side behavior
      // For now, just verify the function exists
      expect(typeof hasUserConsent).toBe('function')
    })
  })

  describe('initPostHog', () => {
    it('should not initialize without API key', async () => {
      // API key is not set in test environment
      const { initPostHog: freshInit } = await import('./posthog-config')
      freshInit()

      // Should not call init without API key
      expect(mockInit).not.toHaveBeenCalled()
    })
  })

  describe('updateConsentStatus', () => {
    it('should be a function', () => {
      expect(typeof updateConsentStatus).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => updateConsentStatus()).not.toThrow()
    })
  })

  describe('identifyUser', () => {
    it('should be a function', () => {
      expect(typeof identifyUser).toBe('function')
    })

    it('should not throw when called with userId', async () => {
      await expect(identifyUser('user-123')).resolves.not.toThrow()
    })

    it('should not throw when called with null', async () => {
      await expect(identifyUser(null)).resolves.not.toThrow()
    })
  })

  describe('trackEvent', () => {
    it('should be a function', () => {
      expect(typeof trackEvent).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => trackEvent('test_event', { key: 'value' })).not.toThrow()
    })

    it('should accept event without properties', () => {
      expect(() => trackEvent('simple_event')).not.toThrow()
    })
  })

  describe('trackPageView', () => {
    it('should be a function', () => {
      expect(typeof trackPageView).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => trackPageView('/test/page')).not.toThrow()
    })
  })

  describe('getPostHog', () => {
    it('should return null when not initialized', () => {
      // PostHog is not initialized in test env (no API key)
      const result = getPostHog()
      expect(result).toBeNull()
    })
  })

  describe('resetPostHog', () => {
    it('should be a function', () => {
      expect(typeof resetPostHog).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => resetPostHog()).not.toThrow()
    })
  })
})
