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
})
