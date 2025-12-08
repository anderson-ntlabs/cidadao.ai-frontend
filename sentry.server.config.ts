/**
 * Sentry Server Configuration
 *
 * This file configures Sentry for the server-side of the Next.js application.
 * It initializes error tracking and performance monitoring for server components.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable PII to capture user context
  sendDefaultPii: true,

  // Integrations
  integrations: [
    // Note: vercelAIIntegration requires @ai-sdk packages
    // For custom LLM implementations, use manual instrumentation
  ],

  // Filter events
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV !== 'production') {
      return null
    }

    const error = hint.originalException
    if (error instanceof Error) {
      // Ignore network errors
      if (error.message.includes('NetworkError') || error.message.includes('fetch failed')) {
        return null
      }
      // Ignore cancelled requests
      if (error.message.includes('AbortError')) {
        return null
      }
    }

    return event
  },
})
