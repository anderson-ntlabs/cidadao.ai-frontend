/**
 * Agora Reducer
 *
 * Central state management for the Agora platform.
 * Uses reducer pattern for predictable state updates.
 *
 * Part of Sprint 3 refactoring - eliminates duplicate state
 * management between AgoraAuthProvider and AgoraProvider.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12
 */

import type {
  AgoraUser,
  AgoraTrack,
  StudySession,
  XpTransaction,
  DiaryEntry,
  AgoraBadge,
  DailyChallenge,
  WeeklyChallenge,
  OnboardingData,
} from '@/types/agora'

// ============================================
// State Types
// ============================================

export interface AgoraState {
  // Auth state
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null

  // Session state
  currentSession: StudySession | null
  sessions: StudySession[]

  // Gamification state
  xpTransactions: XpTransaction[]
  badges: AgoraBadge[]
  dailyChallenges: DailyChallenge[]
  weeklyChallenges: WeeklyChallenge[]
  hasDailyBonus: boolean

  // Content state
  diaryEntries: DiaryEntry[]

  // Onboarding state (derived from user, but kept for UI)
  selectedTracks: AgoraTrack[]

  // Cache metadata
  lastLoadedUserId: string | null
  cacheTimestamp: number
}

// ============================================
// Initial State
// ============================================

export const initialAgoraState: AgoraState = {
  // Auth state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  // Session state
  currentSession: null,
  sessions: [],

  // Gamification state
  xpTransactions: [],
  badges: [],
  dailyChallenges: [],
  weeklyChallenges: [],
  hasDailyBonus: false,

  // Content state
  diaryEntries: [],

  // Onboarding state
  selectedTracks: [],

  // Cache metadata
  lastLoadedUserId: null,
  cacheTimestamp: 0,
}

// ============================================
// Action Types
// ============================================

