/**
 * Kids Store Tests
 *
 * Tests for Kids mode state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  })),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

import { useKidsStore, type KidsProfile } from './kids-store'

describe('Kids Store', () => {
  beforeEach(() => {
    // Reset store state
    useKidsStore.setState({
      isKidsMode: false,
      kidsProfile: null,
      currentSession: null,
      isLoading: false,
      error: null,
      sessionVideos: [],
      sessionAgents: [],
      sessionStartTime: null,
      _isStartingSession: false,
      _isEndingSession: false,
      _isLoadingProfile: false,
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with kids mode disabled', () => {
      const state = useKidsStore.getState()
      expect(state.isKidsMode).toBe(false)
    })

    it('should start with no profile', () => {
      const state = useKidsStore.getState()
      expect(state.kidsProfile).toBeNull()
    })

    it('should start with no current session', () => {
      const state = useKidsStore.getState()
      expect(state.currentSession).toBeNull()
    })

    it('should start with empty session tracking', () => {
      const state = useKidsStore.getState()
      expect(state.sessionVideos).toEqual([])
      expect(state.sessionAgents).toEqual([])
    })

    it('should not be loading initially', () => {
      const state = useKidsStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const state = useKidsStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('setKidsMode', () => {
    it('should enable kids mode', () => {
      act(() => {
        useKidsStore.getState().setKidsMode(true)
      })
      expect(useKidsStore.getState().isKidsMode).toBe(true)
    })

    it('should disable kids mode', () => {
      useKidsStore.setState({ isKidsMode: true })

      act(() => {
        useKidsStore.getState().setKidsMode(false)
      })
      expect(useKidsStore.getState().isKidsMode).toBe(false)
    })
  })

  describe('setKidsProfile', () => {
    it('should set kids profile', () => {
      const mockProfile: KidsProfile = {
        id: 'profile-123',
        parentUserId: 'parent-456',
        parentName: 'João Silva',
        parentEmail: 'joao@example.com',
        childName: 'Maria',
        childAvatar: 'monica',
        contractId: 'contract-789',
        contractVersion: '1.0',
        contractAcceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      act(() => {
        useKidsStore.getState().setKidsProfile(mockProfile)
      })

      expect(useKidsStore.getState().kidsProfile).toEqual(mockProfile)
    })

    it('should clear kids profile', () => {
      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      act(() => {
        useKidsStore.getState().setKidsProfile(null)
      })

      expect(useKidsStore.getState().kidsProfile).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      act(() => {
        useKidsStore.getState().setLoading(true)
      })
      expect(useKidsStore.getState().isLoading).toBe(true)
    })

    it('should clear loading state', () => {
      useKidsStore.setState({ isLoading: true })

      act(() => {
        useKidsStore.getState().setLoading(false)
      })
      expect(useKidsStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      act(() => {
        useKidsStore.getState().setError('Something went wrong')
      })
      expect(useKidsStore.getState().error).toBe('Something went wrong')
    })

    it('should clear error', () => {
      useKidsStore.setState({ error: 'Previous error' })

      act(() => {
        useKidsStore.getState().setError(null)
      })
      expect(useKidsStore.getState().error).toBeNull()
    })
  })

  describe('trackVideoWatched', () => {
    it('should not track when no active session', () => {
      // Without currentSession, tracking should be a no-op
      act(() => {
        useKidsStore.getState().trackVideoWatched('video-123')
      })
      expect(useKidsStore.getState().sessionVideos).toEqual([])
    })

    it('should add video to session tracking when session is active', () => {
      // Set up active session
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      act(() => {
        useKidsStore.getState().trackVideoWatched('video-123')
      })
      expect(useKidsStore.getState().sessionVideos).toContain('video-123')
    })

    it('should not add duplicate videos', () => {
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      act(() => {
        useKidsStore.getState().trackVideoWatched('video-123')
        useKidsStore.getState().trackVideoWatched('video-123')
      })
      const videos = useKidsStore.getState().sessionVideos
      expect(videos.filter((v) => v === 'video-123').length).toBe(1)
    })
  })

  describe('trackAgentInteraction', () => {
    it('should not track when no active session', () => {
      act(() => {
        useKidsStore.getState().trackAgentInteraction('monteiro_lobato')
      })
      expect(useKidsStore.getState().sessionAgents).toEqual([])
    })

    it('should add agent to session tracking when session is active', () => {
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      act(() => {
        useKidsStore.getState().trackAgentInteraction('monteiro_lobato')
      })
      expect(useKidsStore.getState().sessionAgents).toContain('monteiro_lobato')
    })

    it('should not add duplicate agents', () => {
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      act(() => {
        useKidsStore.getState().trackAgentInteraction('monteiro_lobato')
        useKidsStore.getState().trackAgentInteraction('monteiro_lobato')
      })
      const agents = useKidsStore.getState().sessionAgents
      expect(agents.filter((a) => a === 'monteiro_lobato').length).toBe(1)
    })
  })

  describe('Session Duration (computed)', () => {
    it('should be null when no session started', () => {
      expect(useKidsStore.getState().sessionStartTime).toBeNull()
    })

    it('should track session start time when set', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      useKidsStore.setState({ sessionStartTime: fiveMinutesAgo })

      const state = useKidsStore.getState()
      expect(state.sessionStartTime).toBe(fiveMinutesAgo)
      // Duration can be computed as (Date.now() - sessionStartTime) / 60000
      const durationMinutes = Math.round((Date.now() - state.sessionStartTime!) / 60000)
      expect(durationMinutes).toBeGreaterThanOrEqual(5)
      expect(durationMinutes).toBeLessThanOrEqual(6)
    })
  })

  describe('Active Session (computed)', () => {
    it('should have no active session initially', () => {
      expect(useKidsStore.getState().currentSession).toBeNull()
    })

    it('should have active session when set', () => {
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      expect(useKidsStore.getState().currentSession).not.toBeNull()
    })
  })

  describe('Kids Mode Active (computed from state)', () => {
    it('should be inactive when kids mode is disabled', () => {
      const state = useKidsStore.getState()
      // isKidsModeActive is computed as: isKidsMode && kidsProfile !== null
      expect(state.isKidsMode && state.kidsProfile !== null).toBe(false)
    })

    it('should be inactive when no profile', () => {
      useKidsStore.setState({ isKidsMode: true, kidsProfile: null })
      const state = useKidsStore.getState()
      expect(state.isKidsMode && state.kidsProfile !== null).toBe(false)
    })

    it('should be active when kids mode is enabled with profile', () => {
      useKidsStore.setState({
        isKidsMode: true,
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      const state = useKidsStore.getState()
      expect(state.isKidsMode && state.kidsProfile !== null).toBe(true)
    })
  })

  describe('Operation Guards', () => {
    it('should have guard flags for async operations', () => {
      const state = useKidsStore.getState()
      expect(state._isStartingSession).toBe(false)
      expect(state._isEndingSession).toBe(false)
      expect(state._isLoadingProfile).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Set up some state
      useKidsStore.setState({
        isKidsMode: true,
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
        sessionVideos: ['video-1', 'video-2'],
        sessionAgents: ['agent-1'],
        error: 'Some error',
      })

      act(() => {
        useKidsStore.getState().reset()
      })

      const state = useKidsStore.getState()
      expect(state.isKidsMode).toBe(false)
      expect(state.kidsProfile).toBeNull()
      expect(state.currentSession).toBeNull()
      expect(state.sessionVideos).toEqual([])
      expect(state.sessionAgents).toEqual([])
      expect(state.error).toBeNull()
    })
  })

  describe('enableKidsMode', () => {
    it('should create new profile when none exists', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'new-profile-123',
              parent_user_id: 'parent-456',
              parent_name: 'João Silva',
              parent_email: 'joao@example.com',
              child_name: 'Maria',
              child_avatar: 'monica',
              contract_id: 'contract-789',
              contract_version: '1.0',
              contract_accepted_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              is_active: true,
            },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore
        .getState()
        .enableKidsMode(
          'parent-456',
          'João Silva',
          'joao@example.com',
          'Maria',
          'monica',
          'contract-789'
        )

      expect(result).toBe(true)
      expect(useKidsStore.getState().isKidsMode).toBe(true)
      expect(useKidsStore.getState().kidsProfile).not.toBeNull()
      expect(useKidsStore.getState().kidsProfile?.childName).toBe('Maria')
    })

    it('should reactivate existing profile', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const existingProfile = {
        id: 'existing-123',
        parent_user_id: 'parent-456',
        parent_name: 'João',
        parent_email: 'joao@example.com',
        child_name: 'Maria',
        child_avatar: 'cocorico',
        contract_id: 'old-contract',
        contract_version: '1.0',
        contract_accepted_at: null,
        created_at: new Date().toISOString(),
        is_active: false,
      }

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { ...existingProfile, is_active: true },
            error: null,
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: existingProfile, error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore
        .getState()
        .enableKidsMode('parent-456', 'João Updated', 'joao@example.com', 'Maria Updated')

      expect(result).toBe(true)
      expect(useKidsStore.getState().isKidsMode).toBe(true)
    })

    it('should handle errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore
        .getState()
        .enableKidsMode('parent-456', 'João', 'joao@example.com', 'Maria')

      expect(result).toBe(false)
      expect(useKidsStore.getState().error).toBe('Falha ao ativar modo Kids')
    })
  })

  describe('disableKidsMode', () => {
    it('should deactivate profile successfully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        isKidsMode: true,
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      const result = await useKidsStore.getState().disableKidsMode('parent-456')

      expect(result).toBe(true)
      expect(useKidsStore.getState().isKidsMode).toBe(false)
      expect(useKidsStore.getState().kidsProfile).toBeNull()
    })

    it('should end current session before disabling', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      const mockSupabase = {
        from: vi.fn(() => ({
          update: mockUpdate,
          eq: mockEq,
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        isKidsMode: true,
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-123',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      await useKidsStore.getState().disableKidsMode('parent-456')

      expect(useKidsStore.getState().currentSession).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: new Error('Database error') }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().disableKidsMode('parent-456')

      expect(result).toBe(false)
      expect(useKidsStore.getState().error).toBe('Falha ao desativar modo Kids')
    })
  })

  describe('loadKidsProfile', () => {
    it('should load existing profile', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const profileData = {
        id: 'profile-123',
        parent_user_id: 'parent-456',
        parent_name: 'João',
        parent_email: 'joao@example.com',
        child_name: 'Maria',
        child_avatar: 'monica',
        contract_id: null,
        contract_version: '1.0',
        contract_accepted_at: null,
        created_at: new Date().toISOString(),
        is_active: true,
      }

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: profileData, error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().loadKidsProfile('parent-456')

      expect(result).not.toBeNull()
      expect(result?.childName).toBe('Maria')
      expect(useKidsStore.getState().isKidsMode).toBe(true)
    })

    it('should return null when no profile exists', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().loadKidsProfile('parent-456')

      expect(result).toBeNull()
      expect(useKidsStore.getState().isKidsMode).toBe(false)
    })

    it('should skip when already loading', async () => {
      useKidsStore.setState({ _isLoadingProfile: true })

      const result = await useKidsStore.getState().loadKidsProfile('parent-456')

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().loadKidsProfile('parent-456')

      expect(result).toBeNull()
      expect(useKidsStore.getState().isKidsMode).toBe(false)
    })
  })

  describe('updateChildAvatar', () => {
    it('should update avatar successfully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      const result = await useKidsStore.getState().updateChildAvatar('cocorico')

      expect(result).toBe(true)
      expect(useKidsStore.getState().kidsProfile?.childAvatar).toBe('cocorico')
    })

    it('should return false when no profile', async () => {
      const result = await useKidsStore.getState().updateChildAvatar('cocorico')
      expect(result).toBe(false)
    })

    it('should handle errors', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: new Error('Database error') }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-123',
          parentUserId: 'parent-456',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      const result = await useKidsStore.getState().updateChildAvatar('cocorico')

      expect(result).toBe(false)
    })
  })

  describe('startKidsSession', () => {
    it('should start session when profile exists', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'session-123',
              kids_profile_id: 'profile-456',
              started_at: new Date().toISOString(),
            },
            error: null,
          }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-456',
          parentUserId: 'parent-789',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      })

      await useKidsStore.getState().startKidsSession()

      expect(useKidsStore.getState().currentSession).not.toBeNull()
      expect(useKidsStore.getState().sessionStartTime).not.toBeNull()
    })

    it('should not start when no profile', async () => {
      await useKidsStore.getState().startKidsSession()
      expect(useKidsStore.getState().currentSession).toBeNull()
    })

    it('should not start when session already active', async () => {
      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-456',
          parentUserId: 'parent-789',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        currentSession: {
          id: 'existing-session',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
      })

      await useKidsStore.getState().startKidsSession()

      // Should still have the existing session
      expect(useKidsStore.getState().currentSession?.id).toBe('existing-session')
    })

    it('should skip when already starting', async () => {
      useKidsStore.setState({
        kidsProfile: {
          id: 'profile-456',
          parentUserId: 'parent-789',
          parentName: 'João',
          parentEmail: 'joao@example.com',
          childName: 'Maria',
          childAvatar: 'monica',
          contractId: null,
          contractVersion: '1.0',
          contractAcceptedAt: null,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        _isStartingSession: true,
      })

      await useKidsStore.getState().startKidsSession()

      expect(useKidsStore.getState().currentSession).toBeNull()
    })
  })

  describe('endKidsSession', () => {
    it('should end active session', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
        sessionVideos: ['video-1'],
        sessionAgents: ['agent-1'],
        sessionStartTime: Date.now() - 300000, // 5 minutes ago
      })

      await useKidsStore.getState().endKidsSession()

      expect(useKidsStore.getState().currentSession).toBeNull()
      expect(useKidsStore.getState().sessionVideos).toEqual([])
      expect(useKidsStore.getState().sessionAgents).toEqual([])
    })

    it('should do nothing when no active session', async () => {
      await useKidsStore.getState().endKidsSession()
      expect(useKidsStore.getState().currentSession).toBeNull()
    })

    it('should skip when already ending', async () => {
      useKidsStore.setState({
        currentSession: {
          id: 'session-123',
          kidsProfileId: 'profile-456',
          startedAt: new Date().toISOString(),
          endedAt: null,
          durationMinutes: 0,
          videosWatched: [],
          agentsInteracted: [],
        },
        _isEndingSession: true,
      })

      await useKidsStore.getState().endKidsSession()

      // Session should still be there since we skipped
      expect(useKidsStore.getState().currentSession).not.toBeNull()
    })
  })

  describe('generateParentalCode', () => {
    it('should generate code successfully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: 'ABC123', error: null }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().generateParentalCode('parent-456')

      expect(result).toBe('ABC123')
    })

    it('should return null on error', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('RPC error') }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().generateParentalCode('parent-456')

      expect(result).toBeNull()
    })
  })

  describe('validateParentalCode', () => {
    it('should validate correct code', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [
            {
              is_valid: true,
              parent_user_id: 'parent-456',
              kids_profile_id: 'profile-123',
              child_name: 'Maria',
            },
          ],
          error: null,
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().validateParentalCode('ABC123')

      expect(result.isValid).toBe(true)
      expect(result.childName).toBe('Maria')
    })

    it('should return invalid for wrong code', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().validateParentalCode('WRONG')

      expect(result.isValid).toBe(false)
    })

    it('should handle errors', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('RPC error') }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().validateParentalCode('ABC123')

      expect(result.isValid).toBe(false)
    })
  })

  describe('getDailyStats', () => {
    it('should return stats successfully', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({
          data: [
            {
              total_minutes: 45,
              total_sessions: 3,
              videos_watched: ['video-1', 'video-2'],
              agents_used: ['agent-1'],
            },
          ],
          error: null,
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().getDailyStats('profile-123')

      expect(result?.totalMinutes).toBe(45)
      expect(result?.totalSessions).toBe(3)
      expect(result?.videosWatched).toHaveLength(2)
    })

    it('should return default stats when no data', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().getDailyStats('profile-123')

      expect(result?.totalMinutes).toBe(0)
      expect(result?.totalSessions).toBe(0)
    })

    it('should return null on error', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockSupabase = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('RPC error') }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const result = await useKidsStore.getState().getDailyStats('profile-123')

      expect(result).toBeNull()
    })

    it('should use custom date when provided', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const mockRpc = vi.fn().mockResolvedValue({
        data: [{ total_minutes: 30, total_sessions: 2, videos_watched: [], agents_used: [] }],
        error: null,
      })
      const mockSupabase = { rpc: mockRpc }
      vi.mocked(createClient).mockReturnValue(mockSupabase as never)

      const customDate = new Date('2025-01-15')
      await useKidsStore.getState().getDailyStats('profile-123', customDate)

      expect(mockRpc).toHaveBeenCalledWith('get_kids_daily_stats', {
        p_kids_profile_id: 'profile-123',
        p_date: '2025-01-15',
      })
    })
  })

  describe('Selector Hooks exports', () => {
    it('should export useIsKidsMode hook', async () => {
      const { useIsKidsMode } = await import('./kids-store')
      expect(typeof useIsKidsMode).toBe('function')
    })

    it('should export useKidsProfile hook', async () => {
      const { useKidsProfile } = await import('./kids-store')
      expect(typeof useKidsProfile).toBe('function')
    })

    it('should export useKidsSession hook', async () => {
      const { useKidsSession } = await import('./kids-store')
      expect(typeof useKidsSession).toBe('function')
    })
  })
})
