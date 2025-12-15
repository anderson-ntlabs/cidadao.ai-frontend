import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'

// Mock lucide-react icons - need to include all icons used by dependencies
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return {
    ...actual,
    Moon: () => <svg data-testid="moon-icon" />,
    Sun: () => <svg data-testid="sun-icon" />,
  }
})

describe('ThemeToggle', () => {
  const originalLocalStorage = window.localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    length: 0,
    key: vi.fn(),
  }

  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    mockLocalStorage.getItem.mockReturnValue(null)

    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
      writable: true,
    })

    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
    })
    vi.clearAllMocks()
  })

  describe('initial rendering', () => {
    it('renders a button', () => {
      render(<ThemeToggle />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('shows moon icon in light mode', () => {
      render(<ThemeToggle />)
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    it('has correct aria-label in light mode', () => {
      render(<ThemeToggle />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode')
    })
  })

  describe('theme detection', () => {
    it('uses saved theme from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      render(<ThemeToggle />)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('uses system preference if no saved theme', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      render(<ThemeToggle />)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })

  describe('theme toggling', () => {
    it('toggles from light to dark', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('toggles from dark to light', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('saves theme to localStorage', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      fireEvent.click(button)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('updates aria-label after toggle', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')

      fireEvent.click(button)

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })

  describe('dark class on document', () => {
    it('adds dark class when dark theme selected', () => {
      mockLocalStorage.getItem.mockReturnValue('dark')
      render(<ThemeToggle />)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class when light theme selected', () => {
      document.documentElement.classList.add('dark')
      mockLocalStorage.getItem.mockReturnValue('dark')
      render(<ThemeToggle />)

      fireEvent.click(screen.getByRole('button'))

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('multiple toggles', () => {
    it('toggles multiple times correctly', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      // Start light, toggle to dark
      fireEvent.click(button)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()

      // Toggle to light
      fireEvent.click(button)
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()

      // Toggle to dark again
      fireEvent.click(button)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })
  })
})
