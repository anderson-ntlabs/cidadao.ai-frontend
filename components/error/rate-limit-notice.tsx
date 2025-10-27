'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RateLimitNoticeProps {
  /** Seconds until rate limit resets */
  retryAfter: number
  /** Optional message override */
  message?: string
  /** Callback when user clicks retry */
  onRetry?: () => void
  /** Optional className for custom styling */
  className?: string
}

/**
 * Rate Limit Notice Component
 *
 * Displays a user-friendly notice when rate limit is hit (429 error)
 * with countdown timer showing when user can retry.
 *
 * @example
 * ```tsx
 * <RateLimitNotice
 *   retryAfter={60}
 *   onRetry={() => refetchData()}
 * />
 * ```
 */
export function RateLimitNotice({
  retryAfter: initialRetryAfter,
  message,
  onRetry,
  className = ''
}: RateLimitNoticeProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialRetryAfter)
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanRetry(true)
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanRetry(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (remainingSeconds === 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
    }
    return `${minutes}min ${remainingSeconds}s`
  }

  const defaultMessage = 'Você fez muitas requisições. Por favor, aguarde um momento antes de tentar novamente.'

  return (
    <div className={`rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-1">
            Limite de requisições atingido
          </h3>
          <p className="text-sm text-orange-800 dark:text-orange-400 mb-3">
            {message || defaultMessage}
          </p>

          {/* Timer */}
          <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-500 mb-3">
            <Clock className="w-4 h-4" />
            <span>
              {canRetry ? (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Pronto para tentar novamente!
                </span>
              ) : (
                <>
                  Aguarde <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </>
              )}
            </span>
          </div>

          {/* Retry Button */}
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
        <p className="text-xs text-orange-700 dark:text-orange-500">
          <strong>Dica:</strong> Limites de requisição protegem nossos servidores e garantem
          que todos os usuários tenham uma experiência rápida e confiável.
        </p>
      </div>
    </div>
  )
}

/**
 * Hook to extract retry-after from HTTP 429 response
 */
export function useRateLimitNotice() {
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isRateLimited: boolean
    retryAfter: number
  }>({
    isRateLimited: false,
    retryAfter: 0
  })

  const handleRateLimitError = (error: unknown) => {
    // Check if error is a fetch Response with status 429
    if (error instanceof Response && error.status === 429) {
      const retryAfter = parseInt(error.headers.get('Retry-After') || '60', 10)
      setRateLimitInfo({
        isRateLimited: true,
        retryAfter
      })
      return true
    }

    // Check if error object has status 429
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 429
    ) {
      const retryAfter =
        'retryAfter' in error && typeof error.retryAfter === 'number'
          ? error.retryAfter
          : 60
      setRateLimitInfo({
        isRateLimited: true,
        retryAfter
      })
      return true
    }

    return false
  }

  const resetRateLimit = () => {
    setRateLimitInfo({
      isRateLimited: false,
      retryAfter: 0
    })
  }

  return {
    ...rateLimitInfo,
    handleRateLimitError,
    resetRateLimit
  }
}
