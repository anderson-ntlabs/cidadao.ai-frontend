'use client'

import { useEffect, useState, useCallback } from 'react'

// Extend JSX.IntrinsicElements to accept VLibras custom attributes
declare module 'react' {
  interface HTMLAttributes<T> {
    vw?: string
    'vw-access-button'?: string
    'vw-plugin-wrapper'?: string
  }
}

/**
 * VLibras Widget Component
 *
 * Integrates VLibras (Brazilian Sign Language - LIBRAS) translation service
 * using the official government script (https://vlibras.gov.br/).
 *
 * This implementation uses the official VLibras script directly instead of
 * third-party npm packages for better reliability and updates.
 *
 * @see https://vlibras.gov.br/
 * @see https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
 *
 * Features:
 * - Automatic content translation to LIBRAS
 * - Avatar-based sign language interpreter
 * - Respects user preferences (localStorage)
 * - Only loads on Portuguese pages (LIBRAS is Brazilian)
 * - Works across the entire application including chat
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

interface VLibrasWidgetProps {
  /**
   * Current locale - VLibras only renders for 'pt' (Portuguese/Brazil)
   */
  locale: 'pt' | 'en'

  /**
   * Force VLibras to load on component mount
   * @default true
   */
  forceOnload?: boolean

  /**
   * Additional CSS classes for the widget container
   */
  className?: string
}

// VLibras script URL (official government source)
const VLIBRAS_SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js'

export function VLibrasWidget({ locale, forceOnload = true, className = '' }: VLibrasWidgetProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize VLibras widget
  const initializeVLibras = useCallback(() => {
    // Check if VLibras is already initialized
    if (typeof window !== 'undefined' && (window as any).VLibras) {
      const vlibras = new (window as any).VLibras.Widget('https://vlibras.gov.br/app')
      // Force widget to scan the page for translatable content
      if (forceOnload) {
        setTimeout(() => {
          vlibras.forceOnload()
        }, 500)
      }
      setIsLoaded(true)
    }
  }, [forceOnload])

  // Load VLibras script
  useEffect(() => {
    if (!isEnabled || locale !== 'pt') return

    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${VLIBRAS_SCRIPT_URL}"]`)
    if (existingScript) {
      initializeVLibras()
      return
    }

    // Create and load the VLibras script
    const script = document.createElement('script')
    script.src = VLIBRAS_SCRIPT_URL
    script.async = true
    script.onload = () => {
      initializeVLibras()
    }
    script.onerror = () => {
      console.error('[VLibras] Failed to load VLibras script')
    }

    document.head.appendChild(script)

    return () => {
      // Don't remove script on unmount as it may break VLibras
      // VLibras manages its own cleanup
    }
  }, [isEnabled, locale, initializeVLibras])

  // Check if VLibras should be enabled
  useEffect(() => {
    setIsMounted(true)

    // Delay initialization to prevent layout shift during page load
    const initTimer = setTimeout(() => {
      // Check user preference from localStorage
      const userPreference = localStorage.getItem('vlibras-enabled')
      // Default to enabled (true) if no preference is set
      const userEnabled = userPreference === null ? true : userPreference === 'true'

      setIsEnabled(userEnabled)
    }, 1000) // Load after 1s to reduce initial page load

    return () => clearTimeout(initTimer)
  }, [])

  // Listen for toggle events from other components
  useEffect(() => {
    const handleToggle = (event: CustomEvent<{ enabled: boolean }>) => {
      setIsEnabled(event.detail.enabled)
    }

    window.addEventListener('vlibras-toggle', handleToggle as EventListener)
    return () => {
      window.removeEventListener('vlibras-toggle', handleToggle as EventListener)
    }
  }, [])

  // Only render for Portuguese locale (LIBRAS is Brazilian Sign Language)
  if (locale !== 'pt') {
    return null
  }

  // Don't render on server
  if (!isMounted) {
    return null
  }

  // Don't render if disabled by user
  if (!isEnabled) {
    return null
  }

  return (
    <>
      {/* VLibras Widget Container - Required by the official script */}
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active" />
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>

      {/* Accessibility announcement for screen readers */}
      {isLoaded && (
        <div className="sr-only" role="status" aria-live="polite">
          Widget VLibras carregado. Traduz o conteudo para LIBRAS (Lingua Brasileira de Sinais).
        </div>
      )}

      {/* Global styles for VLibras widget positioning */}
      <style jsx global>{`
        /* VLibras widget base positioning */
        div[vw] {
          position: fixed !important;
          bottom: 1rem !important;
          right: 1rem !important;
          z-index: 9999 !important;
        }

        /* VLibras access button styling */
        div[vw] [vw-access-button] {
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background-color: #1351b4 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }

        div[vw] [vw-access-button]:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
        }

        /* VLibras plugin wrapper */
        div[vw] [vw-plugin-wrapper] {
          z-index: 10000 !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          div[vw] {
            bottom: 5rem !important;
            right: 0.75rem !important;
          }

          div[vw] [vw-access-button] {
            width: 50px !important;
            height: 50px !important;
          }
        }

        /* Ensure VLibras works in chat area */
        .chat-messages div[vw],
        [data-testid='chat-container'] div[vw] {
          position: fixed !important;
        }

        /* Safe area support for mobile devices */
        @supports (padding: max(0px)) {
          div[vw] {
            bottom: max(1rem, env(safe-area-inset-bottom)) !important;
            right: max(1rem, env(safe-area-inset-right)) !important;
          }
        }

        /* Ensure VLibras panel is above modals */
        .vp-wrapper,
        .vpw-settings,
        [class*='vp-'] {
          z-index: 10001 !important;
        }
      `}</style>
    </>
  )
}

/**
 * Hook to programmatically control VLibras
 * Allows toggling VLibras on/off and checking its status
 */
export function useVLibras() {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const userPreference = localStorage.getItem('vlibras-enabled')
    setIsEnabled(userPreference === null ? true : userPreference === 'true')
  }, [])

  const toggle = () => {
    const newState = !isEnabled
    setIsEnabled(newState)
    localStorage.setItem('vlibras-enabled', String(newState))

    // Dispatch custom event for VLibras widget to listen
    window.dispatchEvent(
      new CustomEvent('vlibras-toggle', {
        detail: { enabled: newState },
      })
    )
  }

  const enable = () => {
    setIsEnabled(true)
    localStorage.setItem('vlibras-enabled', 'true')
    window.dispatchEvent(
      new CustomEvent('vlibras-toggle', {
        detail: { enabled: true },
      })
    )
  }

  const disable = () => {
    setIsEnabled(false)
    localStorage.setItem('vlibras-enabled', 'false')
    window.dispatchEvent(
      new CustomEvent('vlibras-toggle', {
        detail: { enabled: false },
      })
    )
  }

  return {
    isEnabled,
    toggle,
    enable,
    disable,
  }
}
