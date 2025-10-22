import * as Sentry from '@sentry/nextjs'

/**
 * Log levels for the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Context object for structured logging
 */
export interface LogContext {
  [key: string]: any
}

/**
 * Centralized logger with environment-aware behavior
 *
 * Development: Logs to console
 * Production: Sends errors/warnings to Sentry, suppresses debug/info
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '')
    }
  }

  /**
   * Info-level logging (development only)
   * Use for general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '')
    }
  }

  /**
   * Warning-level logging
   * Development: Logs to console
   * Production: Sends to Sentry
   */
  warn(message: string, context?: LogContext): void {
    if (this.isProduction) {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: context ? { custom: context } : undefined,
      })
    } else {
      console.warn(`[WARN] ${message}`, context || '')
    }
  }

  /**
   * Error-level logging
   * Development: Logs to console
   * Production: Sends to Sentry with full context
   */
  error(error: Error | string, context?: LogContext): void {
    if (this.isProduction) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          contexts: context ? { custom: context } : undefined,
        })
      } else {
        Sentry.captureMessage(error, {
          level: 'error',
          contexts: context ? { custom: context } : undefined,
        })
      }
    } else {
      if (error instanceof Error) {
        console.error('[ERROR]', error.message, error.stack, context || '')
      } else {
        console.error(`[ERROR] ${error}`, context || '')
      }
    }
  }

  /**
   * Log a performance measurement
   * Development: Logs to console
   * Production: Sends to Sentry as breadcrumb
   */
  performance(operation: string, durationMs: number, context?: LogContext): void {
    const message = `${operation} took ${durationMs}ms`

    if (this.isProduction) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message,
        level: 'info',
        data: { durationMs, ...context },
      })
    } else {
      console.log(`[PERF] ${message}`, context || '')
    }
  }

  /**
   * Group related logs together (development only)
   */
  group(label: string): void {
    if (this.isDevelopment && console.group) {
      console.group(label)
    }
  }

  /**
   * End a log group (development only)
   */
  groupEnd(): void {
    if (this.isDevelopment && console.groupEnd) {
      console.groupEnd()
    }
  }

  /**
   * Time an operation (development only)
   */
  time(label: string): void {
    if (this.isDevelopment && console.time) {
      console.time(label)
    }
  }

  /**
   * End timing an operation (development only)
   */
  timeEnd(label: string): void {
    if (this.isDevelopment && console.timeEnd) {
      console.timeEnd(label)
    }
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger()

/**
 * Helper to measure async operations
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.performance(operation, duration, context)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { operation, duration, ...context }
    )
    throw error
  }
}

/**
 * Helper to measure sync operations
 */
export function measureSync<T>(
  operation: string,
  fn: () => T,
  context?: LogContext
): T {
  const start = Date.now()

  try {
    const result = fn()
    const duration = Date.now() - start
    logger.performance(operation, duration, context)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { operation, duration, ...context }
    )
    throw error
  }
}
