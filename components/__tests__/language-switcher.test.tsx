import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageSwitcherV2, LanguageSwitcher } from '../language-switcher-v2'

// Mock Next.js modules
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

describe('LanguageSwitcherV2', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/pt')
  })

  describe('default variant', () => {
    it('renders PT and EN links', () => {
      render(<LanguageSwitcherV2 />)
      expect(screen.getByText('PT')).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('highlights PT when on Portuguese page', () => {
      mockUsePathname.mockReturnValue('/pt')
      render(<LanguageSwitcherV2 />)

      const ptLink = screen.getByText('PT')
      expect(ptLink).toHaveClass('bg-green-600', 'text-white')
    })

    it('highlights EN when on English page', () => {
      mockUsePathname.mockReturnValue('/en')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveClass('bg-green-600', 'text-white')
    })

    it('does not highlight EN on Portuguese page', () => {
      mockUsePathname.mockReturnValue('/pt')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).not.toHaveClass('bg-green-600')
    })
  })

  describe('mobile variant', () => {
    it('renders full language names', () => {
      render(<LanguageSwitcherV2 variant="mobile" />)
      expect(screen.getByText('Português')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('highlights Português when on Portuguese page', () => {
      mockUsePathname.mockReturnValue('/pt')
      render(<LanguageSwitcherV2 variant="mobile" />)

      const ptLink = screen.getByText('Português')
      expect(ptLink).toHaveClass('bg-green-600', 'text-white')
    })

    it('highlights English when on English page', () => {
      mockUsePathname.mockReturnValue('/en')
      render(<LanguageSwitcherV2 variant="mobile" />)

      const enLink = screen.getByText('English')
      expect(enLink).toHaveClass('bg-green-600', 'text-white')
    })
  })

  describe('localized paths', () => {
    it('generates correct PT path from home', () => {
      mockUsePathname.mockReturnValue('/en')
      render(<LanguageSwitcherV2 />)

      const ptLink = screen.getByText('PT')
      expect(ptLink).toHaveAttribute('href', '/pt')
    })

    it('generates correct EN path from home', () => {
      mockUsePathname.mockReturnValue('/pt')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveAttribute('href', '/en')
    })

    it('preserves path when switching from PT to EN', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveAttribute('href', '/en/app/dashboard')
    })

    it('preserves path when switching from EN to PT', () => {
      mockUsePathname.mockReturnValue('/en/app/chat')
      render(<LanguageSwitcherV2 />)

      const ptLink = screen.getByText('PT')
      expect(ptLink).toHaveAttribute('href', '/pt/app/chat')
    })

    it('handles nested paths correctly', () => {
      mockUsePathname.mockReturnValue('/pt/agora/trilhas/cidadania')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveAttribute('href', '/en/agora/trilhas/cidadania')
    })

    it('handles root path with trailing slash', () => {
      mockUsePathname.mockReturnValue('/pt/')
      render(<LanguageSwitcherV2 />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveAttribute('href', '/en')
    })
  })

  describe('className prop', () => {
    it('applies custom className in default variant', () => {
      const { container } = render(<LanguageSwitcherV2 className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('applies custom className in mobile variant', () => {
      const { container } = render(
        <LanguageSwitcherV2 variant="mobile" className="mobile-custom" />
      )
      expect(container.firstChild).toHaveClass('mobile-custom')
    })
  })

  describe('styling', () => {
    it('has flex container', () => {
      const { container } = render(<LanguageSwitcherV2 />)
      expect(container.firstChild).toHaveClass('flex', 'gap-2')
    })

    it('links have font-medium class', () => {
      render(<LanguageSwitcherV2 />)

      const ptLink = screen.getByText('PT')
      const enLink = screen.getByText('EN')

      expect(ptLink).toHaveClass('font-medium')
      expect(enLink).toHaveClass('font-medium')
    })

    it('links have rounded corners', () => {
      render(<LanguageSwitcherV2 />)

      const ptLink = screen.getByText('PT')
      expect(ptLink).toHaveClass('rounded')
    })
  })

  describe('accessibility', () => {
    it('renders as anchor elements', () => {
      render(<LanguageSwitcherV2 />)

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
    })

    it('links have accessible text', () => {
      render(<LanguageSwitcherV2 />)

      expect(screen.getByText('PT')).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('mobile variant has full language names for clarity', () => {
      render(<LanguageSwitcherV2 variant="mobile" />)

      expect(screen.getByText('Português')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })
})

describe('LanguageSwitcher (alias)', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/pt')
  })

  it('is exported as alias', () => {
    expect(LanguageSwitcher).toBe(LanguageSwitcherV2)
  })

  it('renders correctly via alias', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText('PT')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })
})
