'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Font Size Control Component
 *
 * Allows users to adjust the base font size of the application for better readability.
 * Supports 4 font size levels: small, normal, large, and xlarge.
 *
 * Features:
 * - Persistent preference in localStorage
 * - Visual feedback with size indicator
 * - Keyboard accessible controls
 * - Smooth transition between sizes
 * - Reset to default option
 */

export type FontSize = 'small' | 'normal' | 'large' | 'xlarge'

interface FontSizeControlProps {
  /**
   * Current locale for translated labels
   */
  locale: 'pt' | 'en'

  /**
   * Layout variant: 'inline' for horizontal, 'vertical' for stacked
   * @default 'inline'
   */
  layout?: 'inline' | 'vertical'

  /**
   * Show labels on buttons
   * @default false
   */
  showLabels?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Callback when font size changes
   */
  onChange?: (size: FontSize) => void
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
  xlarge: '20px',
}

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: 'A-',
  normal: 'A',
  large: 'A+',
  xlarge: 'A++',
}

export function FontSizeControl({
  locale,
  layout = 'inline',
  showLabels = false,
  className = '',
  onChange,
}: FontSizeControlProps) {
  const [fontSize, setFontSize] = useState<FontSize>('normal')
  const [isMounted, setIsMounted] = useState(false)

  const t = useMemo(() => locale === 'pt' ? {
    decrease: 'Diminuir tamanho da fonte',
    increase: 'Aumentar tamanho da fonte',
    reset: 'Restaurar tamanho padrão',
    current: 'Tamanho atual',
    small: 'Pequeno',
    normal: 'Normal',
    large: 'Grande',
    xlarge: 'Muito Grande',
  } : {
    decrease: 'Decrease font size',
    increase: 'Increase font size',
    reset: 'Reset to default size',
    current: 'Current size',
    small: 'Small',
    normal: 'Normal',
    large: 'Large',
    xlarge: 'Extra Large',
  }, [locale])

  const applyFontSize = useCallback((size: FontSize, persist: boolean = true) => {
    const root = document.documentElement
    root.style.fontSize = FONT_SIZE_MAP[size]
    setFontSize(size)

    if (persist) {
      localStorage.setItem('fontSize', size)
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('fontsize-change', {
      detail: { size, value: FONT_SIZE_MAP[size] }
    }))

    // Call onChange callback
    if (onChange) {
      onChange(size)
    }

    // Announce to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent = `${t.current}: ${t[size]}`
    document.body.appendChild(announcement)
    setTimeout(() => document.body.removeChild(announcement), 1000)
  }, [onChange, t])

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('fontSize') as FontSize
    if (saved && FONT_SIZE_MAP[saved]) {
      applyFontSize(saved, false)
    }
  }, [applyFontSize])

  const decrease = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      applyFontSize(sizes[currentIndex - 1])
    }
  }

  const increase = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      applyFontSize(sizes[currentIndex + 1])
    }
  }

  const reset = () => {
    applyFontSize('normal')
  }

  // Don't render on server
  if (!isMounted) {
    return null
  }

  const containerClass = layout === 'vertical'
    ? 'flex flex-col gap-2'
    : 'flex items-center gap-2'

  return (
    <div className={`font-size-control ${containerClass} ${className}`}>
      {/* Decrease button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={decrease}
        disabled={fontSize === 'small'}
        aria-label={t.decrease}
        title={t.decrease}
        className="h-9 w-9 p-0"
      >
        <Minus className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-xs">A-</span>}
      </Button>

      {/* Current size indicator */}
      <div
        className="flex items-center justify-center min-w-[60px] h-9 px-3 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium"
        aria-label={`${t.current}: ${t[fontSize]}`}
      >
        {FONT_SIZE_LABELS[fontSize]}
      </div>

      {/* Increase button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={increase}
        disabled={fontSize === 'xlarge'}
        aria-label={t.increase}
        title={t.increase}
        className="h-9 w-9 p-0"
      >
        <Plus className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-xs">A+</span>}
      </Button>

      {/* Reset button */}
      {fontSize !== 'normal' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          aria-label={t.reset}
          title={t.reset}
          className="h-9 w-9 p-0 ml-1"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

/**
 * Hook to programmatically control font size
 */
export function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  useEffect(() => {
    const saved = localStorage.getItem('fontSize') as FontSize
    if (saved && FONT_SIZE_MAP[saved]) {
      setFontSize(saved)
    }

    const handleFontSizeChange = (e: CustomEvent) => {
      setFontSize(e.detail.size)
    }

    window.addEventListener('fontsize-change', handleFontSizeChange as EventListener)
    return () => {
      window.removeEventListener('fontsize-change', handleFontSizeChange as EventListener)
    }
  }, [])

  const setSize = (size: FontSize) => {
    const root = document.documentElement
    root.style.fontSize = FONT_SIZE_MAP[size]
    setFontSize(size)
    localStorage.setItem('fontSize', size)
    window.dispatchEvent(new CustomEvent('fontsize-change', {
      detail: { size, value: FONT_SIZE_MAP[size] }
    }))
  }

  return {
    fontSize,
    setFontSize: setSize,
    increase: () => {
      const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
      const currentIndex = sizes.indexOf(fontSize)
      if (currentIndex < sizes.length - 1) {
        setSize(sizes[currentIndex + 1])
      }
    },
    decrease: () => {
      const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
      const currentIndex = sizes.indexOf(fontSize)
      if (currentIndex > 0) {
        setSize(sizes[currentIndex - 1])
      }
    },
    reset: () => setSize('normal'),
  }
}
