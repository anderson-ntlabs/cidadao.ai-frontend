'use client'

import { useEffect, useState, useRef } from 'react'

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
 * @see https://vlibras.gov.br/
 * @see https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

interface VLibrasWidgetProps {
  /**
   * Current locale - VLibras only renders for 'pt' (Portuguese/Brazil)
   */
  locale: 'pt' | 'en'
}

// VLibras script URL (official government CDN)
const VLIBRAS_SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js'

export function VLibrasWidget({ locale }: VLibrasWidgetProps) {
  const [isMounted, setIsMounted] = useState(false)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load VLibras script after component mounts
  useEffect(() => {
    if (!isMounted || locale !== 'pt') return

    // Prevent double loading
    if (scriptLoadedRef.current) return

    // Check if VLibras is already initialized
    if ((window as any).VLibras) {
      scriptLoadedRef.current = true
      return
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="vlibras"]')
    if (existingScript) {
      scriptLoadedRef.current = true
      return
    }

    scriptLoadedRef.current = true

    // Create and load the VLibras script
    const script = document.createElement('script')
    script.src = VLIBRAS_SCRIPT_URL
    script.async = true
    script.onerror = () => {
      console.error('[VLibras] Failed to load script')
      scriptLoadedRef.current = false
    }
    script.onload = () => {
      // Initialize VLibras after script loads
      if ((window as any).VLibras) {
        try {
          new (window as any).VLibras.Widget('https://vlibras.gov.br/app')
        } catch (error) {
          console.error('[VLibras] Failed to initialize widget:', error)
        }
      }
    }
    document.body.appendChild(script)
  }, [isMounted, locale])

  // Only render for Portuguese locale
  if (locale !== 'pt' || !isMounted) {
    return null
  }

  // VLibras container - must be in DOM before script initializes
  return (
    <div vw="true" className="enabled">
      <div vw-access-button="true" className="active" />
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper" />
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
