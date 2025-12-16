/**
 * Tests for FontSizeControl component and useFontSize hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react'
import { FontSizeControl, useFontSize } from '../font-size-control'

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

describe('FontSizeControl', () => {
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

    // Reset document root style
    document.documentElement.style.fontSize = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.documentElement.style.fontSize = ''
  })

  describe('Rendering', () => {
    it('renders controls after mount', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByLabelText('Diminuir tamanho da fonte')).toBeInTheDocument()
      expect(screen.getByLabelText('Aumentar tamanho da fonte')).toBeInTheDocument()
    })

    it('renders current size indicator', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByText('A')).toBeInTheDocument() // Normal size indicator
    })
  })

  describe('Locale', () => {
    it('uses Portuguese labels', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTitle('Diminuir tamanho da fonte')).toBeInTheDocument()
      expect(screen.getByTitle('Aumentar tamanho da fonte')).toBeInTheDocument()
    })

    it('uses English labels', async () => {
      render(<FontSizeControl locale="en" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByTitle('Decrease font size')).toBeInTheDocument()
      expect(screen.getByTitle('Increase font size')).toBeInTheDocument()
    })
  })

  describe('Increase/Decrease', () => {
    it('increases font size on click', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      fireEvent.click(increaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(document.documentElement.style.fontSize).toBe('18px')
      expect(screen.getByText('A+')).toBeInTheDocument()
    })

    it('decreases font size on click', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      // First increase
      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      fireEvent.click(increaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      // Then decrease
      const decreaseBtn = screen.getByLabelText('Diminuir tamanho da fonte')
      fireEvent.click(decreaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(document.documentElement.style.fontSize).toBe('16px')
    })

    it('disables decrease at smallest size', async () => {
      localStorageMock['fontSize'] = 'small'

      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const decreaseBtn = screen.getByLabelText('Diminuir tamanho da fonte')
      expect(decreaseBtn).toBeDisabled()
    })

    it('disables increase at largest size', async () => {
      localStorageMock['fontSize'] = 'xlarge'

      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      expect(increaseBtn).toBeDisabled()
    })
  })

  describe('Reset', () => {
    it('shows reset button when not normal size', async () => {
      localStorageMock['fontSize'] = 'large'

      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByLabelText('Restaurar tamanho padrão')).toBeInTheDocument()
    })

    it('hides reset button at normal size', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.queryByLabelText('Restaurar tamanho padrão')).not.toBeInTheDocument()
    })

    it('resets to normal size on click', async () => {
      localStorageMock['fontSize'] = 'large'

      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const resetBtn = screen.getByLabelText('Restaurar tamanho padrão')
      fireEvent.click(resetBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(document.documentElement.style.fontSize).toBe('16px')
    })
  })

  describe('Persistence', () => {
    it('loads saved font size from localStorage', async () => {
      localStorageMock['fontSize'] = 'large'

      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(document.documentElement.style.fontSize).toBe('18px')
      expect(screen.getByText('A+')).toBeInTheDocument()
    })

    it('saves font size to localStorage on change', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      fireEvent.click(increaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(localStorage.setItem).toHaveBeenCalledWith('fontSize', 'large')
    })
  })

  describe('Events', () => {
    it('dispatches fontsize-change event', async () => {
      render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      fireEvent.click(increaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(dispatchEventSpy).toHaveBeenCalled()
    })

    it('calls onChange callback', async () => {
      const onChange = vi.fn()

      render(<FontSizeControl locale="pt" onChange={onChange} />)

      await act(async () => {
        vi.runAllTimers()
      })

      const increaseBtn = screen.getByLabelText('Aumentar tamanho da fonte')
      fireEvent.click(increaseBtn)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(onChange).toHaveBeenCalledWith('large')
    })
  })

  describe('Layout', () => {
    it('applies inline layout by default', async () => {
      const { container } = render(<FontSizeControl locale="pt" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(container.querySelector('.flex.items-center')).toBeInTheDocument()
    })

    it('applies vertical layout', async () => {
      const { container } = render(<FontSizeControl locale="pt" layout="vertical" />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(container.querySelector('.flex.flex-col')).toBeInTheDocument()
    })
  })

  describe('Labels', () => {
    it('shows labels when showLabels is true', async () => {
      render(<FontSizeControl locale="pt" showLabels />)

      await act(async () => {
        vi.runAllTimers()
      })

      expect(screen.getByText('A-')).toBeInTheDocument()
    })
  })
})

describe('useFontSize', () => {
  let localStorageMock: Record<string, string>

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

    document.documentElement.style.fontSize = ''
  })

  afterEach(() => {
    document.documentElement.style.fontSize = ''
  })

  it('returns default font size', () => {
    const { result } = renderHook(() => useFontSize())

    expect(result.current.fontSize).toBe('normal')
  })

  it('loads saved font size', () => {
    localStorageMock['fontSize'] = 'large'

    const { result } = renderHook(() => useFontSize())

    expect(result.current.fontSize).toBe('large')
  })

  it('provides setFontSize function', () => {
    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.setFontSize('large')
    })

    expect(result.current.fontSize).toBe('large')
    expect(document.documentElement.style.fontSize).toBe('18px')
  })

  it('provides increase function', () => {
    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.increase()
    })

    expect(result.current.fontSize).toBe('large')
  })

  it('provides decrease function', () => {
    localStorageMock['fontSize'] = 'large'

    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.decrease()
    })

    expect(result.current.fontSize).toBe('normal')
  })

  it('provides reset function', () => {
    localStorageMock['fontSize'] = 'xlarge'

    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.reset()
    })

    expect(result.current.fontSize).toBe('normal')
  })

  it('does not decrease below small', () => {
    localStorageMock['fontSize'] = 'small'

    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.decrease()
    })

    expect(result.current.fontSize).toBe('small')
  })

  it('does not increase above xlarge', () => {
    localStorageMock['fontSize'] = 'xlarge'

    const { result } = renderHook(() => useFontSize())

    act(() => {
      result.current.increase()
    })

    expect(result.current.fontSize).toBe('xlarge')
  })
})
