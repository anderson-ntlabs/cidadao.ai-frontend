/**
 * Tests for Logger Module
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Logger Module', () => {
  let consoleSpy: {
    error: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    info: ReturnType<typeof vi.spyOn>
    log: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  describe('LogLevel', () => {
    it('should export log level constants', async () => {
      const { LogLevel } = await import('./index')

      expect(LogLevel.FATAL).toBe('fatal')
      expect(LogLevel.ERROR).toBe('error')
      expect(LogLevel.WARN).toBe('warn')
      expect(LogLevel.INFO).toBe('info')
      expect(LogLevel.DEBUG).toBe('debug')
      expect(LogLevel.TRACE).toBe('trace')
    })
  })

  describe('Logger class', () => {
    it('should create a logger with context', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('TestContext')

      expect(logger).toBeInstanceOf(Logger)
    })

    it('should log fatal messages', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      logger.fatal('Fatal error message')

      expect(consoleSpy.error).toHaveBeenCalled()
      const call = consoleSpy.error.mock.calls[0][0]
      expect(call).toContain('FATAL')
      expect(call).toContain('Test')
      expect(call).toContain('Fatal error message')
    })

    it('should log error messages with Error object', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')
      const error = new Error('Test error')

      logger.error('Error occurred', error)

      expect(consoleSpy.error).toHaveBeenCalled()
      const call = consoleSpy.error.mock.calls[0][0]
      expect(call).toContain('ERROR')
      expect(call).toContain('Error occurred')
      expect(call).toContain('Test error')
    })

    it('should log error messages without Error object', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      logger.error('Error message', { detail: 'some detail' })

      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should log warn messages', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      logger.warn('Warning message')

      expect(consoleSpy.warn).toHaveBeenCalled()
      const call = consoleSpy.warn.mock.calls[0][0]
      expect(call).toContain('WARN')
    })

    it('should log info messages', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      logger.info('Info message')

      expect(consoleSpy.info).toHaveBeenCalled()
      const call = consoleSpy.info.mock.calls[0][0]
      expect(call).toContain('INFO')
    })

    it('should log debug messages', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      logger.debug('Debug message')

      expect(consoleSpy.log).toHaveBeenCalled()
      const call = consoleSpy.log.mock.calls[0][0]
      expect(call).toContain('DEBUG')
    })

    it('should have trace method defined', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      expect(typeof logger.trace).toBe('function')
      // Note: trace level may not log in dev mode since log level is DEBUG
      logger.trace('Trace message')
    })

    it('should create child logger with combined context', async () => {
      const { Logger } = await import('./index')
      const parentLogger = new Logger('Parent')
      const childLogger = parentLogger.child('Child')

      childLogger.info('Child message')

      expect(consoleSpy.info).toHaveBeenCalled()
      const call = consoleSpy.info.mock.calls[0][0]
      expect(call).toContain('Parent:Child')
    })

    it('should log with data using logWithData', async () => {
      const { Logger, LogLevel } = await import('./index')
      const logger = new Logger('Test')

      logger.logWithData(LogLevel.INFO, 'Message with data', { key: 'value' })

      expect(consoleSpy.info).toHaveBeenCalled()
    })

    it('should provide time function for performance measurement', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      const endTimer = logger.time('operation')
      expect(typeof endTimer).toBe('function')

      endTimer()

      expect(consoleSpy.log).toHaveBeenCalled()
      const call = consoleSpy.log.mock.calls[0][0]
      expect(call).toContain('operation took')
    })

    it('should measure async operations', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      const result = await logger.measure('async-op', async () => {
        return 'result'
      })

      expect(result).toBe('result')
      expect(consoleSpy.log).toHaveBeenCalled()
      const call = consoleSpy.log.mock.calls[0][0]
      expect(call).toContain('async-op completed')
    })

    it('should handle measure errors', async () => {
      const { Logger } = await import('./index')
      const logger = new Logger('Test')

      await expect(
        logger.measure('failing-op', async () => {
          throw new Error('Failure')
        })
      ).rejects.toThrow('Failure')

      expect(consoleSpy.error).toHaveBeenCalled()
      const call = consoleSpy.error.mock.calls[0][0]
      expect(call).toContain('failing-op failed')
    })
  })

  describe('createLogger factory', () => {
    it('should create a Logger instance', async () => {
      const { createLogger, Logger } = await import('./index')

      const logger = createLogger('TestModule')

      expect(logger).toBeInstanceOf(Logger)
    })
  })

  describe('default logger', () => {
    it('should export a default logger instance', async () => {
      const { logger, Logger } = await import('./index')

      expect(logger).toBeInstanceOf(Logger)
    })
  })
})
