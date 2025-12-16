/**
 * Tests for BadgeShowcase component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BadgeShowcase } from '../badge-showcase'

// Mock dependencies
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@/data/badges', () => ({
  BADGES: {
    primeiro_contato: {
      name_pt: 'Primeiro Contato',
      name_en: 'First Contact',
      description_pt: 'Iniciou sua primeira conversa',
      description_en: 'Started your first conversation',
    },
    colaborador: {
      name_pt: 'Colaborador',
      name_en: 'Collaborator',
      description_pt: 'Contribuiu para a plataforma',
      description_en: 'Contributed to the platform',
    },
  },
}))

const mockBadges = [
  {
    id: '1',
    user_id: 'user-1',
    badge_type: 'primeiro_contato' as const,
    earned_at: '2025-12-01T10:00:00Z',
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    badge_type: 'colaborador' as const,
    earned_at: '2025-12-10T14:30:00Z',
    created_at: '2025-12-10T14:30:00Z',
  },
]

const mockUseBadgeStore = vi.fn()

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => mockUseBadgeStore(),
}))

describe('BadgeShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseBadgeStore.mockReturnValue({
      badges: [],
      isLoading: false,
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [],
        isLoading: true,
      })

      const { container } = render(<BadgeShowcase />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not show badges when loading', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: mockBadges,
        isLoading: true,
      })

      render(<BadgeShowcase />)

      expect(screen.queryByText('Primeiro Contato')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no badges', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [],
        isLoading: false,
      })

      render(<BadgeShowcase />)

      expect(screen.getByText('Nenhum badge ainda')).toBeInTheDocument()
    })

    it('shows empty state message in Portuguese by default', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [],
        isLoading: false,
      })

      render(<BadgeShowcase />)

      expect(
        screen.getByText('Complete tarefas para ganhar badges exclusivos!')
      ).toBeInTheDocument()
    })

    it('shows empty state message in English', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [],
        isLoading: false,
      })

      render(<BadgeShowcase locale="en" />)

      expect(screen.getByText('No badges yet')).toBeInTheDocument()
      expect(screen.getByText('Complete tasks to earn exclusive badges!')).toBeInTheDocument()
    })

    it('does not show empty state when showEmpty is false', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [],
        isLoading: false,
      })

      const { container } = render(<BadgeShowcase showEmpty={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('With Badges', () => {
    beforeEach(() => {
      mockUseBadgeStore.mockReturnValue({
        badges: mockBadges,
        isLoading: false,
      })
    })

    it('renders badge names in Portuguese', () => {
      render(<BadgeShowcase locale="pt" />)

      expect(screen.getByText('Primeiro Contato')).toBeInTheDocument()
      expect(screen.getByText('Colaborador')).toBeInTheDocument()
    })

    it('renders badge names in English', () => {
      render(<BadgeShowcase locale="en" />)

      expect(screen.getByText('First Contact')).toBeInTheDocument()
      expect(screen.getByText('Collaborator')).toBeInTheDocument()
    })

    it('shows badge descriptions in full mode', () => {
      render(<BadgeShowcase locale="pt" compact={false} />)

      expect(screen.getByText('Iniciou sua primeira conversa')).toBeInTheDocument()
    })

    it('hides badge descriptions in compact mode', () => {
      render(<BadgeShowcase locale="pt" compact={true} />)

      expect(screen.queryByText('Iniciou sua primeira conversa')).not.toBeInTheDocument()
    })

    it('shows section title with badge count in full mode', () => {
      render(<BadgeShowcase locale="pt" compact={false} />)

      expect(screen.getByText('Seus Badges')).toBeInTheDocument()
      expect(screen.getByText('(2)')).toBeInTheDocument()
    })

    it('hides section title in compact mode', () => {
      render(<BadgeShowcase locale="pt" compact={true} />)

      expect(screen.queryByText('Seus Badges')).not.toBeInTheDocument()
    })

    it('shows earned date for badges', () => {
      render(<BadgeShowcase locale="pt" />)

      // Check that "Conquistado em" appears for each badge
      const earnedTexts = screen.getAllByText(/Conquistado em/)
      expect(earnedTexts.length).toBe(2)
    })

    it('shows earned date in English', () => {
      render(<BadgeShowcase locale="en" />)

      const earnedTexts = screen.getAllByText(/Earned on/)
      expect(earnedTexts.length).toBe(2)
    })
  })

  describe('Date Formatting', () => {
    beforeEach(() => {
      mockUseBadgeStore.mockReturnValue({
        badges: [mockBadges[0]],
        isLoading: false,
      })
    })

    it('formats date in Portuguese locale', () => {
      render(<BadgeShowcase locale="pt" />)

      // Date should be formatted as DD/MMM/YYYY in pt-BR
      const dateText = screen.getByText(/Conquistado em/)
      expect(dateText).toBeInTheDocument()
    })

    it('formats date in English locale', () => {
      render(<BadgeShowcase locale="en" />)

      const dateText = screen.getByText(/Earned on/)
      expect(dateText).toBeInTheDocument()
    })
  })
})
