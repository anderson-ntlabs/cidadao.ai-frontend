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
  hasAcceptedInternshipContract?: boolean // Alias for hasAcceptedTerms (backwards compat)

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
// Database Row Types (match Supabase schema)
// ============================================

/**
 * agora_profiles table - raw database row
 */
export interface AgoraProfileDB {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  github_username: string | null
  github_fork_verified: boolean
  github_fork_url: string | null
  matricula: string | null
  curso: string | null
  periodo: number | null
  total_xp: number
  current_level: number
  current_rank: string
  tracks: string[]
  current_streak: number
  longest_streak: number
  total_sessions: number
  total_time_minutes: number
  total_videos_completed: number
  badges: string[]
  main_track: string | null
  program_start_date: string | null
  program_end_date: string | null
  program_status: string | null
  last_activity_date: string | null
  last_daily_bonus_date: string | null
  has_accepted_terms: boolean
  has_completed_onboarding: boolean
  onboarding_step: number
  is_superuser: boolean
  is_active: boolean
  enrolled_at: string
  created_at: string
  updated_at: string
}

/**
 * agora_consent table
 */
export interface AgoraConsentDB {
  id: string
  user_id: string
  consent_version: string
  tracking_consent: boolean
  data_processing_consent: boolean
  certificate_consent: boolean
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/**
 * agora_xp_transactions table
 */
export interface AgoraXpTransactionDB {
  id: string
  user_id: string
  amount: number
  balance_after: number
  source_type: string
  description: string
  created_at: string
}

/**
 * agora_sessions table
 */
export interface AgoraSessionDB {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  xp_earned: number | null
  conversations: Array<{ agent_name: string }> | null
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
}

/**
 * agora_diary_entries table
 */
export interface AgoraDiaryEntryDB {
  id: string
  user_id: string
  session_id: string | null
  content: string
  mood: DiaryMood | null
  what_learned: string | null
  what_struggled: string | null
  next_steps: string | null
  entry_date: string | null
  created_at: string
  updated_at: string
}

/**
 * agora_video_progress table
 */
export interface AgoraVideoProgressDB {
  id: string
  user_id: string
  video_id: string
  watched_seconds: number
  total_seconds: number
  progress_percentage: number
  status: 'not_started' | 'in_progress' | 'completed'
  completed_at: string | null
  xp_awarded: number
  created_at: string
  updated_at: string
}

/**
 * agora_reading_progress table
 */
export interface AgoraReadingProgressDB {
  id: string
  user_id: string
  reading_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  started_at: string | null
  completed_at: string | null
  confirmed_read: boolean
  confirmation_date: string | null
  notes: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

/**
 * agora_certificates table
 */
export interface AgoraCertificateDB {
  id: string
  user_id: string
  certificate_number: string
  certificate_type: 'completion' | 'distinction' | 'excellence'
  program_start_date: string
  program_end_date: string
  total_hours: number
  total_xp: number
  final_rank: string
  final_level: number
  missions_completed: number
  articles_read: number
  conversations_count: number
  verification_hash: string
  verification_url: string
  issued_at: string
  created_at: string
}

/**
 * agora_calendar_events table
 */
export interface AgoraCalendarEventDB {
  id: string
  user_id: string
  title: string
  start_time: string
  end_time: string | null
  event_type: 'study' | 'reading' | 'video' | 'chat' | 'deadline'
  description: string | null
  xp_reward: number
  completed: boolean
  completed_at: string | null
  url: string | null
  created_at: string
}

/**
 * agora_challenge_progress table
 */
export interface AgoraChallengeProgressDB {
  id: string
  user_id: string
  challenge_id: string
  challenge_type: 'daily' | 'weekly'
  current_progress: number
  target_value: number
  is_completed: boolean
  completed_at: string | null
  xp_reward: number
  xp_claimed: boolean
  xp_claimed_at: string | null
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

/**
 * agora_track_progress table
 */
export interface AgoraTrackProgressDB {
  id: string
  user_id: string
  track_id: string
  current_module: number
  modules_completed: number[]
  videos_completed: string[]
  readings_completed: string[]
  progress_percentage: number
  started_at: string
  completed_at: string | null
  last_activity_at: string
  created_at: string
  updated_at: string
}

/**
 * kids_sessions table
 */
export interface KidsSessionDB {
  id: string
  user_id: string
  parent_session_id: string | null
  kid_name: string
  kid_age: number | null
  avatar_id: string | null
  xp_earned: number
  time_spent_minutes: number
  activities_completed: string[]
  started_at: string
  ended_at: string | null
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
}

/**
 * parental_controls table
 */
export interface ParentalControlDB {
  id: string
  user_id: string
  pin_hash: string
  max_daily_minutes: number
  allowed_agents: string[]
  content_filter_level: 'strict' | 'moderate' | 'open'
  created_at: string
  updated_at: string
}

// ============================================
// Supabase Auth Types
// ============================================

/**
 * User metadata from Supabase auth
 */
export interface SupabaseUserMetadata {
  full_name?: string
  name?: string
  avatar_url?: string
  user_name?: string
  email?: string
  email_verified?: boolean
  phone_verified?: boolean
  sub?: string
}

// ============================================
// Transformation Functions
// ============================================

/**
 * Transform DB profile to frontend user
 */
export function transformProfileToUser(profile: AgoraProfileDB, hasConsent: boolean): AgoraUser {
  return {
    id: profile.user_id,
    name: profile.full_name ?? 'Estudante',
    email: profile.email ?? '',
    avatar:
      profile.avatar_url ??
      `https://ui-avatars.com/api/?name=Estudante&background=16a34a&color=fff`,
    githubUsername: profile.github_username ?? undefined,
    matricula: profile.matricula ?? undefined,
    curso: profile.curso ?? undefined,
    periodo: profile.periodo ?? undefined,
    totalXp: profile.total_xp,
    currentLevel: profile.current_level,
    currentRank: profile.current_rank,
    tracks: (profile.tracks ?? []) as AgoraTrack[],
    currentStreak: profile.current_streak,
    longestStreak: profile.longest_streak,
    totalSessions: profile.total_sessions,
    totalTimeMinutes: profile.total_time_minutes,
    totalVideosCompleted: profile.total_videos_completed,
    hasAcceptedLgpd: hasConsent,
    hasAcceptedTerms: profile.has_accepted_terms,
    hasCompletedOnboarding: profile.has_completed_onboarding,
    onboardingStep: profile.onboarding_step,
    isSuperuser: profile.is_superuser,
    enrolledAt: profile.enrolled_at,
    lastActivityDate: profile.last_activity_date ?? undefined,
    lastDailyBonusDate: profile.last_daily_bonus_date ?? undefined,
  }
}

/**
 * Transform DB XP transaction to frontend
 */
export function transformXpTransaction(tx: AgoraXpTransactionDB): XpTransaction {
  return {
    id: tx.id,
    amount: tx.amount,
    balanceAfter: tx.balance_after,
    sourceType: tx.source_type,
    description: tx.description,
    createdAt: tx.created_at,
  }
}

/**
 * Transform DB diary entry to frontend
 */
export function transformDiaryEntry(entry: AgoraDiaryEntryDB): DiaryEntry {
  return {
    id: entry.id,
    content: entry.content,
    mood: entry.mood ?? 'neutral',
    whatLearned: entry.what_learned ?? '',
    whatStruggled: entry.what_struggled ?? '',
    nextSteps: entry.next_steps ?? '',
    entryDate: entry.entry_date ?? entry.created_at.split('T')[0],
    createdAt: entry.created_at,
  }
}

/**
 * Transform DB session to frontend
 */
export function transformSession(session: AgoraSessionDB): StudySession {
  return {
    id: session.id,
    startedAt: session.started_at,
    endedAt: session.ended_at ?? undefined,
    durationMinutes: session.duration_minutes ?? 0,
    xpEarned: session.xp_earned ?? 0,
    agentsUsed: session.conversations?.map((c) => c.agent_name) ?? [],
    status: session.status,
  }
}

/**
 * Transform DB calendar event to frontend
 */
export function transformCalendarEvent(event: AgoraCalendarEventDB): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    startTime: event.start_time,
    endTime: event.end_time ?? undefined,
    eventType: event.event_type,
    description: event.description ?? undefined,
    xpReward: event.xp_reward,
    completed: event.completed,
    url: event.url ?? undefined,
    createdAt: event.created_at,
  }
}

// ============================================
// Calendar Event Frontend Type
// ============================================

export interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime?: string
  eventType: 'study' | 'reading' | 'video' | 'chat' | 'deadline'
  description?: string
  xpReward: number
  completed: boolean
  url?: string
  createdAt: string
}

// ============================================
// Type Guards
// ============================================

export function isAgoraTrack(value: string): value is AgoraTrack {
  return ['backend', 'frontend', 'ia', 'devops'].includes(value)
}

export function isDiaryMood(value: string): value is DiaryMood {
  return ['great', 'good', 'neutral', 'struggling'].includes(value)
}

// ============================================
// Re-export for backwards compatibility
// ============================================

// These exports ensure existing imports continue to work
export type { AgoraUser as AgoraUserType }
