/**
 * Tests for ChartCard component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartCard } from '../chart-card'

// Mock UI components
vi.mock('../card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <p className={className} data-testid="card-description">
      {children}
    </p>
  ),
}))

vi.mock('../button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('../dropdown', () => ({
  Dropdown: ({ trigger, children }: any) => (
    <div data-testid="dropdown">
      <div data-testid="dropdown-trigger">{trigger}</div>
      <div data-testid="dropdown-menu">{children}</div>
    </div>
  ),
}))

describe('ChartCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with title', () => {
      render(
        <ChartCard title="Revenue Chart">
          <div>Chart content</div>
        </ChartCard>
      )

      expect(screen.getByText('Revenue Chart')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(
        <ChartCard title="Revenue Chart" description="Monthly revenue analysis">
          <div>Chart content</div>
        </ChartCard>
      )

      expect(screen.getByText('Monthly revenue analysis')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <ChartCard title="Test">
          <div data-testid="chart-content">My chart</div>
        </ChartCard>
      )

      expect(screen.getByTestId('chart-content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ChartCard title="Test" className="custom-chart">
          <div>Content</div>
        </ChartCard>
      )

      const card = screen.getByTestId('card')
      expect(card.className).toContain('custom-chart')
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      const { container } = render(
        <ChartCard title="Test" isLoading>
          <div>Content</div>
        </ChartCard>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('hides children when loading', () => {
      render(
        <ChartCard title="Test" isLoading>
          <div data-testid="hidden-content">Content</div>
        </ChartCard>
      )

      expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error message when error is provided', () => {
      render(
        <ChartCard title="Test" error="Failed to load data">
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('hides children when error', () => {
      render(
        <ChartCard title="Test" error="Error">
          <div data-testid="hidden-content">Content</div>
        </ChartCard>
      )

      expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument()
    })

    it('does not show error when null', () => {
      render(
        <ChartCard title="Test" error={null}>
          <div data-testid="visible-content">Content</div>
        </ChartCard>
      )

      expect(screen.getByTestId('visible-content')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('shows refresh action when onRefresh provided', () => {
      const onRefresh = vi.fn()

      render(
        <ChartCard title="Test" onRefresh={onRefresh}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Atualizar')).toBeInTheDocument()
    })

    it('shows fullscreen action when onFullscreen provided', () => {
      const onFullscreen = vi.fn()

      render(
        <ChartCard title="Test" onFullscreen={onFullscreen}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Tela cheia')).toBeInTheDocument()
    })

    it('shows export action when onExport provided', () => {
      const onExport = vi.fn()

      render(
        <ChartCard title="Test" onExport={onExport}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Exportar')).toBeInTheDocument()
    })

    it('calls onRefresh when refresh clicked', async () => {
      const user = userEvent.setup()
      const onRefresh = vi.fn()

      render(
        <ChartCard title="Test" onRefresh={onRefresh}>
          <div>Content</div>
        </ChartCard>
      )

      await user.click(screen.getByText('Atualizar'))
      expect(onRefresh).toHaveBeenCalled()
    })

    it('calls onFullscreen when fullscreen clicked', async () => {
      const user = userEvent.setup()
      const onFullscreen = vi.fn()

      render(
        <ChartCard title="Test" onFullscreen={onFullscreen}>
          <div>Content</div>
        </ChartCard>
      )

      await user.click(screen.getByText('Tela cheia'))
      expect(onFullscreen).toHaveBeenCalled()
    })

    it('calls onExport when export clicked', async () => {
      const user = userEvent.setup()
      const onExport = vi.fn()

      render(
        <ChartCard title="Test" onExport={onExport}>
          <div>Content</div>
        </ChartCard>
      )

      await user.click(screen.getByText('Exportar'))
      expect(onExport).toHaveBeenCalled()
    })
  })

  describe('Custom Actions', () => {
    it('renders custom actions', () => {
      const customAction = {
        label: 'Custom Action',
        onClick: vi.fn(),
      }

      render(
        <ChartCard title="Test" actions={[customAction]}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Custom Action')).toBeInTheDocument()
    })

    it('calls custom action onClick', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const customAction = {
        label: 'Custom',
        onClick,
      }

      render(
        <ChartCard title="Test" actions={[customAction]}>
          <div>Content</div>
        </ChartCard>
      )

      await user.click(screen.getByText('Custom'))
      expect(onClick).toHaveBeenCalled()
    })

    it('renders custom action with icon', () => {
      const customAction = {
        label: 'With Icon',
        icon: <span data-testid="custom-icon">Icon</span>,
        onClick: vi.fn(),
      }

      render(
        <ChartCard title="Test" actions={[customAction]}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('combines default and custom actions', () => {
      const onRefresh = vi.fn()
      const customAction = {
        label: 'Custom',
        onClick: vi.fn(),
      }

      render(
        <ChartCard title="Test" onRefresh={onRefresh} actions={[customAction]}>
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.getByText('Atualizar')).toBeInTheDocument()
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })
  })

  describe('No Actions', () => {
    it('does not render dropdown when no actions', () => {
      render(
        <ChartCard title="Test">
          <div>Content</div>
        </ChartCard>
      )

      expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument()
    })
  })
})
