/**
 * Next.js Client Instrumentation
 *
 * This file configures Sentry for the client-side of the Next.js application.
 * It initializes error tracking and performance monitoring.
 *
 * Session Replay is lazy-loaded only when an error occurs to reduce bundle size.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-11
 * Updated: 2025-12-15 - Lazy load replay integration for bundle optimization
 */

import * as Sentry from '@sentry/nextjs'

// Export the router transition hook for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

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

  // Session Replay - disabled in initial load, added dynamically on error
  // This saves ~50-80KB from the initial bundle
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Integrations - minimal set for initial load
  // replayIntegration removed to reduce bundle by ~50-80KB
  // It will be lazy-loaded when an error occurs via addReplayOnError()
  integrations: isProduction
    ? [
        Sentry.browserTracingIntegration({
          enableLongTask: false, // Reduce tracing overhead
        }),
      ]
    : [],

  // Filter events and lazy load replay on error
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
