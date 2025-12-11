/**
 * Next.js Client Instrumentation
 *
 * This file configures Sentry for the client-side of the Next.js application.
 * It initializes error tracking, performance monitoring, and session replay.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-11
 */

import * as Sentry from '@sentry/nextjs'

// Only initialize Sentry in production to reduce dev bundle
const isProduction = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: isProduction ? process.env.NEXT_PUBLIC_SENTRY_DSN : undefined,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Only enable in production
  enabled: isProduction,

  // Tracing - reduced sample rate for performance
  tracesSampleRate: isProduction ? 0.1 : 0,

  // Session Replay - only in production, lazy loaded
  replaysSessionSampleRate: isProduction ? 0.1 : 0,
  replaysOnErrorSampleRate: isProduction ? 1.0 : 0,

  // Integrations - only add what's needed
  integrations: isProduction
    ? [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
        Sentry.browserTracingIntegration(),
      ]
    : [],

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
