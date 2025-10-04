/**
 * Sentry Configuration
 *
 * Error tracking and performance monitoring with Sentry
 */

import * as Sentry from '@sentry/nextjs';

export interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Get Sentry configuration
 */
export function getSentryConfig(): SentryConfig {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  return {
    dsn,
    environment,
    enabled: !!dsn && environment === 'production',
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  };
}

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('[Sentry] Disabled - no DSN configured or not in production');
    return;
  }

  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,

      // Performance Monitoring
      tracesSampleRate: config.tracesSampleRate,

      // Session Replay integration moved to @sentry/browser in v8
      // Configured separately if needed

      // Capture sessions
      replaysSessionSampleRate: config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

      // Filter events
      beforeSend(event, hint) {
        // Don't send errors in development
        if (config.environment !== 'production') {
          return null;
        }

        // Filter out specific errors
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore network errors (user offline)
          if (error.message.includes('NetworkError')) {
            return null;
          }

          // Ignore cancelled requests
          if (error.message.includes('AbortError')) {
            return null;
          }
        }

        return event;
      },

      // Add user context
      beforeBreadcrumb(breadcrumb) {
        // Filter out sensitive data from breadcrumbs
        if (breadcrumb.category === 'console') {
          return null;
        }

        return breadcrumb;
      },
    });

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.error('[Error]', error, context);
    return;
  }

  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log(`[${level}]`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Set user context
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Start span for performance monitoring
 * Note: startTransaction is deprecated in Sentry v8, use startSpan instead
 */
export function trackPerformance(
  name: string,
  op: string,
  callback: () => void
): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    callback();
    return;
  }

  // Use addBreadcrumb for tracking instead of deprecated startTransaction
  Sentry.addBreadcrumb({
    message: `${op}: ${name}`,
    level: 'info',
    category: 'performance',
  });

  callback();
}

/**
 * Track page load performance
 */
export function trackPageLoad(pageName: string): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    return;
  }

  // Track page load via breadcrumb
  Sentry.addBreadcrumb({
    message: `Page loaded: ${pageName}`,
    level: 'info',
    category: 'navigation',
  });
}
