/**
 * Tests for HeaderActions component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeaderActions } from '../header-actions'

// Mock dependencies
vi.mock('../../ui/button', () => ({
  Button: ({ children, onClick, className, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} className={className} data-testid={testId} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('../../ui/notification-dropdown', () => ({
  NotificationDropdown: ({ locale }: any) => (
    <div data-testid="notification-dropdown" data-locale={locale}>
      Notifications
    </div>
  ),
}))

vi.mock('../../theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}))

vi.mock('../../language-selector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language</div>,
}))

describe('HeaderActions', () => {
  const defaultProps = {
    locale: 'pt' as const,
    isPublicPage: true,
    isLandingPage: false,
    isMenuOpen: false,
    onMenuToggle: vi.fn(),
    showMobileMenu: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders theme toggle', () => {
      render(<HeaderActions {...defaultProps} />)

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })

    it('renders notification dropdown when not on landing page', () => {
      render(<HeaderActions {...defaultProps} isLandingPage={false} />)

      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
    })

    it('hides notification dropdown on landing page', () => {
      render(<HeaderActions {...defaultProps} isLandingPage={true} />)

      expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument()
    })

    it('renders language selector on public pages', () => {
      render(<HeaderActions {...defaultProps} isPublicPage={true} />)

      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
    })

    it('hides language selector on non-public pages', () => {
      render(<HeaderActions {...defaultProps} isPublicPage={false} />)

      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument()
    })
  })

  describe('Mobile Menu Button', () => {
    it('renders mobile menu button when showMobileMenu is true', () => {
      render(<HeaderActions {...defaultProps} showMobileMenu={true} />)

      expect(screen.getByTestId('mobile-menu-trigger')).toBeInTheDocument()
    })

    it('hides mobile menu button when showMobileMenu is false', () => {
      render(<HeaderActions {...defaultProps} showMobileMenu={false} />)

      expect(screen.queryByTestId('mobile-menu-trigger')).not.toBeInTheDocument()
    })

    it('calls onMenuToggle when mobile menu button clicked', async () => {
      const onMenuToggle = vi.fn()
      const user = userEvent.setup()

      render(<HeaderActions {...defaultProps} onMenuToggle={onMenuToggle} showMobileMenu={true} />)

      await user.click(screen.getByTestId('mobile-menu-trigger'))

      expect(onMenuToggle).toHaveBeenCalledTimes(1)
    })

    it('shows close icon when menu is open', () => {
      render(<HeaderActions {...defaultProps} isMenuOpen={true} showMobileMenu={true} />)

      const menuButton = screen.getByTestId('mobile-menu-trigger')
      expect(menuButton).toHaveAttribute('aria-label', 'Close menu')
    })

    it('shows open icon when menu is closed', () => {
      render(<HeaderActions {...defaultProps} isMenuOpen={false} showMobileMenu={true} />)

      const menuButton = screen.getByTestId('mobile-menu-trigger')
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu')
    })
  })

  describe('Locale', () => {
    it('passes PT locale to notification dropdown', () => {
      render(<HeaderActions {...defaultProps} locale="pt" />)

      const dropdown = screen.getByTestId('notification-dropdown')
      expect(dropdown).toHaveAttribute('data-locale', 'pt')
    })

    it('passes EN locale to notification dropdown', () => {
      render(<HeaderActions {...defaultProps} locale="en" />)

      const dropdown = screen.getByTestId('notification-dropdown')
      expect(dropdown).toHaveAttribute('data-locale', 'en')
    })
  })

  describe('Styling', () => {
    it('has flex layout', () => {
      const { container } = render(<HeaderActions {...defaultProps} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('items-center')
    })

    it('has gap between items', () => {
      const { container } = render(<HeaderActions {...defaultProps} />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('gap-2')
    })

    it('mobile menu button has lg:hidden class', () => {
      render(<HeaderActions {...defaultProps} showMobileMenu={true} />)

      const menuButton = screen.getByTestId('mobile-menu-trigger')
      expect(menuButton.className).toContain('lg:hidden')
    })
  })

  describe('Different Configurations', () => {
    it('shows all items on public non-landing page', () => {
      render(
        <HeaderActions
          {...defaultProps}
          isPublicPage={true}
          isLandingPage={false}
          showMobileMenu={true}
        />
      )

      expect(screen.getByTestId('language-selector')).toBeInTheDocument()
      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument()
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-menu-trigger')).toBeInTheDocument()
    })

    it('hides language and notifications on private landing page', () => {
      render(
        <HeaderActions
          {...defaultProps}
          isPublicPage={false}
          isLandingPage={true}
          showMobileMenu={false}
        />
      )

      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument()
      expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument()
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      expect(screen.queryByTestId('mobile-menu-trigger')).not.toBeInTheDocument()
    })
  })
})
