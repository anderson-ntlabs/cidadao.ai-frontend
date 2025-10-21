'use client'

import { useState, useEffect } from 'react'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVLibras } from './vlibras-widget'

/**
 * VLibras Toggle Component
 *
 * Simple toggle button to enable/disable VLibras (Brazilian Sign Language)
 * translation widget. Works in conjunction with VLibrasWidget component.
 *
 * Features:
 * - Visual feedback (enabled/disabled state)
 * - Persistent preference via useVLibras hook
 * - Keyboard accessible
 * - Screen reader announcements
 * - Only renders on Portuguese pages
 */

interface VLibrasToggleProps {
  /**
   * Current locale - only renders for 'pt'
   */
  locale: 'pt' | 'en'

  /**
   * Layout variant
   * @default 'button'
   */
  variant?: 'button' | 'switch'

  /**
   * Show label text
   * @default false
   */
  showLabel?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Callback when toggle state changes
   */
  onChange?: (enabled: boolean) => void
}

export function VLibrasToggle({
  locale,
  variant = 'button',
  showLabel = false,
  className = '',
  onChange,
}: VLibrasToggleProps) {
  const { isEnabled, toggle } = useVLibras()
  const [isMounted, setIsMounted] = useState(false)

  const t = locale === 'pt' ? {
    enable: 'Ativar VLibras (LIBRAS)',
    disable: 'Desativar VLibras (LIBRAS)',
    label: 'VLibras',
    enabled: 'VLibras ativado',
    disabled: 'VLibras desativado',
  } : {
    enable: 'Enable VLibras (LIBRAS)',
    disable: 'Disable VLibras (LIBRAS)',
    label: 'VLibras',
    enabled: 'VLibras enabled',
    disabled: 'VLibras disabled',
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only render for Portuguese locale
  if (locale !== 'pt') {
    return null
  }

  // Don't render on server
  if (!isMounted) {
    return null
  }

  const handleToggle = () => {
    toggle()

    // Call onChange callback
    if (onChange) {
      onChange(!isEnabled)
    }

    // Announce to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.className = 'sr-only'
    announcement.textContent = !isEnabled ? t.enabled : t.disabled
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none focus:ring-2
          focus:ring-green-500 focus:ring-offset-2
          ${isEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}
          ${className}
        `}
        role="switch"
        aria-checked={isEnabled}
        aria-label={isEnabled ? t.disable : t.enable}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full
            bg-white transition-transform
            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
        {showLabel && (
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.label}
          </span>
        )}
      </button>
    )
  }

  // Button variant
  return (
    <Button
      variant={isEnabled ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      aria-label={isEnabled ? t.disable : t.enable}
      aria-pressed={isEnabled}
      className={`
        ${isEnabled ? 'bg-green-600 hover:bg-green-700' : ''}
        ${className}
      `}
    >
      <Languages className="h-4 w-4" />
      {showLabel && (
        <span className="ml-2">{t.label}</span>
      )}
    </Button>
  )
}
