/**
 * Tests for RateLimitNotice component and useRateLimitNotice hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook } from '@testing-library/react'
import { RateLimitNotice, useRateLimitNotice } from '../rate-limit-notice'

// Mock dependencies
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

describe('RateLimitNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders title', () => {
      render(<RateLimitNotice retryAfter={60} />)

      expect(screen.getByText('Limite de requisições atingido')).toBeInTheDocument()
    })

    it('renders default message', () => {
      render(<RateLimitNotice retryAfter={60} />)

      expect(
        screen.getByText(
          'Você fez muitas requisições. Por favor, aguarde um momento antes de tentar novamente.'
        )
      ).toBeInTheDocument()
    })

    it('renders custom message', () => {
      render(<RateLimitNotice retryAfter={60} message="Custom message" />)

      expect(screen.getByText('Custom message')).toBeInTheDocument()
    })

    it('renders tip section', () => {
      render(<RateLimitNotice retryAfter={60} />)

      expect(screen.getByText(/Limites de requisição protegem/)).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<RateLimitNotice retryAfter={60} className="custom-class" />)

      const notice = container.firstChild as HTMLElement
      expect(notice.className).toContain('custom-class')
    })
  })

  describe('Timer Display', () => {
    it('displays seconds correctly', () => {
      render(<RateLimitNotice retryAfter={45} />)

      expect(screen.getByText('45 segundos')).toBeInTheDocument()
    })

    it('displays singular second', () => {
      render(<RateLimitNotice retryAfter={1} />)

      expect(screen.getByText('1 segundo')).toBeInTheDocument()
    })

    it('displays minutes correctly', () => {
      render(<RateLimitNotice retryAfter={120} />)

      expect(screen.getByText('2 minutos')).toBeInTheDocument()
    })

    it('displays singular minute', () => {
      render(<RateLimitNotice retryAfter={60} />)

      expect(screen.getByText('1 minuto')).toBeInTheDocument()
    })

    it('displays combined minutes and seconds', () => {
      render(<RateLimitNotice retryAfter={90} />)

      expect(screen.getByText('1min 30s')).toBeInTheDocument()
    })
  })

  describe('Countdown', () => {
    it('counts down every second', async () => {
      render(<RateLimitNotice retryAfter={5} />)

      expect(screen.getByText('5 segundos')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('4 segundos')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('3 segundos')).toBeInTheDocument()
    })

    it('shows ready message when countdown reaches zero', () => {
      render(<RateLimitNotice retryAfter={2} />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.getByText('Pronto para tentar novamente!')).toBeInTheDocument()
    })

    it('shows ready immediately when retryAfter is 0', () => {
      render(<RateLimitNotice retryAfter={0} />)

      expect(screen.getByText('Pronto para tentar novamente!')).toBeInTheDocument()
    })
  })

  describe('Retry Button', () => {
    it('hides retry button before countdown completes', () => {
      render(<RateLimitNotice retryAfter={60} onRetry={() => {}} />)

      expect(screen.queryByText('Tentar Novamente')).not.toBeInTheDocument()
    })

    it('shows retry button after countdown completes', () => {
      render(<RateLimitNotice retryAfter={1} onRetry={() => {}} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
    })

    it('hides retry button when no onRetry callback', () => {
      render(<RateLimitNotice retryAfter={0} />)

      expect(screen.queryByText('Tentar Novamente')).not.toBeInTheDocument()
    })

    it('calls onRetry when button clicked', async () => {
      const onRetry = vi.fn()
      vi.useRealTimers()
      const user = userEvent.setup()

      render(<RateLimitNotice retryAfter={0} onRetry={onRetry} />)

      await user.click(screen.getByText('Tentar Novamente'))

      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling', () => {
    it('has orange border styling', () => {
      const { container } = render(<RateLimitNotice retryAfter={60} />)

      const notice = container.firstChild as HTMLElement
      expect(notice.className).toContain('border-orange-200')
    })

    it('has orange background styling', () => {
      const { container } = render(<RateLimitNotice retryAfter={60} />)

      const notice = container.firstChild as HTMLElement
      expect(notice.className).toContain('bg-orange-50')
    })

    it('has rounded corners', () => {
      const { container } = render(<RateLimitNotice retryAfter={60} />)

      const notice = container.firstChild as HTMLElement
      expect(notice.className).toContain('rounded-lg')
    })
  })
})

describe('useRateLimitNotice', () => {
  describe('Initial State', () => {
    it('starts with not rate limited', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      expect(result.current.isRateLimited).toBe(false)
      expect(result.current.retryAfter).toBe(0)
    })
  })

  describe('handleRateLimitError', () => {
    it('handles Response object with 429 status', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      const mockResponse = new Response(null, {
        status: 429,
        headers: { 'Retry-After': '30' },
      })

      act(() => {
        const handled = result.current.handleRateLimitError(mockResponse)
        expect(handled).toBe(true)
      })

      expect(result.current.isRateLimited).toBe(true)
      expect(result.current.retryAfter).toBe(30)
    })

    it('handles object with status 429 and retryAfter', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      act(() => {
        const handled = result.current.handleRateLimitError({
          status: 429,
          retryAfter: 45,
        })
        expect(handled).toBe(true)
      })

      expect(result.current.isRateLimited).toBe(true)
      expect(result.current.retryAfter).toBe(45)
    })

    it('uses default 60 seconds when retryAfter not provided', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      act(() => {
        result.current.handleRateLimitError({ status: 429 })
      })

      expect(result.current.retryAfter).toBe(60)
    })

    it('returns false for non-429 errors', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      act(() => {
        const handled = result.current.handleRateLimitError({ status: 500 })
        expect(handled).toBe(false)
      })

      expect(result.current.isRateLimited).toBe(false)
    })

    it('returns false for null error', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      act(() => {
        const handled = result.current.handleRateLimitError(null)
        expect(handled).toBe(false)
      })
    })

    it('returns false for string error', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      act(() => {
        const handled = result.current.handleRateLimitError('Error message')
        expect(handled).toBe(false)
      })
    })
  })

  describe('resetRateLimit', () => {
    it('resets rate limit state', () => {
      const { result } = renderHook(() => useRateLimitNotice())

      // First set rate limited
      act(() => {
        result.current.handleRateLimitError({ status: 429, retryAfter: 30 })
      })

      expect(result.current.isRateLimited).toBe(true)

      // Then reset
      act(() => {
        result.current.resetRateLimit()
      })

      expect(result.current.isRateLimited).toBe(false)
      expect(result.current.retryAfter).toBe(0)
    })
  })
})
