'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Academy Background Customization Hook
 *
 * Allows users to customize their dashboard background with:
 * - Solid colors (Tarsila palette)
 * - TCC slide backgrounds
 * - Custom uploaded images
 *
 * Design: Bo Bardi + Dumont + Anderson
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

export interface BackgroundOption {
  id: string
  name: string
  type: 'solid' | 'gradient' | 'image'
  value: string
  preview?: string
  artist?: string
}

// Available background options
export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  // Solid Colors - Tarsila Palette
  {
    id: 'tarsila-creme',
    name: 'Creme Tarsila',
    type: 'solid',
    value: 'hsl(42 100% 98%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'tarsila-amarelo-suave',
    name: 'Amarelo Suave',
    type: 'solid',
    value: 'hsl(43 80% 95%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'elegant-gray',
    name: 'Cinza Elegante',
    type: 'solid',
    value: 'hsl(0 0% 9%)',
    artist: 'Bo Bardi',
  },
  {
    id: 'charcoal',
    name: 'Carvao',
    type: 'solid',
    value: 'hsl(0 0% 12%)',
    artist: 'Bo Bardi',
  },

  // Gradients
  {
    id: 'tarsila-sunset',
    name: 'Por do Sol Tarsila',
    type: 'gradient',
    value: 'linear-gradient(135deg, hsl(43 89% 95%) 0%, hsl(24 80% 90%) 100%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'tarsila-terra',
    name: 'Terra Brasileira',
    type: 'gradient',
    value: 'linear-gradient(180deg, hsl(42 100% 98%) 0%, hsl(33 58% 90%) 100%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'gray-depth',
    name: 'Profundidade',
    type: 'gradient',
    value: 'linear-gradient(180deg, hsl(0 0% 9%) 0%, hsl(0 0% 14%) 100%)',
    artist: 'Bo Bardi',
  },

  // TCC Slide Backgrounds
  {
    id: 'tcc-tarsila',
    name: 'Modernismo Brasileiro',
    type: 'image',
    value: '/academy/Tarsila do Amaral_ Modernismo Brasileiro.svg',
    preview: '/academy/Tarsila do Amaral_ Modernismo Brasileiro.svg',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'tcc-cidadao-1',
    name: 'Cidadao.AI Democratizando',
    type: 'image',
    value: '/academy/Cidadão.AI_ democratizando transparência.svg',
    preview: '/academy/Cidadão.AI_ democratizando transparência.svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-2',
    name: 'Cidadao.AI Slide 1',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI.svg',
    preview: '/academy/Cópia de Cidadão.AI.svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-3',
    name: 'Cidadao.AI Slide 2',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI (1).svg',
    preview: '/academy/Cópia de Cidadão.AI (1).svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-4',
    name: 'Cidadao.AI Slide 3',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI (2).svg',
    preview: '/academy/Cópia de Cidadão.AI (2).svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-5',
    name: 'Cidadao.AI Slide 4',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI (3).svg',
    preview: '/academy/Cópia de Cidadão.AI (3).svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-6',
    name: 'Cidadao.AI Slide 5',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI (4).svg',
    preview: '/academy/Cópia de Cidadão.AI (4).svg',
    artist: 'Anderson Silva',
  },
  {
    id: 'tcc-cidadao-7',
    name: 'Cidadao.AI Slide 6',
    type: 'image',
    value: '/academy/Cópia de Cidadão.AI (5).svg',
    preview: '/academy/Cópia de Cidadão.AI (5).svg',
    artist: 'Anderson Silva',
  },
]

const STORAGE_KEY = 'academy_background_preference'

interface BackgroundPreference {
  lightBackground: string
  darkBackground: string
  useOverlay: boolean
  overlayOpacity: number
}

const DEFAULT_PREFERENCE: BackgroundPreference = {
  lightBackground: 'tarsila-creme',
  darkBackground: 'elegant-gray',
  useOverlay: true,
  overlayOpacity: 0.85,
}

export function useAcademyBackground() {
  const [preference, setPreference] = useState<BackgroundPreference>(DEFAULT_PREFERENCE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preference from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreference({ ...DEFAULT_PREFERENCE, ...parsed })
      }
    } catch (e) {
      console.error('Failed to load background preference:', e)
    }
    setIsLoaded(true)
  }, [])

  // Save preference to localStorage
  const savePreference = useCallback((newPreference: Partial<BackgroundPreference>) => {
    setPreference((prev) => {
      const updated = { ...prev, ...newPreference }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save background preference:', e)
      }
      return updated
    })
  }, [])

  // Get the current background option based on theme
  const getCurrentBackground = useCallback(
    (isDark: boolean): BackgroundOption | undefined => {
      const bgId = isDark ? preference.darkBackground : preference.lightBackground
      return BACKGROUND_OPTIONS.find((bg) => bg.id === bgId)
    },
    [preference]
  )

  // Get CSS styles for the background
  const getBackgroundStyles = useCallback(
    (isDark: boolean): React.CSSProperties => {
      const bg = getCurrentBackground(isDark)
      if (!bg) return {}

      const styles: React.CSSProperties = {}

      switch (bg.type) {
        case 'solid':
          styles.backgroundColor = bg.value
          break
        case 'gradient':
          styles.background = bg.value
          break
        case 'image':
          styles.backgroundImage = `url(${bg.value})`
          styles.backgroundSize = 'cover'
          styles.backgroundPosition = 'center'
          styles.backgroundAttachment = 'fixed'
          break
      }

      return styles
    },
    [getCurrentBackground]
  )

  // Set light mode background
  const setLightBackground = useCallback(
    (bgId: string) => {
      savePreference({ lightBackground: bgId })
    },
    [savePreference]
  )

  // Set dark mode background
  const setDarkBackground = useCallback(
    (bgId: string) => {
      savePreference({ darkBackground: bgId })
    },
    [savePreference]
  )

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    savePreference({ useOverlay: !preference.useOverlay })
  }, [preference.useOverlay, savePreference])

  // Set overlay opacity
  const setOverlayOpacity = useCallback(
    (opacity: number) => {
      savePreference({ overlayOpacity: Math.max(0, Math.min(1, opacity)) })
    },
    [savePreference]
  )

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    savePreference(DEFAULT_PREFERENCE)
  }, [savePreference])

  return {
    preference,
    isLoaded,
    getCurrentBackground,
    getBackgroundStyles,
    setLightBackground,
    setDarkBackground,
    toggleOverlay,
    setOverlayOpacity,
    resetToDefaults,
    backgroundOptions: BACKGROUND_OPTIONS,
  }
}
