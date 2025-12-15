/**
 * Tests for SimplifiedHeader component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimplifiedHeader } from '../simplified-header'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="logo-image"
    />
  ),
}))

const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => '/pt'),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

describe('SimplifiedHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt')
  })

  describe('Rendering - Portuguese', () => {
    it('renders logo image', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
    })

    it('renders brand name', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByText('Cidadão.AI')).toBeInTheDocument()
    })

    it('renders login button in Portuguese', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByText('Entrar')).toBeInTheDocument()
    })

    it('renders Brazilian flag for PT locale', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByText('🇧🇷')).toBeInTheDocument()
    })

    it('renders theme toggle', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })
  })

  describe('Rendering - English', () => {
    it('renders login button in English', () => {
      render(<SimplifiedHeader locale="en" />)

      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('renders US flag for EN locale', () => {
      render(<SimplifiedHeader locale="en" />)

      expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('home link points to locale root - PT', () => {
      render(<SimplifiedHeader locale="pt" />)

      const homeLink = screen.getByRole('link', { name: /cidadão\.ai home/i })
      expect(homeLink).toHaveAttribute('href', '/pt')
    })

    it('home link points to locale root - EN', () => {
      render(<SimplifiedHeader locale="en" />)

      const homeLink = screen.getByRole('link', { name: /cidadão\.ai home/i })
      expect(homeLink).toHaveAttribute('href', '/en')
    })

    it('login link points to locale login page - PT', () => {
      render(<SimplifiedHeader locale="pt" />)

      const loginLink = screen.getByText('Entrar').closest('a')
      expect(loginLink).toHaveAttribute('href', '/pt/login')
    })

    it('login link points to locale login page - EN', () => {
      render(<SimplifiedHeader locale="en" />)

      const loginLink = screen.getByText('Login').closest('a')
      expect(loginLink).toHaveAttribute('href', '/en/login')
    })
  })

  describe('Language Toggle', () => {
    it('has correct aria-label for PT locale', () => {
      render(<SimplifiedHeader locale="pt" />)

      const langButton = screen.getByRole('button', { name: /alterar idioma para inglês/i })
      expect(langButton).toBeInTheDocument()
    })

    it('has correct aria-label for EN locale', () => {
      render(<SimplifiedHeader locale="en" />)

      const langButton = screen.getByRole('button', { name: /switch language to portuguese/i })
      expect(langButton).toBeInTheDocument()
    })

    it('navigates to EN when toggling from PT', async () => {
      const user = userEvent.setup()

      render(<SimplifiedHeader locale="pt" />)

      await user.click(screen.getByText('🇧🇷'))

      expect(mockPush).toHaveBeenCalledWith('/en')
    })

    it('navigates to PT when toggling from EN', async () => {
      // Mock for EN path
      mockUsePathname.mockReturnValue('/en')

      const user = userEvent.setup()

      render(<SimplifiedHeader locale="en" />)

      await user.click(screen.getByText('🇺🇸'))

      expect(mockPush).toHaveBeenCalledWith('/pt')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<SimplifiedHeader locale="pt" className="custom-class" />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('custom-class')
    })

    it('has fixed positioning', () => {
      const { container } = render(<SimplifiedHeader locale="pt" />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('fixed')
    })

    it('has z-index for overlay', () => {
      const { container } = render(<SimplifiedHeader locale="pt" />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('z-50')
    })

    it('has backdrop blur', () => {
      const { container } = render(<SimplifiedHeader locale="pt" />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('backdrop-blur-lg')
    })
  })

  describe('Accessibility', () => {
    it('has navigation role', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('flag has img role with label - PT', () => {
      render(<SimplifiedHeader locale="pt" />)

      expect(screen.getByRole('img', { name: /bandeira do brasil/i })).toBeInTheDocument()
    })

    it('flag has img role with label - EN', () => {
      render(<SimplifiedHeader locale="en" />)

      expect(screen.getByRole('img', { name: /us flag/i })).toBeInTheDocument()
    })
  })

  describe('Logo Image', () => {
    it('uses forum-icon.png as logo', () => {
      render(<SimplifiedHeader locale="pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('src', '/forum-icon.png')
    })

    it('has correct alt text', () => {
      render(<SimplifiedHeader locale="pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('alt', 'Greek Forum')
    })
  })
})
