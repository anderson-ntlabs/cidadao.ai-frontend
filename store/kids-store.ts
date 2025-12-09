/**
 * Kids Mode Store
 *
 * Zustand store for managing Kids mode state in Ágora Academy.
 * Handles kids profiles, sessions, and parental tracking.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

// Kids avatar type - Brazilian cartoon characters
export type KidsAvatarType = 'monica' | 'cocorico' | 'ze_carioca' | 'jorel' | 'luluzinha' | string

// Types
export interface KidsProfile {
  id: string
  parentUserId: string
  parentName: string
  parentEmail: string
  childName: string
  childAvatar: KidsAvatarType
  contractId: string | null
  contractVersion: string
  contractAcceptedAt: string | null
  createdAt: string
  isActive: boolean
}

export interface KidsSession {
  id: string
  kidsProfileId: string
  startedAt: string
  endedAt: string | null
  durationMinutes: number
  videosWatched: string[]
  agentsInteracted: string[]
}

export interface KidsDailyStats {
  totalMinutes: number
  totalSessions: number
  videosWatched: string[]
  agentsUsed: string[]
}

interface KidsState {
  // State
  isKidsMode: boolean
  kidsProfile: KidsProfile | null
  currentSession: KidsSession | null
  isLoading: boolean
  error: string | null

  // Session tracking (in-memory for current session)
  sessionVideos: string[]
  sessionAgents: string[]
  sessionStartTime: number | null

  // Actions
  setKidsMode: (enabled: boolean) => void
  setKidsProfile: (profile: KidsProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Profile management
  enableKidsMode: (
    parentUserId: string,
    parentName: string,
    parentEmail: string,
    childName: string,
    avatar?: KidsAvatarType,
    contractId?: string
  ) => Promise<boolean>
  disableKidsMode: (parentUserId: string) => Promise<boolean>
  loadKidsProfile: (parentUserId: string) => Promise<KidsProfile | null>

  // Session management
  startKidsSession: () => Promise<void>
  endKidsSession: () => Promise<void>
  trackVideoWatched: (videoId: string) => void
  trackAgentInteraction: (agentId: string) => void

  // Parental access
  generateParentalCode: (parentUserId: string) => Promise<string | null>
  validateParentalCode: (code: string) => Promise<{
    isValid: boolean
    parentUserId?: string
    kidsProfileId?: string
    childName?: string
  }>

  // Stats
  getDailyStats: (kidsProfileId: string, date?: Date) => Promise<KidsDailyStats | null>

  // Reset
  reset: () => void
}

const initialState = {
  isKidsMode: false,
  kidsProfile: null,
  currentSession: null,
  isLoading: false,
  error: null,
  sessionVideos: [],
  sessionAgents: [],
  sessionStartTime: null,
}

export const useKidsStore = create<KidsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setKidsMode: (enabled) => set({ isKidsMode: enabled }),
      setKidsProfile: (profile) => set({ kidsProfile: profile }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Enable Kids Mode
      enableKidsMode: async (
        parentUserId,
        parentName,
        parentEmail,
        childName,
        avatar = 'monica',
        contractId
      ) => {
        const supabase = createClient()
        set({ isLoading: true, error: null })

        try {
          // Check if profile already exists (use maybeSingle to avoid 406 when no profile)
          const { data: existing } = await supabase
            .from('agora_kids_profiles')
            .select('*')
            .eq('parent_user_id', parentUserId)
            .maybeSingle()

          if (existing) {
            // Reactivate existing profile
            const { data, error } = await supabase
              .from('agora_kids_profiles')
              .update({
                is_active: true,
                parent_name: parentName,
                parent_email: parentEmail,
                child_name: childName,
                child_avatar: avatar,
                contract_id: contractId || existing.contract_id,
                contract_accepted_at: contractId
                  ? new Date().toISOString()
                  : existing.contract_accepted_at,
              })
              .eq('parent_user_id', parentUserId)
              .select()
              .single()

            if (error) throw error

            const profile: KidsProfile = {
              id: data.id,
              parentUserId: data.parent_user_id,
              parentName: data.parent_name,
              parentEmail: data.parent_email,
              childName: data.child_name,
              childAvatar: data.child_avatar,
              contractId: data.contract_id,
              contractVersion: data.contract_version,
              contractAcceptedAt: data.contract_accepted_at,
              createdAt: data.created_at,
              isActive: data.is_active,
            }

            set({ kidsProfile: profile, isKidsMode: true, isLoading: false })
            logger.info('Kids mode reactivated', { profileId: profile.id })
            return true
          }

          // Create new profile
          const { data, error } = await supabase
            .from('agora_kids_profiles')
            .insert({
              parent_user_id: parentUserId,
              parent_name: parentName,
              parent_email: parentEmail,
              child_name: childName,
              child_avatar: avatar,
              contract_id: contractId,
              contract_accepted_at: contractId ? new Date().toISOString() : null,
            })
            .select()
            .single()

          if (error) throw error

          const profile: KidsProfile = {
            id: data.id,
            parentUserId: data.parent_user_id,
            parentName: data.parent_name,
            parentEmail: data.parent_email,
            childName: data.child_name,
            childAvatar: data.child_avatar,
            contractId: data.contract_id,
            contractVersion: data.contract_version,
            contractAcceptedAt: data.contract_accepted_at,
            createdAt: data.created_at,
            isActive: data.is_active,
          }

          set({ kidsProfile: profile, isKidsMode: true, isLoading: false })
          logger.info('Kids mode enabled', { profileId: profile.id })
          return true
        } catch (error) {
          logger.error('Failed to enable kids mode', { error })
          set({ error: 'Falha ao ativar modo Kids', isLoading: false })
          return false
        }
      },

      // Disable Kids Mode
      disableKidsMode: async (parentUserId) => {
        const supabase = createClient()
        set({ isLoading: true, error: null })

        try {
          // End current session if active
          const { currentSession } = get()
          if (currentSession) {
            await get().endKidsSession()
          }

          // Deactivate profile
          const { error } = await supabase
            .from('agora_kids_profiles')
            .update({ is_active: false })
            .eq('parent_user_id', parentUserId)

          if (error) throw error

          set({
            isKidsMode: false,
            kidsProfile: null,
            currentSession: null,
            isLoading: false,
          })

          logger.info('Kids mode disabled', { parentUserId })
          return true
        } catch (error) {
          logger.error('Failed to disable kids mode', { error })
          set({ error: 'Falha ao desativar modo Kids', isLoading: false })
          return false
        }
      },

      // Load existing profile
      loadKidsProfile: async (parentUserId) => {
        const supabase = createClient()

        try {
          // Use maybeSingle() instead of single() to avoid 406 error when no profile exists
          const { data, error } = await supabase
            .from('agora_kids_profiles')
            .select('*')
            .eq('parent_user_id', parentUserId)
            .eq('is_active', true)
            .maybeSingle()

          if (error) {
            logger.error('Error loading kids profile', { error })
            set({ isKidsMode: false, kidsProfile: null })
            return null
          }

          if (!data) {
            // No profile exists - this is normal for new users
            set({ isKidsMode: false, kidsProfile: null })
            return null
          }

          const profile: KidsProfile = {
            id: data.id,
            parentUserId: data.parent_user_id,
            parentName: data.parent_name,
            parentEmail: data.parent_email,
            childName: data.child_name,
            childAvatar: data.child_avatar,
            contractId: data.contract_id,
            contractVersion: data.contract_version,
            contractAcceptedAt: data.contract_accepted_at,
            createdAt: data.created_at,
            isActive: data.is_active,
          }

          set({ kidsProfile: profile, isKidsMode: true })
          return profile
        } catch (error) {
          logger.error('Failed to load kids profile', { error })
          return null
        }
      },

      // Start a new session
      startKidsSession: async () => {
        const { kidsProfile, currentSession } = get()

        if (!kidsProfile) {
          logger.warn('Cannot start session without kids profile')
          return
        }

        // Don't start if already in session
        if (currentSession) {
          logger.debug('Session already active')
          return
        }

        const supabase = createClient()

        try {
          const { data, error } = await supabase
            .from('agora_kids_sessions')
            .insert({
              kids_profile_id: kidsProfile.id,
            })
            .select()
            .single()

          if (error) throw error

          const session: KidsSession = {
            id: data.id,
            kidsProfileId: data.kids_profile_id,
            startedAt: data.started_at,
            endedAt: null,
            durationMinutes: 0,
            videosWatched: [],
            agentsInteracted: [],
          }

          set({
            currentSession: session,
            sessionVideos: [],
            sessionAgents: [],
            sessionStartTime: Date.now(),
          })

          logger.info('Kids session started', { sessionId: session.id })
        } catch (error) {
          logger.error('Failed to start kids session', { error })
        }
      },

      // End current session
      endKidsSession: async () => {
        const { currentSession, sessionVideos, sessionAgents, sessionStartTime } = get()

        if (!currentSession) {
          logger.debug('No active session to end')
          return
        }

        const supabase = createClient()
        const durationMinutes = sessionStartTime
          ? Math.round((Date.now() - sessionStartTime) / 60000)
          : 0

        try {
          const { error } = await supabase
            .from('agora_kids_sessions')
            .update({
              ended_at: new Date().toISOString(),
              duration_minutes: durationMinutes,
              videos_watched: sessionVideos,
              agents_interacted: sessionAgents,
            })
            .eq('id', currentSession.id)

          if (error) throw error

          set({
            currentSession: null,
            sessionVideos: [],
            sessionAgents: [],
            sessionStartTime: null,
          })

          logger.info('Kids session ended', {
            sessionId: currentSession.id,
            duration: durationMinutes,
            videos: sessionVideos.length,
            agents: sessionAgents.length,
          })
        } catch (error) {
          logger.error('Failed to end kids session', { error })
        }
      },

      // Track video watched
      trackVideoWatched: (videoId) => {
        const { sessionVideos, currentSession } = get()

        if (!currentSession) {
          logger.debug('No active session for video tracking')
          return
        }

        if (!sessionVideos.includes(videoId)) {
          set({ sessionVideos: [...sessionVideos, videoId] })
          logger.debug('Video tracked', { videoId })
        }
      },

      // Track agent interaction
      trackAgentInteraction: (agentId) => {
        const { sessionAgents, currentSession } = get()

        if (!currentSession) {
          logger.debug('No active session for agent tracking')
          return
        }

        if (!sessionAgents.includes(agentId)) {
          set({ sessionAgents: [...sessionAgents, agentId] })
          logger.debug('Agent interaction tracked', { agentId })
        }
      },

      // Generate parental access code
      generateParentalCode: async (parentUserId) => {
        const supabase = createClient()

        try {
          const { data, error } = await supabase.rpc('create_parental_access_code', {
            p_parent_user_id: parentUserId,
          })

          if (error) throw error

          logger.info('Parental code generated', { parentUserId })
          return data as string
        } catch (error) {
          logger.error('Failed to generate parental code', { error })
          return null
        }
      },

      // Validate parental code
      validateParentalCode: async (code) => {
        const supabase = createClient()

        try {
          const { data, error } = await supabase.rpc('validate_parental_code', {
            p_code: code.toUpperCase(),
          })

          if (error) throw error

          if (!data || data.length === 0) {
            return { isValid: false }
          }

          const result = data[0]
          return {
            isValid: result.is_valid,
            parentUserId: result.parent_user_id,
            kidsProfileId: result.kids_profile_id,
            childName: result.child_name,
          }
        } catch (error) {
          logger.error('Failed to validate parental code', { error })
          return { isValid: false }
        }
      },

      // Get daily stats
      getDailyStats: async (kidsProfileId, date = new Date()) => {
        const supabase = createClient()
        const dateStr = date.toISOString().split('T')[0]

        try {
          const { data, error } = await supabase.rpc('get_kids_daily_stats', {
            p_kids_profile_id: kidsProfileId,
            p_date: dateStr,
          })

          if (error) throw error

          if (!data || data.length === 0) {
            return {
              totalMinutes: 0,
              totalSessions: 0,
              videosWatched: [],
              agentsUsed: [],
            }
          }

          const stats = data[0]
          return {
            totalMinutes: stats.total_minutes || 0,
            totalSessions: stats.total_sessions || 0,
            videosWatched: stats.videos_watched || [],
            agentsUsed: stats.agents_used || [],
          }
        } catch (error) {
          logger.error('Failed to get daily stats', { error })
          return null
        }
      },

      // Reset store
      reset: () => set(initialState),
    }),
    {
      name: 'agora-kids-store',
      partialize: (state) => ({
        // Only persist essential state
        isKidsMode: state.isKidsMode,
        kidsProfile: state.kidsProfile,
      }),
    }
  )
)

// Selector hooks for convenience
export const useIsKidsMode = () => useKidsStore((state) => state.isKidsMode)
export const useKidsProfile = () => useKidsStore((state) => state.kidsProfile)
export const useKidsSession = () => useKidsStore((state) => state.currentSession)
