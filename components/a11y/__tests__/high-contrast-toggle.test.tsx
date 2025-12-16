/**
 * Tests for HighContrastToggle component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HighContrastToggle } from '../high-contrast-toggle'

// Mock Button
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

describe('HighContrastToggle', () => {
  let localStorageMock: Record<string, string>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock = {}

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key]
        }),
      },
      writable: true,
    })

    // Reset document classList
    document.documentElement.classList.remove('high-contrast')
  })

  afterEach(() => {
    document.documentElement.classList.remove('high-contrast')
  })

  describe('Initial Rendering', () => {
    it('renders toggle button', () => {
      render(<HighContrastToggle />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has aria-label for activation', () => {
      render(<HighContrastToggle />)

      expect(screen.getByLabelText('Ativar alto contraste')).toBeInTheDocument()
    })

    it('has title for activation', () => {
      render(<HighContrastToggle />)

      expect(screen.getByTitle('Ativar alto contraste')).toBeInTheDocument()
    })
  })

  describe('Loading Saved State', () => {
    it('loads high contrast state from localStorage', () => {
      localStorageMock['highContrast'] = 'true'

      render(<HighContrastToggle />)

      expect(localStorage.getItem).toHaveBeenCalledWith('highContrast')
    })

    it('applies high-contrast class when saved as true', () => {
      localStorageMock['highContrast'] = 'true'

      render(<HighContrastToggle />)

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
    })

    it('does not apply high-contrast class when saved as false', () => {
      localStorageMock['highContrast'] = 'false'

      render(<HighContrastToggle />)

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
    })

    it('does not apply high-contrast class when no saved value', () => {
      render(<HighContrastToggle />)

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
    })
  })

  describe('Toggle Functionality', () => {
    it('enables high contrast on click', () => {
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
    })

    it('disables high contrast on second click', () => {
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('button'))

      expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
    })

    it('saves enabled state to localStorage', () => {
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))

      expect(localStorage.setItem).toHaveBeenCalledWith('highContrast', 'true')
    })

    it('saves disabled state to localStorage', () => {
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('button'))

      expect(localStorage.setItem).toHaveBeenCalledWith('highContrast', 'false')
    })
  })

  describe('Aria Labels', () => {
    it('shows deactivation label when high contrast is enabled', () => {
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByLabelText('Desativar alto contraste')).toBeInTheDocument()
    })

    it('shows activation label when high contrast is disabled', () => {
      localStorageMock['highContrast'] = 'true'
      render(<HighContrastToggle />)

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByLabelText('Ativar alto contraste')).toBeInTheDocument()
    })
  })
})
