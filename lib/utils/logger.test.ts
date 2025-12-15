import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as Sentry from '@sentry/nextjs'
import { measureAsync, measureSync, logger } from './logger'

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
const consoleTimeSpy = vi.spyOn(console, 'time').mockImplementation(() => {})
const consoleTimeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => {})

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

describe('measureAsync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute async operation and return result', async () => {
    const operation = vi.fn().mockResolvedValue('success')

    const result = await measureAsync('test-op', operation)

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should measure execution time', async () => {
    const operation = vi.fn().mockResolvedValue(42)

    await measureAsync('calculate', operation)

    // Should log performance metric
    expect(consoleLogSpy).toHaveBeenCalled()
    const callArgs = consoleLogSpy.mock.calls[0]
    expect(callArgs[0]).toContain('[PERF]')
    expect(callArgs[0]).toContain('calculate took')
    expect(callArgs[0]).toContain('ms')
  })

  it('should pass context to performance log', async () => {
    const operation = vi.fn().mockResolvedValue('data')

    await measureAsync('fetch-data', operation, { source: 'api' })

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[PERF] fetch-data took'), {
      source: 'api',
    })
  })

  it('should log errors and rethrow', async () => {
    const error = new Error('Operation failed')
    const operation = vi.fn().mockRejectedValue(error)

    await expect(measureAsync('failing-op', operation)).rejects.toThrow('Operation failed')

    expect(consoleErrorSpy).toHaveBeenCalled()
    const errorCall = consoleErrorSpy.mock.calls[0]
    expect(errorCall[0]).toBe('[ERROR]')
    expect(errorCall[1]).toBe('Operation failed')
  })

  it('should include operation name and duration in error context', async () => {
    const error = new Error('Failed')
    const operation = vi.fn().mockRejectedValue(error)

    await expect(measureAsync('critical-op', operation, { userId: '123' })).rejects.toThrow()

    const errorContext = consoleErrorSpy.mock.calls[0][3]
    expect(errorContext).toMatchObject({
      operation: 'critical-op',
      userId: '123',
    })
    expect(errorContext).toHaveProperty('duration')
    expect(typeof errorContext.duration).toBe('number')
  })

  it('should handle non-Error rejections', async () => {
    const operation = vi.fn().mockRejectedValue('String error')

    await expect(measureAsync('bad-op', operation)).rejects.toBe('String error')

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should measure time accurately for slow operations', async () => {
    const slowOperation = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'done'
    })

    await measureAsync('slow-op', slowOperation)

    const perfLog = consoleLogSpy.mock.calls[0][0]
    // Should have measured at least ~100ms
    const match = perfLog.match(/took (\d+)ms/)
    expect(match).toBeTruthy()
    const duration = parseInt(match![1])
    expect(duration).toBeGreaterThanOrEqual(90) // Allow some variance
  })

  it('should not affect operation return value', async () => {
    const complexResult = { data: [1, 2, 3], meta: { total: 3 } }
    const operation = vi.fn().mockResolvedValue(complexResult)

    const result = await measureAsync('complex-op', operation)

    expect(result).toEqual(complexResult)
  })
})

describe('measureSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute sync operation and return result', () => {
    const operation = vi.fn().mockReturnValue('result')

    const result = measureSync('sync-op', operation)

    expect(result).toBe('result')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should measure execution time', () => {
    const operation = vi.fn().mockReturnValue(100)

    measureSync('compute', operation)

    expect(consoleLogSpy).toHaveBeenCalled()
    const callArgs = consoleLogSpy.mock.calls[0]
    expect(callArgs[0]).toContain('[PERF]')
    expect(callArgs[0]).toContain('compute took')
    expect(callArgs[0]).toContain('ms')
  })

  it('should pass context to performance log', () => {
    const operation = vi.fn().mockReturnValue('processed')

    measureSync('process-data', operation, { format: 'json' })

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[PERF] process-data took'),
      { format: 'json' }
    )
  })

  it('should log errors and rethrow', () => {
    const error = new Error('Sync operation failed')
    const operation = vi.fn().mockImplementation(() => {
      throw error
    })

    expect(() => measureSync('failing-sync', operation)).toThrow('Sync operation failed')

    expect(consoleErrorSpy).toHaveBeenCalled()
    const errorCall = consoleErrorSpy.mock.calls[0]
    expect(errorCall[0]).toBe('[ERROR]')
    expect(errorCall[1]).toBe('Sync operation failed')
  })

  it('should include operation name and duration in error context', () => {
    const error = new Error('Failed')
    const operation = vi.fn().mockImplementation(() => {
      throw error
    })

    expect(() => measureSync('important-op', operation, { attempt: 1 })).toThrow()

    const errorContext = consoleErrorSpy.mock.calls[0][3]
    expect(errorContext).toMatchObject({
      operation: 'important-op',
      attempt: 1,
    })
    expect(errorContext).toHaveProperty('duration')
    expect(typeof errorContext.duration).toBe('number')
  })

  it('should handle non-Error throws', () => {
    const operation = vi.fn().mockImplementation(() => {
      throw 'String error'
    })

    expect(() => measureSync('bad-sync', operation)).toThrow('String error')

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should return falsy values correctly', () => {
    const tests = [
      { value: 0, description: 'zero' },
      { value: false, description: 'false' },
      { value: '', description: 'empty string' },
      { value: null, description: 'null' },
      { value: undefined, description: 'undefined' },
    ]

    tests.forEach(({ value, description }) => {
      const operation = vi.fn().mockReturnValue(value)
      const result = measureSync(`return-${description}`, operation)
      expect(result).toBe(value)
    })
  })

  it('should not affect operation return value', () => {
    const complexResult = { items: ['a', 'b'], count: 2 }
    const operation = vi.fn().mockReturnValue(complexResult)

    const result = measureSync('complex-sync', operation)

    expect(result).toEqual(complexResult)
  })

  it('should measure fast operations', () => {
    const fastOp = vi.fn().mockReturnValue('fast')

    measureSync('fast-op', fastOp)

    const perfLog = consoleLogSpy.mock.calls[0][0]
    // Even fast operations should be measured
    expect(perfLog).toMatch(/took \d+ms/)
  })
})

