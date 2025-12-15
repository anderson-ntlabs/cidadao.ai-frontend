/**
 * Tests for ContentCard component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentCard } from '../content-card'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}))

describe('ContentCard', () => {
  const defaultProps = {
    icon: '📚',
    title: 'Test Title',
    description: 'Test description text',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders icon', () => {
      render(<ContentCard {...defaultProps} />)

      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<ContentCard {...defaultProps} />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<ContentCard {...defaultProps} />)

      expect(screen.getByText('Test description text')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<ContentCard {...defaultProps} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('renders icon with accessibility label', () => {
      render(<ContentCard {...defaultProps} />)

      const iconElement = screen.getByRole('img', { name: 'Test Title' })
      expect(iconElement).toBeInTheDocument()
    })
  })

  describe('Button Mode (onClick)', () => {
    it('renders as button when onClick provided', () => {
      const onClick = vi.fn()

      render(<ContentCard {...defaultProps} onClick={onClick} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()

      render(<ContentCard {...defaultProps} onClick={onClick} />)

      await user.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalled()
    })

    it('has correct aria-label for button', () => {
      const onClick = vi.fn()

      render(<ContentCard {...defaultProps} onClick={onClick} />)

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open Test Title')
    })

    it('shows "Click to learn more" hint', () => {
      render(<ContentCard {...defaultProps} onClick={() => {}} />)

      expect(screen.getByText('Click to learn more →')).toBeInTheDocument()
    })
  })

  describe('Link Mode (href)', () => {
    it('renders as link when href provided', () => {
      render(<ContentCard {...defaultProps} href="/test-link" />)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test-link')
    })

    it('has correct aria-label for link', () => {
      render(<ContentCard {...defaultProps} href="/test-link" />)

      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to Test Title')
    })

    it('shows "Click to access" hint for links', () => {
      render(<ContentCard {...defaultProps} href="/test-link" />)

      expect(screen.getByText('Click to access →')).toBeInTheDocument()
    })
  })

  describe('Gradient Styling', () => {
    it('applies default gradient', () => {
      const { container } = render(<ContentCard {...defaultProps} onClick={() => {}} />)

      const gradientOverlay = container.querySelector('.bg-gradient-to-br')
      expect(gradientOverlay?.className).toContain('from-green-500')
      expect(gradientOverlay?.className).toContain('to-blue-600')
    })

    it('applies custom gradient', () => {
      const { container } = render(
        <ContentCard {...defaultProps} onClick={() => {}} gradient="from-purple-500 to-pink-600" />
      )

      const gradientOverlay = container.querySelector('.bg-gradient-to-br')
      expect(gradientOverlay?.className).toContain('from-purple-500')
      expect(gradientOverlay?.className).toContain('to-pink-600')
    })
  })

  describe('Styling Classes', () => {
    it('has hover scale effect class', () => {
      const { container } = render(<ContentCard {...defaultProps} onClick={() => {}} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('hover:scale-105')
    })

    it('has active scale effect class', () => {
      const { container } = render(<ContentCard {...defaultProps} onClick={() => {}} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('active:scale-95')
    })

    it('has touch manipulation class', () => {
      const { container } = render(<ContentCard {...defaultProps} onClick={() => {}} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('touch-manipulation')
    })

    it('has focus ring styles', () => {
      const { container } = render(<ContentCard {...defaultProps} onClick={() => {}} />)

      const button = container.querySelector('button')
      expect(button?.className).toContain('focus:ring-2')
      expect(button?.className).toContain('focus:ring-green-500')
    })
  })
})
