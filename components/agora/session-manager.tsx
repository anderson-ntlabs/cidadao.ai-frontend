'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAgora } from '@/hooks/use-agora'
import { cn } from '@/lib/utils'

/**
 * Session Manager Component
 *
 * Manages user session with:
 * - Inactivity timeout (30 minutes default)
 * - Warning before timeout (5 minutes before)
 * - Activity tracking (mouse, keyboard, touch)
 * - Auto-save session before logout
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-08
 */

interface SessionManagerProps {
  timeoutMinutes?: number // Total timeout in minutes (default: 30)
  warningMinutes?: number // Warning before timeout (default: 5)
  enabled?: boolean // Enable/disable session management
}

export function SessionManager({
  timeoutMinutes = 30,
  warningMinutes = 5,
  enabled = true,
}: SessionManagerProps) {
  const router = useRouter()
  const { user, isAuthenticated, logout, endSession } = useAgora()

  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const lastActivityRef = useRef<number>(Date.now())
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const warningIdRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIdRef = useRef<NodeJS.Timeout | null>(null)

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)

    // Clear existing timeouts
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
    if (warningIdRef.current) clearTimeout(warningIdRef.current)
    if (countdownIdRef.current) clearInterval(countdownIdRef.current)

    // Set warning timeout
    warningIdRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemainingSeconds(warningMinutes * 60)

      // Start countdown
      countdownIdRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIdRef.current) clearInterval(countdownIdRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, timeoutMs - warningMs)

    // Set logout timeout
    timeoutIdRef.current = setTimeout(() => {
      handleAutoLogout()
    }, timeoutMs)
  }, [timeoutMs, warningMs, warningMinutes])

  // Handle automatic logout due to inactivity
  const handleAutoLogout = async () => {
    setIsLoggingOut(true)
    try {
      // End active session if exists
      await endSession()
      // Logout
      await logout()
      router.replace('/pt/agora/login?reason=inactivity')
    } catch {
      // Force redirect even on error
      router.replace('/pt/agora/login?reason=inactivity')
    }
  }

  // Extend session (user clicked "Continue")
  const handleExtendSession = () => {
    updateActivity()
  }

  // Setup activity listeners
  useEffect(() => {
    if (!enabled || !isAuthenticated || !user) return

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll']

    // Throttled activity handler
    let throttleTimeout: NodeJS.Timeout | null = null
    const throttledUpdate = () => {
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        updateActivity()
        throttleTimeout = null
      }, 1000) // Throttle to once per second
    }

    // Add listeners
    events.forEach((event) => {
      window.addEventListener(event, throttledUpdate, { passive: true })
    })

    // Initial activity
    updateActivity()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledUpdate)
      })
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current)
      if (warningIdRef.current) clearTimeout(warningIdRef.current)
      if (countdownIdRef.current) clearInterval(countdownIdRef.current)
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
  }, [enabled, isAuthenticated, user, updateActivity])

  // Don't render if not enabled or not authenticated
  if (!enabled || !isAuthenticated || !user) return null

  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Warning Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-desc"
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2
              id="session-warning-title"
              className="text-lg font-bold text-yellow-800 dark:text-yellow-200"
            >
              Sessao expirando
            </h2>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Voce sera desconectado por inatividade
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Countdown */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatTime(remainingSeconds)}
              </span>
            </div>
            <p id="session-warning-desc" className="text-gray-600 dark:text-gray-400">
              Sua sessao sera encerrada em {formatTime(remainingSeconds)} devido a inatividade.
            </p>
          </div>

          {/* Info */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Clique em &quot;Continuar&quot; para manter sua sessao ativa.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleAutoLogout}
            disabled={isLoggingOut}
          >
            Sair agora
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleExtendSession}
            disabled={isLoggingOut}
          >
            <Clock className="w-4 h-4 mr-2" />
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
