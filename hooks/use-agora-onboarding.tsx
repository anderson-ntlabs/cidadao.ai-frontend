/**
 * Ágora Onboarding Hook
 *
 * Manages onboarding flow, track selection, GitHub verification,
 * LGPD consent, and terms acceptance.
 * Separated from main auth for better code organization.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AgoraOnboarding')

// ============================================
// Types
// ============================================

export type AgoraTrack = 'backend' | 'frontend' | 'ia' | 'devops'

export interface GitHubContribution {
  username: string
  hasForked: boolean
  forkUrl?: string
  commitCount: number
  lastCommitDate?: string
  lastChecked: string
}

export interface OnboardingData {
  currentStep: number
  completedSteps: number[]
  selectedTracks: AgoraTrack[]
  githubUsername?: string
  githubForkVerified: boolean
  completedAt?: string
  github: GitHubContribution | null
}

export interface OnboardingUser {
  id: string
  githubUsername?: string
  tracks: AgoraTrack[]
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean
  hasCompletedOnboarding: boolean
  onboardingStep: number
}

// ============================================
// Context & Hook Interface
// ============================================

export interface UseAgoraOnboardingReturn {
  // State
  hasCompletedOnboarding: boolean
  onboardingStep: number
  selectedTracks: AgoraTrack[]
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean
  onboarding: OnboardingData | null
  isLoading: boolean

  // Actions - Tracks
  toggleTrack: (track: AgoraTrack) => void
  selectTracks: (tracks: AgoraTrack[]) => Promise<void>
  confirmTracks: () => Promise<void>

  // Actions - Onboarding Steps
  setOnboardingStep: (step: number) => Promise<void>
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => Promise<void>

  // Actions - GitHub
  setGitHubUsername: (username: string) => Promise<void>
  verifyGitHubFork: () => Promise<{ success: boolean; message: string }>

  // Actions - Consent
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  acceptTerms: (ipAddress?: string, userAgent?: string, contractId?: string) => Promise<void>

  // Backwards compatibility
  initOnboarding: () => void
  updateOnboarding: (updates: Partial<OnboardingData>) => void
}

interface AgoraOnboardingProviderProps {
  children: React.ReactNode
  userId: string | null
  onXpAward?: (amount: number, source: string, description: string) => Promise<void>
  onCheckBadges?: () => Promise<void>
}

const AgoraOnboardingContext = createContext<UseAgoraOnboardingReturn | undefined>(undefined)

// ============================================
// Provider
// ============================================

export function AgoraOnboardingProvider({
  children,
  userId,
  onXpAward,
  onCheckBadges,
}: AgoraOnboardingProviderProps) {
  const supabase = createClient()

  // State
  const [user, setUser] = useState<OnboardingUser | null>(null)
  const [selectedTracks, setSelectedTracks] = useState<AgoraTrack[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load onboarding data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        const { data: profile } = await supabase
          .from('agora_profiles')
          .select(
            `
            github_username,
            tracks,
            has_accepted_terms,
            has_completed_onboarding,
            onboarding_step,
            github_fork_verified
          `
          )
          .eq('user_id', userId)
          .maybeSingle()

        // Check LGPD consent
        const { data: consent } = await supabase
          .from('agora_consent')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (profile) {
          const tracks = (profile.tracks as AgoraTrack[]) || []

          setUser({
            id: userId,
            githubUsername: profile.github_username || undefined,
            tracks,
            hasAcceptedLgpd: !!consent,
            hasAcceptedTerms: profile.has_accepted_terms || false,
            hasCompletedOnboarding: profile.has_completed_onboarding || false,
            onboardingStep: profile.onboarding_step || 0,
          })

          setSelectedTracks(tracks)

          setOnboarding({
            currentStep: profile.onboarding_step || 0,
            completedSteps: [],
            selectedTracks: tracks,
            githubUsername: profile.github_username || undefined,
            githubForkVerified: profile.github_fork_verified || false,
            completedAt: profile.has_completed_onboarding ? new Date().toISOString() : undefined,
            github: null,
          })
        }
      } catch (error) {
        logger.error('Failed to load onboarding data', { error })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, supabase])

  // Helper to update profile
  const updateProfile = useCallback(
    async (
      updates: Partial<{
        githubUsername: string
        tracks: AgoraTrack[]
        hasAcceptedTerms: boolean
        hasCompletedOnboarding: boolean
        onboardingStep: number
      }>
    ) => {
      if (!userId) return

      const dbUpdates: Record<string, unknown> = {}
      if (updates.githubUsername !== undefined) dbUpdates.github_username = updates.githubUsername
      if (updates.tracks !== undefined) dbUpdates.tracks = updates.tracks
      if (updates.hasAcceptedTerms !== undefined)
        dbUpdates.has_accepted_terms = updates.hasAcceptedTerms
      if (updates.hasCompletedOnboarding !== undefined)
        dbUpdates.has_completed_onboarding = updates.hasCompletedOnboarding
      if (updates.onboardingStep !== undefined) dbUpdates.onboarding_step = updates.onboardingStep

      await supabase.from('agora_profiles').update(dbUpdates).eq('user_id', userId)

      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null
      )
    },
    [userId, supabase]
  )

  // Toggle track selection
  const toggleTrack = useCallback((track: AgoraTrack) => {
    setSelectedTracks((prev) => {
      if (prev.includes(track)) {
        return prev.filter((t) => t !== track)
      } else {
        return [...prev, track]
      }
    })
  }, [])

  // Select tracks
  const selectTracks = useCallback(
    async (tracks: AgoraTrack[]) => {
      if (!userId) return
      await updateProfile({ tracks, onboardingStep: 3 })
      setSelectedTracks(tracks)

      if (onXpAward) {
        await onXpAward(
          25 * tracks.length,
          'onboarding',
          `Trilhas selecionadas: ${tracks.join(', ')}`
        )
      }

      logger.info('Tracks selected', { tracks })
    },
    [userId, updateProfile, onXpAward]
  )

  // Confirm tracks (backwards compat)
  const confirmTracks = useCallback(async () => {
    if (!userId || selectedTracks.length === 0) return
    await selectTracks(selectedTracks)
  }, [userId, selectedTracks, selectTracks])

  // Set onboarding step
  const setOnboardingStep = useCallback(
    async (step: number) => {
      if (!userId) return
      await updateProfile({ onboardingStep: step })
      setOnboarding((prev) => (prev ? { ...prev, currentStep: step } : null))
    },
    [userId, updateProfile]
  )

  // Set GitHub username
  const setGitHubUsername = useCallback(
    async (username: string) => {
      if (!userId) return
      await updateProfile({ githubUsername: username, onboardingStep: 4 })
      setOnboarding((prev) => (prev ? { ...prev, githubUsername: username, currentStep: 4 } : null))
      logger.info('GitHub username set', { username })
    },
    [userId, updateProfile]
  )

  // Verify GitHub fork
  const verifyGitHubFork = useCallback(async (): Promise<{
    success: boolean
    message: string
  }> => {
    if (!userId || !user?.githubUsername || selectedTracks.length === 0) {
      return { success: false, message: 'Usuario ou trilhas nao definidos' }
    }

    try {
      // Import and call the real verification function
      const { verifyGitHubFork: verifyFork } = await import('@/lib/agora/github')
      const result = await verifyFork(user.githubUsername)

      if (result.success) {
        await supabase
          .from('agora_profiles')
          .update({
            github_fork_verified: true,
            github_fork_url: result.forkUrl || null,
          })
          .eq('user_id', userId)

        if (onXpAward) {
          await onXpAward(50, 'onboarding', 'Fork do repositorio verificado!')
        }
        await updateProfile({ onboardingStep: 4 })
      }

      return result
    } catch (error) {
      logger.error('GitHub fork verification failed', { error })

      // On error, allow user to proceed (graceful degradation)
      await supabase
        .from('agora_profiles')
        .update({ github_fork_verified: true })
        .eq('user_id', userId)

      if (onXpAward) {
        await onXpAward(50, 'onboarding', 'Fork aceito provisoriamente')
      }
      await updateProfile({ onboardingStep: 4 })

      return {
        success: true,
        message: 'Fork aceito provisoriamente. Verifique manualmente depois.',
      }
    }
  }, [userId, user, selectedTracks, supabase, onXpAward, updateProfile])

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!userId) return

    await updateProfile({ hasCompletedOnboarding: true, onboardingStep: 5 })

    if (onXpAward) {
      await onXpAward(100, 'onboarding', 'Onboarding concluido! Bem-vindo a Agora!')
    }

    if (onCheckBadges) {
      await onCheckBadges()
    }

    setOnboarding((prev) =>
      prev ? { ...prev, completedAt: new Date().toISOString(), currentStep: 5 } : null
    )

    logger.info('Onboarding completed')
  }, [userId, updateProfile, onXpAward, onCheckBadges])

  // Reset onboarding
  const resetOnboarding = useCallback(async () => {
    if (!userId) return

    await supabase
      .from('agora_profiles')
      .update({
        has_completed_onboarding: false,
        has_accepted_terms: false,
        onboarding_step: 0,
        tracks: [],
        github_fork_verified: false,
      })
      .eq('user_id', userId)

    setSelectedTracks([])
    setUser((prev) =>
      prev
        ? {
            ...prev,
            hasCompletedOnboarding: false,
            hasAcceptedTerms: false,
            onboardingStep: 0,
            tracks: [],
          }
        : null
    )
    setOnboarding({
      currentStep: 0,
      completedSteps: [],
      selectedTracks: [],
      githubUsername: user?.githubUsername,
      githubForkVerified: false,
      completedAt: undefined,
      github: null,
    })

    logger.info('Onboarding reset')
  }, [userId, supabase, user])

  // Accept LGPD consent
  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      if (!userId) return

      try {
        await supabase.from('agora_consent').upsert(
          {
            user_id: userId,
            consent_version: 'v1.0',
            tracking_consent: true,
            data_processing_consent: true,
            certificate_consent: true,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
          { onConflict: 'user_id' }
        )

        setUser((prev) => (prev ? { ...prev, hasAcceptedLgpd: true } : null))
        logger.info('LGPD consent accepted', { ipAddress })
      } catch (error) {
        logger.error('Failed to accept LGPD consent', { error })
      }
    },
    [userId, supabase]
  )

  // Accept terms
  const acceptTerms = useCallback(
    async (_ipAddress?: string, _userAgent?: string, _contractId?: string) => {
      if (!userId) return

      try {
        await updateProfile({ hasAcceptedTerms: true })

        if (onXpAward) {
          await onXpAward(100, 'terms_accept', 'Bonus de boas-vindas - Aceite dos Termos de Uso')
        }

        logger.info('Terms accepted')
      } catch (error) {
        logger.error('Failed to accept terms', { error })
      }
    },
    [userId, updateProfile, onXpAward]
  )

  // Backwards compatibility: initOnboarding (no-op)
  const initOnboarding = useCallback(() => {
    logger.debug('initOnboarding called (no-op in real auth mode)')
  }, [])

  // Backwards compatibility: updateOnboarding
  const updateOnboarding = useCallback(
    (updates: Partial<OnboardingData>) => {
      if (updates.selectedTracks) {
        setSelectedTracks(updates.selectedTracks)
      }
      if (updates.currentStep !== undefined && userId) {
        updateProfile({ onboardingStep: updates.currentStep })
      }
    },
    [userId, updateProfile]
  )

  // Context value
  const contextValue = useMemo(
    (): UseAgoraOnboardingReturn => ({
      hasCompletedOnboarding: user?.hasCompletedOnboarding || false,
      onboardingStep: user?.onboardingStep || 0,
      selectedTracks,
      hasAcceptedLgpd: user?.hasAcceptedLgpd || false,
      hasAcceptedTerms: user?.hasAcceptedTerms || false,
      onboarding,
      isLoading,
      toggleTrack,
      selectTracks,
      confirmTracks,
      setOnboardingStep,
      completeOnboarding,
      resetOnboarding,
      setGitHubUsername,
      verifyGitHubFork,
      acceptLgpdConsent,
      acceptTerms,
      initOnboarding,
      updateOnboarding,
    }),
    [
      user,
      selectedTracks,
      onboarding,
      isLoading,
      toggleTrack,
      selectTracks,
      confirmTracks,
      setOnboardingStep,
      completeOnboarding,
      resetOnboarding,
      setGitHubUsername,
      verifyGitHubFork,
      acceptLgpdConsent,
      acceptTerms,
      initOnboarding,
      updateOnboarding,
    ]
  )

  return (
    <AgoraOnboardingContext.Provider value={contextValue}>
      {children}
    </AgoraOnboardingContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useAgoraOnboarding(): UseAgoraOnboardingReturn {
  const context = useContext(AgoraOnboardingContext)

  if (context === undefined) {
    throw new Error('useAgoraOnboarding must be used within an AgoraOnboardingProvider')
  }

  return context
}
