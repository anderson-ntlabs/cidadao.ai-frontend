/**
 * Agora Mode Hook
 *
 * Manages the current mode (Academy vs Kids) using sessionStorage.
 * Mode is cleared when the browser tab is closed, forcing users
 * to re-select their mode on next visit.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type AgoraMode = 'academy' | 'kids' | null

const STORAGE_KEY = 'agora_current_mode'
const MODE_TIMESTAMP_KEY = 'agora_mode_timestamp'

interface UseAgoraModeReturn {
  /** Current mode: 'academy', 'kids', or null if not selected */
  mode: AgoraMode
  /** Whether mode is still loading from storage */
  isLoading: boolean
  /** Set the current mode */
  setMode: (mode: 'academy' | 'kids') => void
  /** Clear mode and return to selection */
  clearMode: () => void
  /** Check if current mode is Academy */
  isAcademy: boolean
  /** Check if current mode is Kids */
  isKids: boolean
  /** Navigate to mode selection page */
  goToSelection: () => void
}

/**
 * Hook to manage Agora mode (Academy vs Kids)
 *
 * Uses sessionStorage so mode is cleared when tab closes.
 * This ensures users must re-select mode on each visit.
 */
export function useAgoraMode(): UseAgoraModeReturn {
  const router = useRouter()
  const [mode, setModeState] = useState<AgoraMode>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load mode from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = sessionStorage.getItem(STORAGE_KEY) as AgoraMode
    if (stored === 'academy' || stored === 'kids') {
      setModeState(stored)
    }
    setIsLoading(false)
  }, [])

  // Set mode and persist to sessionStorage
  const setMode = useCallback((newMode: 'academy' | 'kids') => {
    if (typeof window === 'undefined') return

    sessionStorage.setItem(STORAGE_KEY, newMode)
    sessionStorage.setItem(MODE_TIMESTAMP_KEY, Date.now().toString())
    setModeState(newMode)
  }, [])

  // Clear mode from sessionStorage
  const clearMode = useCallback(() => {
    if (typeof window === 'undefined') return

    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(MODE_TIMESTAMP_KEY)
    setModeState(null)
  }, [])

  // Navigate to selection page
  const goToSelection = useCallback(() => {
    clearMode()
    router.push('/pt/agora/selecao')
  }, [clearMode, router])

  return {
    mode,
    isLoading,
    setMode,
    clearMode,
    isAcademy: mode === 'academy',
    isKids: mode === 'kids',
    goToSelection,
  }
}

/**
 * Guard hook that requires Academy mode
 * Redirects to selection page if not in Academy mode
 */
export function useRequireAcademyMode(): boolean {
  const router = useRouter()
  const { mode, isLoading } = useAgoraMode()

  useEffect(() => {
    if (isLoading) return

    if (mode !== 'academy') {
      router.replace('/pt/agora/selecao')
    }
  }, [mode, isLoading, router])

  return !isLoading && mode === 'academy'
}

/**
 * Guard hook that requires Kids mode SELECTED
 * Redirects to selection page if user hasn't selected Kids mode
 * Note: This checks mode selection, NOT kids profile setup
 */
export function useRequireKidsModeSelected(): boolean {
  const router = useRouter()
  const { mode, isLoading } = useAgoraMode()

  useEffect(() => {
    if (isLoading) return

    if (mode !== 'kids') {
      router.replace('/pt/agora/selecao')
    }
  }, [mode, isLoading, router])

  return !isLoading && mode === 'kids'
}

/**
 * Utility to clear mode on page unload
 * Call this in layout to ensure cleanup
 */
export function setupModeCleanup(): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleBeforeUnload = () => {
    // Note: sessionStorage is automatically cleared when tab closes
    // This is just for explicit cleanup during navigation away
    // We don't clear here because we want mode to persist during navigation
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}
