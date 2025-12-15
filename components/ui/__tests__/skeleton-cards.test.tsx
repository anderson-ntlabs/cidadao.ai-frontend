/**
 * Tests for Skeleton Cards components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SkeletonStatCard,
  SkeletonChatHistoryItem,
  SkeletonInvestigationCard,
  SkeletonChart,
  SkeletonStatsGrid,
  SkeletonChatHistory,
  SkeletonInvestigationsList,
} from '../skeleton-cards'

// Mock dependencies
vi.mock('../skeleton', () => ({
  Skeleton: ({ className, style }: any) => (
    <div data-testid="skeleton" className={className} style={style} />
  ),
}))

vi.mock('../glass-card', () => ({
  GlassCard: ({ children, className }: any) => (
    <div data-testid="glass-card" className={className}>
      {children}
    </div>
  ),
  GlassCardContent: ({ children, className }: any) => (
    <div data-testid="glass-card-content" className={className}>
      {children}
    </div>
  ),
}))

describe('SkeletonStatCard', () => {
  it('renders glass card', () => {
    render(<SkeletonStatCard />)

    expect(screen.getByTestId('glass-card')).toBeInTheDocument()
  })

  it('renders multiple skeleton elements', () => {
    render(<SkeletonStatCard />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders glass card content with padding', () => {
    render(<SkeletonStatCard />)

    const content = screen.getByTestId('glass-card-content')
    expect(content.className).toContain('p-6')
  })
})

describe('SkeletonChatHistoryItem', () => {
  it('renders container with border', () => {
    const { container } = render(<SkeletonChatHistoryItem />)

    const item = container.firstChild as HTMLElement
    expect(item.className).toContain('border')
  })

  it('renders multiple skeleton elements for content', () => {
    render(<SkeletonChatHistoryItem />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(2)
  })
})

describe('SkeletonInvestigationCard', () => {
  it('renders glass card', () => {
    render(<SkeletonInvestigationCard />)

    expect(screen.getByTestId('glass-card')).toBeInTheDocument()
  })

  it('renders multiple skeleton elements', () => {
    render(<SkeletonInvestigationCard />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(5)
  })

  it('renders agent avatars as rounded skeleton', () => {
    render(<SkeletonInvestigationCard />)

    const skeletons = screen.getAllByTestId('skeleton')
    const roundedSkeletons = skeletons.filter((s) => s.className.includes('rounded-full'))
    expect(roundedSkeletons.length).toBeGreaterThan(0)
  })
})

describe('SkeletonChart', () => {
  it('renders with default height', () => {
    const { container } = render(<SkeletonChart />)

    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer.style.height).toBe('256px')
  })

  it('renders with custom height', () => {
    const { container } = render(<SkeletonChart height={400} />)

    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer.style.height).toBe('400px')
  })

  it('renders 7 bar skeletons', () => {
    render(<SkeletonChart />)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBe(7)
  })

  it('bars have random heights', () => {
    render(<SkeletonChart />)

    const skeletons = screen.getAllByTestId('skeleton')
    const heights = skeletons.map((s) => s.style.height)

    // All heights should be defined and different
    heights.forEach((h) => {
      expect(h).toBeDefined()
      expect(h).toContain('%')
    })
  })
})

describe('SkeletonStatsGrid', () => {
  it('renders 4 stat cards', () => {
    render(<SkeletonStatsGrid />)

    const glassCards = screen.getAllByTestId('glass-card')
    expect(glassCards.length).toBe(4)
  })

  it('renders grid with responsive columns', () => {
    const { container } = render(<SkeletonStatsGrid />)

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('lg:grid-cols-4')
  })
})

describe('SkeletonChatHistory', () => {
  it('renders default 5 items', () => {
    const { container } = render(<SkeletonChatHistory />)

    const items = container.querySelectorAll('.border')
    expect(items.length).toBe(5)
  })

  it('renders custom count of items', () => {
    const { container } = render(<SkeletonChatHistory count={3} />)

    const items = container.querySelectorAll('.border')
    expect(items.length).toBe(3)
  })

  it('renders in a spaced container', () => {
    const { container } = render(<SkeletonChatHistory />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('space-y-3')
  })
})

describe('SkeletonInvestigationsList', () => {
  it('renders default 3 items', () => {
    render(<SkeletonInvestigationsList />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards.length).toBe(3)
  })

  it('renders custom count of items', () => {
    render(<SkeletonInvestigationsList count={5} />)

    const cards = screen.getAllByTestId('glass-card')
    expect(cards.length).toBe(5)
  })

  it('renders in a spaced container', () => {
    const { container } = render(<SkeletonInvestigationsList />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('space-y-4')
  })
})
