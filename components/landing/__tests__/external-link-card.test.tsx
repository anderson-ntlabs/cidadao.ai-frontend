/**
 * Tests for ExternalLinkCard component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExternalLinkCard } from '../external-link-card'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, target, rel, className, ...props }: any) => (
    <a href={href} target={target} rel={rel} className={className} {...props}>
      {children}
    </a>
  ),
}))

describe('ExternalLinkCard', () => {
  const defaultProps = {
    icon: '📖',
    title: 'Documentation',
    description: 'View the API documentation',
    href: 'https://docs.example.com',
  }

  describe('Rendering', () => {
    it('renders icon', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      expect(screen.getByText('📖')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      expect(screen.getByText('Documentation')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      expect(screen.getByText('View the API documentation')).toBeInTheDocument()
    })

    it('renders icon with accessibility label', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      const iconElement = screen.getByRole('img', { name: 'Documentation' })
      expect(iconElement).toBeInTheDocument()
    })
  })

  describe('Link Behavior', () => {
    it('renders as external link', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://docs.example.com')
    })

    it('opens in new tab', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('has security attributes', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('has correct aria-label', () => {
      render(<ExternalLinkCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-label', 'Documentation - Abrir em nova aba')
    })
  })

  describe('External Link Icon', () => {
    it('renders external link icon', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      // Lucide icon renders as SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('has hover scale effect', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('hover:scale-105')
    })

    it('has active scale effect', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('active:scale-95')
    })

    it('has touch manipulation', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('touch-manipulation')
    })

    it('has focus ring styles', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:ring-2')
      expect(link?.className).toContain('focus:ring-green-500')
    })

    it('has backdrop blur', () => {
      const { container } = render(<ExternalLinkCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('backdrop-blur-sm')
    })
  })

  describe('Different Content', () => {
    it('renders GitHub link', () => {
      render(
        <ExternalLinkCard
          icon="💻"
          title="GitHub"
          description="View source code"
          href="https://github.com/example"
        />
      )

      expect(screen.getByText('GitHub')).toBeInTheDocument()
      expect(screen.getByText('View source code')).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/example')
    })

    it('renders API link', () => {
      render(
        <ExternalLinkCard
          icon="🔌"
          title="API"
          description="Access our REST API"
          href="https://api.example.com"
        />
      )

      expect(screen.getByText('API')).toBeInTheDocument()
      expect(screen.getByText('Access our REST API')).toBeInTheDocument()
    })
  })
})
