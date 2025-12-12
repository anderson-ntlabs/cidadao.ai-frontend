/**
 * User Converter Utilities
 *
 * Single source of truth for converting Supabase users to AgoraUser.
 * Eliminates duplicate conversion logic across:
 * - use-agora-auth.tsx convertToAgoraUser()
 * - use-agora.tsx inline conversion
 * - auth.service.ts convertSupabaseUser()
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Sprint 3 refactoring
 */

import { User as SupabaseUser } from '@supabase/supabase-js'
import type { AgoraUser, AuthUser, DEFAULT_AGORA_USER } from '@/types/agora'

// ============================================
// Avatar Utilities
// ============================================

/**
 * Generate fallback avatar URL using UI Avatars
 */
export function generateFallbackAvatar(
  name: string,
  background: string = '16a34a',
  color: string = 'fff',
  size: number = 128
): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&size=${size}`
}

/**
 * Extract avatar from Supabase user metadata
 * Checks multiple sources in order of priority
 */
export function extractAvatar(supabaseUser: SupabaseUser, fallbackName: string): string {
  const metadata = supabaseUser.user_metadata || {}

  // Check direct metadata fields
  let avatar = metadata.avatar_url || metadata.picture || metadata.avatar || null

  // Try identities array for raw OAuth data
  if (!avatar && supabaseUser.identities && supabaseUser.identities.length > 0) {
    const identity = supabaseUser.identities[0]
    const identityData = identity.identity_data || {}
    avatar = identityData.avatar_url || identityData.picture || identityData.avatar || null
  }

  // Fallback to UI Avatars
  if (!avatar) {
    avatar = generateFallbackAvatar(fallbackName)
  }

  return avatar
}

// ============================================
// Name Extraction
// ============================================

/**
 * Extract display name from Supabase user metadata
 * Checks multiple sources in order of priority
 */
export function extractName(supabaseUser: SupabaseUser): string {
  const metadata = supabaseUser.user_metadata || {}

  return (
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    metadata.preferred_username ||
    supabaseUser.email?.split('@')[0] ||
    'Estudante'
  )
}

// ============================================
// User Conversion
// ============================================

/**
 * Convert Supabase user to minimal AuthUser
 * Used by auth.service.ts for lightweight auth operations
 */
export function convertToAuthUser(supabaseUser: SupabaseUser): AuthUser {
  const metadata = supabaseUser.user_metadata || {}
  const name = extractName(supabaseUser)
  const avatar = extractAvatar(supabaseUser, name)

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name,
    avatar,
    githubUsername: metadata.user_name || metadata.preferred_username,
    provider: supabaseUser.app_metadata?.provider,
  }
}

/**
 * Database profile row type (from agora_profiles table)
 */
export interface AgoraProfileRow {
  user_id: string
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  github_username?: string | null
  matricula?: string | null
  curso?: string | null
  periodo?: number | null
  total_xp?: number | null
  current_level?: number | null
  current_rank?: string | null
  current_streak?: number | null
  longest_streak?: number | null
  total_sessions?: number | null
  total_time_minutes?: number | null
  total_videos_completed?: number | null
  tracks?: string[] | null
  has_accepted_terms?: boolean | null
  has_completed_onboarding?: boolean | null
  onboarding_step?: number | null
  is_superuser?: boolean | null
  enrolled_at?: string | null
  last_activity_date?: string | null
  last_daily_bonus_date?: string | null
  badges?: string[] | null
}

/**
 * Convert Supabase user + profile to full AgoraUser
 * This is the SINGLE conversion function to use everywhere
 *
 * @param supabaseUser - Supabase auth user
 * @param profile - Optional database profile (from agora_profiles)
 * @param hasConsent - Whether user has LGPD consent
 */
export function convertToAgoraUser(
  supabaseUser: SupabaseUser,
  profile?: AgoraProfileRow | null,
  hasConsent: boolean = false
): AgoraUser {
  const metadata = supabaseUser.user_metadata || {}
  const name = extractName(supabaseUser)
  const avatar = extractAvatar(supabaseUser, name)

  // GitHub username from metadata or profile
  const githubUsername =
    profile?.github_username || metadata.user_name || metadata.preferred_username || undefined

  // Build user object with profile data if available
  const hasTerms = profile?.has_accepted_terms || false

  return {
    // Core identity
    id: supabaseUser.id,
    email: supabaseUser.email || profile?.email || '',
    name: profile?.full_name || name,
    avatar: profile?.avatar_url || avatar,

    // OAuth metadata
    githubUsername,
    provider: supabaseUser.app_metadata?.provider,

    // Academic info
    matricula: profile?.matricula || undefined,
    curso: profile?.curso || undefined,
    periodo: profile?.periodo || undefined,

    // Gamification stats
    totalXp: profile?.total_xp || 0,
    currentLevel: profile?.current_level || 1,
    currentRank: profile?.current_rank || 'novato',
    currentStreak: profile?.current_streak || 0,
    longestStreak: profile?.longest_streak || 0,

    // Activity stats
    totalSessions: profile?.total_sessions || 0,
    totalTimeMinutes: profile?.total_time_minutes || 0,
    totalVideosCompleted: profile?.total_videos_completed || 0,

    // Learning tracks
    tracks: (profile?.tracks as AgoraUser['tracks']) || [],

    // Consent and compliance
    hasAcceptedLgpd: hasConsent,
    hasAcceptedTerms: hasTerms,

    // Onboarding state
    hasCompletedOnboarding: profile?.has_completed_onboarding || false,
    onboardingStep: profile?.onboarding_step || 0,

    // Permissions
    isSuperuser: profile?.is_superuser || false,

    // Timestamps
    enrolledAt: profile?.enrolled_at || new Date().toISOString(),
    lastActivityDate: profile?.last_activity_date || undefined,
    lastDailyBonusDate: profile?.last_daily_bonus_date || undefined,
  }
}

/**
 * Create a new AgoraUser from minimal auth data
 * Used when profile doesn't exist yet (first login)
 */
export function createNewAgoraUser(authUser: AuthUser, hasConsent: boolean = false): AgoraUser {
  return {
    // Core identity
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    avatar: authUser.avatar,

    // OAuth metadata
    githubUsername: authUser.githubUsername,
    provider: authUser.provider,

    // Academic info (empty for new users)
    matricula: undefined,
    curso: undefined,
    periodo: undefined,

    // Gamification stats (defaults)
    totalXp: 0,
    currentLevel: 1,
    currentRank: 'novato',
    currentStreak: 0,
    longestStreak: 0,

    // Activity stats (defaults)
    totalSessions: 0,
    totalTimeMinutes: 0,
    totalVideosCompleted: 0,

    // Learning tracks (empty)
    tracks: [],

    // Consent and compliance
    hasAcceptedLgpd: hasConsent,
    hasAcceptedTerms: false,

    // Onboarding state
    hasCompletedOnboarding: false,
    onboardingStep: 0,

    // Permissions
    isSuperuser: false,

    // Timestamps
    enrolledAt: new Date().toISOString(),
    lastActivityDate: undefined,
    lastDailyBonusDate: undefined,
  }
}

/**
 * Merge partial updates into existing AgoraUser
 */
export function mergeUserUpdate(user: AgoraUser, updates: Partial<AgoraUser>): AgoraUser {
  return { ...user, ...updates }
}

/**
 * Check if user needs to complete LGPD/terms consent
 */
export function needsConsent(user: AgoraUser): boolean {
  return !user.hasAcceptedLgpd || !user.hasAcceptedTerms
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedSetup(user: AgoraUser): boolean {
  return user.hasAcceptedLgpd && user.hasAcceptedTerms && user.hasCompletedOnboarding
}
