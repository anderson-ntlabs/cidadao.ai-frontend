import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary, SectionErrorBoundary } from './error-boundary'

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(
      screen.getByText('Ocorreu um erro inesperado ao carregar este conteúdo.')
    ).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })

  it('should allow retry after error', async () => {
    const user = userEvent.setup()
    let throwError = true

    // Component that can stop throwing
    function TestComponent() {
      if (throwError) {
        throw new Error('Test error')
      }
      return <div>Success after retry</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Error UI is shown
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()

    // Stop throwing and click retry
    throwError = false
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
    await user.click(retryButton)

    // After clicking retry, need to force re-render with fixed component
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Success message should appear
    expect(screen.getByText('Success after retry')).toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Detalhes do erro \(desenvolvimento\)/i)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })
})

describe('SectionErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render children when there is no error', () => {
    render(
      <SectionErrorBoundary section="Chat">
        <div>Chat content</div>
      </SectionErrorBoundary>
    )

    expect(screen.getByText('Chat content')).toBeInTheDocument()
  })

  it('should render section-specific error message when error occurs', () => {
    render(
      <SectionErrorBoundary section="Chat">
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    )

    expect(screen.getByText('Erro ao carregar Chat')).toBeInTheDocument()
    expect(
      screen.getByText('Não foi possível carregar esta seção. Tente recarregar a página.')
    ).toBeInTheDocument()
  })
})