describe('integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should work with nested measure calls', async () => {
    const innerOp = vi.fn().mockReturnValue('inner')
    const outerOp = vi.fn().mockImplementation(async () => {
      return measureSync('inner-op', innerOp)
    })

    await measureAsync('outer-op', outerOp)

    // Should log both operations
    expect(consoleLogSpy).toHaveBeenCalledTimes(2)
    expect(consoleLogSpy.mock.calls[0][0]).toContain('inner-op')
    expect(consoleLogSpy.mock.calls[1][0]).toContain('outer-op')
  })

  it('should handle errors in nested operations', async () => {
    const error = new Error('Inner error')
    const innerOp = vi.fn().mockImplementation(() => {
      throw error
    })
    const outerOp = vi.fn().mockImplementation(async () => {
      return measureSync('inner-op', innerOp)
    })

    await expect(measureAsync('outer-op', outerOp)).rejects.toThrow('Inner error')

    // Should log error from inner operation
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe('Logger class methods', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Note: debug, info, group, groupEnd, time, timeEnd only work in NODE_ENV=development
  // In test environment (NODE_ENV=test), these methods are no-ops

  describe('debug (no-op in test mode)', () => {
    it('should not log in test environment', () => {
      logger.debug('Debug message', { key: 'value' })
      // debug only logs in development mode
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('info (no-op in test mode)', () => {
    it('should not log in test environment', () => {
      logger.info('Info message', { data: 123 })
      // info only logs in development mode
      expect(consoleInfoSpy).not.toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    it('should log warning message with context', () => {
      logger.warn('Warning message', { warning: true })
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message', { warning: true })
    })

    it('should log warning message without context', () => {
      logger.warn('Warning only')
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning only', '')
    })
  })

  describe('error', () => {
    it('should log Error object with stack trace', () => {
      const error = new Error('Test error')
      logger.error(error, { context: 'test' })
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test error', expect.any(String), {
        context: 'test',
      })
    })

    it('should log Error object without context', () => {
      const error = new Error('Simple error')
      logger.error(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        'Simple error',
        expect.any(String),
        ''
      )
    })

    it('should log string error with context', () => {
      logger.error('String error', { reason: 'unknown' })
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] String error', { reason: 'unknown' })
    })

    it('should log string error without context', () => {
      logger.error('Simple string error')
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Simple string error', '')
    })
  })

  describe('performance', () => {
    it('should log performance metric with context in non-production mode', () => {
      logger.performance('api-call', 150, { endpoint: '/api/test' })
      expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] api-call took 150ms', {
        endpoint: '/api/test',
      })
    })

    it('should log performance metric without context', () => {
      logger.performance('render', 50)
      expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] render took 50ms', '')
    })
  })

  describe('group (no-op in test mode)', () => {
    it('should not call console.group in test environment', () => {
      logger.group('My Group')
      expect(consoleGroupSpy).not.toHaveBeenCalled()
    })
  })

  describe('groupEnd (no-op in test mode)', () => {
    it('should not call console.groupEnd in test environment', () => {
      logger.groupEnd()
      expect(consoleGroupEndSpy).not.toHaveBeenCalled()
    })
  })

  describe('time (no-op in test mode)', () => {
    it('should not call console.time in test environment', () => {
      logger.time('timer-label')
      expect(consoleTimeSpy).not.toHaveBeenCalled()
    })
  })

  describe('timeEnd (no-op in test mode)', () => {
    it('should not call console.timeEnd in test environment', () => {
      logger.timeEnd('timer-label')
      expect(consoleTimeEndSpy).not.toHaveBeenCalled()
    })
  })
})

