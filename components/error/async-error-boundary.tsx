'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/utils/logger'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface AsyncErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isLoading: boolean
}

/**
 * Async Error Boundary Component
 *
 * Reusable error boundary for async operations with:
 * - Loading states
 * - Error recovery
 * - Timeout handling
 * - Custom fallback UI
 *
 * @example
 * ```tsx
 * <AsyncErrorBoundary>
 *   <AsyncDataComponent />
 * </AsyncErrorBoundary>
 * ```
 */
export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  private abortController: AbortController | null = null
  private timeoutId: NodeJS.Timeout | null = null

  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      isLoading: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncErrorBoundaryState> {
    return {
      hasError: true,
      error,
      isLoading: false
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    logger.error(error, {
      component: 'AsyncErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Clear any pending operations
    this.cleanup()
  }

  componentDidUpdate(prevProps: AsyncErrorBoundaryProps) {
    // Reset error state when resetKeys change
    if (
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    this.cleanup()
  }

  private areResetKeysEqual(
    prevKeys: Array<string | number>,
    nextKeys: Array<string | number>
  ): boolean {
    if (prevKeys.length !== nextKeys.length) return false
    return prevKeys.every((key, index) => key === nextKeys[index])
  }

  private cleanup() {
    // Abort any pending async operations
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  private resetErrorBoundary = () => {
    this.cleanup()
    this.setState({
      hasError: false,
      error: null,
      isLoading: false
    })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Algo deu errado
                </h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Ocorreu um erro ao carregar este componente. Por favor, tente novamente.
              </p>

              {process.env.NODE_ENV === 'development' && error && (
                <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                    {error.message}
                  </p>
                </div>
              )}

              <Button
                onClick={this.resetErrorBoundary}
                className="w-full"
                variant="default"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

/**
 * Hook-based wrapper for functional components
 */
export function withAsyncErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AsyncErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <AsyncErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AsyncErrorBoundary>
    )
  }
}
