/**
 * Tests for StatCard component (stats folder)
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react'
import { StatCard, StatsGrid } from '../stat-card'

// Mock dependencies
vi.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children, className, onClick }: any) => (
    <div data-testid="glass-card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  GlassCardContent: ({ children, className }: any) => (
    <div data-testid="glass-card-content" className={className}>
      {children}
    </div>
  ),
}))

describe('StatCard', () => {
  const defaultProps = {
    icon: Activity,
    value: '1,234',
    label: 'Active Users',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders value', () => {
      render(<StatCard {...defaultProps} />)

      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('renders label', () => {
      render(<StatCard {...defaultProps} />)

      expect(screen.getByText('Active Users')).toBeInTheDocument()
    })

    it('renders icon', () => {
      const { container } = render(<StatCard {...defaultProps} />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders subtitle when provided', () => {
      render(<StatCard {...defaultProps} subtitle="Last 30 days" />)

      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<StatCard {...defaultProps} className="custom-class" />)

      const card = screen.getByTestId('glass-card')
      expect(card.className).toContain('custom-class')
    })
  })

  describe('Colors', () => {
    it('applies blue color by default', () => {
      const { container } = render(<StatCard {...defaultProps} />)

      const iconContainer = container.querySelector('.bg-blue-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies green color', () => {
      const { container } = render(<StatCard {...defaultProps} color="green" />)

      const iconContainer = container.querySelector('.bg-green-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies purple color', () => {
      const { container } = render(<StatCard {...defaultProps} color="purple" />)

      const iconContainer = container.querySelector('.bg-purple-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies orange color', () => {
      const { container } = render(<StatCard {...defaultProps} color="orange" />)

      const iconContainer = container.querySelector('.bg-orange-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies red color', () => {
      const { container } = render(<StatCard {...defaultProps} color="red" />)

      const iconContainer = container.querySelector('.bg-red-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies yellow color', () => {
      const { container } = render(<StatCard {...defaultProps} color="yellow" />)

      const iconContainer = container.querySelector('.bg-yellow-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies pink color', () => {
      const { container } = render(<StatCard {...defaultProps} color="pink" />)

      const iconContainer = container.querySelector('.bg-pink-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies indigo color', () => {
      const { container } = render(<StatCard {...defaultProps} color="indigo" />)

      const iconContainer = container.querySelector('.bg-indigo-100')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('uses md size by default', () => {
      render(<StatCard {...defaultProps} />)

      const content = screen.getByTestId('glass-card-content')
      expect(content.className).toContain('p-6')
    })

    it('applies sm size', () => {
      render(<StatCard {...defaultProps} size="sm" />)

      const content = screen.getByTestId('glass-card-content')
      expect(content.className).toContain('p-4')
    })

    it('applies lg size', () => {
      render(<StatCard {...defaultProps} size="lg" />)

      const content = screen.getByTestId('glass-card-content')
      expect(content.className).toContain('p-8')
    })
  })

  describe('Trend Indicator', () => {
    it('shows up trend', () => {
      render(<StatCard {...defaultProps} trend="+12%" trendDirection="up" />)

      expect(screen.getByText(/↑.*\+12%/)).toBeInTheDocument()
    })

    it('shows down trend', () => {
      render(<StatCard {...defaultProps} trend="-5%" trendDirection="down" />)

      expect(screen.getByText(/↓.*-5%/)).toBeInTheDocument()
    })

    it('shows neutral trend', () => {
      render(<StatCard {...defaultProps} trend="0%" trendDirection="neutral" />)

      expect(screen.getByText(/→.*0%/)).toBeInTheDocument()
    })

    it('does not show trend when not provided', () => {
      render(<StatCard {...defaultProps} />)

      expect(screen.queryByText('↑')).not.toBeInTheDocument()
      expect(screen.queryByText('↓')).not.toBeInTheDocument()
      expect(screen.queryByText('→')).not.toBeInTheDocument()
    })
  })

  describe('Click Handler', () => {
    it('calls onClick when card clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()

      render(<StatCard {...defaultProps} onClick={onClick} />)

      await user.click(screen.getByTestId('glass-card'))

      expect(onClick).toHaveBeenCalled()
    })

    it('applies cursor-pointer when clickable', () => {
      render(<StatCard {...defaultProps} onClick={() => {}} />)

      const card = screen.getByTestId('glass-card')
      expect(card.className).toContain('cursor-pointer')
    })

    it('does not apply cursor-pointer when not clickable', () => {
      render(<StatCard {...defaultProps} />)

      const card = screen.getByTestId('glass-card')
      expect(card.className).not.toContain('cursor-pointer')
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading', () => {
      const { container } = render(<StatCard {...defaultProps} isLoading />)

      const pulsing = container.querySelector('.animate-pulse')
      expect(pulsing).toBeInTheDocument()
    })

    it('hides content when loading', () => {
      render(<StatCard {...defaultProps} isLoading />)

      expect(screen.queryByText('1,234')).not.toBeInTheDocument()
      expect(screen.queryByText('Active Users')).not.toBeInTheDocument()
    })
  })

  describe('Number Values', () => {
    it('handles numeric value', () => {
      render(<StatCard {...defaultProps} value={5678} />)

      expect(screen.getByText('5678')).toBeInTheDocument()
    })
  })
})

describe('StatsGrid', () => {
  it('renders children', () => {
    render(
      <StatsGrid>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </StatsGrid>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('uses 4 columns by default', () => {
    const { container } = render(
      <StatsGrid>
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('lg:grid-cols-4')
  })

  it('applies 1 column', () => {
    const { container } = render(
      <StatsGrid columns={1}>
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).not.toContain('lg:grid-cols')
  })

  it('applies 2 columns', () => {
    const { container } = render(
      <StatsGrid columns={2}>
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('md:grid-cols-2')
  })

  it('applies 3 columns', () => {
    const { container } = render(
      <StatsGrid columns={3}>
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('lg:grid-cols-3')
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatsGrid className="custom-grid">
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('custom-grid')
  })

  it('has gap between items', () => {
    const { container } = render(
      <StatsGrid>
        <div>Child</div>
      </StatsGrid>
    )

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain('gap-4')
  })
})
