/**
 * Agora Types
 *
 * Unified types for the Agora learning platform.
 * This is the single source of truth for all Agora-related types.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Created as part of Sprint 3 refactoring
 */

// ============================================
// Track Types
// ============================================

export type AgoraTrack = 'backend' | 'frontend' | 'ia' | 'devops'

// ============================================
// User Types - SINGLE SOURCE OF TRUTH
// ============================================

/**
 * Unified AgoraUser type
 *
 * Merges all user fields from:
 * - use-agora-auth.tsx AgoraUser (auth-focused)
 * - use-agora.tsx AgoraUser (full platform data)
 * - auth.service.ts AuthUser (minimal auth)
 *
 * Fields are organized by category for clarity.
 */
export interface AgoraUser {
  // Core identity (required)
  id: string
  email: string
  name: string
  avatar: string

  // OAuth metadata (optional)
  githubUsername?: string
  provider?: string

  // Academic info (optional)
  matricula?: string
  curso?: string
  periodo?: number

  // Gamification stats
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  longestStreak: number

  // Activity stats
  totalSessions: number
  totalTimeMinutes: number
  totalVideosCompleted: number

  // Learning tracks
  tracks: AgoraTrack[]

  // Consent and compliance
  hasAcceptedLgpd: boolean
  hasAcceptedTerms: boolean

  // Onboarding state
  hasCompletedOnboarding: boolean
  onboardingStep: number

  // Permissions
  isSuperuser: boolean

  // Timestamps
  enrolledAt: string
  lastActivityDate?: string
  lastDailyBonusDate?: string
}

/**
 * Minimal auth user (for auth service)
 * Subset of AgoraUser for lightweight auth operations
 */
export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
  githubUsername?: string
  provider?: string
}

/**
 * Default values for new users
 */
export const DEFAULT_AGORA_USER: Omit<AgoraUser, 'id' | 'email' | 'name' | 'avatar'> = {
  totalXp: 0,
  currentLevel: 1,
  currentRank: 'novato',
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  totalTimeMinutes: 0,
  totalVideosCompleted: 0,
  tracks: [],
  hasAcceptedLgpd: false,
  hasAcceptedTerms: false,
  hasCompletedOnboarding: false,
  onboardingStep: 0,
  isSuperuser: false,
  enrolledAt: '',
}

// ============================================
// Session Types
// ============================================

export interface StudySession {
  id: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  xpEarned: number
  agentsUsed: string[]
  status: 'active' | 'completed' | 'abandoned'
}

// ============================================
// XP Types
// ============================================

export interface XpTransaction {
  id: string
  amount: number
  balanceAfter: number
  sourceType: string
  description: string
  createdAt: string
}

// ============================================
// Diary Types
// ============================================

export type DiaryMood = 'great' | 'good' | 'neutral' | 'struggling'

export interface DiaryEntry {
  id: string
  content: string
  mood: DiaryMood
  whatLearned: string
  whatStruggled: string
  nextSteps: string
  entryDate: string
  createdAt: string
}

// ============================================
// Badge Types
// ============================================

export interface AgoraBadge {
  id: string
  type: string
  name: string
  description: string
  emoji: string
  earnedAt: string
  criteria: string
}

export interface BadgeDefinition {
  id: string
  type: string
  name: string
  description: string
  emoji: string
  criteria: string
  xpReward: number
  check: (user: AgoraUser) => boolean
}

// ============================================
// Challenge Types
// ============================================

export type DailyChallengeType = 'session' | 'diary' | 'time'
export type WeeklyChallengeType = 'sessions' | 'xp' | 'streak'

export interface DailyChallenge {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: DailyChallengeType
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  periodStart: string
}

export interface WeeklyChallenge {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  type: WeeklyChallengeType
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  periodStart: string
  expiresAt: string
}

// ============================================
// Onboarding Types
// ============================================

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

// ============================================
// Auth State Types
// ============================================

export interface AgoraAuthState {
  user: AgoraUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// ============================================
// Context Action Types
// ============================================

export type AgoraAuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AgoraUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<AgoraUser> }
  | { type: 'LOGOUT' }

// ============================================
// Utility Types
// ============================================

/**
 * Create user input - fields needed to create a new AgoraUser
 */
export interface CreateAgoraUserInput {
  id: string
  email: string
  name: string
  avatar: string
  githubUsername?: string
  provider?: string
}

/**
 * Update user input - partial update to existing user
 */
export type UpdateAgoraUserInput = Partial<
  Omit<AgoraUser, 'id' | 'email' | 'enrolledAt' | 'isSuperuser'>
>

// ============================================
// Re-export for backwards compatibility
// ============================================

// These exports ensure existing imports continue to work
export type { AgoraUser as AgoraUserType }
