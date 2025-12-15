/**
 * Tests for AgoraHeader component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgoraHeader } from '../agora-header'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/pt/agora'),
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

vi.mock('@/components/badge', () => ({
  AvatarWithBadge: ({ alt, fallbackInitial }: any) => (
    <div data-testid="avatar" data-alt={alt} data-initial={fallbackInitial}>
      Avatar
    </div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, open }: any) => (
    <div data-testid="dropdown-menu" data-open={open}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="dropdown-item">
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

describe('AgoraHeader', () => {
  const defaultUser = {
    name: 'João Silva',
    avatar: '/avatars/joao.png',
    totalXp: 1500,
    currentLevel: 5,
    currentRank: 'aprendiz',
  }

  const defaultProps = {
    user: defaultUser,
    onLogout: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders header with logo', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByText('Ágora')).toBeInTheDocument()
      expect(screen.getByText('Cidadão.AI')).toBeInTheDocument()
    })

    it('renders user XP', () => {
      render(<AgoraHeader {...defaultProps} />)

      // Multiple XP displays (desktop and mobile), use getAllByText
      const xpElements = screen.getAllByText(/1\.500 XP/i)
      expect(xpElements.length).toBeGreaterThan(0)
    })

    it('renders avatar component', () => {
      render(<AgoraHeader {...defaultProps} />)

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('data-alt', 'João Silva')
    })

    it('renders theme toggle', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })

    it('displays user first name', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByText('João')).toBeInTheDocument()
    })

    it('displays user level', () => {
      render(<AgoraHeader {...defaultProps} />)

      // Level displayed in multiple places (header and dropdown)
      const levelElements = screen.getAllByText('Lv.5')
      expect(levelElements.length).toBeGreaterThan(0)
    })

    it('applies custom className', () => {
      const { container } = render(<AgoraHeader {...defaultProps} className="custom-class" />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('custom-class')
    })
  })

  describe('XP Display', () => {
    it('formats XP with thousand separator', () => {
      render(<AgoraHeader {...defaultProps} />)

      // Multiple XP displays (desktop and mobile)
      const xpElements = screen.getAllByText(/1\.500 XP/i)
      expect(xpElements.length).toBeGreaterThan(0)
    })

    it('shows abbreviated XP on mobile for large values', () => {
      const userWithHighXp = {
        ...defaultUser,
        totalXp: 15000,
      }

      render(<AgoraHeader {...defaultProps} user={userWithHighXp} />)

      // Should show abbreviated version for mobile
      expect(screen.getByText('15.0k')).toBeInTheDocument()
    })

    it('shows full XP on mobile for small values', () => {
      const userWithLowXp = {
        ...defaultUser,
        totalXp: 500,
      }

      render(<AgoraHeader {...defaultProps} user={userWithLowXp} />)

      // Multiple displays for XP
      const xpElements = screen.getAllByText('500')
      expect(xpElements.length).toBeGreaterThan(0)
    })
  })

  describe('Demo Mode', () => {
    it('shows demo banner when in demo mode', () => {
      render(<AgoraHeader {...defaultProps} isDemoMode />)

      expect(screen.getByText('Modo Demo')).toBeInTheDocument()
    })

    it('shows reset option in demo mode', () => {
      render(<AgoraHeader {...defaultProps} isDemoMode />)

      expect(screen.getByText('Resetar Demo')).toBeInTheDocument()
    })

    it('hides demo banner in normal mode', () => {
      render(<AgoraHeader {...defaultProps} isDemoMode={false} />)

      expect(screen.queryByText('Modo Demo')).not.toBeInTheDocument()
    })
  })

  describe('Kids Mode', () => {
    it('shows child name when in kids mode', () => {
      render(<AgoraHeader {...defaultProps} isKidsMode kidsChildName="Maria" />)

      // Maria appears in multiple places (header and dropdown)
      const mariaElements = screen.getAllByText('Maria')
      expect(mariaElements.length).toBeGreaterThan(0)
    })

    it('hides XP display in kids mode', () => {
      render(<AgoraHeader {...defaultProps} isKidsMode kidsChildName="Maria" />)

      expect(screen.queryAllByText(/XP/i)).toHaveLength(0)
    })

    it('shows Área Kids label in kids mode', () => {
      render(<AgoraHeader {...defaultProps} isKidsMode kidsChildName="Maria" />)

      expect(screen.getByText('Área Kids')).toBeInTheDocument()
    })

    it('shows exit kids mode option', () => {
      render(<AgoraHeader {...defaultProps} isKidsMode kidsChildName="Maria" />)

      expect(screen.getByText('Sair da Área Kids')).toBeInTheDocument()
    })
  })

  describe('Dropdown Menu', () => {
    it('renders dropdown menu', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })

    it('shows user rank in dropdown', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByText('aprendiz')).toBeInTheDocument()
    })

    it('shows logout option', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('calls onLogout when logout clicked', async () => {
      const user = userEvent.setup()
      const onLogout = vi.fn()

      render(<AgoraHeader {...defaultProps} onLogout={onLogout} />)

      await user.click(screen.getByText('Sair'))

      expect(onLogout).toHaveBeenCalled()
    })

    it('shows menu links', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
      expect(screen.getByText('Ranking')).toBeInTheDocument()
      expect(screen.getByText('Configurações')).toBeInTheDocument()
      expect(screen.getByText('Atividades')).toBeInTheDocument()
      expect(screen.getByText('Ajuda')).toBeInTheDocument()
    })
  })

  describe('Switch Mode', () => {
    it('shows switch mode option when callback provided', () => {
      render(<AgoraHeader {...defaultProps} onSwitchMode={() => {}} />)

      expect(screen.getByText('Trocar Modo')).toBeInTheDocument()
    })

    it('hides switch mode option when callback not provided', () => {
      render(<AgoraHeader {...defaultProps} />)

      expect(screen.queryByText('Trocar Modo')).not.toBeInTheDocument()
    })

    it('calls onSwitchMode when clicked', async () => {
      const user = userEvent.setup()
      const onSwitchMode = vi.fn()

      render(<AgoraHeader {...defaultProps} onSwitchMode={onSwitchMode} />)

      await user.click(screen.getByText('Trocar Modo'))

      expect(onSwitchMode).toHaveBeenCalled()
    })
  })

  describe('Navigation Links', () => {
    it('has link to dashboard', () => {
      render(<AgoraHeader {...defaultProps} />)

      const link = screen.getByRole('link', { name: /agora dashboard/i })
      expect(link).toHaveAttribute('href', '/pt/agora')
    })

    it('has link to profile', () => {
      render(<AgoraHeader {...defaultProps} />)

      const profileLink = screen.getByText('Meu Perfil').closest('a')
      expect(profileLink).toHaveAttribute('href', '/pt/agora/perfil')
    })

    it('has link to ranking', () => {
      render(<AgoraHeader {...defaultProps} />)

      const rankingLink = screen.getByText('Ranking').closest('a')
      expect(rankingLink).toHaveAttribute('href', '/pt/agora/ranking')
    })

    it('has link to settings', () => {
      render(<AgoraHeader {...defaultProps} />)

      const settingsLink = screen.getByText('Configurações').closest('a')
      expect(settingsLink).toHaveAttribute('href', '/pt/agora/configuracoes')
    })
  })

  describe('Breadcrumb', () => {
    it('does not show breadcrumb on dashboard', () => {
      render(<AgoraHeader {...defaultProps} />)

      // Dashboard is the root, no breadcrumb
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Rank Colors', () => {
    it('applies correct color for novato rank', () => {
      const novatoUser = { ...defaultUser, currentRank: 'novato' }
      render(<AgoraHeader {...defaultProps} user={novatoUser} />)

      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-gray')
    })

    it('applies correct color for aprendiz rank', () => {
      render(<AgoraHeader {...defaultProps} />)

      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-green')
    })

    it('applies correct color for mentor rank', () => {
      const mentorUser = { ...defaultUser, currentRank: 'mentor' }
      render(<AgoraHeader {...defaultProps} user={mentorUser} />)

      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-purple')
    })
  })

  describe('Accessibility', () => {
    it('has aria-label on logo link', () => {
      render(<AgoraHeader {...defaultProps} />)

      const logoLink = screen.getByRole('link', { name: /agora dashboard/i })
      expect(logoLink).toHaveAttribute('aria-label', 'Agora Dashboard')
    })
  })
})
