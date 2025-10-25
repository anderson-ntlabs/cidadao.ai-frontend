import { describe, it, expect, vi, beforeEach } from 'vitest'
import { measureAsync, measureSync } from './logger'

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[PERF] fetch-data took'),
      { source: 'api' }
    )
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
      userId: '123'
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
      await new Promise(resolve => setTimeout(resolve, 100))
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
    const operation = vi.fn().mockImplementation(() => { throw error })

    expect(() => measureSync('failing-sync', operation)).toThrow('Sync operation failed')

    expect(consoleErrorSpy).toHaveBeenCalled()
    const errorCall = consoleErrorSpy.mock.calls[0]
    expect(errorCall[0]).toBe('[ERROR]')
    expect(errorCall[1]).toBe('Sync operation failed')
  })

  it('should include operation name and duration in error context', () => {
    const error = new Error('Failed')
    const operation = vi.fn().mockImplementation(() => { throw error })

    expect(() => measureSync('important-op', operation, { attempt: 1 })).toThrow()

    const errorContext = consoleErrorSpy.mock.calls[0][3]
    expect(errorContext).toMatchObject({
      operation: 'important-op',
      attempt: 1
    })
    expect(errorContext).toHaveProperty('duration')
    expect(typeof errorContext.duration).toBe('number')
  })

  it('should handle non-Error throws', () => {
    const operation = vi.fn().mockImplementation(() => { throw 'String error' })

    expect(() => measureSync('bad-sync', operation)).toThrow('String error')

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should return falsy values correctly', () => {
    const tests = [
      { value: 0, description: 'zero' },
      { value: false, description: 'false' },
      { value: '', description: 'empty string' },
      { value: null, description: 'null' },
      { value: undefined, description: 'undefined' }
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
    const innerOp = vi.fn().mockImplementation(() => { throw error })
    const outerOp = vi.fn().mockImplementation(async () => {
      return measureSync('inner-op', innerOp)
    })

    await expect(measureAsync('outer-op', outerOp)).rejects.toThrow('Inner error')

    // Should log error from inner operation
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
