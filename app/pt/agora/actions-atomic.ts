'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Atomic Server Actions for Ágora Academy
 *
 * These actions use atomic database functions to prevent race conditions
 * and ensure data consistency. They should be preferred over the original
 * actions.ts implementations.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

// ============================================
// Action Result Types (returned to client)
// ============================================

interface AddXpResult {
  success: boolean
  error?: string
  newTotalXp?: number
  newLevel?: number
  newRank?: string
  levelUp?: boolean
  rankUp?: boolean
}

interface StreakResult {
  success: boolean
  error?: string
  newStreak?: number
  longestStreak?: number
  streakMultiplier?: number
  streakBroken?: boolean
}

interface EndSessionResult {
  success: boolean
  error?: string
  durationMinutes?: number
  newTotalSessions?: number
  newTotalTime?: number
}

interface DailyBonusResult {
  success: boolean
  error?: string
  xpAwarded?: number
  streakMultiplier?: number
  alreadyClaimed?: boolean
}

interface BadgeAwardResult {
  success: boolean
  error?: string
  alreadyHad?: boolean
  xpAwarded?: number
}

interface SoftDeleteResult {
  success: boolean
  error?: string
  tablesAffected?: number
  recordsDeleted?: number
}

// ============================================
// RPC Response Types (from Supabase functions)
// ============================================

interface RpcAddXpResponse {
  new_total_xp: number
  new_level: number
  new_rank: string
  level_up: boolean
  rank_up: boolean
}

interface RpcStreakResponse {
  new_streak: number
  longest_streak: number
  streak_multiplier: number
  streak_broken: boolean
}

interface RpcEndSessionResponse {
  duration_minutes: number
  new_total_sessions: number
  new_total_time: number
}

interface RpcDailyBonusResponse {
  success: boolean
  already_claimed: boolean
  xp_awarded: number
  streak_multiplier: number
}

interface RpcBadgeResponse {
  success: boolean
  already_had: boolean
  xp_awarded: number
}

interface RpcSoftDeleteResponse {
  tables_affected: number
  records_deleted: number
}

// ============================================
// Atomic XP Action
// ============================================

/**
 * Add XP atomically using database function.
 * Prevents race conditions and ensures level/rank are calculated correctly.
 */
export async function addXpAtomic(
  amount: number,
  sourceType: string,
  description?: string
): Promise<AddXpResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('add_xp_atomic', {
      p_user_id: user.id,
      p_amount: amount,
      p_source_type: sourceType,
      p_description: description ?? sourceType,
    })

    if (response.error) {
      console.error('Atomic XP error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcAddXpResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    revalidatePath('/pt/agora')

    return {
      success: true,
      newTotalXp: result.new_total_xp,
      newLevel: result.new_level,
      newRank: result.new_rank,
      levelUp: result.level_up,
      rankUp: result.rank_up,
    }
  } catch (err) {
    console.error('Failed to add XP atomically:', err)
    return { success: false, error: 'Failed to add XP' }
  }
}

// ============================================
// Atomic Streak Action
// ============================================

/**
 * Update streak atomically using database function.
 * Ensures streak calculations are always consistent.
 */
export async function updateStreakAtomic(): Promise<StreakResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('update_streak_atomic', {
      p_user_id: user.id,
    })

    if (response.error) {
      console.error('Atomic streak error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcStreakResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    revalidatePath('/pt/agora')

    return {
      success: true,
      newStreak: result.new_streak,
      longestStreak: result.longest_streak,
      streakMultiplier: result.streak_multiplier,
      streakBroken: result.streak_broken,
    }
  } catch (err) {
    console.error('Failed to update streak atomically:', err)
    return { success: false, error: 'Failed to update streak' }
  }
}

// ============================================
// Atomic End Session Action
// ============================================

/**
 * End session atomically using database function.
 * Ensures session and profile stats are always in sync.
 */
export async function endSessionAtomic(
  sessionId: string,
  xpEarned: number = 0,
  agentsUsed: string[] = []
): Promise<EndSessionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('end_session_atomic', {
      p_session_id: sessionId,
      p_user_id: user.id,
      p_xp_earned: xpEarned,
      p_agents_used: agentsUsed,
    })

    if (response.error) {
      console.error('Atomic end session error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcEndSessionResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    revalidatePath('/pt/agora')

    return {
      success: true,
      durationMinutes: result.duration_minutes,
      newTotalSessions: result.new_total_sessions,
      newTotalTime: result.new_total_time,
    }
  } catch (err) {
    console.error('Failed to end session atomically:', err)
    return { success: false, error: 'Failed to end session' }
  }
}

// ============================================
// Atomic Daily Bonus Action
// ============================================

/**
 * Claim daily bonus atomically using database function.
 * Prevents double-claiming and applies streak multiplier.
 */
export async function claimDailyBonusAtomic(): Promise<DailyBonusResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('claim_daily_bonus_atomic', {
      p_user_id: user.id,
    })

    if (response.error) {
      console.error('Atomic daily bonus error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcDailyBonusResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    if (result.already_claimed) {
      return { success: false, alreadyClaimed: true }
    }

    if (!result.success) {
      return { success: false, error: 'Failed to claim bonus' }
    }

    revalidatePath('/pt/agora')

    return {
      success: true,
      xpAwarded: result.xp_awarded,
      streakMultiplier: result.streak_multiplier,
    }
  } catch (err) {
    console.error('Failed to claim daily bonus atomically:', err)
    return { success: false, error: 'Failed to claim bonus' }
  }
}

// ============================================
// Atomic Badge Award Action
// ============================================

/**
 * Award badge atomically using database function.
 * Ensures badge is only awarded once and XP bonus is applied.
 */
export async function awardBadgeAtomic(
  badgeId: string,
  badgeName: string,
  badgeEmoji?: string,
  badgeTier: number = 1,
  xpBonus: number = 0,
  triggerSource?: string,
  triggerValue?: number
): Promise<BadgeAwardResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('award_badge', {
      p_user_id: user.id,
      p_badge_id: badgeId,
      p_badge_name: badgeName,
      p_badge_emoji: badgeEmoji,
      p_badge_tier: badgeTier,
      p_xp_bonus: xpBonus,
      p_trigger_source: triggerSource,
      p_trigger_value: triggerValue,
    })

    if (response.error) {
      console.error('Atomic badge award error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcBadgeResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    if (result.already_had) {
      return { success: true, alreadyHad: true, xpAwarded: 0 }
    }

    revalidatePath('/pt/agora')

    return {
      success: result.success,
      alreadyHad: false,
      xpAwarded: result.xp_awarded,
    }
  } catch (err) {
    console.error('Failed to award badge atomically:', err)
    return { success: false, error: 'Failed to award badge' }
  }
}

// ============================================
// LGPD: Soft Delete User Data
// ============================================

/**
 * Soft delete all user data for LGPD compliance.
 * Marks all records as deleted without physically removing them.
 */
export async function softDeleteUserData(): Promise<SoftDeleteResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const response = await supabase.rpc('soft_delete_user_data', {
      p_user_id: user.id,
    })

    if (response.error) {
      console.error('Soft delete error:', response.error)
      return { success: false, error: response.error.message }
    }

    const results = response.data as RpcSoftDeleteResponse[] | null
    const result = results?.[0]
    if (!result) {
      return { success: false, error: 'No result returned' }
    }

    return {
      success: true,
      tablesAffected: result.tables_affected,
      recordsDeleted: result.records_deleted,
    }
  } catch (err) {
    console.error('Failed to soft delete user data:', err)
    return { success: false, error: 'Failed to delete data' }
  }
}
