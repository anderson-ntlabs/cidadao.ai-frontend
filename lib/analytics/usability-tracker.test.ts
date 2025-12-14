/**
 * Tests for Usability Tracker
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoisted mock
const mockTrackEvent = vi.hoisted(() => vi.fn())

// Mock modules
vi.mock('./posthog-config', () => ({
  trackEvent: mockTrackEvent,
}))

vi.mock('../telemetry/chat-telemetry', () => ({
  chatTelemetry: {
    track: vi.fn(),
  },
}))

// Import after mocks
import {
  trackUsability,
  trackPageView,
  trackNavigation,
  trackClick,
  trackAgentSelected,
  trackChatInteraction,
  trackInvestigationStarted,
  trackInvestigationCompleted,
  trackAccessibilityToggle,
  trackError,
  trackTimeOnPage,
} from './usability-tracker'

// Mock fetch
global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any

describe('Usability Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup window mocks
    vi.stubGlobal('window', {
      innerWidth: 1920,
      innerHeight: 1080,
      location: { pathname: '/pt/app/chat' },
    })

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    })

    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('trackUsability', () => {
    it('should track event with PostHog', () => {
      trackUsability('test_event', {})

      expect(mockTrackEvent).toHaveBeenCalledWith('test_event', expect.any(Object))
    })

    it('should include device type based on screen width - mobile', () => {
      vi.stubGlobal('window', {
        innerWidth: 500,
        innerHeight: 800,
        location: { pathname: '/test' },
      })

      trackUsability('test_event', {})

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'test_event',
        expect.objectContaining({ device_type: 'mobile' })
      )
    })

    it('should include device type based on screen width - tablet', () => {
      vi.stubGlobal('window', {
        innerWidth: 800,
        innerHeight: 1024,
        location: { pathname: '/test' },
      })

      trackUsability('test_event', {})

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'test_event',
        expect.objectContaining({ device_type: 'tablet' })
      )
    })

    it('should include device type based on screen width - desktop', () => {
      trackUsability('test_event', {})

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'test_event',
        expect.objectContaining({ device_type: 'desktop' })
      )
    })

    it('should include page path from window.location', () => {
      trackUsability('test_event', {})

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'test_event',
        expect.objectContaining({ page_path: '/pt/app/chat' })
      )
    })

    it('should send to Supabase when consent is given', async () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn().mockReturnValue('accepted'),
      })

      trackUsability('test_event', { category: 'interaction' })

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/track',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should not send to Supabase without consent', async () => {
      trackUsability('test_event', { category: 'interaction' })

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('trackPageView', () => {
    it('should track page view with navigation category', () => {
      trackPageView('/pt/app/dashboard')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'page_view',
        expect.objectContaining({
          category: 'navigation',
          page_path: '/pt/app/dashboard',
        })
      )
    })
  })

  describe('trackNavigation', () => {
    it('should track navigation event', () => {
      trackNavigation('/home', '/about')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'navigation',
        expect.objectContaining({ category: 'navigation' })
      )
    })
  })

  describe('trackClick', () => {
    it('should track click with element ID', () => {
      trackClick('submit-button', 'Submit')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'click',
        expect.objectContaining({
          category: 'interaction',
          element_clicked: 'submit-button',
        })
      )
    })
  })

  describe('trackAgentSelected', () => {
    it('should track agent selection', () => {
      trackAgentSelected('zumbi')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agent_selected',
        expect.objectContaining({
          category: 'interaction',
          agent_used: 'zumbi',
        })
      )
    })
  })

  describe('trackChatInteraction', () => {
    it('should track chat interaction with agent', () => {
      trackChatInteraction(150, 'abaporu', false)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'chat_interaction',
        expect.objectContaining({
          category: 'interaction',
          agent_used: 'abaporu',
        })
      )
    })

    it('should track demo mode flag', () => {
      trackChatInteraction(100, 'zumbi', true)

      expect(mockTrackEvent).toHaveBeenCalledWith('chat_interaction', expect.any(Object))
    })
  })

  describe('trackInvestigationStarted', () => {
    it('should track investigation start', () => {
      trackInvestigationStarted('contract_analysis')

      expect(mockTrackEvent).toHaveBeenCalledWith('investigation_started', expect.any(Object))
    })
  })

  describe('trackInvestigationCompleted', () => {
    it('should track investigation completion with metrics', () => {
      trackInvestigationCompleted('salary_analysis', 5000, 3, true)

      expect(mockTrackEvent).toHaveBeenCalledWith('investigation_completed', expect.any(Object))
    })
  })

  describe('trackAccessibilityToggle', () => {
    it('should track accessibility feature toggle', () => {
      trackAccessibilityToggle('high_contrast', true)

      expect(mockTrackEvent).toHaveBeenCalledWith('accessibility_toggle', expect.any(Object))
    })
  })

  describe('trackError', () => {
    it('should track error with type and message', () => {
      trackError('api_error', 'Connection timeout', { endpoint: '/api/chat' })

      expect(mockTrackEvent).toHaveBeenCalledWith('error', expect.any(Object))
    })
  })

  describe('trackTimeOnPage', () => {
    it('should track time on page', () => {
      trackTimeOnPage('/pt/app/chat', 120000)

      expect(mockTrackEvent).toHaveBeenCalledWith('time_on_page', expect.any(Object))
    })
  })
})
