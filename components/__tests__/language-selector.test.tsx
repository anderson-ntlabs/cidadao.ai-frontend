/**
 * Tests for LanguageSelector component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSelector } from '../language-selector'

// Mock dependencies
const { mockUsePathname, mockPush } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt'),
  mockPush: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="dropdown-item">
      {children}
    </button>
  ),
}))

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt')
  })

  describe('Rendering', () => {
    it('renders dropdown menu', () => {
      render(<LanguageSelector />)

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })

    it('renders trigger button', () => {
      render(<LanguageSelector />)

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
    })

    it('shows Brazilian flag for PT locale', () => {
      mockUsePathname.mockReturnValue('/pt/app')

      render(<LanguageSelector />)

      // Flag appears in trigger and dropdown menu
      const flags = screen.getAllByText('🇧🇷')
      expect(flags.length).toBeGreaterThan(0)
    })

    it('shows US flag for EN locale', () => {
      mockUsePathname.mockReturnValue('/en/app')

      render(<LanguageSelector />)

      // Flag appears in trigger and dropdown menu
      const flags = screen.getAllByText('🇺🇸')
      expect(flags.length).toBeGreaterThan(0)
    })

    it('renders language options', () => {
      render(<LanguageSelector />)

      expect(screen.getByText('Português')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('shows checkmark for current language', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSelector />)

      // PT is current, should show checkmark next to it
      const items = screen.getAllByTestId('dropdown-item')
      const ptItem = items.find((item) => item.textContent?.includes('Português'))
      expect(ptItem?.textContent).toContain('✓')
    })
  })

  describe('Language Detection', () => {
    it('detects PT from /pt path', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSelector />)

      const trigger = screen.getByRole('button', { name: /language: português/i })
      expect(trigger).toBeInTheDocument()
    })

    it('detects PT from /pt/app path', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<LanguageSelector />)

      const trigger = screen.getByRole('button', { name: /language: português/i })
      expect(trigger).toBeInTheDocument()
    })

    it('detects EN from /en path', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<LanguageSelector />)

      const trigger = screen.getByRole('button', { name: /language: english/i })
      expect(trigger).toBeInTheDocument()
    })

    it('detects EN from /en/app path', () => {
      mockUsePathname.mockReturnValue('/en/app/dashboard')

      render(<LanguageSelector />)

      const trigger = screen.getByRole('button', { name: /language: english/i })
      expect(trigger).toBeInTheDocument()
    })

    it('defaults to PT for root path', () => {
      mockUsePathname.mockReturnValue('/')

      render(<LanguageSelector />)

      const trigger = screen.getByRole('button', { name: /language: português/i })
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Language Switching', () => {
    it('switches from PT to EN', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/app')

      render(<LanguageSelector />)

      const enOption = screen.getByText('English').closest('button')
      if (enOption) {
        await user.click(enOption)
      }

      expect(mockPush).toHaveBeenCalledWith('/en/app')
    })

    it('switches from EN to PT', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/app')

      render(<LanguageSelector />)

      const ptOption = screen.getByText('Português').closest('button')
      if (ptOption) {
        await user.click(ptOption)
      }

      expect(mockPush).toHaveBeenCalledWith('/pt/app')
    })

    it('does not navigate when clicking current language', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/app')

      render(<LanguageSelector />)

      const ptOption = screen.getByText('Português').closest('button')
      if (ptOption) {
        await user.click(ptOption)
      }

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Route Mapping PT to EN', () => {
    it('maps /pt/agentes to /en/agents', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/agentes')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en/agents')
    })

    it('maps /pt/sobre to /en/about', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/sobre')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en/about')
    })

    it('maps /pt/privacidade to /en/privacy', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/privacidade')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en/privacy')
    })

    it('maps /pt/termos to /en/terms', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/termos')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en/terms')
    })

    it('maps /pt/ajuda to /en/help', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt/ajuda')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en/help')
    })
  })

  describe('Route Mapping EN to PT', () => {
    it('maps /en/agents to /pt/agentes', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/agents')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt/agentes')
    })

    it('maps /en/about to /pt/sobre', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/about')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt/sobre')
    })

    it('maps /en/privacy to /pt/privacidade', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/privacy')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt/privacidade')
    })

    it('maps /en/terms to /pt/termos', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/terms')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt/termos')
    })

    it('maps /en/help to /pt/ajuda', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en/help')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt/ajuda')
    })
  })

  describe('Root Path Handling', () => {
    it('navigates to /en from /pt root', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSelector />)

      await user.click(screen.getByText('English').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/en')
    })

    it('navigates to /pt from /en root', async () => {
      const user = userEvent.setup()
      mockUsePathname.mockReturnValue('/en')

      render(<LanguageSelector />)

      await user.click(screen.getByText('Português').closest('button')!)

      expect(mockPush).toHaveBeenCalledWith('/pt')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<LanguageSelector className="custom-class" />)

      const button = screen.getByRole('button', { name: /language:/i })
      expect(button.className).toContain('custom-class')
    })

    it('highlights current language option', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSelector />)

      const items = screen.getAllByTestId('dropdown-item')
      const ptItem = items.find((item) => item.textContent?.includes('Português'))
      expect(ptItem?.className).toContain('bg-green-50')
    })
  })

  describe('Accessibility', () => {
    it('has aria-label on trigger button', () => {
      render(<LanguageSelector />)

      const button = screen.getByRole('button', { name: /language:/i })
      expect(button).toHaveAttribute('aria-label')
    })

    it('aria-label includes current language', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<LanguageSelector />)

      const button = screen.getByRole('button', { name: /language: english/i })
      expect(button).toBeInTheDocument()
    })
  })
})
