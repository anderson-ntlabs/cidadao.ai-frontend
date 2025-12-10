'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AgoraBackground')

/**
 * Agora Background Customization Hook
 *
 * Supports solid colors, gradients, TCC slide images, and random mode.
 * Random mode selects a new image background each session.
 *
 * Design: Bo Bardi + Dumont + Anderson
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 * Updated: 2025-12-08 - Added random session mode
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
const SESSION_KEY = 'agora_random_bg'

interface BackgroundState {
  selectedId: string
  overlayEnabled: boolean
  overlayOpacity: number
  randomMode: boolean
}

const DEFAULT_STATE: BackgroundState = {
  selectedId: 'default',
  overlayEnabled: true,
  overlayOpacity: 0.85,
  randomMode: true, // Default to random mode enabled
}

// Get image options for random selection
const IMAGE_OPTIONS = BACKGROUND_OPTIONS.filter((bg) => bg.type === 'image')

// Select a random image background
function getRandomImageId(): string {
  const randomIndex = Math.floor(Math.random() * IMAGE_OPTIONS.length)
  return IMAGE_OPTIONS[randomIndex].id
}

export function useAgoraBackground() {
  const [state, setState] = useState<BackgroundState>(DEFAULT_STATE)
  const [sessionBgId, setSessionBgId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const initializedRef = useRef(false)

  // Load from localStorage and handle random mode on mount
  useEffect(() => {
    if (typeof window === 'undefined' || initializedRef.current) return
    initializedRef.current = true

    try {
      // Load persisted preferences
      const stored = localStorage.getItem(STORAGE_KEY)
      let loadedState = DEFAULT_STATE

      if (stored) {
        const parsed = JSON.parse(stored)
        loadedState = { ...DEFAULT_STATE, ...parsed }
      }

      // Handle random mode
      if (loadedState.randomMode) {
        // Check if we already have a random background for this session
        const existingSessionBg = sessionStorage.getItem(SESSION_KEY)

        if (existingSessionBg) {
          // Use existing session background
          setSessionBgId(existingSessionBg)
        } else {
          // Select new random background for this session
          const randomId = getRandomImageId()
          sessionStorage.setItem(SESSION_KEY, randomId)
          setSessionBgId(randomId)
        }
      }

      setState(loadedState)
    } catch (e) {
      logger.error('Failed to load background preference', { error: e })
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage (persists preferences across sessions)
  const saveState = useCallback((newState: Partial<BackgroundState>) => {
    setState((prev) => {
      const updated = { ...prev, ...newState }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        logger.error('Failed to save background preference', { error: e })
      }
      return updated
    })
  }, [])

  // Determine effective background ID (considering random mode)
  const effectiveBackgroundId = state.randomMode && sessionBgId ? sessionBgId : state.selectedId

  // Get current background option
  const currentBackground =
    BACKGROUND_OPTIONS.find((bg) => bg.id === effectiveBackgroundId) || BACKGROUND_OPTIONS[0]

  // Set background by ID (disables random mode when user manually selects)
  const setBackground = useCallback(
    (id: string) => {
      const exists = BACKGROUND_OPTIONS.find((bg) => bg.id === id)
      if (exists) {
        // Clear session storage when manually selecting
        sessionStorage.removeItem(SESSION_KEY)
        setSessionBgId(null)
        saveState({ selectedId: id, randomMode: false })
      }
    },
    [saveState]
  )

  // Enable random mode
  const enableRandomMode = useCallback(() => {
    const randomId = getRandomImageId()
    sessionStorage.setItem(SESSION_KEY, randomId)
    setSessionBgId(randomId)
    saveState({ randomMode: true })
  }, [saveState])

  // Disable random mode (keeps current background)
  const disableRandomMode = useCallback(() => {
    // Keep the current session background as the selected one
    if (sessionBgId) {
      saveState({ selectedId: sessionBgId, randomMode: false })
    } else {
      saveState({ randomMode: false })
    }
    sessionStorage.removeItem(SESSION_KEY)
    setSessionBgId(null)
  }, [sessionBgId, saveState])

  // Toggle random mode
  const toggleRandomMode = useCallback(() => {
    if (state.randomMode) {
      disableRandomMode()
    } else {
      enableRandomMode()
    }
  }, [state.randomMode, enableRandomMode, disableRandomMode])

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

  // Reset to defaults (enables random mode)
  const reset = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    const randomId = getRandomImageId()
    sessionStorage.setItem(SESSION_KEY, randomId)
    setSessionBgId(randomId)
    saveState(DEFAULT_STATE)
  }, [saveState])

  return {
    // State
    currentBackground,
    isLoaded,
    overlayEnabled: state.overlayEnabled,
    overlayOpacity: state.overlayOpacity,
    randomMode: state.randomMode,

    // Actions
    setBackground,
    toggleOverlay,
    setOverlayOpacity,
    reset,
    enableRandomMode,
    disableRandomMode,
    toggleRandomMode,

    // Style helpers
    getBackgroundStyle,
    getOverlayStyle,

    // Data (pre-filtered at module level for performance)
    options: BACKGROUND_OPTIONS,
    solidOptions: SOLID_OPTIONS,
    gradientOptions: GRADIENT_OPTIONS,
    imageOptions: IMAGE_OPTIONS,
  }
}

// Pre-compute filtered arrays at module level (once, not on every render)
const SOLID_OPTIONS = BACKGROUND_OPTIONS.filter((bg) => bg.type === 'solid')
const GRADIENT_OPTIONS = BACKGROUND_OPTIONS.filter((bg) => bg.type === 'gradient')
