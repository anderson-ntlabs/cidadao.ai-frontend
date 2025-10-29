'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

/**
 * VLibras Widget Component
 *
 * Integrates VLibras (Brazilian Sign Language - LIBRAS) translation service
 * into the application. VLibras is an official Brazilian government tool that
 * translates web content into sign language.
 *
 * @see https://vlibras.gov.br/
 * @see https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
 *
 * Features:
 * - Automatic content translation to LIBRAS
 * - Avatar options (Guga, Ícaro, Hozana)
 * - Respects user preferences (localStorage)
 * - Only loads on Portuguese pages (LIBRAS is Brazilian)
 * - Feature flag support via environment variable
 */

interface VLibrasWidgetProps {
  /**
   * Current locale - VLibras only renders for 'pt' (Portuguese/Brazil)
   */
  locale: 'pt' | 'en'

  /**
   * Force VLibras to load on component mount
   * Useful for SPAs where onload event may have already fired
   * @default true
   */
  forceOnload?: boolean

  /**
   * Additional CSS classes for the widget container
   */
  className?: string
}

/**
 * Dynamically import VLibras to avoid SSR issues
 * VLibras manipulates the DOM and requires browser APIs
 *
 * IMPORTANT: Import default export directly, not as .default
 * The package exports VLibras as default export
 */
const VLibras = dynamic(
  () => import('@djpfs/react-vlibras'),
  {
    ssr: false,
    loading: () => null // No loading state needed for accessibility widget
  }
)

export function VLibrasWidget({
  locale,
  forceOnload = true,
  className = ''
}: VLibrasWidgetProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Check if VLibras is enabled via environment variable
    const envEnabled = process.env.NEXT_PUBLIC_ENABLE_VLIBRAS === 'true'

    // Check user preference from localStorage
    const userPreference = localStorage.getItem('vlibras-enabled')
    const userEnabled = userPreference === null ? true : userPreference === 'true'

    // Enable if both env and user preference allow it
    setIsEnabled(envEnabled && userEnabled)
  }, [])

  // Only render for Portuguese locale (LIBRAS is Brazilian Sign Language)
  if (locale !== 'pt') {
    return null
  }

  // Don't render on server
  if (!isMounted) {
    return null
  }

  // Don't render if disabled
  if (!isEnabled) {
    return null
  }

  return (
    <>
      {/* VLibras Widget with proper styling */}
      <div
        className={`vlibras-widget-container fixed bottom-4 right-4 z-[9999] ${className}`}
        data-testid="vlibras-widget"
        style={{
          // Ensure VLibras is always visible and above other elements
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 9999,
        }}
      >
        <VLibras forceOnload={forceOnload} />
      </div>

      {/* Accessibility announcement for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Widget VLibras carregado. Tradução para LIBRAS disponível.
      </div>

      {/* Global styles for VLibras widget */}
      <style jsx global>{`
        /* VLibras widget base styles */
        [vw] {
          position: fixed !important;
          bottom: 1rem !important;
          right: 1rem !important;
          z-index: 9999 !important;
        }

        /* VLibras access button */
        [vw] .access-button {
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background-color: #1351b4 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-center !important;
        }

        [vw] .access-button:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
        }

        /* VLibras widget image fix */
        [vw] img,
        [vw] svg {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }

        /* VLibras popup/modal */
        [vw] .vpw-settings-wrapper,
        [vw] .vpw-player-wrapper {
          z-index: 10000 !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          [vw] {
            bottom: 5rem !important;
            right: 1rem !important;
          }

          [vw] .access-button {
            width: 50px !important;
            height: 50px !important;
          }
        }

        /* Ensure VLibras doesn't interfere with safe areas on mobile */
        @supports (padding: max(0px)) {
          [vw] {
            bottom: max(1rem, env(safe-area-inset-bottom)) !important;
            right: max(1rem, env(safe-area-inset-right)) !important;
          }
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

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('vlibras-toggle', {
      detail: { enabled: newState }
    }))
  }

  const enable = () => {
    setIsEnabled(true)
    localStorage.setItem('vlibras-enabled', 'true')
    window.dispatchEvent(new CustomEvent('vlibras-toggle', {
      detail: { enabled: true }
    }))
  }

  const disable = () => {
    setIsEnabled(false)
    localStorage.setItem('vlibras-enabled', 'false')
    window.dispatchEvent(new CustomEvent('vlibras-toggle', {
      detail: { enabled: false }
    }))
  }

  return {
    isEnabled,
    toggle,
    enable,
    disable
  }
}
