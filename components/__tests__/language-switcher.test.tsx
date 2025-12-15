/**
 * Tests for LanguageSwitcher components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageSwitcherOriginal } from '../language-switcher'

// Mock dependencies
const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/pt'),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('LanguageSwitcherOriginal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/pt')
  })

  describe('Rendering', () => {
    it('renders both language links', () => {
      render(<LanguageSwitcherOriginal />)

      expect(screen.getByText('PT')).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('has correct href for PT link', () => {
      render(<LanguageSwitcherOriginal />)

      const ptLink = screen.getByText('PT')
      expect(ptLink).toHaveAttribute('href', '/pt')
    })

    it('has correct href for EN link', () => {
      render(<LanguageSwitcherOriginal />)

      const enLink = screen.getByText('EN')
      expect(enLink).toHaveAttribute('href', '/en')
    })
  })

  describe('Active State - PT', () => {
    it('shows PT as active when on PT path', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSwitcherOriginal />)

      const ptLink = screen.getByText('PT')
      expect(ptLink.className).toContain('bg-green-600')
      expect(ptLink.className).toContain('text-white')
    })

    it('shows EN as inactive when on PT path', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSwitcherOriginal />)

      const enLink = screen.getByText('EN')
      expect(enLink.className).toContain('bg-gray-200')
      expect(enLink.className).toContain('text-gray-700')
    })

    it('detects PT from nested path', () => {
      mockUsePathname.mockReturnValue('/pt/app/dashboard')

      render(<LanguageSwitcherOriginal />)

      const ptLink = screen.getByText('PT')
      expect(ptLink.className).toContain('bg-green-600')
    })
  })

  describe('Active State - EN', () => {
    it('shows EN as active when on EN path', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<LanguageSwitcherOriginal />)

      const enLink = screen.getByText('EN')
      expect(enLink.className).toContain('bg-green-600')
      expect(enLink.className).toContain('text-white')
    })

    it('shows PT as inactive when on EN path', () => {
      mockUsePathname.mockReturnValue('/en')

      render(<LanguageSwitcherOriginal />)

      const ptLink = screen.getByText('PT')
      expect(ptLink.className).toContain('bg-gray-200')
      expect(ptLink.className).toContain('text-gray-700')
    })

    it('detects EN from nested path', () => {
      mockUsePathname.mockReturnValue('/en/app/chat')

      render(<LanguageSwitcherOriginal />)

      const enLink = screen.getByText('EN')
      expect(enLink.className).toContain('bg-green-600')
    })
  })

  describe('Styling', () => {
    it('has fixed positioning', () => {
      const { container } = render(<LanguageSwitcherOriginal />)

      const wrapper = container.firstChild
      expect((wrapper as HTMLElement).className).toContain('fixed')
    })

    it('has top-right positioning', () => {
      const { container } = render(<LanguageSwitcherOriginal />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('top-4')
      expect(wrapper.className).toContain('right-4')
    })

    it('links have rounded corners', () => {
      render(<LanguageSwitcherOriginal />)

      const ptLink = screen.getByText('PT')
      expect(ptLink.className).toContain('rounded-md')
    })

    it('inactive links have hover effect', () => {
      mockUsePathname.mockReturnValue('/pt')

      render(<LanguageSwitcherOriginal />)

      const enLink = screen.getByText('EN')
      expect(enLink.className).toContain('hover:bg-gray-300')
    })
  })
})
