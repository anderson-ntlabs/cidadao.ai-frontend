/**
 * Agora Reducer Tests
 *
 * Tests for the centralized Agora state management reducer.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  agoraReducer,
  initialAgoraState,
  agoraActions,
  agoraSelectors,
  type AgoraState,
} from '../agora-reducer'
import type { AgoraUser, StudySession, XpTransaction, AgoraBadge, DiaryEntry } from '@/types/agora'

// Test fixtures
const mockUser: AgoraUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  totalXp: 500,
  currentLevel: 5,
  currentRank: 'estudante',
  currentStreak: 7,
  longestStreak: 10,
  totalSessions: 15,
  totalTimeMinutes: 300,
  hasCompletedOnboarding: true,
  onboardingStep: 5,
  hasAcceptedLgpd: true,
  hasAcceptedTerms: true,
  isSuperuser: false,
  tracks: ['frontend', 'backend'],
  enrolledAt: '2025-01-01T00:00:00Z',
  createdAt: '2025-01-01T00:00:00Z',
  badges: ['pioneiro'],
}

const mockSession: StudySession = {
  id: 'session-123',
  userId: 'user-123',
  startTime: '2025-01-01T10:00:00Z',
  endTime: '2025-01-01T11:00:00Z',
  durationMinutes: 60,
  xpEarned: 100,
  track: 'frontend',
  status: 'completed',
}

const mockXpTransaction: XpTransaction = {
  id: 'tx-123',
  userId: 'user-123',
  amount: 50,
  reason: 'Completed lesson',
  source: 'lesson',
  balanceAfter: 550,
  createdAt: '2025-01-01T12:00:00Z',
}

const mockBadge: AgoraBadge = {
  id: 'badge-123',
  badgeId: 'pioneer',
  userId: 'user-123',
  earnedAt: '2025-01-01T00:00:00Z',
  name: 'Pioneer',
  description: 'First badge',
  icon: 'star',
  tier: 'bronze',
}

const mockDiaryEntry: DiaryEntry = {
  id: 'diary-123',
  userId: 'user-123',
  content: 'Learned about React hooks today',
  mood: 'happy',
  createdAt: '2025-01-01T12:00:00Z',
}

describe('agoraReducer', () => {
  let state: AgoraState

  beforeEach(() => {
    state = { ...initialAgoraState }
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(initialAgoraState.user).toBeNull()
      expect(initialAgoraState.isAuthenticated).toBe(false)
      expect(initialAgoraState.isLoading).toBe(true)
      expect(initialAgoraState.authError).toBeNull()
      expect(initialAgoraState.sessions).toEqual([])
      expect(initialAgoraState.badges).toEqual([])
      expect(initialAgoraState.xpTransactions).toEqual([])
      expect(initialAgoraState.diaryEntries).toEqual([])
      expect(initialAgoraState.selectedTracks).toEqual([])
    })
  })

  describe('Auth actions', () => {
    it('should handle SET_LOADING', () => {
      const newState = agoraReducer(state, { type: 'SET_LOADING', payload: false })
      expect(newState.isLoading).toBe(false)
    })

    it('should handle SET_AUTH_ERROR', () => {
      const error = 'Authentication failed'
      const newState = agoraReducer(state, { type: 'SET_AUTH_ERROR', payload: error })
      expect(newState.authError).toBe(error)
    })

    it('should handle SET_AUTH_ERROR with null', () => {
      state.authError = 'Some error'
      const newState = agoraReducer(state, { type: 'SET_AUTH_ERROR', payload: null })
      expect(newState.authError).toBeNull()
    })

    it('should handle SET_USER with user', () => {
      const newState = agoraReducer(state, { type: 'SET_USER', payload: mockUser })

      expect(newState.user).toEqual(mockUser)
      expect(newState.isAuthenticated).toBe(true)
      expect(newState.isLoading).toBe(false)
      expect(newState.authError).toBeNull()
      expect(newState.selectedTracks).toEqual(mockUser.tracks)
    })

    it('should handle SET_USER with null (logout)', () => {
      state.user = mockUser
      state.isAuthenticated = true

      const newState = agoraReducer(state, { type: 'SET_USER', payload: null })

      expect(newState.user).toBeNull()
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.selectedTracks).toEqual([])
    })

    it('should handle UPDATE_USER', () => {
      state.user = mockUser
      const updates = { totalXp: 600, currentLevel: 6 }

      const newState = agoraReducer(state, { type: 'UPDATE_USER', payload: updates })

      expect(newState.user?.totalXp).toBe(600)
      expect(newState.user?.currentLevel).toBe(6)
      expect(newState.user?.name).toBe(mockUser.name) // Unchanged
    })

    it('should handle UPDATE_USER with tracks', () => {
      state.user = mockUser
      const newTracks = ['frontend', 'backend', 'devops']

      const newState = agoraReducer(state, {
        type: 'UPDATE_USER',
        payload: { tracks: newTracks as AgoraUser['tracks'] },
      })

      expect(newState.user?.tracks).toEqual(newTracks)
      expect(newState.selectedTracks).toEqual(newTracks)
    })

    it('should not update user if null', () => {
      const newState = agoraReducer(state, { type: 'UPDATE_USER', payload: { totalXp: 100 } })
      expect(newState.user).toBeNull()
    })

    it('should handle LOGOUT', () => {
      state.user = mockUser
      state.isAuthenticated = true
      state.sessions = [mockSession]
      state.badges = [mockBadge]

      const newState = agoraReducer(state, { type: 'LOGOUT' })

      expect(newState.user).toBeNull()
      expect(newState.isAuthenticated).toBe(false)
      expect(newState.isLoading).toBe(false)
      expect(newState.sessions).toEqual([])
      expect(newState.badges).toEqual([])
    })
  })

  describe('Data loading actions', () => {
    it('should handle LOAD_USER_DATA', () => {
      const payload = {
        user: mockUser,
        sessions: [mockSession],
        xpTransactions: [mockXpTransaction],
        diaryEntries: [mockDiaryEntry],
        badges: [mockBadge],
        hasDailyBonus: true,
      }

      const newState = agoraReducer(state, { type: 'LOAD_USER_DATA', payload })

      expect(newState.user).toEqual(mockUser)
      expect(newState.isAuthenticated).toBe(true)
      expect(newState.isLoading).toBe(false)
      expect(newState.sessions).toEqual([mockSession])
      expect(newState.xpTransactions).toEqual([mockXpTransaction])
      expect(newState.diaryEntries).toEqual([mockDiaryEntry])
      expect(newState.badges).toEqual([mockBadge])
      expect(newState.hasDailyBonus).toBe(true)
      expect(newState.selectedTracks).toEqual(mockUser.tracks)
      expect(newState.lastLoadedUserId).toBe(mockUser.id)
      expect(newState.cacheTimestamp).toBeGreaterThan(0)
    })

    it('should handle SET_CACHE_METADATA', () => {
      const timestamp = Date.now()
      const newState = agoraReducer(state, {
        type: 'SET_CACHE_METADATA',
        payload: { userId: 'user-123', timestamp },
      })

      expect(newState.lastLoadedUserId).toBe('user-123')
      expect(newState.cacheTimestamp).toBe(timestamp)
    })
  })

  describe('Session actions', () => {
    it('should handle START_SESSION', () => {
      const newState = agoraReducer(state, { type: 'START_SESSION', payload: mockSession })
      expect(newState.currentSession).toEqual(mockSession)
    })

    it('should handle END_SESSION', () => {
      state.user = mockUser
      state.currentSession = mockSession

      const endedSession = { ...mockSession, status: 'completed' as const }
      const newState = agoraReducer(state, { type: 'END_SESSION', payload: endedSession })

      expect(newState.currentSession).toBeNull()
      expect(newState.sessions[0]).toEqual(endedSession)
      expect(newState.user?.totalSessions).toBe(mockUser.totalSessions + 1)
      expect(newState.user?.totalTimeMinutes).toBe(
        mockUser.totalTimeMinutes + endedSession.durationMinutes
      )
    })

    it('should handle END_SESSION without user', () => {
      const newState = agoraReducer(state, { type: 'END_SESSION', payload: mockSession })

      expect(newState.currentSession).toBeNull()
      expect(newState.sessions[0]).toEqual(mockSession)
      expect(newState.user).toBeNull()
    })

    it('should handle ADD_SESSION', () => {
      const newState = agoraReducer(state, { type: 'ADD_SESSION', payload: mockSession })
      expect(newState.sessions[0]).toEqual(mockSession)
    })
  })

  describe('XP actions', () => {
    it('should handle ADD_XP_TRANSACTION', () => {
      state.user = mockUser

      const newState = agoraReducer(state, {
        type: 'ADD_XP_TRANSACTION',
        payload: mockXpTransaction,
      })

      expect(newState.xpTransactions[0]).toEqual(mockXpTransaction)
      expect(newState.user?.totalXp).toBe(mockXpTransaction.balanceAfter)
    })

    it('should handle ADD_XP_TRANSACTION without user', () => {
      const newState = agoraReducer(state, {
        type: 'ADD_XP_TRANSACTION',
        payload: mockXpTransaction,
      })

      expect(newState.xpTransactions[0]).toEqual(mockXpTransaction)
      expect(newState.user).toBeNull()
    })

    it('should handle SET_XP_TRANSACTIONS', () => {
      const transactions = [mockXpTransaction]
      const newState = agoraReducer(state, { type: 'SET_XP_TRANSACTIONS', payload: transactions })
      expect(newState.xpTransactions).toEqual(transactions)
    })
  })

  describe('Badge actions', () => {
    it('should handle ADD_BADGE', () => {
      const newState = agoraReducer(state, { type: 'ADD_BADGE', payload: mockBadge })
      expect(newState.badges).toContain(mockBadge)
    })

    it('should handle ADD_BADGES', () => {
      const badges = [mockBadge, { ...mockBadge, id: 'badge-456' }]
      const newState = agoraReducer(state, { type: 'ADD_BADGES', payload: badges })
      expect(newState.badges).toHaveLength(2)
    })

    it('should handle SET_BADGES', () => {
      state.badges = [mockBadge]
      const newBadges = [{ ...mockBadge, id: 'badge-789' }]

      const newState = agoraReducer(state, { type: 'SET_BADGES', payload: newBadges })
      expect(newState.badges).toEqual(newBadges)
    })
  })

  describe('Diary actions', () => {
    it('should handle ADD_DIARY_ENTRY', () => {
      const newState = agoraReducer(state, { type: 'ADD_DIARY_ENTRY', payload: mockDiaryEntry })
      expect(newState.diaryEntries[0]).toEqual(mockDiaryEntry)
    })

    it('should handle SET_DIARY_ENTRIES', () => {
      const entries = [mockDiaryEntry]
      const newState = agoraReducer(state, { type: 'SET_DIARY_ENTRIES', payload: entries })
      expect(newState.diaryEntries).toEqual(entries)
    })
  })

  describe('Challenge actions', () => {
    const mockDailyChallenge = {
      id: 'daily-1',
      title: 'Complete a lesson',
      description: 'Complete any lesson',
      xpReward: 50,
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
    }

    const mockWeeklyChallenge = {
      id: 'weekly-1',
      title: 'Study 5 hours',
      description: 'Study for 5 hours this week',
      xpReward: 200,
      progress: 0,
      target: 300,
      completed: false,
      claimed: false,
    }

    it('should handle SET_DAILY_CHALLENGES', () => {
      const challenges = [mockDailyChallenge]
      const newState = agoraReducer(state, { type: 'SET_DAILY_CHALLENGES', payload: challenges })
      expect(newState.dailyChallenges).toEqual(challenges)
    })

    it('should handle SET_WEEKLY_CHALLENGES', () => {
      const challenges = [mockWeeklyChallenge]
      const newState = agoraReducer(state, { type: 'SET_WEEKLY_CHALLENGES', payload: challenges })
      expect(newState.weeklyChallenges).toEqual(challenges)
    })

    it('should handle CLAIM_CHALLENGE for daily', () => {
      state.dailyChallenges = [mockDailyChallenge]

      const newState = agoraReducer(state, {
        type: 'CLAIM_CHALLENGE',
        payload: { challengeId: 'daily-1', isWeekly: false },
      })

      expect(newState.dailyChallenges[0].claimed).toBe(true)
    })

    it('should handle CLAIM_CHALLENGE for weekly', () => {
      state.weeklyChallenges = [mockWeeklyChallenge]

      const newState = agoraReducer(state, {
        type: 'CLAIM_CHALLENGE',
        payload: { challengeId: 'weekly-1', isWeekly: true },
      })

      expect(newState.weeklyChallenges[0].claimed).toBe(true)
    })

    it('should handle SET_HAS_DAILY_BONUS', () => {
      const newState = agoraReducer(state, { type: 'SET_HAS_DAILY_BONUS', payload: true })
      expect(newState.hasDailyBonus).toBe(true)
    })
  })

  describe('Onboarding actions', () => {
    it('should handle SET_SELECTED_TRACKS', () => {
      const tracks = ['frontend', 'backend'] as AgoraUser['tracks']
      const newState = agoraReducer(state, { type: 'SET_SELECTED_TRACKS', payload: tracks })
      expect(newState.selectedTracks).toEqual(tracks)
    })

    it('should handle TOGGLE_TRACK - add', () => {
      state.selectedTracks = ['frontend']

      const newState = agoraReducer(state, { type: 'TOGGLE_TRACK', payload: 'backend' })
      expect(newState.selectedTracks).toContain('backend')
      expect(newState.selectedTracks).toContain('frontend')
    })

    it('should handle TOGGLE_TRACK - remove', () => {
      state.selectedTracks = ['frontend', 'backend']

      const newState = agoraReducer(state, { type: 'TOGGLE_TRACK', payload: 'backend' })
      expect(newState.selectedTracks).not.toContain('backend')
      expect(newState.selectedTracks).toContain('frontend')
    })
  })

  describe('default case', () => {
    it('should return state for unknown action', () => {
      // @ts-expect-error Testing unknown action
      const newState = agoraReducer(state, { type: 'UNKNOWN_ACTION' })
      expect(newState).toEqual(state)
    })
  })
})

describe('agoraActions', () => {
  it('should create setLoading action', () => {
    const action = agoraActions.setLoading(false)
    expect(action).toEqual({ type: 'SET_LOADING', payload: false })
  })

  it('should create setAuthError action', () => {
    const action = agoraActions.setAuthError('Error')
    expect(action).toEqual({ type: 'SET_AUTH_ERROR', payload: 'Error' })
  })

  it('should create setUser action', () => {
    const action = agoraActions.setUser(mockUser)
    expect(action).toEqual({ type: 'SET_USER', payload: mockUser })
  })

  it('should create updateUser action', () => {
    const updates = { totalXp: 100 }
    const action = agoraActions.updateUser(updates)
    expect(action).toEqual({ type: 'UPDATE_USER', payload: updates })
  })

  it('should create logout action', () => {
    const action = agoraActions.logout()
    expect(action).toEqual({ type: 'LOGOUT' })
  })

  it('should create loadUserData action', () => {
    const data = {
      user: mockUser,
      sessions: [],
      xpTransactions: [],
      diaryEntries: [],
      badges: [],
      hasDailyBonus: false,
    }
    const action = agoraActions.loadUserData(data)
    expect(action).toEqual({ type: 'LOAD_USER_DATA', payload: data })
  })

  it('should create startSession action', () => {
    const action = agoraActions.startSession(mockSession)
    expect(action).toEqual({ type: 'START_SESSION', payload: mockSession })
  })

  it('should create endSession action', () => {
    const action = agoraActions.endSession(mockSession)
    expect(action).toEqual({ type: 'END_SESSION', payload: mockSession })
  })

  it('should create addXpTransaction action', () => {
    const action = agoraActions.addXpTransaction(mockXpTransaction)
    expect(action).toEqual({ type: 'ADD_XP_TRANSACTION', payload: mockXpTransaction })
  })

  it('should create addBadge action', () => {
    const action = agoraActions.addBadge(mockBadge)
    expect(action).toEqual({ type: 'ADD_BADGE', payload: mockBadge })
  })

  it('should create addBadges action', () => {
    const badges = [mockBadge]
    const action = agoraActions.addBadges(badges)
    expect(action).toEqual({ type: 'ADD_BADGES', payload: badges })
  })

  it('should create addDiaryEntry action', () => {
    const action = agoraActions.addDiaryEntry(mockDiaryEntry)
    expect(action).toEqual({ type: 'ADD_DIARY_ENTRY', payload: mockDiaryEntry })
  })

  it('should create setDailyChallenges action', () => {
    const challenges: any[] = []
    const action = agoraActions.setDailyChallenges(challenges)
    expect(action).toEqual({ type: 'SET_DAILY_CHALLENGES', payload: challenges })
  })

  it('should create setWeeklyChallenges action', () => {
    const challenges: any[] = []
    const action = agoraActions.setWeeklyChallenges(challenges)
    expect(action).toEqual({ type: 'SET_WEEKLY_CHALLENGES', payload: challenges })
  })

  it('should create claimChallenge action', () => {
    const action = agoraActions.claimChallenge('challenge-1', true)
    expect(action).toEqual({
      type: 'CLAIM_CHALLENGE',
      payload: { challengeId: 'challenge-1', isWeekly: true },
    })
  })

  it('should create setHasDailyBonus action', () => {
    const action = agoraActions.setHasDailyBonus(true)
    expect(action).toEqual({ type: 'SET_HAS_DAILY_BONUS', payload: true })
  })

  it('should create setSelectedTracks action', () => {
    const tracks = ['frontend'] as AgoraUser['tracks']
    const action = agoraActions.setSelectedTracks(tracks)
    expect(action).toEqual({ type: 'SET_SELECTED_TRACKS', payload: tracks })
  })

  it('should create toggleTrack action', () => {
    const action = agoraActions.toggleTrack('frontend')
    expect(action).toEqual({ type: 'TOGGLE_TRACK', payload: 'frontend' })
  })
})

describe('agoraSelectors', () => {
  describe('isSuperuser', () => {
    it('should return true for superuser', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, isSuperuser: true } }
      expect(agoraSelectors.isSuperuser(state)).toBe(true)
    })

    it('should return false for non-superuser', () => {
      const state = { ...initialAgoraState, user: mockUser }
      expect(agoraSelectors.isSuperuser(state)).toBe(false)
    })

    it('should return false when no user', () => {
      expect(agoraSelectors.isSuperuser(initialAgoraState)).toBe(false)
    })
  })

  describe('streakMultiplier', () => {
    it('should return 2.0 for 30+ day streak', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, currentStreak: 30 } }
      expect(agoraSelectors.streakMultiplier(state)).toBe(2.0)
    })

    it('should return 1.5 for 14+ day streak', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, currentStreak: 14 } }
      expect(agoraSelectors.streakMultiplier(state)).toBe(1.5)
    })

    it('should return 1.25 for 7+ day streak', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, currentStreak: 7 } }
      expect(agoraSelectors.streakMultiplier(state)).toBe(1.25)
    })

    it('should return 1.1 for 3+ day streak', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, currentStreak: 3 } }
      expect(agoraSelectors.streakMultiplier(state)).toBe(1.1)
    })

    it('should return 1.0 for < 3 day streak', () => {
      const state = { ...initialAgoraState, user: { ...mockUser, currentStreak: 2 } }
      expect(agoraSelectors.streakMultiplier(state)).toBe(1.0)
    })

    it('should return 1.0 when no user', () => {
      expect(agoraSelectors.streakMultiplier(initialAgoraState)).toBe(1.0)
    })
  })

  describe('onboardingData', () => {
    it('should return onboarding data for user', () => {
      const state = {
        ...initialAgoraState,
        user: mockUser,
        selectedTracks: mockUser.tracks,
      }

      const data = agoraSelectors.onboardingData(state)

      expect(data).not.toBeNull()
      expect(data?.currentStep).toBe(mockUser.onboardingStep)
      expect(data?.selectedTracks).toEqual(mockUser.tracks)
      expect(data?.githubUsername).toBe(mockUser.githubUsername)
    })

    it('should return null when no user', () => {
      expect(agoraSelectors.onboardingData(initialAgoraState)).toBeNull()
    })
  })

  describe('needsConsent', () => {
    it('should return false when all consents accepted', () => {
      const state = { ...initialAgoraState, user: mockUser }
      expect(agoraSelectors.needsConsent(state)).toBe(false)
    })

    it('should return true when LGPD not accepted', () => {
      const state = {
        ...initialAgoraState,
        user: { ...mockUser, hasAcceptedLgpd: false },
      }
      expect(agoraSelectors.needsConsent(state)).toBe(true)
    })

    it('should return true when terms not accepted', () => {
      const state = {
        ...initialAgoraState,
        user: { ...mockUser, hasAcceptedTerms: false },
      }
      expect(agoraSelectors.needsConsent(state)).toBe(true)
    })

    it('should return false when no user', () => {
      expect(agoraSelectors.needsConsent(initialAgoraState)).toBe(false)
    })
  })

  describe('isCacheValid', () => {
    it('should return true for valid cache', () => {
      const state = {
        ...initialAgoraState,
        user: mockUser,
        lastLoadedUserId: 'user-123',
        cacheTimestamp: Date.now(),
      }
      expect(agoraSelectors.isCacheValid(state, 'user-123')).toBe(true)
    })

    it('should return false for different user', () => {
      const state = {
        ...initialAgoraState,
        user: mockUser,
        lastLoadedUserId: 'user-123',
        cacheTimestamp: Date.now(),
      }
      expect(agoraSelectors.isCacheValid(state, 'user-456')).toBe(false)
    })

    it('should return false for expired cache', () => {
      const state = {
        ...initialAgoraState,
        user: mockUser,
        lastLoadedUserId: 'user-123',
        cacheTimestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      }
      expect(agoraSelectors.isCacheValid(state, 'user-123', 5 * 60 * 1000)).toBe(false)
    })

    it('should return false when no user', () => {
      const state = {
        ...initialAgoraState,
        lastLoadedUserId: 'user-123',
        cacheTimestamp: Date.now(),
      }
      expect(agoraSelectors.isCacheValid(state, 'user-123')).toBe(false)
    })
  })
})