export type AgoraAction =
  // Auth actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: AgoraUser | null }
  | { type: 'UPDATE_USER'; payload: Partial<AgoraUser> }
  | { type: 'LOGOUT' }

  // Data loading actions
  | {
      type: 'LOAD_USER_DATA'
      payload: {
        user: AgoraUser
        sessions: StudySession[]
        xpTransactions: XpTransaction[]
        diaryEntries: DiaryEntry[]
        badges: AgoraBadge[]
        hasDailyBonus: boolean
      }
    }
  | { type: 'SET_CACHE_METADATA'; payload: { userId: string; timestamp: number } }

  // Session actions
  | { type: 'START_SESSION'; payload: StudySession }
  | { type: 'END_SESSION'; payload: StudySession }
  | { type: 'ADD_SESSION'; payload: StudySession }

  // XP actions
  | { type: 'ADD_XP_TRANSACTION'; payload: XpTransaction }
  | { type: 'SET_XP_TRANSACTIONS'; payload: XpTransaction[] }

  // Badge actions
  | { type: 'ADD_BADGE'; payload: AgoraBadge }
  | { type: 'ADD_BADGES'; payload: AgoraBadge[] }
  | { type: 'SET_BADGES'; payload: AgoraBadge[] }

  // Diary actions
  | { type: 'ADD_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'SET_DIARY_ENTRIES'; payload: DiaryEntry[] }

  // Challenge actions
  | { type: 'SET_DAILY_CHALLENGES'; payload: DailyChallenge[] }
  | { type: 'SET_WEEKLY_CHALLENGES'; payload: WeeklyChallenge[] }
  | { type: 'CLAIM_CHALLENGE'; payload: { challengeId: string; isWeekly: boolean } }
  | { type: 'SET_HAS_DAILY_BONUS'; payload: boolean }

  // Onboarding actions
  | { type: 'SET_SELECTED_TRACKS'; payload: AgoraTrack[] }
  | { type: 'TOGGLE_TRACK'; payload: AgoraTrack }

// ============================================
// Reducer
// ============================================

export function agoraReducer(state: AgoraState, action: AgoraAction): AgoraState {
  switch (action.type) {
    // -------------------------
    // Auth actions
    // -------------------------
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
        authError: null,
        // Sync selectedTracks with user tracks
        selectedTracks: action.payload?.tracks || [],
      }

    case 'UPDATE_USER':
      if (!state.user) return state
      const updatedUser = { ...state.user, ...action.payload }
      return {
        ...state,
        user: updatedUser,
        // Sync selectedTracks if tracks were updated
        selectedTracks: action.payload.tracks ?? state.selectedTracks,
      }

    case 'LOGOUT':
      return {
        ...initialAgoraState,
        isLoading: false,
      }

    // -------------------------
    // Data loading actions
    // -------------------------
    case 'LOAD_USER_DATA':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
        sessions: action.payload.sessions,
        xpTransactions: action.payload.xpTransactions,
        diaryEntries: action.payload.diaryEntries,
        badges: action.payload.badges,
        hasDailyBonus: action.payload.hasDailyBonus,
        selectedTracks: action.payload.user.tracks,
        lastLoadedUserId: action.payload.user.id,
        cacheTimestamp: Date.now(),
      }

    case 'SET_CACHE_METADATA':
      return {
        ...state,
        lastLoadedUserId: action.payload.userId,
        cacheTimestamp: action.payload.timestamp,
      }

    // -------------------------
    // Session actions
    // -------------------------
    case 'START_SESSION':
      return {
        ...state,
        currentSession: action.payload,
      }

    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
        sessions: [action.payload, ...state.sessions],
        // Update user stats
        user: state.user
          ? {
              ...state.user,
              totalSessions: state.user.totalSessions + 1,
              totalTimeMinutes: state.user.totalTimeMinutes + action.payload.durationMinutes,
            }
          : null,
      }

    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
      }

    // -------------------------
    // XP actions
    // -------------------------
    case 'ADD_XP_TRANSACTION':
      return {
        ...state,
        xpTransactions: [action.payload, ...state.xpTransactions],
        // Update user XP
        user: state.user
          ? {
              ...state.user,
              totalXp: action.payload.balanceAfter,
            }
          : null,
      }

    case 'SET_XP_TRANSACTIONS':
      return {
        ...state,
        xpTransactions: action.payload,
      }

    // -------------------------
    // Badge actions
    // -------------------------
    case 'ADD_BADGE':
      return {
        ...state,
        badges: [...state.badges, action.payload],
      }

    case 'ADD_BADGES':
      return {
        ...state,
        badges: [...state.badges, ...action.payload],
      }

    case 'SET_BADGES':
      return {
        ...state,
        badges: action.payload,
      }

    // -------------------------
    // Diary actions
    // -------------------------
    case 'ADD_DIARY_ENTRY':
      return {
        ...state,
        diaryEntries: [action.payload, ...state.diaryEntries],
      }

    case 'SET_DIARY_ENTRIES':
      return {
        ...state,
        diaryEntries: action.payload,
      }

    // -------------------------
    // Challenge actions
    // -------------------------
    case 'SET_DAILY_CHALLENGES':
      return {
        ...state,
        dailyChallenges: action.payload,
      }

    case 'SET_WEEKLY_CHALLENGES':
      return {
        ...state,
        weeklyChallenges: action.payload,
      }

    case 'CLAIM_CHALLENGE':
      if (action.payload.isWeekly) {
        return {
          ...state,
          weeklyChallenges: state.weeklyChallenges.map((c) =>
            c.id === action.payload.challengeId ? { ...c, claimed: true } : c
          ),
        }
      }
      return {
        ...state,
        dailyChallenges: state.dailyChallenges.map((c) =>
          c.id === action.payload.challengeId ? { ...c, claimed: true } : c
        ),
      }

    case 'SET_HAS_DAILY_BONUS':
      return {
        ...state,
        hasDailyBonus: action.payload,
      }

    // -------------------------
    // Onboarding actions
    // -------------------------
    case 'SET_SELECTED_TRACKS':
      return {
        ...state,
        selectedTracks: action.payload,
      }

    case 'TOGGLE_TRACK':
      const track = action.payload
      const currentTracks = state.selectedTracks
      const newTracks = currentTracks.includes(track)
        ? currentTracks.filter((t) => t !== track)
        : [...currentTracks, track]
      return {
        ...state,
        selectedTracks: newTracks,
      }

    default:
      return state
  }
}

// ============================================
// Action Creators (for type safety)
// ============================================

