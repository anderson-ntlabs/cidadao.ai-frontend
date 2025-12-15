/**
 * Tests for Toast components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toast, ToastContainer, type Toast as ToastType } from '../toast'

describe('Toast', () => {
  const defaultToast: ToastType = {
    id: 'test-toast-1',
    type: 'success',
    title: 'Success Message',
    description: 'This is a success toast',
  }

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders toast with title', () => {
      render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Success Message')).toBeInTheDocument()
    })

    it('renders toast with description', () => {
      render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('This is a success toast')).toBeInTheDocument()
    })

    it('renders toast without description when not provided', () => {
      const toastWithoutDesc: ToastType = {
        id: 'test-toast-2',
        type: 'info',
        title: 'Info Only',
      }

      render(<Toast toast={toastWithoutDesc} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Info Only')).toBeInTheDocument()
      expect(screen.queryByText('This is a success toast')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Toast Types', () => {
    it('renders success toast with correct styling', () => {
      const { container } = render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement.className).toContain('bg-green')
    })

    it('renders error toast with correct styling', () => {
      const errorToast: ToastType = {
        id: 'error-toast',
        type: 'error',
        title: 'Error Message',
      }

      const { container } = render(<Toast toast={errorToast} onDismiss={mockOnDismiss} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement.className).toContain('bg-red')
    })

    it('renders info toast with correct styling', () => {
      const infoToast: ToastType = {
        id: 'info-toast',
        type: 'info',
        title: 'Info Message',
      }

      const { container } = render(<Toast toast={infoToast} onDismiss={mockOnDismiss} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement.className).toContain('bg-blue')
    })

    it('renders warning toast with correct styling', () => {
      const warningToast: ToastType = {
        id: 'warning-toast',
        type: 'warning',
        title: 'Warning Message',
      }

      const { container } = render(<Toast toast={warningToast} onDismiss={mockOnDismiss} />)

      const toastElement = container.firstChild as HTMLElement
      expect(toastElement.className).toContain('bg-yellow')
    })
  })

  describe('Dismiss Behavior', () => {
    it('calls onDismiss when close button clicked', () => {
      render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      fireEvent.click(screen.getByRole('button'))

      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1')
    })

    it('auto-dismisses after duration', () => {
      const toastWithDuration: ToastType = {
        ...defaultToast,
        duration: 3000,
      }

      render(<Toast toast={toastWithDuration} onDismiss={mockOnDismiss} />)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1')
    })

    it('does not auto-dismiss when duration is 0', () => {
      const toastWithZeroDuration: ToastType = {
        ...defaultToast,
        duration: 0,
      }

      render(<Toast toast={toastWithZeroDuration} onDismiss={mockOnDismiss} />)

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it('does not auto-dismiss when duration is undefined', () => {
      render(<Toast toast={defaultToast} onDismiss={mockOnDismiss} />)

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it('clears timer on unmount', () => {
      const toastWithDuration: ToastType = {
        ...defaultToast,
        duration: 5000,
      }

      const { unmount } = render(<Toast toast={toastWithDuration} onDismiss={mockOnDismiss} />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(mockOnDismiss).not.toHaveBeenCalled()
    })
  })
})

describe('ToastContainer', () => {
  const mockToasts: ToastType[] = [
    { id: '1', type: 'success', title: 'Success' },
    { id: '2', type: 'error', title: 'Error' },
    { id: '3', type: 'info', title: 'Info' },
  ]

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all toasts', () => {
    render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders empty container when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />)

    const toastContainer = container.firstChild as HTMLElement
    expect(toastContainer.children).toHaveLength(0)
  })

  it('passes onDismiss to each toast', () => {
    render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(mockOnDismiss).toHaveBeenCalledWith('1')
  })

  it('has fixed positioning', () => {
    const { container } = render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />)

    const toastContainer = container.firstChild as HTMLElement
    expect(toastContainer.className).toContain('fixed')
  })

  it('has proper z-index for overlay', () => {
    const { container } = render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />)

    const toastContainer = container.firstChild as HTMLElement
    expect(toastContainer.className).toContain('z-50')
  })
})
