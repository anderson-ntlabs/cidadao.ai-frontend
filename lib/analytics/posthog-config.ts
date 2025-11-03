/**
 * PostHog Analytics Configuration
 *
 * Privacy-first analytics for usability research
 * LGPD compliant with anonymization and unified consent management
 *
 * Unified Consent Model:
 * - Single cookie consent banner covers both cookies and analytics
 * - Accepting cookies = consent for PostHog analytics
 * - Rejecting cookies = only essential cookies, no analytics
 */

import posthog from 'posthog-js'
import { logger } from '@/lib/logger'

let isInitialized = false

/**
 * Initialize PostHog with privacy-first configuration
 *
 * PostHog always initializes, but respects user consent:
 * - With consent: full analytics + session recording
 * - Without consent: opt-out mode (no data collection)
 */
export function initPostHog() {
  // Only initialize in browser
  if (typeof window === 'undefined') return

  // Only initialize once
  if (isInitialized) return

  // Require API key
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('PostHog API key not configured - analytics disabled', {
        context: 'PostHogConfig',
      })
    }
    return
  }

  try {
    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',

      // Privacy & LGPD Compliance
      persistence: 'localStorage', // Use localStorage for session
      opt_out_capturing_by_default: false, // Start in opt-in mode

      // Session Recording Configuration
      disable_session_recording: !hasUserConsent(), // Disabled without consent
      session_recording: {
        maskAllInputs: true, // Mask all input fields
        maskTextSelector: '.sensitive', // Mask sensitive elements
        recordCrossOriginIframes: false, // Don't record iframes
      },

      // Performance & Features
      autocapture: true, // Enable autocapture for web analytics
      capture_pageview: true, // Capture pageview events automatically
      capture_pageleave: true, // Track when users leave

      // Debugging
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug('PostHog initialized successfully', {
            context: 'PostHogConfig',
            userConsent: hasUserConsent(),
          })
        }

        // Apply current consent status immediately
        updateConsentStatus()
      },
    })

    isInitialized = true
  } catch (error) {
    logger.error('PostHog initialization failed', error, { context: 'PostHogConfig' })
  }
}

/**
 * Check if user has consented to analytics
 *
 * Unified consent model: only cookie-consent is required
 * Accepting cookies implies consent for analytics and research
 */
export function hasUserConsent(): boolean {
  if (typeof window === 'undefined') return false

  const cookieConsent = localStorage.getItem('cookie-consent')

  // Simplified: only cookie consent is required
  // Analytics consent is bundled in the cookie consent banner
  return cookieConsent === 'accepted'
}

/**
 * Update PostHog consent status
 *
 * Called when user accepts/rejects cookie consent
 * or when consent status changes
 */
export function updateConsentStatus() {
  if (!isInitialized) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('PostHog not initialized yet - skipping consent update', {
        context: 'PostHogConfig',
      })
    }
    return
  }

  const hasConsent = hasUserConsent()

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Updating PostHog consent status', {
      context: 'PostHogConfig',
      status: hasConsent ? 'ACCEPTED' : 'REJECTED',
    })
  }

  if (hasConsent) {
    posthog.opt_in_capturing()
    posthog.startSessionRecording()

    if (process.env.NODE_ENV === 'development') {
      logger.info('PostHog analytics enabled - collecting data', { context: 'PostHogConfig' })
    }
  } else {
    posthog.opt_out_capturing()
    posthog.stopSessionRecording()

    if (process.env.NODE_ENV === 'development') {
      logger.info('PostHog analytics disabled - not collecting data', { context: 'PostHogConfig' })
    }
  }
}

/**
 * Identify user (anonymously with hash)
 */
export async function identifyUser(userId: string | null) {
  if (!isInitialized || !hasUserConsent()) return

  if (userId) {
    // Use SHA-256 hash of user ID for anonymization
    const userHash = await hashUserId(userId)
    posthog.identify(userHash, {
      anonymized: true,
    })
  } else {
    posthog.reset() // Anonymous user
  }
}

/**
 * Hash user ID for anonymization (SHA-256)
 */
async function hashUserId(userId: string): Promise<string> {
  if (typeof window === 'undefined') return userId

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(userId)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    logger.error('Failed to hash user ID for PostHog', error, { context: 'PostHogConfig' })
    return userId
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!isInitialized || !hasUserConsent()) return

  posthog.capture(eventName, {
    ...properties,
    timestamp: Date.now(),
  })
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string) {
  if (!isInitialized || !hasUserConsent()) return

  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_path: pagePath,
  })
}

/**
 * Get PostHog instance (for advanced usage)
 */
export function getPostHog() {
  return isInitialized ? posthog : null
}

/**
 * Reset PostHog (logout)
 */
export function resetPostHog() {
  if (!isInitialized) return
  posthog.reset()
}

// Export PostHog instance for advanced usage
export { posthog }
