// import pino from 'pino' // Removed for optimization - using custom logger

// Define log levels
export const LogLevel = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const

export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel]

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
      },
    },
  },
}

// Simple logger implementation to replace pino
const logLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG

// Logger wrapper with consistent interface
export class Logger {
  private context: string
  private minLevel: string

  constructor(context: string) {
    this.context = context
    this.minLevel = logLevel
  }

  private shouldLog(level: string): boolean {
    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private log(level: string, message: string, ...args: any[]) {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`

    switch (level) {
      case 'fatal':
      case 'error':
        console.error(logMessage, ...args)
        break
      case 'warn':
        console.warn(logMessage, ...args)
        break
      case 'info':
        console.info(logMessage, ...args)
        break
      case 'debug':
      case 'trace':
        console.log(logMessage, ...args)
        break
    }
  }

  fatal(message: string, ...args: any[]) {
    this.log('fatal', message, ...args)
  }

  error(message: string, error?: Error | any, ...args: any[]) {
    if (error instanceof Error) {
      this.log('error', `${message} - ${error.message}`, error.stack, ...args)
    } else {
      this.log('error', message, error, ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args)
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args)
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args)
  }

  trace(message: string, ...args: any[]) {
    this.log('trace', message, ...args)
  }

  // Method overload to handle different signatures
  logWithData(level: LogLevelType, message: string, data?: any) {
    this.log(level, message, data)
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
