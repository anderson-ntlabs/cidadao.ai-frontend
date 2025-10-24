/**
 * Unified Usability Tracker
 *
 * Central hub for tracking user behavior across multiple analytics platforms:
 * - PostHog (session replay, heatmaps)
 * - Supabase (data backup, custom queries)
 * - Local Telemetry (real-time monitoring)
 *
 * Privacy-first: All data anonymized and consent-gated
 */

import { trackEvent as trackPostHogEvent } from './posthog-config'
import { chatTelemetry } from '../telemetry/chat-telemetry'

/**
 * Event categories for analytics
 */
export type EventCategory =
  | 'navigation'      // Page views, route changes
  | 'interaction'     // Clicks, form submissions
  | 'performance'     // Task completion, duration
  | 'accessibility'   // A11y feature usage
  | 'error'          // Errors and failures

/**
 * Usability event interface
 */
export interface UsabilityEvent {
  // Event identification
  type: string
  category: EventCategory

  // Context
  page_path?: string
  element_clicked?: string
  agent_used?: string
  interaction_type?: string

  // Performance metrics
  duration_ms?: number
  time_on_page?: number
  steps_taken?: number

  // Success indicators
  success?: boolean
  error_message?: string

  // User context (anonymized)
  session_id?: string
  is_authenticated?: boolean
  is_demo_mode?: boolean

  // Device context
  device_type?: 'mobile' | 'tablet' | 'desktop'
  screen_width?: number
  screen_height?: number

  // Additional metadata
  metadata?: Record<string, any>
}

/**
 * Main tracking function
 */
export function trackUsability(
  eventType: string,
  data: Partial<UsabilityEvent>
): void {
  // Build complete event
  const event: UsabilityEvent = {
    type: eventType,
    category: data.category || 'interaction',
    page_path: data.page_path || getCurrentPath(),
    session_id: data.session_id || getSessionId(),
    device_type: data.device_type || getDeviceType(),
    screen_width: data.screen_width || window.innerWidth,
    screen_height: data.screen_height || window.innerHeight,
    ...data,
  }

  // Send to all platforms
  sendToPostHog(event)
  sendToSupabase(event)
  sendToLocalTelemetry(event)
}

/**
 * Send event to PostHog
 */
function sendToPostHog(event: UsabilityEvent): void {
  try {
    trackPostHogEvent(event.type, {
      category: event.category,
      page_path: event.page_path,
      element_clicked: event.element_clicked,
      agent_used: event.agent_used,
      duration_ms: event.duration_ms,
      success: event.success,
      device_type: event.device_type,
      ...event.metadata,
    })
  } catch (error) {
    console.error('[Analytics] PostHog error:', error)
  }
}

/**
 * Send event to Supabase
 */
async function sendToSupabase(event: UsabilityEvent): Promise<void> {
  // Only send if user has research consent
  if (!hasResearchConsent()) return

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: event.type,
        event_category: event.category,
        session_id: event.session_id,
        page_path: event.page_path,
        element_clicked: event.element_clicked,
        agent_used: event.agent_used,
        interaction_type: event.interaction_type,
        duration_ms: event.duration_ms,
        time_on_page: event.time_on_page,
        steps_taken: event.steps_taken,
        device_type: event.device_type,
        screen_width: event.screen_width,
        screen_height: event.screen_height,
        is_demo_mode: event.is_demo_mode,
        is_authenticated: event.is_authenticated,
        has_research_consent: true,
      }),
    })
  } catch (error) {
    console.error('[Analytics] Supabase error:', error)
  }
}

/**
 * Send event to local telemetry (if chat-related)
 */
function sendToLocalTelemetry(event: UsabilityEvent): void {
  // Only track chat events in local telemetry
  if (event.category !== 'interaction' || !event.type.includes('chat')) return

  try {
    chatTelemetry.track({
      type: mapToTelemetryType(event.type),
      timestamp: Date.now(),
      sessionId: event.session_id,
      data: event.metadata,
      duration: event.duration_ms,
    })
  } catch (error) {
    console.error('[Analytics] Local telemetry error:', error)
  }
}

/**
 * Map usability event type to telemetry event type
 */
function mapToTelemetryType(eventType: string): any {
  const mapping: Record<string, any> = {
    'chat_message_sent': 'message_sent',
    'chat_message_received': 'message_received',
    'chat_error': 'error',
    'chat_retry': 'retry',
    'chat_session_start': 'session_start',
    'chat_session_end': 'session_end',
  }

  return mapping[eventType] || 'message_sent'
}

/**
 * Helper: Get current page path
 */
function getCurrentPath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
}

/**
 * Helper: Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('analytics-session-id')

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics-session-id', sessionId)
  }

  return sessionId
}

/**
 * Helper: Detect device type
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth

  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Helper: Check research consent
 */
function hasResearchConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('research-consent') === 'accepted'
}

// ============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// ============================================================================

/**
 * Track page view
 */
export function trackPageView(pagePath: string): void {
  trackUsability('page_view', {
    category: 'navigation',
    page_path: pagePath,
  })
}

/**
 * Track navigation
 */
export function trackNavigation(from: string, to: string): void {
  trackUsability('navigation', {
    category: 'navigation',
    metadata: { from, to },
  })
}

/**
 * Track button click
 */
export function trackClick(elementId: string, elementText?: string): void {
  trackUsability('click', {
    category: 'interaction',
    element_clicked: elementId,
    metadata: { text: elementText },
  })
}

/**
 * Track agent selection
 */
export function trackAgentSelected(agentName: string): void {
  trackUsability('agent_selected', {
    category: 'interaction',
    agent_used: agentName,
  })
}

/**
 * Track chat interaction
 */
export function trackChatInteraction(
  messageLength: number,
  agent: string,
  isDemoMode: boolean = false
): void {
  trackUsability('chat_interaction', {
    category: 'interaction',
    agent_used: agent,
    is_demo_mode: isDemoMode,
    metadata: { message_length: messageLength },
  })
}

/**
 * Track investigation started
 */
export function trackInvestigationStarted(investigationType: string): void {
  trackUsability('investigation_started', {
    category: 'performance',
    interaction_type: investigationType,
  })
}

/**
 * Track investigation completed
 */
export function trackInvestigationCompleted(
  investigationType: string,
  durationMs: number,
  stepsTaken: number,
  success: boolean
): void {
  trackUsability('investigation_completed', {
    category: 'performance',
    interaction_type: investigationType,
    duration_ms: durationMs,
    steps_taken: stepsTaken,
    success,
  })
}

/**
 * Track accessibility feature toggle
 */
export function trackAccessibilityToggle(
  feature: 'high_contrast' | 'font_size' | 'vlibras',
  enabled: boolean
): void {
  trackUsability('accessibility_toggle', {
    category: 'accessibility',
    interaction_type: feature,
    metadata: { enabled },
  })
}

/**
 * Track error
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
): void {
  trackUsability('error', {
    category: 'error',
    error_message: errorMessage,
    interaction_type: errorType,
    metadata: context,
  })
}

/**
 * Track time on page
 */
export function trackTimeOnPage(pagePath: string, timeMs: number): void {
  trackUsability('time_on_page', {
    category: 'performance',
    page_path: pagePath,
    time_on_page: timeMs,
  })
}
