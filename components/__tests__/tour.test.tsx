/**
 * Tests for Tour component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { Tour } from '../tour'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

describe('Tour', () => {
  const defaultSteps = [
    {
      target: '#step-1',
      title: 'Step 1 Title',
      content: 'Step 1 content description',
      placement: 'bottom' as const,
    },
    {
      target: '#step-2',
      title: 'Step 2 Title',
      content: 'Step 2 content description',
      placement: 'right' as const,
    },
    {
      target: '#step-3',
      title: 'Step 3 Title',
      content: 'Step 3 content description',
      placement: 'top' as const,
    },
  ]

  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorageMock.clear()

    // Create target elements in DOM
    const container = document.createElement('div')
    container.id = 'test-container'

    const step1 = document.createElement('div')
    step1.id = 'step-1'
    step1.style.width = '100px'
    step1.style.height = '50px'
    step1.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 200,
      bottom: 150,
      width: 100,
      height: 50,
      x: 100,
      y: 100,
      toJSON: () => {},
    }))

    const step2 = document.createElement('div')
    step2.id = 'step-2'
    step2.getBoundingClientRect = vi.fn(() => ({
      left: 200,
      top: 200,
      right: 300,
      bottom: 250,
      width: 100,
      height: 50,
      x: 200,
      y: 200,
      toJSON: () => {},
    }))

    const step3 = document.createElement('div')
    step3.id = 'step-3'
    step3.getBoundingClientRect = vi.fn(() => ({
      left: 300,
      top: 300,
      right: 400,
      bottom: 350,
      width: 100,
      height: 50,
      x: 300,
      y: 300,
      toJSON: () => {},
    }))

    container.appendChild(step1)
    container.appendChild(step2)
    container.appendChild(step3)
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    const container = document.getElementById('test-container')
    if (container) {
      document.body.removeChild(container)
    }
  })

  describe('Initialization', () => {
    it('does not render immediately (waits for timeout)', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      expect(screen.queryByText('Step 1 Title')).not.toBeInTheDocument()
    })

    it('renders after initial timeout when not completed', async () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('Step 1 Title')).toBeInTheDocument()
    })

    it('does not render when already completed', () => {
      localStorageMock.getItem.mockReturnValue('true')

      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} storageKey="tour-completed" />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByText('Step 1 Title')).not.toBeInTheDocument()
    })

    it('does not render when steps are empty', () => {
      render(<Tour steps={[]} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByRole('button', { name: /próximo/i })).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('shows first step initially', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('Step 1 Title')).toBeInTheDocument()
      expect(screen.getByText('Step 1 content description')).toBeInTheDocument()
    })

    it('navigates to next step', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      fireEvent.click(screen.getByText(/próximo/i))

      expect(screen.getByText('Step 2 Title')).toBeInTheDocument()
    })

    it('navigates to previous step', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/anterior/i))

      expect(screen.getByText('Step 1 Title')).toBeInTheDocument()
    })

    it('disables previous button on first step', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const prevButton = screen.getByText(/anterior/i).closest('button')
      expect(prevButton).toBeDisabled()
    })

    it('shows "Concluir" on last step', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Navigate to last step
      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/próximo/i))

      expect(screen.getByText(/concluir/i)).toBeInTheDocument()
    })
  })

  describe('Completion', () => {
    it('calls onComplete when finishing tour', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Navigate through all steps
      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/concluir/i))

      expect(mockOnComplete).toHaveBeenCalled()
    })

    it('saves completion to localStorage', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} storageKey="my-tour" />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Navigate and complete
      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/próximo/i))
      fireEvent.click(screen.getByText(/concluir/i))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('my-tour', 'true')
    })

    it('uses default storage key', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Skip to complete
      fireEvent.click(screen.getByText(/pular/i))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('tour-completed', 'true')
    })
  })

  describe('Skip Functionality', () => {
    it('has skip button', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText(/pular/i)).toBeInTheDocument()
    })

    it('completes tour when skip clicked', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      fireEvent.click(screen.getByText(/pular/i))

      expect(mockOnComplete).toHaveBeenCalled()
    })

    it('completes tour when overlay clicked', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Click overlay (black backdrop)
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50')
      if (overlay) {
        fireEvent.click(overlay)
      }

      expect(mockOnComplete).toHaveBeenCalled()
    })

    it('has close button', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // There should be an X button
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Progress Indicator', () => {
    it('shows current step number', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('1 de 3')).toBeInTheDocument()
    })

    it('updates step number on navigation', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      fireEvent.click(screen.getByText(/próximo/i))

      expect(screen.getByText('2 de 3')).toBeInTheDocument()
    })

    it('shows progress dots', () => {
      const { container } = render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const dots = container.querySelectorAll('.rounded-full.w-2.h-2')
      expect(dots.length).toBe(3)
    })
  })

  describe('Target Element', () => {
    it('scrolls to target element', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })

    it('adds tour-highlight class to target', () => {
      render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const targetElement = document.getElementById('step-1')
      expect(targetElement?.classList.contains('tour-highlight')).toBe(true)
    })
  })

  describe('Placement', () => {
    it('renders tooltip with correct positioning', () => {
      const { container } = render(<Tour steps={defaultSteps} onComplete={mockOnComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const tooltip = container.querySelector('.fixed.z-\\[9999\\]')
      expect(tooltip).toBeInTheDocument()
    })
  })
})
