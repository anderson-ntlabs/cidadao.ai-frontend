import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  VirtualKeyboardSpacer,
  VirtualKeyboardSpacerSafe,
  useVirtualKeyboard,
} from '../virtual-keyboard-spacer'

describe('VirtualKeyboardSpacer', () => {
  let mockVisualViewport: any

  beforeEach(() => {
    mockVisualViewport = {
      height: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    })

    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders a div element', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      expect(container.querySelector('div')).toBeInTheDocument()
    })

    it('has data-keyboard-spacer attribute', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      expect(container.querySelector('[data-keyboard-spacer]')).toBeInTheDocument()
    })

    it('has aria-hidden attribute', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveAttribute('aria-hidden', 'true')
    })

    it('has width full class', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveClass('w-full')
    })
  })

  describe('initial state', () => {
    it('starts with 0 height when no keyboard', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveStyle({ height: '0px' })
    })

    it('starts with minHeight when specified', () => {
      // Simulate keyboard not visible (viewport = window)
      const { container } = render(<VirtualKeyboardSpacer minHeight={34} />)
      const spacer = container.querySelector('div')
      // Should use minHeight since no keyboard
      expect(spacer).toHaveStyle({ height: '34px' })
    })
  })

  describe('keyboard detection', () => {
    it('adds event listeners on mount', () => {
      render(<VirtualKeyboardSpacer />)
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('removes event listeners on unmount', () => {
      const { unmount } = render(<VirtualKeyboardSpacer />)
      unmount()
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
    })

    it('updates height when keyboard appears', () => {
      // Simulate keyboard appearing
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
      mockVisualViewport.height = 500 // 300px keyboard

      const { container } = render(<VirtualKeyboardSpacer />)

      // Simulate resize event
      const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1]

      if (resizeHandler) {
        act(() => {
          resizeHandler()
        })
      }

      const spacer = container.querySelector('div')
      expect(spacer).toHaveStyle({ height: '300px' })
    })
  })

  describe('maxHeight constraint', () => {
    it('respects maxHeight limit', () => {
      Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true })
      mockVisualViewport.height = 400 // 600px keyboard

      const { container } = render(<VirtualKeyboardSpacer maxHeight={300} />)

      const resizeHandler = mockVisualViewport.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'resize'
      )?.[1]

      if (resizeHandler) {
        act(() => {
          resizeHandler()
        })
      }

      const spacer = container.querySelector('div')
      expect(spacer).toHaveStyle({ height: '300px' })
    })
  })

  describe('transition duration', () => {
    it('uses default transition duration', () => {
      const { container } = render(<VirtualKeyboardSpacer />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveStyle({ transition: 'height 300ms ease-out' })
    })

    it('uses custom transition duration', () => {
      const { container } = render(<VirtualKeyboardSpacer transitionDuration={250} />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveStyle({ transition: 'height 250ms ease-out' })
    })
  })

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(<VirtualKeyboardSpacer className="custom-spacer" />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveClass('custom-spacer')
    })

    it('merges with default classes', () => {
      const { container } = render(<VirtualKeyboardSpacer className="custom-class" />)
      const spacer = container.querySelector('div')
      expect(spacer).toHaveClass('w-full', 'custom-class')
    })
  })

  describe('without visualViewport', () => {
    it('handles missing visualViewport gracefully', () => {
      Object.defineProperty(window, 'visualViewport', {
        value: null,
        writable: true,
        configurable: true,
      })

      const { container } = render(<VirtualKeyboardSpacer />)
      const spacer = container.querySelector('div')
      expect(spacer).toBeInTheDocument()
      expect(spacer).toHaveStyle({ height: '0px' })
    })
  })
})

describe('VirtualKeyboardSpacerSafe', () => {
  beforeEach(() => {
    const mockVisualViewport = {
      height: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    })
  })

  it('renders with pb-safe class', () => {
    const { container } = render(<VirtualKeyboardSpacerSafe />)
    const spacer = container.querySelector('div')
    expect(spacer).toHaveClass('pb-safe')
  })

  it('uses 34px as minHeight', () => {
    const { container } = render(<VirtualKeyboardSpacerSafe />)
    const spacer = container.querySelector('div')
    expect(spacer).toHaveStyle({ height: '34px' })
  })

  it('applies custom className', () => {
    const { container } = render(<VirtualKeyboardSpacerSafe className="safe-class" />)
    const spacer = container.querySelector('div')
    expect(spacer).toHaveClass('safe-class', 'pb-safe')
  })
})

describe('useVirtualKeyboard', () => {
  beforeEach(() => {
    const mockVisualViewport = {
      height: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    })
  })

  it('returns isKeyboardVisible state', () => {
    const { result } = renderHook(() => useVirtualKeyboard())
    expect(result.current).toHaveProperty('isKeyboardVisible')
  })

  it('returns keyboardHeight state', () => {
    const { result } = renderHook(() => useVirtualKeyboard())
    expect(result.current).toHaveProperty('keyboardHeight')
  })

  it('initializes with keyboard hidden', () => {
    const { result } = renderHook(() => useVirtualKeyboard())
    expect(result.current.isKeyboardVisible).toBe(false)
    expect(result.current.keyboardHeight).toBe(0)
  })

  it('handles missing visualViewport', () => {
    Object.defineProperty(window, 'visualViewport', {
      value: null,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useVirtualKeyboard())
    expect(result.current.isKeyboardVisible).toBe(false)
    expect(result.current.keyboardHeight).toBe(0)
  })
})
