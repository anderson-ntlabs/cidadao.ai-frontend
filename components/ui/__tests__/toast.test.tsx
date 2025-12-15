import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toast, ToastProvider, useToast } from '../toast'

describe('Toast', () => {
  describe('rendering', () => {
    it('renders with title', () => {
      render(<Toast id="1" title="Test Title" />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(<Toast id="1" description="Test description" />)
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('renders with title and description', () => {
      render(<Toast id="1" title="Title" description="Description" />)
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('renders dismiss button when onDismiss is provided', () => {
      render(<Toast id="1" title="Test" onDismiss={() => {}} />)
      const dismissButton = screen.getByRole('button', { name: 'Fechar' })
      expect(dismissButton).toBeInTheDocument()
    })

    it('does not render dismiss button without onDismiss', () => {
      render(<Toast id="1" title="Test" />)
      expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Toast id="1" variant="default" title="Default" />)
      expect(container.firstChild).toHaveClass('bg-background')
    })

    it('renders destructive variant', () => {
      const { container } = render(<Toast id="1" variant="destructive" title="Error" />)
      expect(container.firstChild).toHaveClass('bg-destructive')
    })

    it('renders success variant', () => {
      const { container } = render(<Toast id="1" variant="success" title="Success" />)
      expect(container.firstChild).toHaveClass('bg-green-50')
    })

    it('renders warning variant', () => {
      const { container } = render(<Toast id="1" variant="warning" title="Warning" />)
      expect(container.firstChild).toHaveClass('bg-yellow-50')
    })

    it('renders info variant', () => {
      const { container } = render(<Toast id="1" variant="info" title="Info" />)
      expect(container.firstChild).toHaveClass('bg-blue-50')
    })
  })

  describe('icons', () => {
    it('shows icon by default', () => {
      const { container } = render(<Toast id="1" variant="success" title="Test" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('hides icon when showIcon is false', () => {
      const { container } = render(<Toast id="1" variant="success" title="Test" showIcon={false} />)
      // Should only have the X icon (close button) or no icons
      const icons = container.querySelectorAll('svg')
      // No status icon should be present
      expect(icons.length).toBe(0)
    })

    it('shows correct icon for destructive', () => {
      const { container } = render(<Toast id="1" variant="destructive" title="Error" />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onDismiss when dismiss button is clicked', () => {
      const handleDismiss = vi.fn()
      render(<Toast id="1" title="Test" onDismiss={handleDismiss} />)

      const dismissButton = screen.getByRole('button', { name: 'Fechar' })
      fireEvent.click(dismissButton)

      expect(handleDismiss).toHaveBeenCalled()
    })
  })

  describe('action', () => {
    it('renders action element', () => {
      render(<Toast id="1" title="Test" action={<button>Undo</button>} />)
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<Toast id="1" title="Test" className="custom-toast" />)
      expect(container.firstChild).toHaveClass('custom-toast')
    })
  })
})

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders toast container', () => {
    const { container } = render(
      <ToastProvider>
        <div>Child</div>
      </ToastProvider>
    )
    const toastContainer = container.querySelector('.fixed.bottom-0.right-0')
    expect(toastContainer).toBeInTheDocument()
  })
})

describe('useToast', () => {
  const TestComponent = () => {
    const { addToast, removeToast, toasts } = useToast()

    return (
      <div>
        <button onClick={() => addToast({ title: 'New Toast', variant: 'success' })}>
          Add Toast
        </button>
        <button onClick={() => removeToast(toasts[0]?.id)}>Remove Toast</button>
        <div data-testid="toast-count">{toasts.length}</div>
      </div>
    )
  }

  it('throws error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within a ToastProvider')

    consoleError.mockRestore()
  })

  it('addToast adds a toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('Add Toast'))

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    expect(screen.getByText('New Toast')).toBeInTheDocument()
  })

  it('removeToast removes a toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Toast'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    fireEvent.click(screen.getByText('Remove Toast'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('auto removes toast after timeout', async () => {
    vi.useFakeTimers()

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Add Toast'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    // Fast-forward 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')

    vi.useRealTimers()
  })
})
