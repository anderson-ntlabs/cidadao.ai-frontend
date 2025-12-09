/**
 * useKids Hook
 *
 * React hook for managing Kids mode in Ágora Academy.
 * Provides a high-level interface over the kids store with
 * integration to the main Ágora context.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useKidsStore, KidsProfile, KidsDailyStats } from '@/store/kids-store'
import { useAgora } from '@/hooks/use-agora'
import { logger } from '@/lib/logger'

export interface UseKidsReturn {
  // State
  isKidsMode: boolean
  kidsProfile: KidsProfile | null
  isLoading: boolean
  error: string | null
  isSessionActive: boolean

  // Parent info
  parentName: string | null
  parentEmail: string | null

  // Child info
  childName: string | null
  childAvatar: string | null

  // Actions
  enableKidsMode: (
    parentName: string,
    parentEmail: string,
    childName: string,
    avatar?: string,
    contractId?: string
  ) => Promise<boolean>
  disableKidsMode: () => Promise<boolean>
  updateAvatar: (avatarId: string) => Promise<boolean>
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  trackVideo: (videoId: string) => void
  trackAgent: (agentId: string) => void

  // Parental access
  generateAccessCode: () => Promise<string | null>
  validateAccessCode: (code: string) => Promise<{
    isValid: boolean
    childName?: string
  }>

  // Stats
  getTodayStats: () => Promise<KidsDailyStats | null>
  getStatsForDate: (date: Date) => Promise<KidsDailyStats | null>
}

/**
 * Hook for Kids mode management
 *
 * @example
 * ```tsx
 * const {
 *   isKidsMode,
 *   childName,
 *   enableKidsMode,
 *   startSession,
 *   trackVideo
 * } = useKids()
 *
 * // Enable kids mode
 * await enableKidsMode('Maria', 'pai@email.com', 'tarsila')
 *
 * // Start session when child enters
 * await startSession()
 *
 * // Track video watched
 * trackVideo('intro-programacao')
 * ```
 */
