'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/hooks/use-haptic'

interface UpdateNotificationProps {
  /** Auto-update without user confirmation */
  autoUpdate?: boolean
  /** Show update details/changelog */
  showDetails?: boolean
  /** Custom class name */
  className?: string
}

/**
 * PWA Update Notification Component
 *
 * Notifies users when a new version of the PWA is available.
 * Works with Next.js + Serwist service worker.
 *
 * Features:
 * - Automatic detection of service worker updates
 * - User-friendly update notification
 * - One-click update with page reload
 * - Haptic feedback on update
 * - Skip this version option
 * - Progress indication during update
 *
 * @example
 * ```tsx
 * import { UpdateNotification } from '@/components/pwa'
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <UpdateNotification autoUpdate={false} />
 *     </>
 *   )
 * }
 * ```
 */
export function UpdateNotification({
  autoUpdate = false,
  showDetails = false,
  className,
}: UpdateNotificationProps) {
  const [showUpdate, setShowUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const { vibrate } = useHaptic()

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Listen for service worker updates
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) return

        // Check if there's an update waiting
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdate(true)
          vibrate('warning')
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, update available
              setWaitingWorker(newWorker)
              setShowUpdate(true)
              vibrate('warning')

              // Auto-update if enabled
              if (autoUpdate) {
                handleUpdate()
              }
            }
          })
        })

        // Aggressive update check strategy
        // Check immediately on mount
        registration.update()

        // Check every 30 seconds for the first 5 minutes (aggressive initial check)
        const aggressiveCheck = setInterval(() => {
          registration.update()
        }, 30 * 1000)

        setTimeout(
          () => {
            clearInterval(aggressiveCheck)
          },
          5 * 60 * 1000
        )

        // After 5 minutes, check every 5 minutes (normal check)
        const intervalId = setInterval(
          () => {
            registration.update()
          },
          5 * 60 * 1000
        )

        return () => clearInterval(intervalId)
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }

    checkForUpdates()

    // Listen for controller change (update activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload to get new content
      window.location.reload()
    })
  }, [autoUpdate, vibrate])

  const handleUpdate = () => {
    if (!waitingWorker) return

    vibrate('success')
    setIsUpdating(true)

    // Tell the waiting service worker to activate
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })

    // The controllerchange event will trigger reload
  }

  const handleSkip = () => {
    vibrate('light')
    setShowUpdate(false)
    // Store skip for this session
    sessionStorage.setItem('update-skipped', 'true')
  }

  // Don't show if user already skipped this session
  useEffect(() => {
    const skipped = sessionStorage.getItem('update-skipped')
    if (skipped === 'true') {
      setShowUpdate(false)
    }
  }, [])

  if (!showUpdate) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50',
        'md:bottom-6 md:left-auto md:right-6 md:max-w-md',
        'animate-in slide-in-from-bottom-4 fade-in duration-500',
        className
      )}
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Fechar"
          disabled={isUpdating}
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              {isUpdating ? (
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Zap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isUpdating ? 'Atualizando...' : 'Nova versão disponível!'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isUpdating ? 'Aplicando atualização...' : 'Atualize para a versão mais recente'}
              </p>
            </div>
          </div>

          {/* Update Details */}
          {showDetails && !isUpdating && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-200 font-medium mb-2">
                O que há de novo:
              </p>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1 list-disc list-inside">
                <li>Melhorias de performance</li>
                <li>Correções de bugs</li>
                <li>Novos recursos</li>
              </ul>
            </div>
          )}

          {/* Update Button */}
          {!isUpdating && (
            <button
              onClick={handleUpdate}
              className="w-full min-h-[44px] px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl touch-manipulation"
            >
              <RefreshCw className="w-5 h-5" />
              Atualizar Agora
            </button>
          )}

          {/* Loading state */}
          {isUpdating && (
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150" />
            </div>
          )}

          {/* Skip option */}
          {!isUpdating && (
            <button
              onClick={handleSkip}
              className="w-full mt-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2"
            >
              Agora não
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple Update Toast
 *
 * Minimal notification in toast style
 */
export function UpdateToast() {
  const [showToast, setShowToast] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const { vibrate } = useHaptic()

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const checkForUpdates = async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return

      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setShowToast(true)
        vibrate('warning')
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setShowToast(true)
            vibrate('warning')
          }
        })
      })
    }

    checkForUpdates()
  }, [vibrate])

  const handleUpdate = () => {
    if (!waitingWorker) return
    vibrate('success')
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  if (!showToast) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-gray-900 dark:text-gray-100 flex-1">Nova versão disponível</p>
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 min-h-[36px] bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors touch-manipulation"
          >
            Atualizar
          </button>
          <button
            onClick={() => setShowToast(false)}
            className="p-1.5 min-h-[36px] min-w-[36px] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
