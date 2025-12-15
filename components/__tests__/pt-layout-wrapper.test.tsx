/**
 * Tests for PTLayoutWrapper component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PTLayoutWrapper } from '../pt-layout-wrapper'

// Mock dependencies
const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt'),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

vi.mock('@/components/header', () => ({
  Header: ({ locale, navigationItems }: any) => (
    <header data-testid="full-header">
      <span data-testid="header-locale">{locale}</span>
      <span data-testid="nav-items">{navigationItems?.length}</span>
    </header>
  ),
}))

vi.mock('@/components/landing', () => ({
  SimplifiedHeader: ({ locale }: any) => (
    <header data-testid="simplified-header">
      <span data-testid="simplified-locale">{locale}</span>
    </header>
  ),
}))

vi.mock('@/components/footer-with-survey', () => ({
  FooterWithSurvey: ({ locale }: any) => (
    <footer data-testid="footer">
      <span data-testid="footer-locale">{locale}</span>
    </footer>
  ),
}))

describe('PTLayoutWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt')
  })

  describe('Landing Page', () => {
    it('uses SimplifiedHeader on landing page', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
    })

    it('uses SimplifiedHeader on EN landing page', () => {
      mockUsePathname.mockReturnValue('/en')

      render(
        <PTLayoutWrapper locale="en">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
    })

    it('uses SimplifiedHeader with trailing slash', () => {
      mockUsePathname.mockReturnValue('/pt/')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
    })

    it('shows footer on landing page', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('Login Page', () => {
    it('uses SimplifiedHeader on login page', () => {
      mockUsePathname.mockReturnValue('/pt/login')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
    })

    it('uses SimplifiedHeader on EN login page', () => {
      mockUsePathname.mockReturnValue('/en/login')

      render(
        <PTLayoutWrapper locale="en">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
    })

    it('uses SimplifiedHeader on login page with trailing slash', () => {
      mockUsePathname.mockReturnValue('/pt/login/')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('simplified-header')).toBeInTheDocument()
    })
  })

  describe('Public Pages', () => {
    it('uses full Header on about page', () => {
      mockUsePathname.mockReturnValue('/pt/about')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('full-header')).toBeInTheDocument()
      expect(screen.queryByTestId('simplified-header')).not.toBeInTheDocument()
    })

    it('uses full Header on agents page', () => {
      mockUsePathname.mockReturnValue('/pt/agents')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('full-header')).toBeInTheDocument()
    })

    it('shows footer on public pages', () => {
      mockUsePathname.mockReturnValue('/pt/about')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('passes correct locale to header', () => {
      mockUsePathname.mockReturnValue('/pt/about')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('header-locale')).toHaveTextContent('pt')
    })

    it('passes navigation items to header', () => {
      mockUsePathname.mockReturnValue('/pt/about')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      // PT has 5 navigation items
      expect(screen.getByTestId('nav-items')).toHaveTextContent('5')
    })
  })

  describe('Authenticated Routes', () => {
    it('hides header on /app/ route', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('simplified-header')).not.toBeInTheDocument()
    })

    it('hides footer on authenticated routes', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
    })

    it('hides header on chat route', () => {
      mockUsePathname.mockReturnValue('/pt/chat')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
    })

    it('hides header on profile route', () => {
      mockUsePathname.mockReturnValue('/pt/perfil')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
    })

    it('hides header on settings route', () => {
      mockUsePathname.mockReturnValue('/pt/settings')

      render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
    })
  })

  describe('Agora Routes', () => {
    it('has standalone layout for agora routes', () => {
      mockUsePathname.mockReturnValue('/pt/agora/dashboard')

      render(
        <PTLayoutWrapper locale="pt">
          <div data-testid="content">Content</div>
        </PTLayoutWrapper>
      )

      // No header or footer on agora routes
      expect(screen.queryByTestId('full-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('simplified-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument()

      // But content is rendered
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('renders main with correct role for agora', () => {
      mockUsePathname.mockReturnValue('/pt/agora/tracks')

      const { container } = render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      const main = container.querySelector('main')
      expect(main).toHaveAttribute('role', 'main')
    })
  })

  describe('Children Rendering', () => {
    it('renders children content', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(
        <PTLayoutWrapper locale="pt">
          <div data-testid="child-content">Child Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('main has correct id', () => {
      mockUsePathname.mockReturnValue('/pt')

      const { container } = render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      const main = container.querySelector('main')
      expect(main).toHaveAttribute('id', 'main-content')
    })

    it('main has role attribute', () => {
      mockUsePathname.mockReturnValue('/pt')

      const { container } = render(
        <PTLayoutWrapper locale="pt">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      const main = container.querySelector('main')
      expect(main).toHaveAttribute('role', 'main')
    })
  })

  describe('EN Locale Navigation', () => {
    it('uses EN navigation items', () => {
      mockUsePathname.mockReturnValue('/en/about')

      render(
        <PTLayoutWrapper locale="en">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      // EN also has 5 navigation items
      expect(screen.getByTestId('nav-items')).toHaveTextContent('5')
    })

    it('passes EN locale to footer', () => {
      mockUsePathname.mockReturnValue('/en/about')

      render(
        <PTLayoutWrapper locale="en">
          <div>Content</div>
        </PTLayoutWrapper>
      )

      expect(screen.getByTestId('footer-locale')).toHaveTextContent('en')
    })
  })
})
