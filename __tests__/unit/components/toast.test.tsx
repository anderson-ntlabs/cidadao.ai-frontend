import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast, ToastProvider, useToast } from '@/components/ui/toast'

describe('Toast Component', () => {
  describe('Toast - Rendering', () => {
    it('renders toast with title', () => {
      render(<Toast id="test" title="Test Title" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders toast with description', () => {
      render(<Toast id="test" description="Test Description" />)
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders toast with both title and description', () => {
      render(<Toast id="test" title="Title" description="Description" />)
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('renders toast without title or description', () => {
      const { container } = render(<Toast id="test" />)
      expect(container.querySelector('.grid')).toBeInTheDocument()
    })
  })

  describe('Toast - Variants', () => {
    it('applies default variant classes', () => {
      render(<Toast id="test" variant="default" data-testid="toast">Test</Toast>)
      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('bg-background', 'text-foreground')
    })

    it('applies destructive variant classes', () => {
      render(<Toast id="test" variant="destructive" data-testid="toast">Test</Toast>)
      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('border-destructive', 'bg-destructive')
    })

    it('applies success variant classes', () => {
      render(<Toast id="test" variant="success" data-testid="toast">Test</Toast>)
      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('border-green-200', 'bg-green-50', 'text-green-900')
    })

    it('applies warning variant classes', () => {
      render(<Toast id="test" variant="warning" data-testid="toast">Test</Toast>)
      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('border-yellow-200', 'bg-yellow-50', 'text-yellow-900')
    })
  })

  describe('Toast - Base Styling', () => {
    it('applies base toast classes', () => {
      render(<Toast id="test" data-testid="toast">Test</Toast>)
      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass(
        'pointer-events-auto',
        'relative',
        'flex',
        'items-center',
        'rounded-md',
        'border',
        'shadow-lg',
        'transition-all'
      )
    })
  })

  describe('Toast - Dismiss Functionality', () => {
    it('renders dismiss button when onDismiss is provided', () => {
      const handleDismiss = vi.fn()
      render(<Toast id="test" title="Test" onDismiss={handleDismiss} />)

      const dismissButton = screen.getByRole('button')
      expect(dismissButton).toBeInTheDocument()
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(<Toast id="test" title="Test" />)

      const dismissButton = screen.queryByRole('button')
      expect(dismissButton).not.toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', async () => {
      const handleDismiss = vi.fn()
      const user = userEvent.setup()

      render(<Toast id="test" title="Test" onDismiss={handleDismiss} />)

      const dismissButton = screen.getByRole('button')
      await user.click(dismissButton)

      expect(handleDismiss).toHaveBeenCalledTimes(1)
    })

    it('dismiss button has correct styles', () => {
      const handleDismiss = vi.fn()
      render(<Toast id="test" title="Test" onDismiss={handleDismiss} />)

      const dismissButton = screen.getByRole('button')
      expect(dismissButton).toHaveClass('absolute', 'right-2', 'top-2', 'rounded-md')
    })
  })

  describe('Toast - Action Slot', () => {
    it('renders action element when provided', () => {
      const action = <button data-testid="action">Undo</button>
      render(<Toast id="test" title="Test" action={action} />)

      expect(screen.getByTestId('action')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
    })

    it('does not render action when not provided', () => {
      render(<Toast id="test" title="Test" />)

      const action = screen.queryByTestId('action')
      expect(action).not.toBeInTheDocument()
    })
  })

  describe('Toast - Title and Description Styling', () => {
    it('applies correct title styling', () => {
      render(<Toast id="test" title="Title" />)

      const title = screen.getByText('Title')
      expect(title).toHaveClass('text-sm', 'font-semibold')
    })

    it('applies correct description styling', () => {
      render(<Toast id="test" description="Description" />)

      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-sm', 'opacity-90')
    })
  })

  describe('Toast - Custom Classes', () => {
    it('merges custom className with default classes', () => {
      render(<Toast id="test" className="custom-toast" data-testid="toast">Test</Toast>)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('custom-toast')
      expect(toast).toHaveClass('flex') // default class
    })
  })

  describe('Toast - Ref Forwarding', () => {
    it('forwards ref to toast element', () => {
      const ref = vi.fn()
      render(<Toast id="test" ref={ref}>Test</Toast>)
      expect(ref).toHaveBeenCalled()
    })
  })
})

describe('ToastProvider', () => {
  describe('Provider - Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      )
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('renders toast container', () => {
      const { container } = render(
        <ToastProvider>
          <div>Test</div>
        </ToastProvider>
      )
      const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
      expect(toastContainer).toBeInTheDocument()
    })
  })
})

describe('useToast Hook', () => {
  it('throws error when used outside ToastProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function TestComponent() {
      useToast()
      return null
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    )

    consoleSpy.mockRestore()
  })

  it('returns toast context when used inside ToastProvider', () => {
    function TestComponent() {
      const { toasts, addToast, removeToast } = useToast()
      return (
        <div>
          <div data-testid="toasts-count">{toasts.length}</div>
          <div data-testid="has-add-toast">{typeof addToast === 'function' ? 'yes' : 'no'}</div>
          <div data-testid="has-remove-toast">{typeof removeToast === 'function' ? 'yes' : 'no'}</div>
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByTestId('toasts-count')).toHaveTextContent('0')
    expect(screen.getByTestId('has-add-toast')).toHaveTextContent('yes')
    expect(screen.getByTestId('has-remove-toast')).toHaveTextContent('yes')
  })
})
