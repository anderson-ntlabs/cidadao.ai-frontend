import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { Announcer, useAnnouncer } from '../announcer'

describe('Announcer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders with status role', () => {
      render(<Announcer message="Test message" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has sr-only class for screen readers only', () => {
      render(<Announcer message="Test" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveClass('sr-only')
    })

    it('has aria-atomic attribute', () => {
      render(<Announcer message="Test" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveAttribute('aria-atomic', 'true')
    })
  })

  describe('priority', () => {
    it('uses polite aria-live by default', () => {
      render(<Announcer message="Test" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveAttribute('aria-live', 'polite')
    })

    it('uses assertive aria-live when specified', () => {
      render(<Announcer message="Test" priority="assertive" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('message announcement', () => {
    it('announces message after delay', () => {
      render(<Announcer message="Hello world" />)
      const announcer = screen.getByRole('status')

      // Initially empty
      expect(announcer).toHaveTextContent('')

      // After delay, message appears
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(announcer).toHaveTextContent('Hello world')
    })

    it('re-announces when message changes', () => {
      const { rerender } = render(<Announcer message="First" />)

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(screen.getByRole('status')).toHaveTextContent('First')

      rerender(<Announcer message="Second" />)

      // Clears first
      expect(screen.getByRole('status')).toHaveTextContent('')

      // Then announces new message
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(screen.getByRole('status')).toHaveTextContent('Second')
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      render(<Announcer message="Test" className="custom-announcer" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveClass('custom-announcer')
    })

    it('keeps sr-only with custom className', () => {
      render(<Announcer message="Test" className="custom" />)
      const announcer = screen.getByRole('status')
      expect(announcer).toHaveClass('sr-only', 'custom')
    })
  })
})

describe('useAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    // Clean up any announcements left in body
    document.body.querySelectorAll('[role="status"]').forEach((el) => el.remove())
  })

  it('returns announce function', () => {
    const { result } = renderHook(() => useAnnouncer())
    expect(typeof result.current.announce).toBe('function')
  })

  it('creates announcement element in body', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test announcement')
    })

    const announcement = document.body.querySelector('[role="status"]')
    expect(announcement).toBeInTheDocument()
    expect(announcement).toHaveTextContent('Test announcement')
  })

  it('announcement has sr-only class', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test')
    })

    const announcement = document.body.querySelector('[role="status"]')
    expect(announcement).toHaveClass('sr-only')
  })

  it('uses polite priority by default', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Test')
    })

    const announcement = document.body.querySelector('[role="status"]')
    expect(announcement).toHaveAttribute('aria-live', 'polite')
  })

  it('uses assertive priority when specified', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Urgent!', 'assertive')
    })

    const announcement = document.body.querySelector('[role="status"]')
    expect(announcement).toHaveAttribute('aria-live', 'assertive')
  })

  it('removes announcement after timeout', () => {
    const { result } = renderHook(() => useAnnouncer())

    act(() => {
      result.current.announce('Temporary')
    })

    expect(document.body.querySelector('[role="status"]')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(document.body.querySelector('[role="status"]')).not.toBeInTheDocument()
  })
})