describe('Logger - Development Mode', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
    // Set to development mode
    process.env.NODE_ENV = 'development'
    // Force module reload to pick up new env
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('should log debug messages in development mode', async () => {
    const { logger } = await import('./logger')
    logger.debug('Debug message', { key: 'value' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Debug message', { key: 'value' })
  })

  it('should log debug without context in development mode', async () => {
    const { logger } = await import('./logger')
    logger.debug('Debug only')
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Debug only', '')
  })

  it('should log info messages in development mode', async () => {
    const { logger } = await import('./logger')
    logger.info('Info message', { data: 123 })
    expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Info message', { data: 123 })
  })

  it('should log info without context in development mode', async () => {
    const { logger } = await import('./logger')
    logger.info('Info only')
    expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Info only', '')
  })

  it('should use console.warn in development mode', async () => {
    const { logger } = await import('./logger')
    logger.warn('Warning in dev', { warning: true })
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning in dev', { warning: true })
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('should use console.error in development mode for Error objects', async () => {
    const { logger } = await import('./logger')
    const error = new Error('Dev error')
    logger.error(error, { context: 'dev' })
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Dev error', expect.any(String), {
      context: 'dev',
    })
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('should use console.error in development mode for string errors', async () => {
    const { logger } = await import('./logger')
    logger.error('Dev string error', { reason: 'test' })
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Dev string error', { reason: 'test' })
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('should call console.group in development mode', async () => {
    const { logger } = await import('./logger')
    logger.group('Test Group')
    expect(consoleGroupSpy).toHaveBeenCalledWith('Test Group')
  })

  it('should call console.groupEnd in development mode', async () => {
    const { logger } = await import('./logger')
    logger.groupEnd()
    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1)
  })

  it('should call console.time in development mode', async () => {
    const { logger } = await import('./logger')
    logger.time('test-timer')
    expect(consoleTimeSpy).toHaveBeenCalledWith('test-timer')
  })

  it('should call console.timeEnd in development mode', async () => {
    const { logger } = await import('./logger')
    logger.timeEnd('test-timer')
    expect(consoleTimeEndSpy).toHaveBeenCalledWith('test-timer')
  })

  it('should use console.log for performance in development mode', async () => {
    const { logger } = await import('./logger')
    logger.performance('operation', 100, { extra: 'data' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[PERF] operation took 100ms', { extra: 'data' })
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled()
  })
})

describe('Logger - Production Mode', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
    // Set to production mode
    process.env.NODE_ENV = 'production'
    // Force module reload to pick up new env
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('should not log debug in production mode', async () => {
    const { logger } = await import('./logger')
    logger.debug('Debug message', { key: 'value' })
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('should not log info in production mode', async () => {
    const { logger } = await import('./logger')
    logger.info('Info message', { data: 123 })
    expect(consoleInfoSpy).not.toHaveBeenCalled()
  })

  it('should send warnings to Sentry in production mode with context', async () => {
    const { logger } = await import('./logger')
    logger.warn('Production warning', { userId: '123' })
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Production warning', {
      level: 'warning',
      contexts: { custom: { userId: '123' } },
    })
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should send warnings to Sentry in production mode without context', async () => {
    const { logger } = await import('./logger')
    logger.warn('Production warning')
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Production warning', {
      level: 'warning',
      contexts: undefined,
    })
  })

  it('should send Error objects to Sentry in production mode with context', async () => {
    const { logger } = await import('./logger')
    const error = new Error('Production error')
    logger.error(error, { userId: '456' })
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: { custom: { userId: '456' } },
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('should send Error objects to Sentry in production mode without context', async () => {
    const { logger } = await import('./logger')
    const error = new Error('Production error')
    logger.error(error)
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: undefined,
    })
  })

  it('should send string errors to Sentry in production mode with context', async () => {
    const { logger } = await import('./logger')
    logger.error('String error', { reason: 'unknown' })
    expect(Sentry.captureMessage).toHaveBeenCalledWith('String error', {
      level: 'error',
      contexts: { custom: { reason: 'unknown' } },
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('should send string errors to Sentry in production mode without context', async () => {
    const { logger } = await import('./logger')
    logger.error('String error')
    expect(Sentry.captureMessage).toHaveBeenCalledWith('String error', {
      level: 'error',
      contexts: undefined,
    })
  })

  it('should send performance metrics to Sentry as breadcrumbs in production with context', async () => {
    const { logger } = await import('./logger')
    logger.performance('api-call', 250, { endpoint: '/api/test' })
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'performance',
      message: 'api-call took 250ms',
      level: 'info',
      data: { durationMs: 250, endpoint: '/api/test' },
    })
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('should send performance metrics to Sentry as breadcrumbs in production without context', async () => {
    const { logger } = await import('./logger')
    logger.performance('render', 50)
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'performance',
      message: 'render took 50ms',
      level: 'info',
      data: { durationMs: 50 },
    })
  })

  it('should not call console.group in production mode', async () => {
    const { logger } = await import('./logger')
    logger.group('Test Group')
    expect(consoleGroupSpy).not.toHaveBeenCalled()
  })

  it('should not call console.groupEnd in production mode', async () => {
    const { logger } = await import('./logger')
    logger.groupEnd()
    expect(consoleGroupEndSpy).not.toHaveBeenCalled()
  })

  it('should not call console.time in production mode', async () => {
    const { logger } = await import('./logger')
    logger.time('test-timer')
    expect(consoleTimeSpy).not.toHaveBeenCalled()
  })

  it('should not call console.timeEnd in production mode', async () => {
    const { logger } = await import('./logger')
    logger.timeEnd('test-timer')
    expect(consoleTimeEndSpy).not.toHaveBeenCalled()
  })
})

describe('createLogger factory', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('should export createLogger function', async () => {
    const loggerModule = await import('./logger')
    expect(loggerModule).toHaveProperty('createLogger')
    expect(typeof loggerModule.createLogger).toBe('function')
  })

  it('should create a new logger instance', async () => {
    const { createLogger } = await import('./logger')
    const customLogger = createLogger()
    expect(customLogger).toBeDefined()
    expect(customLogger).toHaveProperty('debug')
    expect(customLogger).toHaveProperty('info')
    expect(customLogger).toHaveProperty('warn')
    expect(customLogger).toHaveProperty('error')
    expect(customLogger).toHaveProperty('performance')
    expect(customLogger).toHaveProperty('group')
    expect(customLogger).toHaveProperty('groupEnd')
    expect(customLogger).toHaveProperty('time')
    expect(customLogger).toHaveProperty('timeEnd')
  })

  it('should create independent logger instances', async () => {
    const { createLogger } = await import('./logger')
    const logger1 = createLogger()
    const logger2 = createLogger()
    expect(logger1).not.toBe(logger2)
  })

  it('should create logger with development behavior when NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development'
    vi.resetModules()
    const { createLogger } = await import('./logger')
    const customLogger = createLogger()

    customLogger.debug('Test debug')
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test debug', '')
  })

  it('should create logger with production behavior when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production'
    vi.resetModules()
    const { createLogger } = await import('./logger')
    const customLogger = createLogger()

    customLogger.warn('Test warning')
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Test warning', {
      level: 'warning',
      contexts: undefined,
    })
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })
})

