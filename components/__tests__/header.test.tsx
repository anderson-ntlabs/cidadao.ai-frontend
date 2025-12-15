/**
 * Tests for Header component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeaderV2 } from '../header'
import type { NavigationItem } from '../navigation'

// Mock dependencies
const { mockUsePathname, mockPush } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt'),
  mockPush: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('../navigation', () => ({
  Navigation: ({ items }: any) => (
    <nav data-testid="mock-navigation">
      {items?.map((item: any) => (
        <a key={item.href} href={item.href}>
          {item.name}
        </a>
      ))}
    </nav>
  ),
}))

vi.mock('../header/header-logo', () => ({
  HeaderLogo: ({ href }: any) => (
    <a href={href} data-testid="header-logo">
      Logo
    </a>
  ),
}))

vi.mock('../header/header-user-menu', () => ({
  HeaderUserMenu: ({ user, locale, onLogout }: any) => (
    <div data-testid="header-user-menu">
      <span>{user?.name}</span>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}))

vi.mock('../header/header-mobile-menu', () => ({
  HeaderMobileMenu: ({ isOpen, onClose, navigationItems, locale }: any) => (
    <div data-testid="header-mobile-menu" data-open={isOpen}>
      <button onClick={onClose}>Close</button>
      {navigationItems?.map((item: any) => (
        <a key={item.href} href={item.href}>
          {item.name}
        </a>
      ))}
    </div>
  ),
}))

vi.mock('../header/header-actions', () => ({
  HeaderActions: ({ locale, isMenuOpen, onMenuToggle }: any) => (
    <div data-testid="header-actions">
      <button onClick={onMenuToggle} data-testid="menu-toggle">
        {isMenuOpen ? 'Close' : 'Open'} Menu
      </button>
    </div>
  ),
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('HeaderV2', () => {
  const defaultProps = {
    locale: 'pt' as const,
    user: { name: 'Test User', email: 'test@example.com' },
    navigationItems: [
      { name: 'Home', href: '/pt' },
      { name: 'About', href: '/pt/about' },
    ] as NavigationItem[],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt')
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders header element', () => {
      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders logo', () => {
      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByTestId('header-logo')).toBeInTheDocument()
    })

    it('renders navigation', () => {
      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByTestId('mock-navigation')).toBeInTheDocument()
    })

    it('renders actions', () => {
      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByTestId('header-actions')).toBeInTheDocument()
    })

    it('renders mobile menu', () => {
      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByTestId('header-mobile-menu')).toBeInTheDocument()
    })
  })

  describe('Logo href', () => {
    it('links to locale root on landing page', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<HeaderV2 {...defaultProps} />)

      const logo = screen.getByTestId('header-logo')
      expect(logo).toHaveAttribute('href', '/pt')
    })

    it('links to app root on authenticated pages', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} />)

      const logo = screen.getByTestId('header-logo')
      expect(logo).toHaveAttribute('href', '/pt/app')
    })

    it('uses correct locale for English', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<HeaderV2 {...defaultProps} locale="en" />)

      const logo = screen.getByTestId('header-logo')
      expect(logo).toHaveAttribute('href', '/en')
    })
  })

  describe('User Menu', () => {
    it('shows user menu when not on landing and user exists', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} />)

      expect(screen.getByTestId('header-user-menu')).toBeInTheDocument()
    })

    it('hides user menu on landing page', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<HeaderV2 {...defaultProps} />)

      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument()
    })

    it('hides user menu when no user', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} user={null} />)

      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument()
    })
  })

  describe('Menu Toggle', () => {
    it('toggles menu open state', async () => {
      const user = userEvent.setup()

      render(<HeaderV2 {...defaultProps} />)

      const toggleButton = screen.getByTestId('menu-toggle')
      expect(toggleButton).toHaveTextContent('Open Menu')

      await user.click(toggleButton)

      expect(toggleButton).toHaveTextContent('Close Menu')
    })

    it('closes menu when mobile menu close clicked', async () => {
      const user = userEvent.setup()

      render(<HeaderV2 {...defaultProps} />)

      // Open menu first
      await user.click(screen.getByTestId('menu-toggle'))
      expect(screen.getByTestId('menu-toggle')).toHaveTextContent('Close Menu')

      // Close via mobile menu
      await user.click(screen.getByText('Close'))

      expect(screen.getByTestId('menu-toggle')).toHaveTextContent('Open Menu')
    })
  })

  describe('Logout', () => {
    it('calls custom onLogout when provided', async () => {
      const user = userEvent.setup()
      const onLogout = vi.fn()
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} onLogout={onLogout} />)

      await user.click(screen.getByText('Logout'))

      expect(onLogout).toHaveBeenCalled()
    })

    it('falls back to localStorage removal when no onLogout', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      localStorage.setItem('user', JSON.stringify({ name: 'Test' }))
      localStorage.setItem('isAuthenticated', 'true')

      render(<HeaderV2 {...defaultProps} onLogout={undefined} />)

      await user.click(screen.getByText('Logout'))

      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('isAuthenticated')).toBeNull()
    })

    it('shows success toast on fallback logout - PT', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} locale="pt" onLogout={undefined} />)

      await user.click(screen.getByText('Logout'))

      expect(toast.success).toHaveBeenCalledWith('Ate logo!', 'Logout realizado com sucesso')
    })

    it('shows success toast on fallback logout - EN', async () => {
      const user = userEvent.setup()
      const { toast } = await import('@/hooks/use-toast')
      mockUsePathname.mockReturnValue('/en/app/dashboard')

      render(<HeaderV2 {...defaultProps} locale="en" onLogout={undefined} />)

      await user.click(screen.getByText('Logout'))

      expect(toast.success).toHaveBeenCalledWith('See you later!', 'Logged out successfully')
    })

    it('redirects to locale root on fallback logout', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<HeaderV2 {...defaultProps} locale="pt" onLogout={undefined} />)

      await user.click(screen.getByText('Logout'))

      expect(mockPush).toHaveBeenCalledWith('/pt')
    })
  })

  describe('Page Detection', () => {
    it('detects landing page /pt', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<HeaderV2 {...defaultProps} />)

      // User menu hidden on landing
      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument()
    })

    it('detects landing page /en', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<HeaderV2 {...defaultProps} locale="en" />)

      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument()
    })

    it('detects landing page /', () => {
      mockUsePathname.mockReturnValue('/')

      render(<HeaderV2 {...defaultProps} />)

      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies fixed positioning', () => {
      render(<HeaderV2 {...defaultProps} />)

      const header = screen.getByRole('banner')
      expect(header.className).toContain('fixed')
    })

    it('applies z-50 for overlay', () => {
      render(<HeaderV2 {...defaultProps} />)

      const header = screen.getByRole('banner')
      expect(header.className).toContain('z-50')
    })

    it('applies backdrop blur', () => {
      render(<HeaderV2 {...defaultProps} />)

      const header = screen.getByRole('banner')
      expect(header.className).toContain('backdrop-blur-lg')
    })

    it('applies custom className', () => {
      render(<HeaderV2 {...defaultProps} className="custom-header" />)

      const header = screen.getByRole('banner')
      expect(header.className).toContain('custom-header')
    })
  })

  describe('Navigation Role', () => {
    it('has navigation role on inner nav', () => {
      render(<HeaderV2 {...defaultProps} />)

      // Multiple navigation elements exist (header nav + mock navigation)
      const navElements = screen.getAllByRole('navigation')
      expect(navElements.length).toBeGreaterThan(0)
    })
  })
})
