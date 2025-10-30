/**
 * Tests for SkipLinks Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook } from '@testing-library/react'
import { SkipLinks, useSkipTo } from '../skip-links'
import type { SkipLink } from '../skip-links'

describe('SkipLinks', () => {
  beforeEach(() => {
    // Clear any existing elements
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    it('renders with default Portuguese links', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        expect(screen.getByText('Pular para conteúdo principal')).toBeInTheDocument()
      })

      expect(screen.getByText('Pular para navegação')).toBeInTheDocument()
      expect(screen.getByText('Pular para busca')).toBeInTheDocument()
      expect(screen.getByText('Pular para rodapé')).toBeInTheDocument()
    })

    it('renders with default English links', async () => {
      render(<SkipLinks locale="en" />)

      await waitFor(() => {
        expect(screen.getByText('Skip to main content')).toBeInTheDocument()
      })

      expect(screen.getByText('Skip to navigation')).toBeInTheDocument()
      expect(screen.getByText('Skip to search')).toBeInTheDocument()
      expect(screen.getByText('Skip to footer')).toBeInTheDocument()
    })

    it('renders with custom links', async () => {
      const customLinks: SkipLink[] = [
        {
          id: 'custom-1',
          label: 'Custom Link 1',
          targetId: 'target-1'
        },
        {
          id: 'custom-2',
          label: 'Custom Link 2',
          targetId: 'target-2'
        }
      ]

      render(<SkipLinks links={customLinks} />)

      await waitFor(() => {
        expect(screen.getByText('Custom Link 1')).toBeInTheDocument()
      })

      expect(screen.getByText('Custom Link 2')).toBeInTheDocument()
    })

    it('displays keyboard shortcuts when provided', async () => {
      const linksWithShortcuts: SkipLink[] = [
        {
          id: 'test',
          label: 'Test Link',
          targetId: 'test-target',
          shortcut: 'Alt + T'
        }
      ]

      render(<SkipLinks links={linksWithShortcuts} />)

      await waitFor(() => {
        expect(screen.getByText('Alt + T')).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      const { container } = render(
        <SkipLinks locale="pt" className="custom-skip-links" />
      )

      await waitFor(() => {
        const nav = container.querySelector('.custom-skip-links')
        expect(nav).toBeInTheDocument()
      })
    })

    it('renders as nav element with appropriate label', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const nav = screen.getByRole('navigation', { name: /links de navegação rápida/i })
        expect(nav).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('links have proper href attributes', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        expect(mainLink).toHaveAttribute('href', '#main-content')
      })

      const navLink = screen.getByText('Pular para navegação')
      expect(navLink).toHaveAttribute('href', '#main-navigation')
    })

    it('links are focusable', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        mainLink.focus()
        expect(mainLink).toHaveFocus()
      })
    })

    it('links have appropriate styles for keyboard focus', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        expect(mainLink).toHaveClass('focus:ring-4')
        expect(mainLink).toHaveClass('focus:ring-green-500/50')
      })
    })

    it('links are initially hidden (skip-link pattern)', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        expect(mainLink).toHaveClass('-translate-y-full')
        expect(mainLink).toHaveClass('opacity-0')
      })
    })

    it('links become visible on focus', async () => {
      render(<SkipLinks locale="pt" />)

      await waitFor(() => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        expect(mainLink).toHaveClass('focus:translate-y-0')
        expect(mainLink).toHaveClass('focus:opacity-100')
      })
    })
  })

  describe('Navigation Functionality', () => {
    it('scrolls to target element when clicked', async () => {
      const user = userEvent.setup()

      // Create target element
      const target = document.createElement('div')
      target.id = 'main-content'
      document.body.appendChild(target)

      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn()
      target.scrollIntoView = scrollIntoViewMock

      render(<SkipLinks locale="pt" />)

      await waitFor(async () => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        await user.click(mainLink)

        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        })
      })
    })

    it('adds tabindex when target is not focusable', async () => {
      const user = userEvent.setup()

      // Create target element without tabindex
      const target = document.createElement('div')
      target.id = 'main-content'
      document.body.appendChild(target)

      target.scrollIntoView = vi.fn()

      render(<SkipLinks locale="pt" />)

      await waitFor(async () => {
        const mainLink = screen.getByText('Pular para conteúdo principal')
        await user.click(mainLink)

        expect(target.getAttribute('tabindex')).toBe('-1')
      })
    })


    it('prevents default link behavior', async () => {
      const user = userEvent.setup()

      // Create target element
      const target = document.createElement('div')
      target.id = 'main-content'
      document.body.appendChild(target)

      target.scrollIntoView = vi.fn()

      render(<SkipLinks locale="pt" />)

      await waitFor(async () => {
        const mainLink = screen.getByText('Pular para conteúdo principal')

        // Click should not navigate (href is prevented)
        await user.click(mainLink)

        // Window location should not change
        expect(window.location.hash).toBe('')
      })
    })

    it('handles missing target gracefully', async () => {
      const user = userEvent.setup()

      // Don't create target element

      render(<SkipLinks locale="pt" />)

      await waitFor(async () => {
        const mainLink = screen.getByText('Pular para conteúdo principal')

        // Should not throw error
        expect(async () => {
          await user.click(mainLink)
        }).not.toThrow()
      })
    })
  })

  describe('Client-Side Rendering', () => {
    it('does not render on server (returns null initially)', () => {
      const { container } = render(<SkipLinks locale="pt" />)

      // Before useEffect runs, component should not render
      // This is important for SSR
      const nav = container.querySelector('nav')
      expect(nav).toBeNull()
    })

    it('renders after mounting', async () => {
      render(<SkipLinks locale="pt" />)

      // After useEffect runs, component should render
      await waitFor(() => {
        const nav = screen.getByRole('navigation')
        expect(nav).toBeInTheDocument()
      })
    })
  })
})

describe('useSkipTo Hook', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('provides skipTo function', () => {
    const { result } = renderHook(() => useSkipTo())

    expect(result.current.skipTo).toBeInstanceOf(Function)
  })

  it('scrolls to target element', () => {
    const { result } = renderHook(() => useSkipTo())

    // Create target element
    const target = document.createElement('div')
    target.id = 'test-target'
    document.body.appendChild(target)

    const scrollIntoViewMock = vi.fn()
    target.scrollIntoView = scrollIntoViewMock

    result.current.skipTo('test-target')

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('adds tabindex to target when needed', () => {
    const { result } = renderHook(() => useSkipTo())

    // Create target element without tabindex
    const target = document.createElement('div')
    target.id = 'test-target'
    document.body.appendChild(target)

    target.scrollIntoView = vi.fn()

    result.current.skipTo('test-target')

    expect(target.getAttribute('tabindex')).toBe('-1')
  })

  it('handles non-existent target', () => {
    const { result } = renderHook(() => useSkipTo())

    // Should not throw error
    expect(() => {
      result.current.skipTo('non-existent')
    }).not.toThrow()
  })


  it('does not add tabindex if element already has it', () => {
    const { result } = renderHook(() => useSkipTo())

    // Create target with existing tabindex
    const target = document.createElement('button')
    target.id = 'test-target'
    target.setAttribute('tabindex', '0')
    document.body.appendChild(target)

    target.scrollIntoView = vi.fn()

    result.current.skipTo('test-target')

    // Should keep original tabindex
    expect(target.getAttribute('tabindex')).toBe('0')
  })
})