describe('measureAsync - Production Mode', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('should send performance metrics to Sentry in production', async () => {
    const { measureAsync } = await import('./logger')
    const operation = vi.fn().mockResolvedValue('success')

    await measureAsync('prod-operation', operation, { env: 'prod' })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'performance',
      message: expect.stringContaining('prod-operation took'),
      level: 'info',
      data: expect.objectContaining({
        durationMs: expect.any(Number),
        env: 'prod',
      }),
    })
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('should send errors to Sentry in production', async () => {
    const { measureAsync } = await import('./logger')
    const error = new Error('Production async error')
    const operation = vi.fn().mockRejectedValue(error)

    await expect(measureAsync('prod-error', operation)).rejects.toThrow('Production async error')

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: expect.objectContaining({
        custom: expect.objectContaining({
          operation: 'prod-error',
          duration: expect.any(Number),
        }),
      }),
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})

describe('measureSync - Production Mode', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  it('should send performance metrics to Sentry in production', async () => {
    const { measureSync } = await import('./logger')
    const operation = vi.fn().mockReturnValue('success')

    measureSync('prod-sync-operation', operation, { type: 'compute' })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'performance',
      message: expect.stringContaining('prod-sync-operation took'),
      level: 'info',
      data: expect.objectContaining({
        durationMs: expect.any(Number),
        type: 'compute',
      }),
    })
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('should send errors to Sentry in production', async () => {
    const { measureSync } = await import('./logger')
    const error = new Error('Production sync error')
    const operation = vi.fn().mockImplementation(() => {
      throw error
    })

    expect(() => measureSync('prod-sync-error', operation)).toThrow('Production sync error')

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      contexts: expect.objectContaining({
        custom: expect.objectContaining({
          operation: 'prod-sync-error',
          duration: expect.any(Number),
        }),
      }),
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
