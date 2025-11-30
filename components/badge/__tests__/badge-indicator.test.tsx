/**
 * Badge Indicator Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BadgeIndicator } from '../badge-indicator'

// Mock variables
let mockBadges: Array<{ badge_type: string }> = []
let mockIsLoading = false
let mockNewBadgeAnimation: string | null = null
const mockClearNewBadgeAnimation = vi.fn()

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => ({
    badges: mockBadges,
    isLoading: mockIsLoading,
    newBadgeAnimation: mockNewBadgeAnimation,
    clearNewBadgeAnimation: mockClearNewBadgeAnimation,
  }),
}))

vi.mock('@/data/badges', () => ({
  BADGES: {
    colaborador: {
      type: 'colaborador',
      name_pt: 'Colaborador',
      name_en: 'Collaborator',
      description_pt: 'Participou da pesquisa',
      description_en: 'Participated in the survey',
      icon: 'medal',
      color: 'amber',
      rarity: 'common',
    },
  },
}))

describe('BadgeIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBadges = []
    mockIsLoading = false
    mockNewBadgeAnimation = null
  })

  it('does not render when user has no badges', () => {
    mockBadges = []
    const { container } = render(<BadgeIndicator />)

    expect(container.firstChild).toBeNull()
  })

  it('renders when user has collaborator badge', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator />)

    const button = screen.getByRole('button', { name: /badge: colaborador/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with English aria-label when locale is en', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator locale="en" />)

    const button = screen.getByRole('button', { name: /badge: collaborator/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick when provided and clicked', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    const onClick = vi.fn()
    render(<BadgeIndicator onClick={onClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalled()
  })

  it('shows tooltip on hover when showTooltip is true', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator showTooltip={true} />)

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Colaborador')).toBeInTheDocument()
    expect(screen.getByText('Participou da pesquisa')).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator showTooltip={true} />)

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(button)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not show tooltip when showTooltip is false', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator showTooltip={false} />)

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows English tooltip text when locale is en', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    render(<BadgeIndicator locale="en" showTooltip={true} />)

    const button = screen.getByRole('button')
    fireEvent.mouseEnter(button)

    expect(screen.getByText('Collaborator')).toBeInTheDocument()
    expect(screen.getByText('Participated in the survey')).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    mockBadges = [{ badge_type: 'colaborador' }]
    const { rerender } = render(<BadgeIndicator size="sm" />)

    let button = screen.getByRole('button')
    expect(button.className).toContain('w-6 h-6')

    rerender(<BadgeIndicator size="lg" />)
    button = screen.getByRole('button')
    expect(button.className).toContain('w-10 h-10')
  })
})
