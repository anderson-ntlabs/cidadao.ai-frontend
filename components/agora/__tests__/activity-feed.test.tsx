/**
 * Tests for ActivityFeed component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '../activity-feed'

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  MessageSquare: () => <span data-testid="message-icon">MessageSquare</span>,
  BookOpen: () => <span data-testid="book-icon">BookOpen</span>,
  Video: () => <span data-testid="video-icon">Video</span>,
  FileText: () => <span data-testid="file-icon">FileText</span>,
}))

describe('ActivityFeed', () => {
  const mockActivities = [
    {
      id: '1',
      amount: 50,
      description: 'Completou conversa com Zumbi',
      sourceType: 'conversation',
      createdAt: '2025-12-15T10:00:00Z',
    },
    {
      id: '2',
      amount: 100,
      description: 'Ganhou badge de explorador',
      sourceType: 'badge',
      createdAt: '2025-12-15T09:00:00Z',
    },
    {
      id: '3',
      amount: 30,
      description: 'Leu artigo sobre transparência',
      sourceType: 'reading',
      createdAt: '2025-12-15T08:00:00Z',
    },
  ]

  describe('Rendering', () => {
    it('renders with activities', () => {
      render(<ActivityFeed activities={mockActivities} />)

      expect(screen.getByText('Atividade Recente')).toBeInTheDocument()
      expect(screen.getByText('Completou conversa com Zumbi')).toBeInTheDocument()
      expect(screen.getByText('Ganhou badge de explorador')).toBeInTheDocument()
      expect(screen.getByText('Leu artigo sobre transparência')).toBeInTheDocument()
    })

    it('displays XP amounts', () => {
      render(<ActivityFeed activities={mockActivities} />)

      expect(screen.getByText('+50')).toBeInTheDocument()
      expect(screen.getByText('+100')).toBeInTheDocument()
      expect(screen.getByText('+30')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      render(<ActivityFeed activities={mockActivities} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByTestId('card-header')).toBeInTheDocument()
      expect(screen.getByTestId('card-content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<ActivityFeed activities={mockActivities} className="custom-class" />)

      expect(screen.getByTestId('card')).toHaveClass('custom-class')
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no activities', () => {
      render(<ActivityFeed activities={[]} />)

      expect(screen.getByText('Nenhuma atividade ainda.')).toBeInTheDocument()
      expect(screen.getByText('Comece conversando com um agente!')).toBeInTheDocument()
    })

    it('does not show activity list when empty', () => {
      render(<ActivityFeed activities={[]} />)

      expect(screen.queryByText('+50')).not.toBeInTheDocument()
    })
  })

  describe('Max Items', () => {
    it('limits activities to default max of 5', () => {
      const manyActivities = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        amount: 10 * (i + 1),
        description: `Activity ${i + 1}`,
        sourceType: 'conversation',
        createdAt: '2025-12-15T10:00:00Z',
      }))

      render(<ActivityFeed activities={manyActivities} />)

      // Should show only 5 activities
      expect(screen.getByText('Activity 1')).toBeInTheDocument()
      expect(screen.getByText('Activity 5')).toBeInTheDocument()
      expect(screen.queryByText('Activity 6')).not.toBeInTheDocument()
    })

    it('respects custom maxItems', () => {
      const manyActivities = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        amount: 10 * (i + 1),
        description: `Activity ${i + 1}`,
        sourceType: 'conversation',
        createdAt: '2025-12-15T10:00:00Z',
      }))

      render(<ActivityFeed activities={manyActivities} maxItems={3} />)

      // Should show only 3 activities
      expect(screen.getByText('Activity 1')).toBeInTheDocument()
      expect(screen.getByText('Activity 3')).toBeInTheDocument()
      expect(screen.queryByText('Activity 4')).not.toBeInTheDocument()
    })
  })

  describe('Source Icons', () => {
    it('shows conversation icon for conversation type', () => {
      const activities = [
        {
          id: '1',
          amount: 50,
          description: 'Test conversation',
          sourceType: 'conversation',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      expect(screen.getByTestId('message-icon')).toBeInTheDocument()
    })

    it('shows trophy icon for badge type', () => {
      const activities = [
        {
          id: '1',
          amount: 100,
          description: 'Test badge',
          sourceType: 'badge',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument()
    })

    it('shows book icon for diary type', () => {
      const activities = [
        {
          id: '1',
          amount: 30,
          description: 'Test diary',
          sourceType: 'diary',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })

    it('shows video icon for video type', () => {
      const activities = [
        {
          id: '1',
          amount: 40,
          description: 'Test video',
          sourceType: 'video',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      expect(screen.getByTestId('video-icon')).toBeInTheDocument()
    })

    it('shows file icon for reading type', () => {
      const activities = [
        {
          id: '1',
          amount: 20,
          description: 'Test reading',
          sourceType: 'reading',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      expect(screen.getByTestId('file-icon')).toBeInTheDocument()
    })

    it('shows default sparkles icon for unknown type', () => {
      const activities = [
        {
          id: '1',
          amount: 25,
          description: 'Test unknown',
          sourceType: 'unknown',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      const { container } = render(<ActivityFeed activities={activities} />)

      // Default icon should be sparkles (check that at least one sparkles icon is present beyond the card header)
      const sparklesIcons = screen.getAllByTestId('sparkles-icon')
      expect(sparklesIcons.length).toBeGreaterThanOrEqual(2) // One in header, one in item
    })

    it('shows default icon when sourceType is undefined', () => {
      const activities = [
        {
          id: '1',
          amount: 25,
          description: 'Test no source',
          createdAt: '2025-12-15T10:00:00Z',
        },
      ]

      render(<ActivityFeed activities={activities} />)

      // Default icon should be sparkles
      const sparklesIcons = screen.getAllByTestId('sparkles-icon')
      expect(sparklesIcons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Animation', () => {
    it('applies animation delay based on index', () => {
      const activities = [
        {
          id: '1',
          amount: 50,
          description: 'First activity',
          sourceType: 'conversation',
          createdAt: '2025-12-15T10:00:00Z',
        },
        {
          id: '2',
          amount: 100,
          description: 'Second activity',
          sourceType: 'badge',
          createdAt: '2025-12-15T09:00:00Z',
        },
      ]

      const { container } = render(<ActivityFeed activities={activities} />)

      const items = container.querySelectorAll('.animate-fade-in')
      expect(items[0]).toHaveStyle({ animationDelay: '0ms' })
      expect(items[1]).toHaveStyle({ animationDelay: '50ms' })
    })
  })
})
