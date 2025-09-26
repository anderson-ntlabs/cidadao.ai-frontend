import pino from 'pino'

// Define log levels
export const LogLevel = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel]

// Logger configuration based on environment
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Browser-compatible logger configuration
const browserConfig = {
  browser: {
    serialize: true,
    asObject: true,
    transmit: {
      level: isProduction ? LogLevel.WARN : LogLevel.DEBUG,
      send: function (level: string, logEvent: any) {
        if (isProduction && level === LogLevel.DEBUG) return
        
        // In production, we could send logs to a service
        // For now, we'll use console methods based on level
        const msg = logEvent.messages[0]
        const extra = logEvent.messages.slice(1)
        
        switch (level) {
          case LogLevel.ERROR:
          case LogLevel.FATAL:
            console.error(msg, ...extra)
            break
          case LogLevel.WARN:
            console.warn(msg, ...extra)
            break
          case LogLevel.DEBUG:
          case LogLevel.TRACE:
            if (!isProduction) {
              console.debug(msg, ...extra)
            }
            break
          default:
            console.log(msg, ...extra)
        }
      }
    }
  }
}

// Create base logger
const baseLogger = pino({
  level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
  browser: browserConfig.browser,
})

// Logger wrapper with consistent interface
export class Logger {
  private context: string
  private logger: pino.Logger

  constructor(context: string) {
    this.context = context
    this.logger = baseLogger.child({ context })
  }

  fatal(message: string, ...args: any[]) {
    this.logger.fatal({ context: this.context }, message, ...args)
  }

  error(message: string, error?: Error | any, ...args: any[]) {
    if (error instanceof Error) {
      this.logger.error(
        {
          context: this.context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message,
        ...args
      )
    } else {
      this.logger.error({ context: this.context, error }, message, ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn({ context: this.context }, message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.logger.info({ context: this.context }, message, ...args)
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug({ context: this.context }, message, ...args)
  }

  trace(message: string, ...args: any[]) {
    this.logger.trace({ context: this.context }, message, ...args)
  }

  // Log with custom data
  log(level: LogLevelType, message: string, data?: any) {
    this.logger[level]({ context: this.context, ...data }, message)
  }

  // Create child logger with additional context
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`)
  }

  // Performance logging
  time(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.debug(`${label} took ${duration.toFixed(2)}ms`)
    }
  }

  // Measure async operations
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }
}

// Factory function to create logger instances
export function createLogger(context: string): Logger {
  return new Logger(context)
}

// Default logger instance
export const logger = createLogger('App')

// Replace console methods in production
if (isProduction && typeof window !== 'undefined') {
  const noop = () => {}
  
  // Keep error and warn in production
  window.console.log = noop
  window.console.debug = noop
  window.console.trace = noop
  window.console.info = noop
}