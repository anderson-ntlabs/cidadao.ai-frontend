'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/hooks/use-haptic'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptProps {
  /** Custom title for the prompt */
  title?: string
  /** Custom description */
  description?: string
  /** Delay before showing prompt (ms) */
  delay?: number
  /** Show on desktop browsers */
  showOnDesktop?: boolean
  /** Custom class name */
  className?: string
}

/**
 * PWA Install Prompt Component
 *
 * Displays a custom Add to Home Screen (A2HS) prompt for PWA installation.
 * Works on Chrome/Edge (Android), Safari (iOS with manual instructions).
 *
 * Features:
 * - Automatic detection of installation capability
 * - Platform-specific instructions (iOS vs Android)
 * - Dismissible with localStorage persistence
 * - Haptic feedback on interaction
 * - Smart timing (shows after delay)
 * - Respects user's previous dismissal
 *
 * @example
 * ```tsx
 * import { InstallPrompt } from '@/components/pwa'
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <InstallPrompt
 *         delay={5000}
 *         showOnDesktop={false}
 *       />
 *     </>
 *   )
 * }
 * ```
 */
export function InstallPrompt({
  title = 'Instalar Cidadão.AI',
  description = 'Acesse rapidamente pelo ícone na tela inicial',
  delay = 3000,
  showOnDesktop = false,
  className,
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const { vibrate } = useHaptic()

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    // Don't show if:
    // - Already installed
    // - Dismissed within last 24 hours
    // - Desktop and showOnDesktop is false
    if (isInStandalone) return
    if (dismissedTime > oneDayAgo) return
    if (!showOnDesktop && !iOS && window.innerWidth > 768) return

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after delay
      setTimeout(() => {
        setShowPrompt(true)
      }, delay)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show manual instructions after delay
    if (iOS && !isInStandalone) {
      setTimeout(() => {
        setShowPrompt(true)
      }, delay)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [delay, showOnDesktop, isStandalone])

  const handleInstall = async () => {
    vibrate('medium')

    if (deferredPrompt) {
      // Chrome/Edge: Show native prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        vibrate('success')
        setShowPrompt(false)
      }

      setDeferredPrompt(null)
    } else if (isIOS) {
      // iOS: Instructions are always visible in the prompt
      vibrate('light')
    }
  }

  const handleDismiss = () => {
    vibrate('light')
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  // Don't render if already installed or shouldn't show
  if (isStandalone || !showPrompt) return null

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50',
        'md:bottom-6 md:left-auto md:right-6 md:max-w-md',
        'animate-in slide-in-from-bottom-4 fade-in duration-500',
        className
      )}
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              {isIOS ? (
                <Smartphone className="w-6 h-6 text-white" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">
                Como instalar no iOS:
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>
                  Toque no ícone de compartilhar <span className="inline-block">↗</span>
                </li>
                <li>Role até "Adicionar à Tela de Início"</li>
                <li>Toque em "Adicionar"</li>
              </ol>
            </div>
          )}

          {/* Android/Desktop Instructions */}
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="w-full min-h-[44px] px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl touch-manipulation"
            >
              <Download className="w-5 h-5" />
              Instalar Aplicativo
            </button>
          )}

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Benefícios:</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Acesso offline</li>
              <li>✅ Atualizações automáticas</li>
              <li>✅ Notificações em tempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Minimal Install Banner
 *
 * Simpler version for top banner placement
 */
export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const { vibrate } = useHaptic()

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    vibrate('medium')
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      vibrate('success')
      setShowBanner(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    vibrate('light')
    localStorage.setItem('pwa-banner-dismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Download className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            Instalar Cidadão.AI para acesso rápido
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-4 py-2 min-h-[44px] bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm touch-manipulation"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 min-h-[44px] min-w-[44px] hover:bg-white/20 rounded-lg transition-colors touch-manipulation"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
