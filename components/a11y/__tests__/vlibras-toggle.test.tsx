/**
 * Tests for VLibrasToggle component and useVLibras hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react'
import { VLibrasToggle } from '../vlibras-toggle'
import { useVLibras } from '../vlibras-widget'

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Languages: () => <span data-testid="languages-icon">Languages</span>,
}))

describe('VLibrasToggle', () => {
  let localStorageMock: Record<string, string>
  let dispatchEventSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
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

    // Spy on dispatchEvent
    dispatchEventSpy = vi.fn()
    window.dispatchEvent = dispatchEventSpy
  })

  afterEach(() => {
    vi.useRealTimers()
    // Clean up any announcements
    document.querySelectorAll('[role="status"]').forEach((el) => el.remove())
  })

  describe('Locale Filtering', () => {
    it('returns null for English locale', () => {
      const { container } = render(<VLibrasToggle locale="en" />)

      expect(container.firstChild).toBeNull()
    })

    it('renders for Portuguese locale', async () => {
      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Button Variant (default)', () => {
    it('renders button with icon', async () => {
      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTestId('languages-icon')).toBeInTheDocument()
    })

    it('has aria-label for activation when disabled', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByLabelText('Ativar VLibras (LIBRAS)')).toBeInTheDocument()
    })

    it('has aria-label for deactivation when enabled', async () => {
      localStorageMock['vlibras-enabled'] = 'true'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByLabelText('Desativar VLibras (LIBRAS)')).toBeInTheDocument()
    })

    it('has aria-pressed attribute', async () => {
      localStorageMock['vlibras-enabled'] = 'true'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('shows label when showLabel is true', async () => {
      render(<VLibrasToggle locale="pt" showLabel />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByText('VLibras')).toBeInTheDocument()
    })

    it('hides label by default', async () => {
      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.queryByText('VLibras')).not.toBeInTheDocument()
    })
  })

  describe('Switch Variant', () => {
    it('renders switch element', async () => {
      render(<VLibrasToggle locale="pt" variant="switch" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('has aria-checked attribute', async () => {
      localStorageMock['vlibras-enabled'] = 'true'

      render(<VLibrasToggle locale="pt" variant="switch" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    })

    it('has aria-label for activation', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" variant="switch" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByLabelText('Ativar VLibras (LIBRAS)')).toBeInTheDocument()
    })

    it('shows label when showLabel is true', async () => {
      render(<VLibrasToggle locale="pt" variant="switch" showLabel />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByText('VLibras')).toBeInTheDocument()
    })
  })

  describe('Toggle Functionality', () => {
    it('toggles state on click (button variant)', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'true')
    })

    it('toggles state on click (switch variant)', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" variant="switch" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const switchEl = screen.getByRole('switch')
      fireEvent.click(switchEl)

      expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'true')
    })

    it('dispatches vlibras-toggle event', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      fireEvent.click(screen.getByRole('button'))

      expect(dispatchEventSpy).toHaveBeenCalled()
    })

    it('calls onChange callback', async () => {
      const onChange = vi.fn()
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" onChange={onChange} />)

      await act(async () => {
        vi.runAllTimers()
      })

      fireEvent.click(screen.getByRole('button'))

      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('creates screen reader announcement on toggle', async () => {
      localStorageMock['vlibras-enabled'] = 'false'

      render(<VLibrasToggle locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      fireEvent.click(screen.getByRole('button'))

      // Check announcement was created
      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()
      expect(announcement).toHaveAttribute('aria-live', 'assertive')
      expect(announcement?.textContent).toBe('VLibras ativado')

      // Clean up announcement after timeout
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(document.querySelector('[role="status"]')).toBeNull()
    })
  })

  describe('Custom Styles', () => {
    it('applies custom className', async () => {
      render(<VLibrasToggle locale="pt" className="custom-class" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('applies custom className to switch', async () => {
      render(<VLibrasToggle locale="pt" variant="switch" className="switch-class" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByRole('switch')).toHaveClass('switch-class')
    })
  })

  describe('English Translations', () => {
    it('uses English labels when locale is en (but returns null)', () => {
      const { container } = render(<VLibrasToggle locale="en" />)

      // VLibras only works in Portuguese, so it returns null for English
      expect(container.firstChild).toBeNull()
    })
  })
})

describe('useVLibras', () => {
  let localStorageMock: Record<string, string>
  let dispatchEventSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock = {}

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
      },
      writable: true,
    })

    dispatchEventSpy = vi.fn()
    window.dispatchEvent = dispatchEventSpy
  })

  it('returns default enabled state when no localStorage', () => {
    const { result } = renderHook(() => useVLibras())

    // Default is true when no preference is set
    expect(result.current.isEnabled).toBe(true)
  })

  it('loads enabled state from localStorage', () => {
    localStorageMock['vlibras-enabled'] = 'true'

    const { result } = renderHook(() => useVLibras())

    expect(result.current.isEnabled).toBe(true)
  })

  it('loads disabled state from localStorage', () => {
    localStorageMock['vlibras-enabled'] = 'false'

    const { result } = renderHook(() => useVLibras())

    expect(result.current.isEnabled).toBe(false)
  })

  it('toggle changes state from false to true', () => {
    localStorageMock['vlibras-enabled'] = 'false'

    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isEnabled).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'true')
  })

  it('toggle changes state from true to false', () => {
    localStorageMock['vlibras-enabled'] = 'true'

    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isEnabled).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'false')
  })

  it('toggle dispatches vlibras-toggle event', () => {
    localStorageMock['vlibras-enabled'] = 'false'

    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.toggle()
    })

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'vlibras-toggle',
        detail: { enabled: true },
      })
    )
  })

  it('enable sets state to true', () => {
    localStorageMock['vlibras-enabled'] = 'false'

    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.enable()
    })

    expect(result.current.isEnabled).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'true')
  })

  it('enable dispatches vlibras-toggle event', () => {
    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.enable()
    })

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'vlibras-toggle',
        detail: { enabled: true },
      })
    )
  })

  it('disable sets state to false', () => {
    localStorageMock['vlibras-enabled'] = 'true'

    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.disable()
    })

    expect(result.current.isEnabled).toBe(false)
    expect(localStorage.setItem).toHaveBeenCalledWith('vlibras-enabled', 'false')
  })

  it('disable dispatches vlibras-toggle event', () => {
    const { result } = renderHook(() => useVLibras())

    act(() => {
      result.current.disable()
    })

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'vlibras-toggle',
        detail: { enabled: false },
      })
    )
  })
})
