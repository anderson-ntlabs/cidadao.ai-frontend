/**
 * Tests for Dashboard Skeleton Components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavigationCardSkeleton } from '../navigation-card-skeleton'
import { QuickStatsSkeleton } from '../quick-stats-skeleton'
import { ActivityFeedSkeleton } from '../activity-feed-skeleton'

// Mock GlassCard components
vi.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children, className, ...props }: any) => (
    <div data-testid="glass-card" className={className} {...props}>
      {children}
    </div>
  ),
  GlassCardHeader: ({ children, ...props }: any) => (
    <div data-testid="glass-card-header" {...props}>
      {children}
    </div>
  ),
  GlassCardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="glass-card-title" className={className} {...props}>
      {children}
    </div>
  ),
  GlassCardContent: ({ children, className, ...props }: any) => (
    <div data-testid="glass-card-content" className={className} {...props}>
      {children}
    </div>
  ),
}))

describe('NavigationCardSkeleton', () => {
  it('renders two navigation cards', () => {
    render(<NavigationCardSkeleton />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards).toHaveLength(2)
  })

  it('applies animate-pulse to cards', () => {
    render(<NavigationCardSkeleton />)

    const cards = screen.getAllByTestId('glass-card')
    cards.forEach((card) => {
      expect(card).toHaveClass('animate-pulse')
    })
  })

  it('renders in a grid layout', () => {
    const { container } = render(<NavigationCardSkeleton />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('gap-6')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('renders icon placeholder for each card', () => {
    const { container } = render(<NavigationCardSkeleton />)

    // Each card should have icon placeholder with w-14 h-14
    const iconPlaceholders = container.querySelectorAll('.w-14.h-14')
    expect(iconPlaceholders).toHaveLength(2)
  })

  it('renders title placeholder for each card', () => {
    const { container } = render(<NavigationCardSkeleton />)

    // Title placeholder with h-7
    const titlePlaceholders = container.querySelectorAll('.h-7')
    expect(titlePlaceholders).toHaveLength(2)
  })

  it('renders description placeholders', () => {
    const { container } = render(<NavigationCardSkeleton />)

    // Description has space-y-2 container with multiple lines
    const descriptionContainers = container.querySelectorAll('.space-y-2')
    expect(descriptionContainers.length).toBeGreaterThan(0)
  })

  it('renders footer stats for each card', () => {
    const { container } = render(<NavigationCardSkeleton />)

    // Footer has border-t
    const footers = container.querySelectorAll('.border-t')
    expect(footers).toHaveLength(2)
  })
})

describe('QuickStatsSkeleton', () => {
  it('renders 4 cards by default', () => {
    render(<QuickStatsSkeleton />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards).toHaveLength(4)
  })

  it('renders custom number of cards', () => {
    render(<QuickStatsSkeleton count={2} />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards).toHaveLength(2)
  })

  it('renders 6 cards when count is 6', () => {
    render(<QuickStatsSkeleton count={6} />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards).toHaveLength(6)
  })

  it('applies animate-pulse to cards', () => {
    render(<QuickStatsSkeleton />)

    const cards = screen.getAllByTestId('glass-card')
    cards.forEach((card) => {
      expect(card).toHaveClass('animate-pulse')
    })
  })

  it('applies p-6 padding to cards', () => {
    render(<QuickStatsSkeleton />)

    const cards = screen.getAllByTestId('glass-card')
    cards.forEach((card) => {
      expect(card).toHaveClass('p-6')
    })
  })

  it('renders in responsive grid layout', () => {
    const { container } = render(<QuickStatsSkeleton />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-4')
  })

  it('renders icon placeholder for each card', () => {
    const { container } = render(<QuickStatsSkeleton />)

    // Each card has icon placeholder with w-10 h-10
    const iconPlaceholders = container.querySelectorAll('.w-10.h-10')
    expect(iconPlaceholders).toHaveLength(4)
  })

  it('renders value placeholder for each card', () => {
    const { container } = render(<QuickStatsSkeleton />)

    // Value placeholder with h-8
    const valuePlaceholders = container.querySelectorAll('.h-8')
    expect(valuePlaceholders).toHaveLength(4)
  })
})

describe('ActivityFeedSkeleton', () => {
  it('renders 4 activity items by default', () => {
    const { container } = render(<ActivityFeedSkeleton />)

    // Each activity item is inside px-6 py-4 container
    const items = container.querySelectorAll('.px-6.py-4')
    expect(items).toHaveLength(4)
  })

  it('renders custom number of items', () => {
    const { container } = render(<ActivityFeedSkeleton items={2} />)

    const items = container.querySelectorAll('.px-6.py-4')
    expect(items).toHaveLength(2)
  })

  it('renders 6 items when items is 6', () => {
    const { container } = render(<ActivityFeedSkeleton items={6} />)

    const items = container.querySelectorAll('.px-6.py-4')
    expect(items).toHaveLength(6)
  })

  it('renders GlassCard container', () => {
    render(<ActivityFeedSkeleton />)

    expect(screen.getByTestId('glass-card')).toBeInTheDocument()
  })

  it('renders GlassCardHeader with title', () => {
    render(<ActivityFeedSkeleton />)

    expect(screen.getByTestId('glass-card-header')).toBeInTheDocument()
    expect(screen.getByTestId('glass-card-title')).toBeInTheDocument()
  })

  it('applies animate-pulse to items', () => {
    const { container } = render(<ActivityFeedSkeleton />)

    const items = container.querySelectorAll('.px-6.py-4')
    items.forEach((item) => {
      expect(item).toHaveClass('animate-pulse')
    })
  })

  it('renders icon placeholder for each item', () => {
    const { container } = render(<ActivityFeedSkeleton />)

    // Each item has icon placeholder with w-5 h-5
    const iconPlaceholders = container.querySelectorAll('.w-5.h-5')
    // 4 items + 1 in header = 5 total
    expect(iconPlaceholders.length).toBeGreaterThanOrEqual(4)
  })

  it('renders divide-y for separating items', () => {
    const { container } = render(<ActivityFeedSkeleton />)

    const divider = container.querySelector('.divide-y')
    expect(divider).toBeInTheDocument()
  })

  it('renders content placeholders for each item', () => {
    const { container } = render(<ActivityFeedSkeleton />)

    // Each item has space-y-2 container for content
    const contentContainers = container.querySelectorAll('.space-y-2')
    expect(contentContainers).toHaveLength(4)
  })
})
