import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SkipLink, SkipLinks } from '../skip-link'

describe('SkipLink', () => {
  describe('rendering', () => {
    it('renders link with children', () => {
      render(<SkipLink href="#main">Skip to content</SkipLink>)
      expect(screen.getByText('Skip to content')).toBeInTheDocument()
    })

    it('renders as anchor element', () => {
      render(<SkipLink href="#main">Skip</SkipLink>)
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('has correct href', () => {
      render(<SkipLink href="#navigation">Skip nav</SkipLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '#navigation')
    })

    it('has sr-only class for screen readers', () => {
      render(<SkipLink href="#main">Skip</SkipLink>)
      expect(screen.getByRole('link')).toHaveClass('sr-only')
    })

    it('has focus styles for visibility', () => {
      render(<SkipLink href="#main">Skip</SkipLink>)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('focus:not-sr-only')
    })
  })
})

describe('SkipLinks', () => {
  beforeEach(() => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/pt/app' },
      writable: true,
    })
  })

  describe('rendering', () => {
    it('renders skip links container', () => {
      render(<SkipLinks />)
      expect(document.querySelector('.skip-links')).toBeInTheDocument()
    })

    it('renders main content link', () => {
      render(<SkipLinks />)
      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument()
    })

    it('renders navigation link', () => {
      render(<SkipLinks />)
      expect(screen.getByText('Pular para a navegação')).toBeInTheDocument()
    })

    it('renders footer link', () => {
      render(<SkipLinks />)
      expect(screen.getByText('Pular para o rodapé')).toBeInTheDocument()
    })
  })

  describe('conditional links', () => {
    it('shows dashboard metrics link on dashboard page', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/pt/app/dashboard' },
        writable: true,
      })

      render(<SkipLinks />)

      // Need to wait for useEffect
      act(() => {})

      expect(screen.getByText('Pular para métricas')).toBeInTheDocument()
    })

    it('shows chat messages link on chat page', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/pt/app/chat' },
        writable: true,
      })

      render(<SkipLinks />)

      act(() => {})

      expect(screen.getByText('Pular para mensagens')).toBeInTheDocument()
    })

    it('does not show metrics link on non-dashboard pages', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/pt/app' },
        writable: true,
      })

      render(<SkipLinks />)

      act(() => {})

      expect(screen.queryByText('Pular para métricas')).not.toBeInTheDocument()
    })

    it('does not show messages link on non-chat pages', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/pt/app/dashboard' },
        writable: true,
      })

      render(<SkipLinks />)

      act(() => {})

      expect(screen.queryByText('Pular para mensagens')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('links have correct href anchors', () => {
      render(<SkipLinks />)

      const mainLink = screen.getByText('Pular para o conteúdo principal')
      expect(mainLink).toHaveAttribute('href', '#main-content')

      const navLink = screen.getByText('Pular para a navegação')
      expect(navLink).toHaveAttribute('href', '#main-navigation')

      const footerLink = screen.getByText('Pular para o rodapé')
      expect(footerLink).toHaveAttribute('href', '#footer')
    })

    it('all links have sr-only class', () => {
      render(<SkipLinks />)

      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link).toHaveClass('sr-only')
      })
    })
  })
})
