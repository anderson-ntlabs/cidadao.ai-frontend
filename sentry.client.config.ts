/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the client-side of the Next.js application.
 * It initializes error tracking, performance monitoring, and session replay.
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

  // Tracing for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter events
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV !== 'production') {
      return null
    }

    const error = hint.originalException
    if (error instanceof Error) {
      // Ignore network errors (user offline)
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return null
      }
      // Ignore cancelled requests
      if (error.message.includes('AbortError')) {
        return null
      }
      // Ignore chunk load errors (handled by Next.js)
      if (error.message.includes('ChunkLoadError')) {
        return null
      }
    }

    return event
  },

  // Filter breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter out console logs for privacy
    if (breadcrumb.category === 'console') {
      return null
    }
    return breadcrumb
  },
})
