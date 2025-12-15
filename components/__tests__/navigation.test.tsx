/**
 * Tests for Navigation components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  NavigationV2,
  NavigationV2Group,
  NavigationV2Drawer,
  NavigationV2Tabs,
  type NavigationItem,
} from '../navigation'
import { Home, MessageSquare, Settings } from 'lucide-react'

// Mock dependencies
const { mockUsePathname, mockUseRouter } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt/app'),
  mockUseRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: mockUseRouter,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, className, onClick, ...props }: any) => (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

describe('NavigationV2', () => {
  const defaultItems: NavigationItem[] = [
    { name: 'Home', href: '/pt/app', icon: Home },
    { name: 'Chat', href: '/pt/app/chat', icon: MessageSquare },
    { name: 'Settings', href: '/pt/app/settings', icon: Settings },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt/app')
  })

  describe('Rendering', () => {
    it('renders navigation with items', () => {
      render(<NavigationV2 items={defaultItems} />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Chat')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('returns null when items is empty', () => {
      const { container } = render(<NavigationV2 items={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('returns null when items is undefined', () => {
      const { container } = render(<NavigationV2 items={undefined as any} />)

      expect(container.firstChild).toBeNull()
    })

    it('renders with navigation role', () => {
      render(<NavigationV2 items={defaultItems} />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has aria-label for accessibility', () => {
      render(<NavigationV2 items={defaultItems} />)

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation')
    })
  })

  describe('Icons', () => {
    it('renders icons by default', () => {
      render(<NavigationV2 items={defaultItems} />)

      // Icons are rendered as SVGs
      const svgs = screen.getByRole('navigation').querySelectorAll('svg')
      expect(svgs.length).toBe(3)
    })

    it('hides icons when showIcons is false', () => {
      render(<NavigationV2 items={defaultItems} showIcons={false} />)

      const svgs = screen.getByRole('navigation').querySelectorAll('svg')
      expect(svgs.length).toBe(0)
    })
  })

  describe('Labels', () => {
    it('shows labels by default', () => {
      render(<NavigationV2 items={defaultItems} />)

      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('hides labels when showLabels is false', () => {
      render(<NavigationV2 items={defaultItems} showLabels={false} />)

      expect(screen.queryByText('Home')).not.toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('marks current page as active', () => {
      mockUsePathname.mockReturnValue('/pt/app')

      render(<NavigationV2 items={defaultItems} />)

      const homeLink = screen.getByRole('link', { name: /home/i })
      expect(homeLink).toHaveAttribute('aria-current', 'page')
    })

    it('marks nested path as active', () => {
      mockUsePathname.mockReturnValue('/pt/app/chat/session-1')

      render(<NavigationV2 items={defaultItems} />)

      const chatLink = screen.getByRole('link', { name: /chat/i })
      expect(chatLink).toHaveAttribute('aria-current', 'page')
    })

    it('does not mark inactive items', () => {
      mockUsePathname.mockReturnValue('/pt/app')

      render(<NavigationV2 items={defaultItems} />)

      const chatLink = screen.getByRole('link', { name: /chat/i })
      expect(chatLink).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Badges', () => {
    it('renders badge when present', () => {
      const itemsWithBadge: NavigationItem[] = [
        { name: 'Notifications', href: '/notifications', badge: 5 },
      ]

      render(<NavigationV2 items={itemsWithBadge} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders string badge', () => {
      const itemsWithBadge: NavigationItem[] = [{ name: 'Updates', href: '/updates', badge: 'New' }]

      render(<NavigationV2 items={itemsWithBadge} />)

      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })

  describe('External Links', () => {
    it('renders external link with target blank', () => {
      const externalItems: NavigationItem[] = [
        { name: 'GitHub', href: 'https://github.com', external: true },
      ]

      render(<NavigationV2 items={externalItems} />)

      const link = screen.getByRole('link', { name: /github/i })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Variants', () => {
    it('applies horizontal variant by default', () => {
      render(<NavigationV2 items={defaultItems} />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('gap-2')
    })

    it('applies vertical variant', () => {
      render(<NavigationV2 items={defaultItems} variant="vertical" />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('flex-col')
    })

    it('applies mobile variant', () => {
      render(<NavigationV2 items={defaultItems} variant="mobile" />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('flex-col')
    })
  })

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<NavigationV2 items={defaultItems} />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('text-base')
    })

    it('applies small size', () => {
      render(<NavigationV2 items={defaultItems} size="sm" />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('text-sm')
    })

    it('applies large size', () => {
      render(<NavigationV2 items={defaultItems} size="lg" />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('text-lg')
    })
  })

  describe('Callbacks', () => {
    it('calls onItemClick when item clicked', async () => {
      const user = userEvent.setup()
      const onItemClick = vi.fn()

      render(<NavigationV2 items={defaultItems} onItemClick={onItemClick} />)

      await user.click(screen.getByRole('link', { name: /chat/i }))

      expect(onItemClick).toHaveBeenCalledWith(defaultItems[1])
    })

    it('calls onItemClick for external links', async () => {
      const user = userEvent.setup()
      const onItemClick = vi.fn()
      const externalItems: NavigationItem[] = [
        { name: 'GitHub', href: 'https://github.com', external: true },
      ]

      render(<NavigationV2 items={externalItems} onItemClick={onItemClick} />)

      await user.click(screen.getByRole('link', { name: /github/i }))

      expect(onItemClick).toHaveBeenCalledWith(externalItems[0])
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<NavigationV2 items={defaultItems} className="custom-class" />)

      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('custom-class')
    })
  })
})

describe('NavigationV2Group', () => {
  it('renders children', () => {
    render(
      <NavigationV2Group>
        <div>Child content</div>
      </NavigationV2Group>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <NavigationV2Group title="Group Title">
        <div>Child</div>
      </NavigationV2Group>
    )

    expect(screen.getByText('Group Title')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(
      <NavigationV2Group>
        <div>Child</div>
      </NavigationV2Group>
    )

    const headings = screen.queryAllByRole('heading')
    expect(headings.length).toBe(0)
  })

  it('applies custom className', () => {
    const { container } = render(
      <NavigationV2Group className="custom-group">
        <div>Child</div>
      </NavigationV2Group>
    )

    expect(container.firstChild).toHaveClass('custom-group')
  })
})

describe('NavigationV2Drawer', () => {
  const defaultItems: NavigationItem[] = [
    { name: 'Home', href: '/pt/app' },
    { name: 'Chat', href: '/pt/app/chat' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
  })

  it('renders when open', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(screen.getByTestId('navigation-drawer')).toBeInTheDocument()
  })

  it('shows menu title', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<NavigationV2Drawer isOpen={true} onClose={onClose} items={defaultItems} />)

    await user.click(screen.getByRole('button', { name: /close menu/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const { container } = render(
      <NavigationV2Drawer isOpen={true} onClose={onClose} items={defaultItems} />
    )

    // Click on backdrop (first child with fixed inset-0 class)
    const backdrop = container.querySelector('.fixed.inset-0')
    if (backdrop) {
      await user.click(backdrop)
    }

    expect(onClose).toHaveBeenCalled()
  })

  it('prevents body scroll when open', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />
    )

    rerender(<NavigationV2Drawer isOpen={false} onClose={vi.fn()} items={defaultItems} />)

    expect(document.body.style.overflow).toBe('unset')
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />
    )

    unmount()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('renders children', () => {
    render(
      <NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems}>
        <div>Extra content</div>
      </NavigationV2Drawer>
    )

    expect(screen.getByText('Extra content')).toBeInTheDocument()
  })

  it('has dialog role', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    render(<NavigationV2Drawer isOpen={true} onClose={vi.fn()} items={defaultItems} />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})

describe('NavigationV2Tabs', () => {
  const defaultItems: NavigationItem[] = [
    { name: 'Overview', href: '/overview', icon: Home },
    { name: 'Details', href: '/details' },
    { name: 'Settings', href: '/settings', badge: 3 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/overview')
  })

  it('renders tab navigation', () => {
    render(<NavigationV2Tabs items={defaultItems} />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('has Tabs aria-label', () => {
    render(<NavigationV2Tabs items={defaultItems} />)

    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Tabs')
  })

  it('renders all tab items', () => {
    render(<NavigationV2Tabs items={defaultItems} />)

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders icon when present', () => {
    render(<NavigationV2Tabs items={defaultItems} />)

    const svgs = screen.getByRole('navigation').querySelectorAll('svg')
    expect(svgs.length).toBe(1) // Only Overview has icon
  })

  it('renders badge when present', () => {
    render(<NavigationV2Tabs items={defaultItems} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('marks active tab', () => {
    mockUsePathname.mockReturnValue('/overview')

    render(<NavigationV2Tabs items={defaultItems} />)

    const overviewLink = screen.getByRole('link', { name: /overview/i })
    expect(overviewLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies custom className', () => {
    const { container } = render(<NavigationV2Tabs items={defaultItems} className="custom-tabs" />)

    expect(container.firstChild).toHaveClass('custom-tabs')
  })
})
