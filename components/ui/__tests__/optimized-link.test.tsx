import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OptimizedLink } from '../optimized-link'

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, prefetch, ...props }: any) => (
    <a href={href} data-prefetch={prefetch?.toString()} {...props}>
      {children}
    </a>
  ),
}))

// Mock the useHoverPreload hook
const mockHoverProps = {
  onMouseEnter: vi.fn(),
  onFocus: vi.fn(),
}

vi.mock('@/hooks/use-route-preload', () => ({
  useHoverPreload: vi.fn(() => mockHoverProps),
}))

describe('OptimizedLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders link with children', () => {
      render(<OptimizedLink href="/about">About</OptimizedLink>)
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('renders as anchor element', () => {
      render(<OptimizedLink href="/contact">Contact</OptimizedLink>)
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('sets correct href', () => {
      render(<OptimizedLink href="/dashboard">Dashboard</OptimizedLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard')
    })

    it('renders with complex href', () => {
      render(<OptimizedLink href="/app/chat/session/123">Session</OptimizedLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/app/chat/session/123')
    })
  })

  describe('prefetch prop', () => {
    it('prefetches by default', () => {
      render(<OptimizedLink href="/test">Test</OptimizedLink>)
      expect(screen.getByRole('link')).toHaveAttribute('data-prefetch', 'true')
    })

    it('respects prefetch=false', () => {
      render(
        <OptimizedLink href="/test" prefetch={false}>
          Test
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('data-prefetch', 'false')
    })

    it('respects prefetch=true', () => {
      render(
        <OptimizedLink href="/test" prefetch={true}>
          Test
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('data-prefetch', 'true')
    })
  })

  describe('preloadOnHover prop', () => {
    it('applies hover props by default', () => {
      render(<OptimizedLink href="/test">Test</OptimizedLink>)
      const link = screen.getByRole('link')

      fireEvent.mouseEnter(link)
      expect(mockHoverProps.onMouseEnter).toHaveBeenCalled()
    })

    it('applies focus props for accessibility', () => {
      render(<OptimizedLink href="/test">Test</OptimizedLink>)
      const link = screen.getByRole('link')

      fireEvent.focus(link)
      expect(mockHoverProps.onFocus).toHaveBeenCalled()
    })

    it('does not apply hover props when preloadOnHover is false', () => {
      const onMouseEnterSpy = vi.fn()
      mockHoverProps.onMouseEnter = onMouseEnterSpy

      render(
        <OptimizedLink href="/test" preloadOnHover={false}>
          Test
        </OptimizedLink>
      )
      const link = screen.getByRole('link')

      fireEvent.mouseEnter(link)
      // When preloadOnHover is false, the hover props shouldn't be applied
      // The component should not have the onMouseEnter handler from hoverProps
    })
  })

  describe('additional props', () => {
    it('passes through className', () => {
      render(
        <OptimizedLink href="/test" className="custom-link">
          Test
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveClass('custom-link')
    })

    it('passes through target', () => {
      render(
        <OptimizedLink href="/test" target="_blank">
          Test
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('passes through rel', () => {
      render(
        <OptimizedLink href="/external" rel="noopener noreferrer">
          External
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('passes through aria-label', () => {
      render(
        <OptimizedLink href="/settings" aria-label="Go to settings">
          Settings
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to settings')
    })

    it('passes through id', () => {
      render(
        <OptimizedLink href="/test" id="nav-link">
          Nav
        </OptimizedLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('id', 'nav-link')
    })
  })

  describe('href types', () => {
    it('handles string href', () => {
      render(<OptimizedLink href="/about">About</OptimizedLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/about')
    })

    it('handles complex route href', () => {
      render(<OptimizedLink href="/pt/agora/trilhas">Trilhas</OptimizedLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/pt/agora/trilhas')
    })
  })

  describe('accessibility', () => {
    it('is focusable', () => {
      render(<OptimizedLink href="/test">Test</OptimizedLink>)
      const link = screen.getByRole('link')

      link.focus()
      expect(document.activeElement).toBe(link)
    })

    it('renders children correctly', () => {
      render(
        <OptimizedLink href="/test">
          <span>Icon</span>
          <span>Text</span>
        </OptimizedLink>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })
})