export const agoraActions = {
  // Auth
  setLoading: (loading: boolean): AgoraAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  setAuthError: (error: string | null): AgoraAction => ({
    type: 'SET_AUTH_ERROR',
    payload: error,
  }),

  setUser: (user: AgoraUser | null): AgoraAction => ({
    type: 'SET_USER',
    payload: user,
  }),

  updateUser: (updates: Partial<AgoraUser>): AgoraAction => ({
    type: 'UPDATE_USER',
    payload: updates,
  }),

  logout: (): AgoraAction => ({ type: 'LOGOUT' }),

  // Data loading
  loadUserData: (data: {
    user: AgoraUser
    sessions: StudySession[]
    xpTransactions: XpTransaction[]
    diaryEntries: DiaryEntry[]
    badges: AgoraBadge[]
    hasDailyBonus: boolean
  }): AgoraAction => ({
    type: 'LOAD_USER_DATA',
    payload: data,
  }),

  // Sessions
  startSession: (session: StudySession): AgoraAction => ({
    type: 'START_SESSION',
    payload: session,
  }),

  endSession: (session: StudySession): AgoraAction => ({
    type: 'END_SESSION',
    payload: session,
  }),

  // XP
  addXpTransaction: (tx: XpTransaction): AgoraAction => ({
    type: 'ADD_XP_TRANSACTION',
    payload: tx,
  }),

  // Badges
  addBadge: (badge: AgoraBadge): AgoraAction => ({
    type: 'ADD_BADGE',
    payload: badge,
  }),

  addBadges: (badges: AgoraBadge[]): AgoraAction => ({
    type: 'ADD_BADGES',
    payload: badges,
  }),

  // Diary
  addDiaryEntry: (entry: DiaryEntry): AgoraAction => ({
    type: 'ADD_DIARY_ENTRY',
    payload: entry,
  }),

  // Challenges
  setDailyChallenges: (challenges: DailyChallenge[]): AgoraAction => ({
    type: 'SET_DAILY_CHALLENGES',
    payload: challenges,
  }),

  setWeeklyChallenges: (challenges: WeeklyChallenge[]): AgoraAction => ({
    type: 'SET_WEEKLY_CHALLENGES',
    payload: challenges,
  }),

  claimChallenge: (challengeId: string, isWeekly: boolean): AgoraAction => ({
    type: 'CLAIM_CHALLENGE',
    payload: { challengeId, isWeekly },
  }),

  setHasDailyBonus: (hasBonus: boolean): AgoraAction => ({
    type: 'SET_HAS_DAILY_BONUS',
    payload: hasBonus,
  }),

  // Onboarding
  setSelectedTracks: (tracks: AgoraTrack[]): AgoraAction => ({
    type: 'SET_SELECTED_TRACKS',
    payload: tracks,
  }),

  toggleTrack: (track: AgoraTrack): AgoraAction => ({
    type: 'TOGGLE_TRACK',
    payload: track,
  }),
}

// ============================================
// Selectors (for derived state)
// ============================================

export const agoraSelectors = {
  isSuperuser: (state: AgoraState): boolean => state.user?.isSuperuser ?? false,

  streakMultiplier: (state: AgoraState): number => {
    const streak = state.user?.currentStreak ?? 0
    const multipliers: Record<number, number> = {
      30: 2.0,
      14: 1.5,
      7: 1.25,
      3: 1.1,
    }
    const thresholds = [30, 14, 7, 3]
    for (const threshold of thresholds) {
      if (streak >= threshold) {
        return multipliers[threshold]
      }
    }
    return 1.0
  },

  onboardingData: (state: AgoraState): OnboardingData | null => {
    if (!state.user) return null
    return {
      currentStep: state.user.onboardingStep,
      completedSteps: Array.from({ length: state.user.onboardingStep }, (_, i) => i + 1),
      selectedTracks: state.selectedTracks,
      githubUsername: state.user.githubUsername,
      githubForkVerified: false,
      completedAt: state.user.hasCompletedOnboarding ? state.user.enrolledAt : undefined,
      github: state.user.githubUsername
        ? {
            username: state.user.githubUsername,
            hasForked: false,
            commitCount: 0,
            lastChecked: state.user.enrolledAt || '',
          }
        : null,
    }
  },

  needsConsent: (state: AgoraState): boolean => {
    if (!state.user) return false
    return !state.user.hasAcceptedLgpd || !state.user.hasAcceptedTerms
  },

  isCacheValid: (state: AgoraState, userId: string, ttlMs: number = 5 * 60 * 1000): boolean => {
    return (
      state.lastLoadedUserId === userId &&
      state.user !== null &&
      Date.now() - state.cacheTimestamp < ttlMs
    )
  },
}
