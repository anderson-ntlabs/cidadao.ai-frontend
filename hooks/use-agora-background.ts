'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Agora Background Customization Hook
 *
 * Simple background customization for Agora dashboard.
 * Supports solid colors, gradients, and TCC slide images.
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
  thumbnail?: string
  artist?: string
}

// Available background options with URL-safe paths
export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  // === SOLID COLORS ===
  {
    id: 'default',
    name: 'Padrao',
    type: 'solid',
    value: '#FFFBF5', // Warm cream
    artist: 'Sistema',
  },
  {
    id: 'tarsila-creme',
    name: 'Creme Tarsila',
    type: 'solid',
    value: '#FFF8E7',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'tarsila-amarelo',
    name: 'Amarelo Suave',
    type: 'solid',
    value: '#FFFAEB',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'elegant-charcoal',
    name: 'Carvao Elegante',
    type: 'solid',
    value: '#171717',
    artist: 'Bo Bardi',
  },
  {
    id: 'deep-gray',
    name: 'Cinza Profundo',
    type: 'solid',
    value: '#1F1F1F',
    artist: 'Bo Bardi',
  },

  // === GRADIENTS ===
  {
    id: 'sunset',
    name: 'Por do Sol',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4C4 100%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'terra',
    name: 'Terra Brasileira',
    type: 'gradient',
    value: 'linear-gradient(180deg, #FFFBF5 0%, #F5DEB3 100%)',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'night',
    name: 'Noite Elegante',
    type: 'gradient',
    value: 'linear-gradient(180deg, #171717 0%, #2D2D2D 100%)',
    artist: 'Bo Bardi',
  },

  // === TCC SLIDE IMAGES ===
  {
    id: 'tarsila-modernismo',
    name: 'Modernismo Brasileiro',
    type: 'image',
    value: '/agora/tarsila-modernismo.png',
    thumbnail: '/agora/tarsila-modernismo.png',
    artist: 'Tarsila do Amaral',
  },
  {
    id: 'cidadao-democratizando',
    name: 'Cidadao.AI Principal',
    type: 'image',
    value: '/agora/cidadao-democratizando.png',
    thumbnail: '/agora/cidadao-democratizando.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-01',
    name: 'Slide 1',
    type: 'image',
    value: '/agora/cidadao-slide-01.png',
    thumbnail: '/agora/cidadao-slide-01.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-02',
    name: 'Slide 2',
    type: 'image',
    value: '/agora/cidadao-slide-02.png',
    thumbnail: '/agora/cidadao-slide-02.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-03',
    name: 'Slide 3',
    type: 'image',
    value: '/agora/cidadao-slide-03.png',
    thumbnail: '/agora/cidadao-slide-03.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-04',
    name: 'Slide 4',
    type: 'image',
    value: '/agora/cidadao-slide-04.png',
    thumbnail: '/agora/cidadao-slide-04.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-05',
    name: 'Slide 5',
    type: 'image',
    value: '/agora/cidadao-slide-05.png',
    thumbnail: '/agora/cidadao-slide-05.png',
    artist: 'Anderson Silva',
  },
  {
    id: 'cidadao-slide-06',
    name: 'Slide 6',
    type: 'image',
    value: '/agora/cidadao-slide-06.png',
    thumbnail: '/agora/cidadao-slide-06.png',
    artist: 'Anderson Silva',
  },
]

const STORAGE_KEY = 'agora_background'

interface BackgroundState {
  selectedId: string
  overlayEnabled: boolean
  overlayOpacity: number
}

const DEFAULT_STATE: BackgroundState = {
  selectedId: 'default',
  overlayEnabled: true,
  overlayOpacity: 0.9,
}

export function useAgoraBackground() {
  const [state, setState] = useState<BackgroundState>(DEFAULT_STATE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState({ ...DEFAULT_STATE, ...parsed })
      }
    } catch (e) {
      console.error('Failed to load background preference:', e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  const saveState = useCallback((newState: Partial<BackgroundState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save background preference:', e)
      }
      return updated
    })
  }, [])

  // Get current background option
  const currentBackground =
    BACKGROUND_OPTIONS.find((bg) => bg.id === state.selectedId) || BACKGROUND_OPTIONS[0]

  // Set background by ID
  const setBackground = useCallback(
    (id: string) => {
      const exists = BACKGROUND_OPTIONS.find((bg) => bg.id === id)
      if (exists) {
        saveState({ selectedId: id })
      }
    },
    [saveState]
  )

  // Get CSS styles for current background
  const getBackgroundStyle = useCallback((): React.CSSProperties => {
    const bg = currentBackground
    if (!bg) return {}

    switch (bg.type) {
      case 'solid':
        return { backgroundColor: bg.value }
      case 'gradient':
        return { background: bg.value }
      case 'image':
        return {
          backgroundImage: `url(${bg.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }
      default:
        return {}
    }
  }, [currentBackground])

  // Get overlay style for image backgrounds
  const getOverlayStyle = useCallback(
    (isDark: boolean): React.CSSProperties | null => {
      if (currentBackground?.type !== 'image' || !state.overlayEnabled) {
        return null
      }
      return {
        backgroundColor: isDark
          ? `rgba(23, 23, 23, ${state.overlayOpacity})`
          : `rgba(255, 251, 245, ${state.overlayOpacity})`,
      }
    },
    [currentBackground, state.overlayEnabled, state.overlayOpacity]
  )

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    saveState({ overlayEnabled: !state.overlayEnabled })
  }, [state.overlayEnabled, saveState])

  // Set overlay opacity
  const setOverlayOpacity = useCallback(
    (opacity: number) => {
      saveState({ overlayOpacity: Math.max(0.5, Math.min(0.98, opacity)) })
    },
    [saveState]
  )

  // Reset to defaults
  const reset = useCallback(() => {
    saveState(DEFAULT_STATE)
  }, [saveState])

  return {
    // State
    currentBackground,
    isLoaded,
    overlayEnabled: state.overlayEnabled,
    overlayOpacity: state.overlayOpacity,

    // Actions
    setBackground,
    toggleOverlay,
    setOverlayOpacity,
    reset,

    // Style helpers
    getBackgroundStyle,
    getOverlayStyle,

    // Data
    options: BACKGROUND_OPTIONS,
    solidOptions: BACKGROUND_OPTIONS.filter((bg) => bg.type === 'solid'),
    gradientOptions: BACKGROUND_OPTIONS.filter((bg) => bg.type === 'gradient'),
    imageOptions: BACKGROUND_OPTIONS.filter((bg) => bg.type === 'image'),
  }
}
