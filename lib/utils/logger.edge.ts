/**
 * Edge-Safe Logger
 *
 * Lightweight logger for Edge Functions (middleware) that doesn't
 * import heavy dependencies like Sentry.
 *
 * Use this in middleware and edge functions.
 * Use the regular logger.ts in server/client code.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-24
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

/**
 * Edge-safe logger that only uses console
 * No external dependencies to keep middleware bundle small
 */
class EdgeLogger {
  private prefix: string
  private isDevelopment = process.env.NODE_ENV === 'development'

  constructor(prefix: string = 'Edge') {
    this.prefix = prefix
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[${this.prefix}:DEBUG] ${message}`, context ?? '')
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[${this.prefix}:INFO] ${message}`, context ?? '')
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`[${this.prefix}:WARN] ${message}`, context ?? '')
  }

  error(error: Error | string, context?: LogContext): void {
    if (error instanceof Error) {
      console.error(`[${this.prefix}:ERROR]`, error.message, context ?? '')
    } else {
      console.error(`[${this.prefix}:ERROR] ${error}`, context ?? '')
    }
  }
}

/**
 * Factory function to create edge-safe loggers
 */
export function createEdgeLogger(prefix: string = 'Edge'): EdgeLogger {
  return new EdgeLogger(prefix)
}

/**
 * Default edge logger instance
 */
export const edgeLogger = new EdgeLogger()
