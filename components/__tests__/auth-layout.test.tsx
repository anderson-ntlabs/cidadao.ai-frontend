/**
 * Tests for AuthLayout components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthLayoutV2, AuthLayoutV2WithSidebar } from '../auth-layout'

// Mock dependencies
const {
  mockUsePathname,
  mockPush,
  mockUser,
  mockIsAuthenticated,
  mockIsLoading,
  mockLogout,
  mockIsMobile,
} = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt/app/dashboard'),
  mockPush: vi.fn(),
  mockUser: vi.fn(() => ({ name: 'Test User', email: 'test@example.com' })),
  mockIsAuthenticated: vi.fn(() => true),
  mockIsLoading: vi.fn(() => false),
  mockLogout: vi.fn(),
  mockIsMobile: vi.fn(() => false),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: mockUser(),
    isAuthenticated: mockIsAuthenticated(),
    isLoading: mockIsLoading(),
    logout: mockLogout,
  }),
}))

vi.mock('@/lib/utils/mobile-detection', () => ({
  useMobileDetection: () => mockIsMobile(),
}))

vi.mock('../header', () => ({
  HeaderV2: ({ locale, user, navigationItems, onLogout }: any) => (
    <header data-testid="header">
      <span data-testid="header-locale">{locale}</span>
      <span data-testid="header-user">{user?.name}</span>
      <span data-testid="nav-items-count">{navigationItems?.length}</span>
      <button onClick={onLogout} data-testid="logout-btn">
        Logout
      </button>
    </header>
  ),
}))

vi.mock('../breadcrumbs', () => ({
  BreadcrumbsV2: ({ items, showHome, homeHref, homeLabel }: any) => (
    <nav data-testid="breadcrumbs">
      <span data-testid="breadcrumb-items">{items?.length}</span>
      <span data-testid="home-href">{homeHref}</span>
      <span data-testid="home-label">{homeLabel}</span>
    </nav>
  ),
  BreadcrumbsV2Mobile: ({ items }: any) => (
    <nav data-testid="breadcrumbs-mobile">
      <span>{items?.length} items</span>
    </nav>
  ),
}))

vi.mock('../loading-screen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen">Loading...</div>,
}))

vi.mock('../mobile-nav', () => ({
  MobileNavV2: () => <nav data-testid="mobile-nav">Mobile Nav</nav>,
}))

vi.mock('../mobile/bottom-navigation', () => ({
  BottomNavigation: ({ items }: any) => (
    <nav data-testid="bottom-navigation">
      <span data-testid="bottom-nav-items">{items?.length}</span>
    </nav>
  ),
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('AuthLayoutV2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt/app/dashboard')
    mockUser.mockReturnValue({ name: 'Test User', email: 'test@example.com' })
    mockIsAuthenticated.mockReturnValue(true)
    mockIsLoading.mockReturnValue(false)
    mockIsMobile.mockReturnValue(false)
    localStorage.clear()
  })

  describe('Rendering - Authenticated', () => {
    it('renders children when authenticated', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div data-testid="child-content">Child Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('renders header with correct props', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('header-locale')).toHaveTextContent('pt')
      expect(screen.getByTestId('header-user')).toHaveTextContent('Test User')
    })

    it('renders navigation items in header', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      // 5 navigation items: Início, Dashboard, Chat, Investigações, Mapa
      expect(screen.getByTestId('nav-items-count')).toHaveTextContent('5')
    })
  })

  describe('Loading State', () => {
    it('shows loading screen when loading', () => {
      mockIsLoading.mockReturnValue(true)

      render(
        <AuthLayoutV2 locale="pt">
          <div data-testid="child-content">Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('loading-screen')).toBeInTheDocument()
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    })
  })

  describe('Auth Redirect', () => {
    it('redirects to login when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false)

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/pt/login')
      })
    })

    it('saves redirect path before redirecting', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      mockUsePathname.mockReturnValue('/pt/app/chat')

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      await waitFor(() => {
        expect(localStorage.getItem('redirectAfterLogin')).toBe('/pt/app/chat')
      })
    })

    it('skips redirect in E2E test mode', async () => {
      mockIsAuthenticated.mockReturnValue(false)
      localStorage.setItem('e2e_test_mode', 'true')

      render(
        <AuthLayoutV2 locale="pt">
          <div data-testid="content">Content</div>
        </AuthLayoutV2>
      )

      // Wait a bit to ensure redirect didn't happen
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Breadcrumbs', () => {
    it('shows breadcrumbs by default', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('hides breadcrumbs when showBreadcrumbs is false', () => {
      render(
        <AuthLayoutV2 locale="pt" showBreadcrumbs={false}>
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    })

    it('uses provided breadcrumbs', () => {
      const customBreadcrumbs = [
        { label: 'Home', href: '/pt' },
        { label: 'Custom Page', current: true },
      ]

      render(
        <AuthLayoutV2 locale="pt" breadcrumbs={customBreadcrumbs}>
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('breadcrumb-items')).toHaveTextContent('2')
    })

    it('generates breadcrumbs from pathname', () => {
      mockUsePathname.mockReturnValue('/pt/app/chat')

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      // Should show breadcrumbs auto-generated from path
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
    })

    it('shows home link with correct locale', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('home-href')).toHaveTextContent('/pt/home')
      expect(screen.getByTestId('home-label')).toHaveTextContent('Início')
    })

    it('uses English home label for en locale', () => {
      render(
        <AuthLayoutV2 locale="en">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('home-label')).toHaveTextContent('Home')
    })

    it('renders mobile breadcrumbs', () => {
      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('breadcrumbs-mobile')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation', () => {
    it('shows BottomNavigation on mobile', () => {
      mockIsMobile.mockReturnValue(true)

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument()
    })

    it('shows MobileNavV2 on desktop', () => {
      mockIsMobile.mockReturnValue(false)

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
    })

    it('BottomNavigation has correct items count', () => {
      mockIsMobile.mockReturnValue(true)

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      // 5 items: home, chat, investigations, dashboard, map
      expect(screen.getByTestId('bottom-nav-items')).toHaveTextContent('5')
    })
  })

  describe('Logout', () => {
    it('passes logout handler to header', async () => {
      const user = userEvent.setup()

      render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      await user.click(screen.getByTestId('logout-btn'))

      expect(mockLogout).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('applies containerClassName', () => {
      const { container } = render(
        <AuthLayoutV2 locale="pt" containerClassName="custom-container">
          <div>Content</div>
        </AuthLayoutV2>
      )

      const containerWithClass = container.querySelector('.custom-container')
      expect(containerWithClass).toBeInTheDocument()
    })

    it('applies contentClassName', () => {
      const { container } = render(
        <AuthLayoutV2 locale="pt" contentClassName="custom-content">
          <div>Content</div>
        </AuthLayoutV2>
      )

      const contentWithClass = container.querySelector('.custom-content')
      expect(contentWithClass).toBeInTheDocument()
    })

    it('has background gradient', () => {
      const { container } = render(
        <AuthLayoutV2 locale="pt">
          <div>Content</div>
        </AuthLayoutV2>
      )

      const gradient = container.querySelector('.bg-gradient-to-br')
      expect(gradient).toBeInTheDocument()
    })
  })
})

describe('AuthLayoutV2WithSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt/app/dashboard')
    mockIsAuthenticated.mockReturnValue(true)
    mockIsLoading.mockReturnValue(false)
    mockIsMobile.mockReturnValue(false)
  })

  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <AuthLayoutV2WithSidebar locale="pt">
          <div data-testid="main-content">Main Content</div>
        </AuthLayoutV2WithSidebar>
      )

      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('renders sidebar content when provided', () => {
      render(
        <AuthLayoutV2WithSidebar
          locale="pt"
          sidebarContent={<div data-testid="sidebar">Sidebar</div>}
        >
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      // Sidebar content appears in both desktop and mobile sidebar
      const sidebars = screen.getAllByTestId('sidebar')
      expect(sidebars.length).toBeGreaterThan(0)
    })
  })

  describe('Sidebar Width', () => {
    it('applies narrow width class', () => {
      const { container } = render(
        <AuthLayoutV2WithSidebar
          locale="pt"
          sidebarWidth="narrow"
          sidebarContent={<div>Sidebar</div>}
        >
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      const sidebar = container.querySelector('.w-48')
      expect(sidebar).toBeInTheDocument()
    })

    it('applies normal width class by default', () => {
      const { container } = render(
        <AuthLayoutV2WithSidebar locale="pt" sidebarContent={<div>Sidebar</div>}>
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      const sidebar = container.querySelector('.w-64')
      expect(sidebar).toBeInTheDocument()
    })

    it('applies wide width class', () => {
      const { container } = render(
        <AuthLayoutV2WithSidebar
          locale="pt"
          sidebarWidth="wide"
          sidebarContent={<div>Sidebar</div>}
        >
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      const sidebar = container.querySelector('.w-80')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('Mobile Sidebar', () => {
    it('renders mobile sidebar drawer when sidebar content provided', () => {
      const { container } = render(
        <AuthLayoutV2WithSidebar
          locale="pt"
          sidebarContent={<div data-testid="sidebar">Sidebar</div>}
        >
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      // Mobile sidebar has -translate-x-full when closed
      const mobileSidebar = container.querySelector('.-translate-x-full')
      expect(mobileSidebar).toBeInTheDocument()
    })

    it('has backdrop element for mobile sidebar', () => {
      const { container } = render(
        <AuthLayoutV2WithSidebar locale="pt" sidebarContent={<div>Sidebar</div>}>
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      // When closed, backdrop should not be visible
      // The component toggles backdrop visibility based on sidebarOpen state
      const sidebar = container.querySelector('.lg\\:hidden.fixed')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('Props Forwarding', () => {
    it('forwards locale to AuthLayoutV2', () => {
      render(
        <AuthLayoutV2WithSidebar locale="en">
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      expect(screen.getByTestId('header-locale')).toHaveTextContent('en')
    })

    it('forwards breadcrumbs props', () => {
      render(
        <AuthLayoutV2WithSidebar locale="pt" showBreadcrumbs={false}>
          <div>Content</div>
        </AuthLayoutV2WithSidebar>
      )

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    })
  })
})
