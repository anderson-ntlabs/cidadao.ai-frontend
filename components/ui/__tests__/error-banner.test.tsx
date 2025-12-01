import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ErrorBanner, OfflineBanner } from '../error-banner'

describe('ErrorBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render error message', () => {
    render(<ErrorBanner error="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render Error object message', () => {
    render(<ErrorBanner error={new Error('Error from exception')} />)

    expect(screen.getByText('Error from exception')).toBeInTheDocument()
  })

  it('should auto-detect network error type', () => {
    render(<ErrorBanner error="Network error: Failed to fetch" />)

    expect(screen.getByText('Sem conexão')).toBeInTheDocument()
  })

  it('should auto-detect timeout error type', () => {
    render(<ErrorBanner error="Request timed out" />)

    expect(screen.getByText('Tempo esgotado')).toBeInTheDocument()
  })

  it('should auto-detect server error type', () => {
    render(<ErrorBanner error="500 Internal Server Error" />)

    expect(screen.getByText('Erro no servidor')).toBeInTheDocument()
  })

  it('should auto-detect client error type', () => {
    render(<ErrorBanner error="404 Not Found" />)

    expect(screen.getByText('Erro na requisição')).toBeInTheDocument()
  })

  it('should use provided error type over auto-detection', () => {
    render(<ErrorBanner error="Some error" type="network" />)

    expect(screen.getByText('Sem conexão')).toBeInTheDocument()
  })

  it('should call onRetry when retry button clicked', () => {
    const handleRetry = vi.fn()
    render(<ErrorBanner error="Error" onRetry={handleRetry} />)

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('should call onDismiss when dismiss button clicked', () => {
    const handleDismiss = vi.fn()
    render(<ErrorBanner error="Error" onDismiss={handleDismiss} />)

    fireEvent.click(screen.getByRole('button', { name: /fechar/i }))

    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('should show auto-retry countdown', async () => {
    const handleRetry = vi.fn()
    render(<ErrorBanner error="Error" onRetry={handleRetry} autoRetrySeconds={3} />)

    expect(screen.getByText(/tentando em 3s/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText(/tentando em 2s/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText(/tentando em 1s/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('should toggle suggestions visibility', () => {
    render(<ErrorBanner error="Network error" type="network" />)

    // Initially suggestions hidden
    expect(screen.queryByText('Verifique sua conexão com a internet')).not.toBeInTheDocument()

    // Click to show suggestions
    fireEvent.click(screen.getByText('O que posso fazer?'))

    expect(screen.getByText('Verifique sua conexão com a internet')).toBeInTheDocument()

    // Click to hide suggestions
    fireEvent.click(screen.getByText('Ocultar sugestões'))

    expect(screen.queryByText('Verifique sua conexão com a internet')).not.toBeInTheDocument()
  })

  it('should show stack trace in details when showDetails is true', () => {
    const errorWithStack = new Error('Test error')
    errorWithStack.stack = 'Error: Test error\n    at test.js:1:1'

    render(<ErrorBanner error={errorWithStack} showDetails />)

    expect(screen.getByText('Detalhes técnicos')).toBeInTheDocument()
  })

  it('should render compact mode correctly', () => {
    render(<ErrorBanner error="Compact error" compact />)

    // In compact mode, should not show title
    expect(screen.queryByText('Erro inesperado')).not.toBeInTheDocument()
    expect(screen.getByText('Compact error')).toBeInTheDocument()
  })

  it('should have accessible alert role', () => {
    render(<ErrorBanner error="Error message" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('OfflineBanner', () => {
  const originalNavigator = { ...navigator }

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalNavigator.onLine,
      writable: true,
      configurable: true,
    })
  })

  it('should render when offline', () => {
    render(<OfflineBanner />)

    expect(
      screen.getByText('Você está offline. Verifique sua conexão com a internet.')
    ).toBeInTheDocument()
  })

  it('should not render when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })

    render(<OfflineBanner />)

    expect(
      screen.queryByText('Você está offline. Verifique sua conexão com a internet.')
    ).not.toBeInTheDocument()
  })

  it('should respond to online/offline events', () => {
    const { rerender } = render(<OfflineBanner />)

    // Initially offline
    expect(
      screen.getByText('Você está offline. Verifique sua conexão com a internet.')
    ).toBeInTheDocument()

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    })
    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    rerender(<OfflineBanner />)

    expect(
      screen.queryByText('Você está offline. Verifique sua conexão com a internet.')
    ).not.toBeInTheDocument()
  })

  it('should have accessible alert role', () => {
    render(<OfflineBanner />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
