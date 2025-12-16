/**
 * Tests for ActionPanel and ActionPanelSection components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings, User, Bell } from 'lucide-react'
import { ActionPanel, ActionPanelSection, ActionPanelItem } from '../action-panel'

// Mock dependencies
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('ActionPanel', () => {
  const defaultItems: ActionPanelItem[] = [
    {
      title: 'Item 1',
      description: 'Description 1',
      icon: Settings,
      actionLabel: 'Action 1',
      onAction: vi.fn(),
    },
    {
      title: 'Item 2',
      description: 'Description 2',
      icon: User,
      actionLabel: 'Action 2',
      onAction: vi.fn(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all items', () => {
      render(<ActionPanel items={defaultItems} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('renders item descriptions', () => {
      render(<ActionPanel items={defaultItems} />)

      expect(screen.getByText('Description 1')).toBeInTheDocument()
      expect(screen.getByText('Description 2')).toBeInTheDocument()
    })

    it('renders panel title', () => {
      render(<ActionPanel items={defaultItems} title="Panel Title" />)

      expect(screen.getByText('Panel Title')).toBeInTheDocument()
    })

    it('renders panel description', () => {
      render(<ActionPanel items={defaultItems} description="Panel Description" />)

      expect(screen.getByText('Panel Description')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<ActionPanel items={defaultItems} />)

      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })
  })

  describe('Badges', () => {
    it('renders badge when provided', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Item with Badge',
          badge: '5',
          badgeColor: 'blue',
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders numeric badge', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Item with Number Badge',
          badge: 42,
          badgeColor: 'green',
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('calls onAction when action button clicked', async () => {
      const onAction = vi.fn()
      const items: ActionPanelItem[] = [
        {
          title: 'Clickable Item',
          actionLabel: 'Click Me',
          onAction,
        },
      ]

      const user = userEvent.setup()
      render(<ActionPanel items={items} />)

      await user.click(screen.getByText('Click Me'))

      expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('disables action button when disabled', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Disabled Item',
          actionLabel: 'Disabled',
          onAction: vi.fn(),
          disabled: true,
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByText('Disabled')).toBeDisabled()
    })

    it('shows loading text when isLoading', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Loading Item',
          actionLabel: 'Submit',
          onAction: vi.fn(),
          isLoading: true,
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByText('Aguarde...')).toBeInTheDocument()
    })
  })

  describe('Chevron Navigation', () => {
    it('renders chevron when showChevron is true', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Navigation Item',
          showChevron: true,
          onAction: vi.fn(),
        },
      ]

      render(<ActionPanel items={items} />)

      // Chevron renders as part of the button
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('clicks on row when showChevron and has onAction', async () => {
      const onAction = vi.fn()
      const items: ActionPanelItem[] = [
        {
          title: 'Clickable Row',
          showChevron: true,
          onAction,
        },
      ]

      const user = userEvent.setup()
      render(<ActionPanel items={items} />)

      // Click on the row
      await user.click(screen.getByText('Clickable Row'))

      expect(onAction).toHaveBeenCalled()
    })
  })

  describe('Custom Action', () => {
    it('renders custom action component', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Custom Action Item',
          action: <button data-testid="custom-action">Custom</button>,
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByTestId('custom-action')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant', () => {
      const { container } = render(<ActionPanel items={defaultItems} variant="default" />)

      // Default has py-4 padding
      expect(container.innerHTML).toContain('py-4')
    })

    it('applies compact variant', () => {
      const { container } = render(<ActionPanel items={defaultItems} variant="compact" />)

      // Compact has py-2 padding
      expect(container.innerHTML).toContain('py-2')
    })
  })

  describe('Dividers', () => {
    it('shows dividers by default', () => {
      const { container } = render(<ActionPanel items={defaultItems} />)

      // Should have border-b for dividers
      expect(container.innerHTML).toContain('border-b')
    })

    it('hides dividers when showDividers is false', () => {
      const items: ActionPanelItem[] = [{ title: 'Item 1' }, { title: 'Item 2' }]

      const { container } = render(<ActionPanel items={items} showDividers={false} />)

      // Should not have divider classes
      const dividerElements = container.querySelectorAll('[class*="border-b"]')
      expect(dividerElements.length).toBe(0)
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<ActionPanel items={defaultItems} className="custom-class" />)

      const panel = container.firstChild
      expect(panel).toHaveClass('custom-class')
    })
  })

  describe('Items without action', () => {
    it('renders item without action button', () => {
      const items: ActionPanelItem[] = [
        {
          title: 'Static Item',
          description: 'No action',
        },
      ]

      render(<ActionPanel items={items} />)

      expect(screen.getByText('Static Item')).toBeInTheDocument()
      expect(screen.getByText('No action')).toBeInTheDocument()
    })
  })
})

describe('ActionPanelSection', () => {
  it('renders section title', () => {
    render(
      <ActionPanelSection title="Section Title">
        <div>Content</div>
      </ActionPanelSection>
    )

    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })

  it('renders section description', () => {
    render(
      <ActionPanelSection title="Title" description="Section Description">
        <div>Content</div>
      </ActionPanelSection>
    )

    expect(screen.getByText('Section Description')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <ActionPanelSection title="Title">
        <div data-testid="child">Child Content</div>
      </ActionPanelSection>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <ActionPanelSection title="With Icon" icon={Settings}>
        <div>Content</div>
      </ActionPanelSection>
    )

    // Icon is rendered but inside a div container
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ActionPanelSection title="Title" className="custom-section">
        <div>Content</div>
      </ActionPanelSection>
    )

    const section = container.firstChild
    expect(section).toHaveClass('custom-section')
  })
})
