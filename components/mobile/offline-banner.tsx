'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * Offline Banner Component
 *
 * Displays a persistent banner when the user loses internet connection.
 * Automatically hides when connection is restored.
 *
 * Features:
 * - Real-time connection status detection
 * - Smooth slide-in/out animations
 * - Accessible (ARIA live region)
 * - Non-blocking (doesn't cover content)
 *
 * @example
 * ```tsx
 * // In root layout
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <OfflineBanner />
 *       {children}
 *     </>
 *   )
 * }
 * ```
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine)

    // Handle online event
    const handleOnline = () => {
      setIsOffline(false)
      setShowReconnected(true)

      // Hide "reconnected" message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    // Handle offline event
    const handleOffline = () => {
      setIsOffline(true)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show offline banner
  if (isOffline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="
          fixed top-0 left-0 right-0 z-[100]
          bg-amber-500 dark:bg-amber-600
          text-amber-950 dark:text-amber-50
          px-4 py-3 text-sm font-medium
          flex items-center justify-center gap-2
          shadow-lg
          animate-slide-down
        "
      >
        <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    )
  }

  // Show reconnected banner (temporary)
  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="
          fixed top-0 left-0 right-0 z-[100]
          bg-emerald-500 dark:bg-emerald-600
          text-emerald-950 dark:text-emerald-50
          px-4 py-3 text-sm font-medium
          flex items-center justify-center gap-2
          shadow-lg
          animate-slide-down
        "
      >
        <Wifi className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>Conexão restaurada!</span>
      </div>
    )
  }

  return null
}

/**
 * Offline Indicator (Compact Version)
 *
 * Shows a small pill indicator in the corner when offline.
 * Less intrusive than the banner, suitable for desktop.
 *
 * @example
 * ```tsx
 * <OfflineIndicator position="bottom-right" />
 * ```
 */
export function OfflineIndicator({
  position = 'top-right',
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  return (
    <div
      role="status"
      aria-label="Offline"
      className={`
        fixed ${positionClasses[position]} z-50
        bg-amber-100 dark:bg-amber-900
        text-amber-900 dark:text-amber-100
        px-3 py-2 rounded-full
        text-xs font-medium
        flex items-center gap-2
        shadow-lg border border-amber-200 dark:border-amber-700
        animate-slide-in
      `}
    >
      <WifiOff className="w-3 h-3" aria-hidden="true" />
      <span>Offline</span>
    </div>
  )
}
