import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationBadge } from '../notification-badge'

describe('NotificationBadge', () => {
  describe('rendering', () => {
    it('renders count when positive', () => {
      render(<NotificationBadge count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('returns null when count is 0', () => {
      const { container } = render(<NotificationBadge count={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('returns null when count is negative', () => {
      const { container } = render(<NotificationBadge count={-1} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders as span element', () => {
      render(<NotificationBadge count={3} />)
      const badge = screen.getByText('3')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('max limit', () => {
    it('displays count when below default max', () => {
      render(<NotificationBadge count={50} />)
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('displays 99+ when exceeding default max', () => {
      render(<NotificationBadge count={100} />)
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('displays count at default max boundary', () => {
      render(<NotificationBadge count={99} />)
      expect(screen.getByText('99')).toBeInTheDocument()
    })

    it('uses custom max value', () => {
      render(<NotificationBadge count={10} max={5} />)
      expect(screen.getByText('5+')).toBeInTheDocument()
    })

    it('displays count below custom max', () => {
      render(<NotificationBadge count={3} max={5} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('handles large custom max', () => {
      render(<NotificationBadge count={999} max={1000} />)
      expect(screen.getByText('999')).toBeInTheDocument()
    })

    it('displays max+ for large counts', () => {
      render(<NotificationBadge count={5000} max={999} />)
      expect(screen.getByText('999+')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('has absolute positioning', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('absolute')
    })

    it('has red background', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('bg-red-500')
    })

    it('has white text', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('text-white')
    })

    it('has rounded-full for pill shape', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('rounded-full')
    })

    it('has font-bold', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('font-bold')
    })

    it('has animation classes', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('animate-in', 'zoom-in-50')
    })
  })

  describe('className prop', () => {
    it('applies custom className', () => {
      render(<NotificationBadge count={1} className="custom-badge" />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('custom-badge')
    })

    it('merges with default classes', () => {
      render(<NotificationBadge count={1} className="custom-class" />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('custom-class', 'absolute', 'bg-red-500')
    })
  })

  describe('positioning', () => {
    it('has negative top offset', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('-top-1')
    })

    it('has negative right offset', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('-right-1')
    })
  })

  describe('sizing', () => {
    it('has minimum width', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('min-w-[20px]')
    })

    it('has fixed height', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('h-5')
    })

    it('has horizontal padding', () => {
      render(<NotificationBadge count={1} />)
      const badge = screen.getByText('1')
      expect(badge).toHaveClass('px-1.5')
    })
  })
})
