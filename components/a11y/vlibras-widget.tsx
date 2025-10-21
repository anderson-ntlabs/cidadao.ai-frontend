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
 */
const VLibras = dynamic(
  () => import('@djpfs/react-vlibras').then(mod => mod.default),
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
    <div
      className={`vlibras-widget-container ${className}`}
      data-testid="vlibras-widget"
    >
      <VLibras forceOnload={forceOnload} />

      {/* Accessibility announcement for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Widget VLibras carregado. Tradução para LIBRAS disponível.
      </div>
    </div>
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
