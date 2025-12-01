'use client'

import { useState, useEffect } from 'react'
import {
  AlertCircle,
  WifiOff,
  Clock,
  ServerCrash,
  RefreshCw,
  X,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * Error Banner Component
 *
 * Displays user-friendly error messages with context-specific
 * icons, colors, and recovery suggestions.
 *
 * Features:
 * - Automatic error type detection
 * - Recovery suggestions
 * - Retry with countdown
 * - Dismissible
 * - Screen reader friendly
 */

export type ErrorType = 'network' | 'timeout' | 'server' | 'client' | 'unknown'

export interface ErrorBannerProps {
  /** Error message or Error object */
  error: string | Error
  /** Error type (auto-detected if not provided) */
  type?: ErrorType
  /** Retry callback */
  onRetry?: () => void
  /** Dismiss callback */
  onDismiss?: () => void
  /** Auto-retry countdown in seconds (0 = no auto-retry) */
  autoRetrySeconds?: number
  /** Show detailed error for debugging */
  showDetails?: boolean
  /** Additional CSS classes */
  className?: string
  /** Compact mode for inline usage */
  compact?: boolean
}

// Error type configuration
const errorConfig: Record<
  ErrorType,
  {
    icon: typeof AlertCircle
    title: string
    color: string
    bgColor: string
    borderColor: string
    suggestions: string[]
  }
> = {
  network: {
    icon: WifiOff,
    title: 'Sem conexão',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    suggestions: [
      'Verifique sua conexão com a internet',
      'Tente desativar e reativar o Wi-Fi',
      'Aguarde alguns segundos e tente novamente',
    ],
  },
  timeout: {
    icon: Clock,
    title: 'Tempo esgotado',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    suggestions: [
      'O servidor está demorando para responder',
      'Isso pode ser temporário, tente novamente',
      'Se persistir, o serviço pode estar em manutenção',
    ],
  },
  server: {
    icon: ServerCrash,
    title: 'Erro no servidor',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    suggestions: [
      'Nosso servidor encontrou um problema',
      'Nossa equipe foi notificada automaticamente',
      'Tente novamente em alguns minutos',
    ],
  },
  client: {
    icon: AlertCircle,
    title: 'Erro na requisição',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    suggestions: [
      'Verifique os dados enviados',
      'Tente recarregar a página',
      'Se persistir, entre em contato com o suporte',
    ],
  },
  unknown: {
    icon: AlertCircle,
    title: 'Erro inesperado',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    suggestions: [
      'Ocorreu um erro desconhecido',
      'Tente recarregar a página',
      'Se persistir, entre em contato com o suporte',
    ],
  },
}

/**
 * Detect error type from error message
 */
function detectErrorType(error: string | Error): ErrorType {
  const message = typeof error === 'string' ? error : error.message
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('cors') ||
    lowerMessage.includes('offline')
  ) {
    return 'network'
  }

  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('tempo esgotado')
  ) {
    return 'timeout'
  }

  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server') ||
    lowerMessage.includes('internal')
  ) {
    return 'server'
  }

  if (
    lowerMessage.includes('400') ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('403') ||
    lowerMessage.includes('404') ||
    lowerMessage.includes('422')
  ) {
    return 'client'
  }

  return 'unknown'
}

export function ErrorBanner({
  error,
  type,
  onRetry,
  onDismiss,
  autoRetrySeconds = 0,
  showDetails = false,
  className,
  compact = false,
}: ErrorBannerProps) {
  const [countdown, setCountdown] = useState(autoRetrySeconds)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const errorMessage = typeof error === 'string' ? error : error.message
  const errorType = type || detectErrorType(error)
  const config = errorConfig[errorType]
  const Icon = config.icon

  // Auto-retry countdown
  useEffect(() => {
    if (autoRetrySeconds > 0 && onRetry) {
      setCountdown(autoRetrySeconds)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            onRetry()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [autoRetrySeconds, onRetry])

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
          config.bgColor,
          config.borderColor,
          'border',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0', config.color)} />
        <span className={config.color}>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn('ml-auto underline hover:no-underline', config.color)}
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        'animate-in fade-in slide-in-from-top duration-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={cn('font-semibold', config.color)}>{config.title}</h3>

          {/* Message */}
          <p className={cn('text-sm mt-1', config.color, 'opacity-90')}>{errorMessage}</p>

          {/* Suggestions (expandable) */}
          {config.suggestions.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium hover:underline',
                  config.color
                )}
              >
                <HelpCircle className="w-4 h-4" />
                {showSuggestions ? 'Ocultar sugestões' : 'O que posso fazer?'}
              </button>

              {showSuggestions && (
                <ul className="mt-2 space-y-1 text-sm">
                  {config.suggestions.map((suggestion, idx) => (
                    <li key={idx} className={cn('flex items-start gap-2', config.color)}>
                      <span className="text-xs mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Debug details */}
          {showDetails && typeof error !== 'string' && error.stack && (
            <details className="mt-3">
              <summary className={cn('text-sm cursor-pointer', config.color)}>
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-black/10 dark:bg-white/10 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="min-h-[36px]"
            >
              {countdown > 0 ? `Tentando em ${countdown}s` : 'Tentar novamente'}
            </Button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                'p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px]',
                'hover:bg-black/10 dark:hover:bg-white/10',
                config.color
              )}
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Offline Banner Component
 *
 * Specialized banner for offline detection
 */
export function OfflineBanner({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-orange-500 text-white',
        'px-4 py-2 text-center text-sm font-medium',
        'flex items-center justify-center gap-2',
        'animate-in slide-in-from-top duration-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-4 h-4" />
      <span>Você está offline. Verifique sua conexão com a internet.</span>
    </div>
  )
}
