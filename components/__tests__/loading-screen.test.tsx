import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LoadingScreen } from '../loading-screen'

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

describe('LoadingScreen', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.matchMedia = originalMatchMedia
    // Clean up any navigator mocks
    if ((window.navigator as any).standalone !== undefined) {
      delete (window.navigator as any).standalone
    }
  })

  describe('visibility', () => {
    it('returns null when not in standalone mode', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })

      const { container } = render(<LoadingScreen />)

      act(() => {
        vi.runAllTimers()
      })

      expect(container.firstChild).toBeNull()
    })

    it('renders when in standalone display mode', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })

      render(<LoadingScreen />)

      expect(screen.getByText('Cidadão.AI')).toBeInTheDocument()
    })

    it('renders when navigator.standalone is true (iOS)', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
      ;(window.navigator as any).standalone = true

      render(<LoadingScreen />)

      expect(screen.getByText('Cidadão.AI')).toBeInTheDocument()
    })
  })

  describe('content', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    })

    it('renders logo image', () => {
      render(<LoadingScreen />)
      expect(screen.getByAltText('Cidadão.AI')).toBeInTheDocument()
    })

    it('renders loading text', () => {
      render(<LoadingScreen />)
      expect(screen.getByText('Carregando transparência...')).toBeInTheDocument()
    })

    it('renders made in Brazil text', () => {
      render(<LoadingScreen />)
      expect(screen.getByText('Feito no Brasil, para o Brasil')).toBeInTheDocument()
    })

    it('renders Brazil flag emojis', () => {
      render(<LoadingScreen />)
      const flags = screen.getAllByText('🇧🇷')
      expect(flags.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('progress animation', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    })

    it('starts at 0% progress', () => {
      const { container } = render(<LoadingScreen />)
      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    it('increases progress over time', () => {
      const { container } = render(<LoadingScreen />)

      // Progress should increase by 10% every 200ms
      act(() => {
        vi.advanceTimersByTime(200)
      })

      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle({ width: '10%' })
    })

    it('reaches 100% progress', () => {
      const { container } = render(<LoadingScreen />)

      // 10 intervals of 200ms = 2000ms to reach 100%
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      const progressBar = container.querySelector('[style*="width"]')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('hides screen after progress completes', () => {
      const { container } = render(<LoadingScreen />)

      // Reach 100% (10 intervals of 200ms)
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Run the setTimeout callback for fade out (500ms + extra margin)
      act(() => {
        vi.advanceTimersByTime(600)
      })

      // Also run any remaining timers
      act(() => {
        vi.runAllTimers()
      })

      expect(container.firstChild).toBeNull()
    })
  })

  describe('styling', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    })

    it('has fixed position overlay', () => {
      const { container } = render(<LoadingScreen />)
      expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'z-[100]')
    })

    it('has gradient background', () => {
      const { container } = render(<LoadingScreen />)
      expect(container.firstChild).toHaveClass('bg-gradient-to-br')
    })

    it('has centered content', () => {
      const { container } = render(<LoadingScreen />)
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('logo has animation', () => {
      const { container } = render(<LoadingScreen />)
      const logoContainer = container.querySelector('.animate-pulse')
      expect(logoContainer).toBeInTheDocument()
    })
  })

  describe('cleanup', () => {
    it('clears interval on unmount', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const { unmount } = render(<LoadingScreen />)

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })
})
