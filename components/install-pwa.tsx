'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPWA() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Check if previously dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-green-500 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
            <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Instalar Cidadão.AI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Instale o app para acesso rápido e funcionar offline
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-3 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}