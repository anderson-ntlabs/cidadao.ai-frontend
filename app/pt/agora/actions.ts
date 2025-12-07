'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Academy Server Actions
 *
 * Server-side mutations for Academy features.
 * These run on the server and can safely access the database.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

// ============================================
// XP & Progress Actions
// ============================================

export async function addXp(amount: number, description: string, sourceType?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('total_xp, current_level')
      .eq('user_id', user.id)
      .single()

    const currentXp = profile?.total_xp || 0
    const newXp = currentXp + amount

    // Calculate new level (100 XP per level)
    const newLevel = Math.floor(newXp / 100) + 1

    // Update profile
    await supabase
      .from('agora_profiles')
      .update({
        total_xp: newXp,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Log transaction
    await supabase.from('agora_xp_transactions').insert({
      user_id: user.id,
      amount,
      description,
      source_type: sourceType || 'system',
    })

    revalidatePath('/pt/agora')
    return { success: true, newXp, newLevel }
  } catch (error) {
    console.error('Failed to add XP:', error)
    return { error: 'Failed to add XP' }
  }
}

export async function recordSession(durationMinutes: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('total_time_minutes, total_sessions, current_streak, last_session_date')
      .eq('user_id', user.id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastSession = profile?.last_session_date
    let newStreak = profile?.current_streak || 0

    // Calculate streak
    if (lastSession) {
      const lastDate = new Date(lastSession)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        newStreak += 1
      } else if (diffDays > 1) {
        newStreak = 1
      }
      // Same day = keep streak
    } else {
      newStreak = 1
    }

    // Update profile
    await supabase
      .from('agora_profiles')
      .update({
        total_time_minutes: (profile?.total_time_minutes || 0) + durationMinutes,
        total_sessions: (profile?.total_sessions || 0) + 1,
        current_streak: newStreak,
        last_session_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    revalidatePath('/pt/agora')
    return { success: true, newStreak }
  } catch (error) {
    console.error('Failed to record session:', error)
    return { error: 'Failed to record session' }
  }
}

// ============================================
// LGPD & Consent Actions
// ============================================

export async function acceptLgpdConsent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Check if already accepted
    const { data: existing } = await supabase
      .from('agora_consent')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return { success: true, alreadyAccepted: true }
    }

    // Insert consent
    await supabase.from('agora_consent').insert({
      user_id: user.id,
      consent_version: 'v1.0',
      tracking_consent: true,
      data_processing_consent: true,
      certificate_consent: true,
    })

    // Create profile if not exists
    await supabase.from('agora_profiles').upsert(
      {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Estudante',
        avatar_url: user.user_metadata?.avatar_url,
        github_username: user.user_metadata?.user_name,
        main_track: 'backend',
        program_start_date: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'user_id' }
    )

    revalidatePath('/pt/agora')
    return { success: true }
  } catch (error) {
    console.error('Failed to accept LGPD consent:', error)
    return { error: 'Failed to accept consent' }
  }
}

// ============================================
// Badge Actions
// ============================================

export async function awardBadge(badgeId: string, badgeName: string, criteria: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Check if already has badge
    const { data: existing } = await supabase
      .from('agora_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_id', badgeId)
      .single()

    if (existing) {
      return { success: true, alreadyHas: true }
    }

    // Award badge
    await supabase.from('agora_badges').insert({
      user_id: user.id,
      badge_id: badgeId,
      badge_name: badgeName,
      criteria,
    })

    // Add XP for badge
    await addXp(50, `Badge ${badgeName} conquistado!`, 'badge')

    revalidatePath('/pt/agora')
    return { success: true }
  } catch (error) {
    console.error('Failed to award badge:', error)
    return { error: 'Failed to award badge' }
  }
}

// ============================================
// Data Fetching (for Server Components)
// ============================================

export async function getAcademyUserData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Fetch consent
    const { data: consent } = await supabase
      .from('agora_consent')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Fetch badges
    const { data: badges } = await supabase
      .from('agora_badges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch recent XP transactions
    const { data: xpTransactions } = await supabase
      .from('agora_xp_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const metadata = user.user_metadata || {}

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.full_name || metadata.full_name || metadata.name || 'Estudante',
      avatar:
        profile?.avatar_url ||
        metadata.avatar_url ||
        `https://ui-avatars.com/api/?name=Estudante&background=f59e0b&color=fff`,
      githubUsername: profile?.github_username || metadata.user_name,
      totalXp: profile?.total_xp || 0,
      currentLevel: profile?.current_level || 1,
      currentRank: profile?.current_rank || 'novato',
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      totalTimeMinutes: profile?.total_time_minutes || 0,
      totalSessions: profile?.total_sessions || 0,
      hasAcceptedLgpd: !!consent,
      badges: badges || [],
      xpTransactions: xpTransactions || [],
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return null
  }
}