export function useKids(): UseKidsReturn {
  const { user } = useAgora()

  // Refs to prevent infinite loops and duplicate calls
  const isStartingSession = useRef(false)
  const hasLoadedProfile = useRef(false)
  const lastUserId = useRef<string | null>(null)

  const {
    isKidsMode,
    kidsProfile,
    currentSession,
    isLoading,
    error,
    enableKidsMode: storeEnableKidsMode,
    disableKidsMode: storeDisableKidsMode,
    loadKidsProfile,
    updateChildAvatar,
    startKidsSession,
    endKidsSession,
    trackVideoWatched,
    trackAgentInteraction,
    generateParentalCode,
    validateParentalCode,
    getDailyStats,
  } = useKidsStore()

  // Load kids profile when user changes (only once per user)
  useEffect(() => {
    if (user?.id && user.id !== lastUserId.current) {
      lastUserId.current = user.id
      hasLoadedProfile.current = false
    }

    if (user?.id && !hasLoadedProfile.current && !isLoading) {
      hasLoadedProfile.current = true
      loadKidsProfile(user.id)
    }
  }, [user?.id, isLoading, loadKidsProfile])

  // Auto-start session when entering kids mode (with guard against duplicate calls)
  useEffect(() => {
    const shouldStartSession =
      isKidsMode && kidsProfile && !currentSession && !isStartingSession.current

    if (shouldStartSession) {
      isStartingSession.current = true
      startKidsSession().finally(() => {
        // Reset flag after a delay to prevent rapid re-triggers
        setTimeout(() => {
          isStartingSession.current = false
        }, 1000)
      })
    }
  }, [isKidsMode, kidsProfile, currentSession, startKidsSession])

  // Reset starting flag when session is created
  useEffect(() => {
    if (currentSession) {
      isStartingSession.current = false
    }
  }, [currentSession])

  // Auto-end session on unmount (but NOT on every currentSession change)
  useEffect(() => {
    // Capture session ID at effect creation time
    const sessionId = currentSession?.id

    return () => {
      // Only end session on unmount if we had an active session
      if (sessionId) {
        endKidsSession()
      }
    }
    // Intentionally not including currentSession in deps to prevent cleanup on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Enable kids mode
  const enableKidsMode = useCallback(
    async (
      parentName: string,
      parentEmail: string,
      childName: string,
      avatar: string = 'monica',
      contractId?: string
    ): Promise<boolean> => {
      if (!user?.id) {
        logger.warn('Cannot enable kids mode without authenticated user')
        return false
      }

      return storeEnableKidsMode(user.id, parentName, parentEmail, childName, avatar, contractId)
    },
    [user?.id, storeEnableKidsMode]
  )

  // Disable kids mode
  const disableKidsMode = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      logger.warn('Cannot disable kids mode without authenticated user')
      return false
    }

    return storeDisableKidsMode(user.id)
  }, [user?.id, storeDisableKidsMode])

  // Generate access code for parental dashboard
  const generateAccessCode = useCallback(async (): Promise<string | null> => {
    if (!user?.id) {
      logger.warn('Cannot generate code without authenticated user')
      return null
    }

    return generateParentalCode(user.id)
  }, [user?.id, generateParentalCode])

  // Validate access code
  const validateAccessCode = useCallback(
    async (code: string): Promise<{ isValid: boolean; childName?: string }> => {
      const result = await validateParentalCode(code)
      return {
        isValid: result.isValid,
        childName: result.childName,
      }
    },
    [validateParentalCode]
  )

  // Get today's stats
  const getTodayStats = useCallback(async (): Promise<KidsDailyStats | null> => {
    if (!kidsProfile?.id) {
      return null
    }

    return getDailyStats(kidsProfile.id)
  }, [kidsProfile?.id, getDailyStats])

  // Get stats for specific date
  const getStatsForDate = useCallback(
    async (date: Date): Promise<KidsDailyStats | null> => {
      if (!kidsProfile?.id) {
        return null
      }

      return getDailyStats(kidsProfile.id, date)
    },
    [kidsProfile?.id, getDailyStats]
  )

  return {
    // State
    isKidsMode,
    kidsProfile,
    isLoading,
    error,
    isSessionActive: !!currentSession,

    // Parent info
    parentName: kidsProfile?.parentName || null,
    parentEmail: kidsProfile?.parentEmail || null,

    // Child info
    childName: kidsProfile?.childName || null,
    childAvatar: kidsProfile?.childAvatar || null,

    // Actions
    enableKidsMode,
    disableKidsMode,
    updateAvatar: updateChildAvatar,
    startSession: startKidsSession,
    endSession: endKidsSession,
    trackVideo: trackVideoWatched,
    trackAgent: trackAgentInteraction,

    // Parental access
    generateAccessCode,
    validateAccessCode,

    // Stats
    getTodayStats,
    getStatsForDate,
  }
}

/**
 * Hook specifically for Kids pages - ensures kids mode is active
 * Redirects to main Agora if not in kids mode
 */
export function useRequireKidsMode() {
  const { isKidsMode, kidsProfile, isLoading } = useKids()

  return {
    isKidsMode,
    kidsProfile,
    isLoading,
    isReady: !isLoading && isKidsMode && !!kidsProfile,
  }
}

/**
 * Hook for parental dashboard - validates access code
 */
export function useParentalAccess() {
  const { validateAccessCode } = useKids()

  const verifyAndGetAccess = useCallback(
    async (code: string) => {
      const result = await validateAccessCode(code)

      if (!result.isValid) {
        return {
          success: false,
          error: 'Código inválido ou expirado',
        }
      }

      return {
        success: true,
        childName: result.childName,
      }
    },
    [validateAccessCode]
  )

  return {
    verifyAndGetAccess,
  }
}

export default useKids
