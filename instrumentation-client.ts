/**
 * Next.js Client Instrumentation
 *
 * PERFORMANCE OPTIMIZED: Sentry is lazy-loaded after page is interactive
 * This reduces First Load JS by ~80KB
 *
 * The initialization happens:
 * - In production: After 3 seconds (requestIdleCallback or setTimeout fallback)
 * - In development: Disabled entirely
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-11
 * Updated: 2025-12-15 - Lazy load entire Sentry for bundle optimization
 */

// Only initialize Sentry in production
const isProduction = process.env.NODE_ENV === 'production'

// Lazy load Sentry after the page is interactive
if (typeof window !== 'undefined' && isProduction) {
  const initSentry = async () => {
    try {
      const Sentry = await import('@sentry/nextjs')

      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: 'production',
        enabled: true,

        // Tracing - reduced sample rate for performance
        tracesSampleRate: 0.1,

        // Session Replay - disabled to reduce bundle
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,

        // Minimal integrations for performance
        integrations: [
          Sentry.browserTracingIntegration({
            enableLongTask: false,
          }),
        ],

        // Filter events
        beforeSend(event, hint) {
          const error = hint.originalException
          if (error instanceof Error) {
            // Ignore network errors (user offline)
            if (
              error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch')
            ) {
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
          if (breadcrumb.category === 'console') {
            return null
          }
          return breadcrumb
        },
      })
    } catch (error) {
      // Silently fail if Sentry can't load
      console.warn('Sentry failed to initialize:', error)
    }
  }

  // Delay Sentry initialization to not block main thread
  // Use requestIdleCallback for optimal timing, fallback to setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        void initSentry()
      },
      { timeout: 5000 }
    )
  } else {
    setTimeout(() => {
      void initSentry()
    }, 3000)
  }
}

// Export empty hook for compatibility (Sentry will add real one after init)
export const onRouterTransitionStart = () => {}
