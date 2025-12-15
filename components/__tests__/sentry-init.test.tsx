import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { SentryInit } from '../sentry-init'

// Mock the Sentry config
const mockInitSentry = vi.fn()
vi.mock('@/lib/monitoring/sentry.config', () => ({
  initSentry: () => mockInitSentry(),
}))

describe('SentryInit', () => {
  beforeEach(() => {
    mockInitSentry.mockClear()
  })

  it('renders nothing visible', () => {
    const { container } = render(<SentryInit />)
    expect(container.firstChild).toBeNull()
  })

  it('calls initSentry on mount', () => {
    render(<SentryInit />)
    expect(mockInitSentry).toHaveBeenCalledTimes(1)
  })

  it('only calls initSentry once', () => {
    const { rerender } = render(<SentryInit />)
    rerender(<SentryInit />)
    expect(mockInitSentry).toHaveBeenCalledTimes(1)
  })
})
