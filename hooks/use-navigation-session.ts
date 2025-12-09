/**
 * useNavigationSession Hook
 *
 * React hook for managing navigation sessions with the NavigationSessionService.
 * Provides reactive state updates and convenient methods for session management.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  navigationSessionService,
  type SessionState,
  type NavigationTarget,
} from '@/lib/services/navigation-session.service'
import { createLogger } from '@/lib/logger'

const logger = createLogger('useNavigationSession')

export interface UseNavigationSessionReturn {
  // State
  isAuthenticated: boolean
  isInAgora: boolean
  isInKidsMode: boolean
  userId: string | null
  isReady: boolean

  // Actions
  initSession: (userId: string) => Promise<void>
  enterAgora: () => void
  enterKidsMode: () => void
  exitKidsMode: () => Promise<void>
  exitAgora: () => Promise<void>
  logout: () => Promise<void>

  // Navigation
  canNavigateTo: (target: NavigationTarget) => boolean
  navigateTo: (target: NavigationTarget) => void
  getRedirectPath: () => string

  // Utilities
  syncState: () => Promise<void>
  clearAllStorage: () => void
}

export function useNavigationSession(): UseNavigationSessionReturn {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<SessionState>(navigationSessionService.getState())
  const [isReady, setIsReady] = useState(false)

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribe = navigationSessionService.subscribe((newState) => {
      setState(newState)
    })

    // Initial sync
    navigationSessionService.syncWithStores().then(() => {
      setState(navigationSessionService.getState())
      setIsReady(true)
    })

    return unsubscribe
  }, [])

  // Detect route changes and update session state
  useEffect(() => {
    if (!isReady) return

    const isAgoraRoute = pathname?.startsWith('/pt/agora') || pathname?.startsWith('/en/agora')
    const isKidsRoute = pathname?.includes('/agora/kids')
    const isLoginRoute = pathname?.includes('/agora/login')

    // Auto-enter Ágora mode when navigating to Ágora routes
    if (isAgoraRoute && !isLoginRoute && state.isAuthenticated && !state.isInAgora) {
      navigationSessionService.enterAgora()
    }

    // Auto-enter Kids mode when navigating to Kids routes
    if (isKidsRoute && state.isAuthenticated && state.isInAgora && !state.isInKidsMode) {
      navigationSessionService.enterKidsMode()
    }

    // Auto-exit Kids mode when leaving Kids routes
    if (!isKidsRoute && state.isInKidsMode) {
      navigationSessionService.exitKidsMode()
    }
  }, [pathname, isReady, state.isAuthenticated, state.isInAgora, state.isInKidsMode])

  // Initialize auth session
  const initSession = useCallback(async (userId: string) => {
    await navigationSessionService.initAuthSession(userId)
  }, [])

  // Enter Ágora mode
  const enterAgora = useCallback(() => {
    navigationSessionService.enterAgora()
  }, [])

  // Enter Kids mode
  const enterKidsMode = useCallback(() => {
    navigationSessionService.enterKidsMode()
  }, [])

  // Exit Kids mode
  const exitKidsMode = useCallback(async () => {
    await navigationSessionService.exitKidsMode()
  }, [])

  // Exit Ágora mode
  const exitAgora = useCallback(async () => {
    await navigationSessionService.exitAgora()
  }, [])

  // Full logout
  const logout = useCallback(async () => {
    logger.info('Logout initiated from hook')
    await navigationSessionService.logout()
    router.push('/pt/agora/login')
  }, [router])

  // Check if can navigate to target
  const canNavigateTo = useCallback((target: NavigationTarget): boolean => {
    const result = navigationSessionService.canNavigateTo(target)
    return result.allowed
  }, [])

  // Navigate to target with guards
  const navigateTo = useCallback(
    (target: NavigationTarget) => {
      const check = navigationSessionService.canNavigateTo(target)

      if (!check.allowed) {
        logger.warn('Navigation blocked', { target, reason: check.reason })
        router.push(navigationSessionService.getRedirectPath())
        return
      }

      const paths: Record<NavigationTarget, string> = {
        landing: '/pt',
        login: '/pt/agora/login',
        'agora-dashboard': '/pt/agora',
        'agora-chat': '/pt/agora/chat',
        'kids-dashboard': '/pt/agora/kids',
        'kids-videos': '/pt/agora/kids/videos',
      }

      router.push(paths[target])
    },
    [router]
  )

  // Get redirect path
  const getRedirectPath = useCallback(() => {
    return navigationSessionService.getRedirectPath()
  }, [])

  // Sync state with stores
  const syncState = useCallback(async () => {
    await navigationSessionService.syncWithStores()
    setState(navigationSessionService.getState())
  }, [])

  // Clear all storage
  const clearAllStorage = useCallback(() => {
    navigationSessionService.clearAllSessionStorage()
  }, [])

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    isInAgora: state.isInAgora,
    isInKidsMode: state.isInKidsMode,
    userId: state.userId,
    isReady,

    // Actions
    initSession,
    enterAgora,
    enterKidsMode,
    exitKidsMode,
    exitAgora,
    logout,

    // Navigation
    canNavigateTo,
    navigateTo,
    getRedirectPath,

    // Utilities
    syncState,
    clearAllStorage,
  }
}

export default useNavigationSession
