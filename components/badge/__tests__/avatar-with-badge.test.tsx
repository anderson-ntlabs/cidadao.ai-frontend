/**
 * Tests for AvatarWithBadge component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AvatarWithBadge } from '../avatar-with-badge'

// Mock dependencies
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="avatar-image"
    />
  ),
}))

vi.mock('@/data/badges', () => ({
  BADGES: {
    colaborador: {
      name_pt: 'Colaborador',
      name_en: 'Collaborator',
      description_pt: 'Contribuiu para a plataforma',
      description_en: 'Contributed to the platform',
    },
  },
}))

const mockUseBadgeStore = vi.fn()

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => mockUseBadgeStore(),
}))

describe('AvatarWithBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseBadgeStore.mockReturnValue({
      badges: [],
    })
  })

  describe('Avatar Rendering', () => {
    it('renders image when src is provided', () => {
      render(<AvatarWithBadge src="/avatar.jpg" alt="User" />)

      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('src', '/avatar.jpg')
      expect(image).toHaveAttribute('alt', 'User')
    })

    it('renders fallback initial when no src', () => {
      render(<AvatarWithBadge alt="User" fallbackInitial="A" />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('uses U as default fallback initial', () => {
      render(<AvatarWithBadge alt="User" />)

      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('capitalizes fallback initial', () => {
      render(<AvatarWithBadge alt="User" fallbackInitial="abc" />)

      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('renders fallback when src is null', () => {
      render(<AvatarWithBadge src={null} alt="User" fallbackInitial="J" />)

      expect(screen.getByText('J')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders small size correctly', () => {
      render(<AvatarWithBadge src="/avatar.jpg" alt="User" size="sm" />)

      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('width', '32')
      expect(image).toHaveAttribute('height', '32')
    })

    it('renders medium size correctly', () => {
      render(<AvatarWithBadge src="/avatar.jpg" alt="User" size="md" />)

      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('width', '40')
      expect(image).toHaveAttribute('height', '40')
    })

    it('renders large size correctly', () => {
      render(<AvatarWithBadge src="/avatar.jpg" alt="User" size="lg" />)

      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('width', '48')
      expect(image).toHaveAttribute('height', '48')
    })

    it('defaults to medium size', () => {
      render(<AvatarWithBadge src="/avatar.jpg" alt="User" />)

      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveAttribute('width', '40')
    })
  })

  describe('Badge Display', () => {
    it('does not show badge when user has no collaborator badge', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'primeiro_contato' }],
      })

      const { container } = render(<AvatarWithBadge alt="User" />)

      const badgeOverlay = container.querySelector('[aria-label]')
      expect(badgeOverlay).not.toBeInTheDocument()
    })

    it('shows badge when user has collaborator badge', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'colaborador' }],
      })

      const { container } = render(<AvatarWithBadge alt="User" />)

      const badgeOverlay = container.querySelector('[aria-label*="Badge"]')
      expect(badgeOverlay).toBeInTheDocument()
    })

    it('does not show badge when showBadge is false', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'colaborador' }],
      })

      const { container } = render(<AvatarWithBadge alt="User" showBadge={false} />)

      const badgeOverlay = container.querySelector('[aria-label*="Badge"]')
      expect(badgeOverlay).not.toBeInTheDocument()
    })

    it('shows Portuguese badge label by default', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'colaborador' }],
      })

      const { container } = render(<AvatarWithBadge alt="User" locale="pt" />)

      const badgeOverlay = container.querySelector('[aria-label="Badge: Colaborador"]')
      expect(badgeOverlay).toBeInTheDocument()
    })

    it('shows English badge label when locale is en', () => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'colaborador' }],
      })

      const { container } = render(<AvatarWithBadge alt="User" locale="en" />)

      const badgeOverlay = container.querySelector('[aria-label="Badge: Collaborator"]')
      expect(badgeOverlay).toBeInTheDocument()
    })
  })

  describe('Hover Interaction', () => {
    beforeEach(() => {
      mockUseBadgeStore.mockReturnValue({
        badges: [{ badge_type: 'colaborador' }],
      })
    })

    it('shows tooltip on hover', () => {
      const { container } = render(<AvatarWithBadge alt="User" locale="pt" />)

      const wrapper = container.firstChild as HTMLElement
      fireEvent.mouseEnter(wrapper)

      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Colaborador')).toBeInTheDocument()
    })

    it('hides tooltip when mouse leaves', () => {
      const { container } = render(<AvatarWithBadge alt="User" locale="pt" />)

      const wrapper = container.firstChild as HTMLElement
      fireEvent.mouseEnter(wrapper)
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.mouseLeave(wrapper)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('shows badge description in tooltip', () => {
      const { container } = render(<AvatarWithBadge alt="User" locale="pt" />)

      const wrapper = container.firstChild as HTMLElement
      fireEvent.mouseEnter(wrapper)

      expect(screen.getByText('Contribuiu para a plataforma')).toBeInTheDocument()
    })

    it('shows English tooltip content', () => {
      const { container } = render(<AvatarWithBadge alt="User" locale="en" />)

      const wrapper = container.firstChild as HTMLElement
      fireEvent.mouseEnter(wrapper)

      expect(screen.getByText('Collaborator')).toBeInTheDocument()
      expect(screen.getByText('Contributed to the platform')).toBeInTheDocument()
    })

    it('scales badge on hover', () => {
      const { container } = render(<AvatarWithBadge alt="User" />)

      const wrapper = container.firstChild as HTMLElement
      fireEvent.mouseEnter(wrapper)

      const badgeOverlay = container.querySelector('[aria-label*="Badge"]')
      expect(badgeOverlay).toHaveClass('scale-125')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<AvatarWithBadge alt="User" className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('applies inline-flex to wrapper', () => {
      const { container } = render(<AvatarWithBadge alt="User" />)

      expect(container.firstChild).toHaveClass('inline-flex')
    })

    it('applies relative positioning', () => {
      const { container } = render(<AvatarWithBadge alt="User" />)

      expect(container.firstChild).toHaveClass('relative')
    })
  })
})
