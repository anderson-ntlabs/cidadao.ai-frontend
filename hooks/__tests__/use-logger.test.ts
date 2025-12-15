import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLogger, useComponentLogger } from '../use-logger'

// Mock the logger module
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn((context: string) => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    context,
  })),
}))

describe('useLogger', () => {
  it('returns a logger instance', () => {
    const { result } = renderHook(() => useLogger('TestComponent'))
    expect(result.current).toBeDefined()
  })

  it('creates logger with provided context', () => {
    const { result } = renderHook(() => useLogger('MyContext'))
    expect(result.current.context).toBe('MyContext')
  })

  it('memoizes logger for same context', () => {
    const { result, rerender } = renderHook(({ context }) => useLogger(context), {
      initialProps: { context: 'Test' },
    })
    const firstLogger = result.current

    rerender({ context: 'Test' })
    expect(result.current).toBe(firstLogger)
  })

  it('creates new logger when context changes', () => {
    const { result, rerender } = renderHook(({ context }) => useLogger(context), {
      initialProps: { context: 'First' },
    })
    const firstLogger = result.current

    rerender({ context: 'Second' })
    expect(result.current).not.toBe(firstLogger)
    expect(result.current.context).toBe('Second')
  })

  it('logger has expected methods', () => {
    const { result } = renderHook(() => useLogger('Test'))
    expect(typeof result.current.debug).toBe('function')
    expect(typeof result.current.info).toBe('function')
    expect(typeof result.current.warn).toBe('function')
    expect(typeof result.current.error).toBe('function')
  })
})

describe('useComponentLogger', () => {
  it('returns a logger instance', () => {
    const { result } = renderHook(() => useComponentLogger('TestComponent'))
    expect(result.current).toBeDefined()
  })

  it('creates logger with component name', () => {
    const { result } = renderHook(() => useComponentLogger('Header'))
    expect(result.current.context).toBe('Header')
  })

  it('logs debug on mount', () => {
    const { result } = renderHook(() => useComponentLogger('TestComponent'))
    expect(result.current.debug).toHaveBeenCalledWith('Component mounted')
  })
})
