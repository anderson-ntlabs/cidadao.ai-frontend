/**
 * PostHog Analytics Configuration
 *
 * Privacy-first analytics for usability research
 * LGPD compliant with anonymization and consent management
 */

import posthog from 'posthog-js'

let isInitialized = false

/**
 * Initialize PostHog with privacy-first configuration
 */
export function initPostHog() {
  // Only initialize in browser
  if (typeof window === 'undefined') return

  // Only initialize once
  if (isInitialized) return

  // Require API key
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) {
    console.warn('[PostHog] API key not configured. Analytics disabled.')
    return
  }

  try {
    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',

      // Privacy & LGPD Compliance
      persistence: 'localStorage',           // Use localStorage for session

      // Session Recording Configuration
      disable_session_recording: !hasUserConsent(), // Disabled without consent
      session_recording: {
        maskAllInputs: true,                 // Mask all input fields
        maskTextSelector: '.sensitive',      // Mask sensitive elements
        recordCrossOriginIframes: false,     // Don't record iframes
      },

      // Performance & Features
      autocapture: false,                    // Manual tracking only
      capture_pageview: false,               // Manual page tracking
      capture_pageleave: true,               // Track when users leave

      // Debugging
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostHog] Initialized successfully')
        }
      },
    })

    isInitialized = true
  } catch (error) {
    console.error('[PostHog] Initialization failed:', error)
  }
}

/**
 * Check if user has consented to analytics
 */
export function hasUserConsent(): boolean {
  if (typeof window === 'undefined') return false

  const cookieConsent = localStorage.getItem('cookie-consent')
  const researchConsent = localStorage.getItem('research-consent')

  // User must accept cookies AND research consent
  return cookieConsent === 'accepted' && researchConsent === 'accepted'
}

/**
 * Update PostHog consent status
 */
export function updateConsentStatus() {
  if (!isInitialized) return

  const hasConsent = hasUserConsent()

  if (hasConsent) {
    posthog.opt_in_capturing()
    posthog.startSessionRecording()
  } else {
    posthog.opt_out_capturing()
    posthog.stopSessionRecording()
  }
}

/**
 * Identify user (anonymously with hash)
 */
export function identifyUser(userId: string | null) {
  if (!isInitialized || !hasUserConsent()) return

  if (userId) {
    // Use SHA-256 hash of user ID for anonymization
    const userHash = hashUserId(userId)
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
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    console.error('[PostHog] Failed to hash user ID:', error)
    return userId
  }
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
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
