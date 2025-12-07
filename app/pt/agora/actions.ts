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
// Video Progress Actions
// ============================================

export async function updateVideoProgress(
  videoId: string,
  watchedSeconds: number,
  totalSeconds: number,
  completed: boolean = false
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const progressPercentage = Math.round((watchedSeconds / totalSeconds) * 100)
    const status = completed ? 'completed' : watchedSeconds > 0 ? 'in_progress' : 'not_started'

    // Check if already completed (to prevent duplicate XP)
    const { data: existing } = await supabase
      .from('agora_video_progress')
      .select('id, status, xp_awarded')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single()

    const alreadyCompleted = existing?.status === 'completed'

    // Upsert progress
    const { error } = await supabase.from('agora_video_progress').upsert(
      {
        user_id: user.id,
        video_id: videoId,
        watched_seconds: watchedSeconds,
        total_seconds: totalSeconds,
        progress_percentage: progressPercentage,
        status,
        completed_at: completed ? new Date().toISOString() : null,
        xp_awarded: completed && !alreadyCompleted ? 25 : existing?.xp_awarded || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,video_id' }
    )

    if (error) throw error

    // Award XP if newly completed
    let xpAwarded = 0
    if (completed && !alreadyCompleted) {
      xpAwarded = 25
      await addXp(xpAwarded, `Vídeo concluído`, 'video')

      // Update profile stats (videos completed)
      try {
        const { error: rpcError } = await supabase.rpc('increment_profile_stat', {
          p_user_id: user.id,
          p_stat: 'total_videos_completed',
          p_amount: 1,
        })
        if (rpcError) {
          // Fallback if RPC doesn't exist - direct update
          const { data: profile } = await supabase
            .from('agora_profiles')
            .select('total_videos_completed')
            .eq('user_id', user.id)
            .single()
          await supabase
            .from('agora_profiles')
            .update({
              total_videos_completed: (profile?.total_videos_completed || 0) + 1,
            })
            .eq('user_id', user.id)
        }
      } catch {
        // Ignore stat update errors
      }
    }

    revalidatePath('/pt/agora/videos')
    return { success: true, xpAwarded, progressPercentage, status }
  } catch (error) {
    console.error('Failed to update video progress:', error)
    return { error: 'Failed to update video progress' }
  }
}

export async function getVideoProgress() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const { data, error } = await supabase
      .from('agora_video_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    // Convert to lookup object
    const progressMap: Record<
      string,
      {
        video_id: string
        watched_seconds: number
        progress_percentage: number
        status: string
        completed_at: string | null
      }
    > = {}

    data?.forEach((p) => {
      progressMap[p.video_id] = p
    })

    return { success: true, data: progressMap }
  } catch (error) {
    console.error('Failed to get video progress:', error)
    return { error: 'Failed to get video progress', data: null }
  }
}

// ============================================
// Reading Progress Actions
// ============================================

export async function updateReadingProgress(
  readingId: string,
  completed: boolean = false,
  notes?: string,
  rating?: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const status = completed ? 'completed' : 'in_progress'

    // Check if already completed
    const { data: existing } = await supabase
      .from('agora_reading_progress')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('reading_id', readingId)
      .single()

    const alreadyCompleted = existing?.status === 'completed'

    // Upsert progress
    const { error } = await supabase.from('agora_reading_progress').upsert(
      {
        user_id: user.id,
        reading_id: readingId,
        status,
        started_at: existing ? undefined : new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : null,
        confirmed_read: completed,
        confirmation_date: completed ? new Date().toISOString() : null,
        notes: notes || undefined,
        rating: rating || undefined,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,reading_id' }
    )

    if (error) throw error

    // Award XP if newly completed
    let xpAwarded = 0
    if (completed && !alreadyCompleted) {
      xpAwarded = 15
      await addXp(xpAwarded, `Leitura concluída`, 'reading')
    }

    revalidatePath('/pt/agora/leituras')
    return { success: true, xpAwarded, status }
  } catch (error) {
    console.error('Failed to update reading progress:', error)
    return { error: 'Failed to update reading progress' }
  }
}

export async function getReadingProgress() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const { data, error } = await supabase
      .from('agora_reading_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    // Convert to lookup object
    const progressMap: Record<
      string,
      {
        reading_id: string
        status: string
        completed_at: string | null
        notes: string | null
        rating: number | null
      }
    > = {}

    data?.forEach((p) => {
      progressMap[p.reading_id] = p
    })

    return { success: true, data: progressMap }
  } catch (error) {
    console.error('Failed to get reading progress:', error)
    return { error: 'Failed to get reading progress', data: null }
  }
}

// ============================================
// Certificate Actions
// ============================================

export async function saveCertificate(certificateData: {
  certificateNumber: string
  certificateType: 'completion' | 'distinction' | 'excellence'
  totalHours: number
  totalXp: number
  finalRank: string
  finalLevel: number
  missionsCompleted: number
  articlesRead: number
  conversationsCount: number
  verificationHash: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get profile for dates
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('program_start_date, enrolled_at')
      .eq('user_id', user.id)
      .single()

    const programStartDate =
      profile?.program_start_date ||
      profile?.enrolled_at?.split('T')[0] ||
      new Date().toISOString().split('T')[0]
    const programEndDate = new Date().toISOString().split('T')[0]

    // Insert certificate
    const { data, error } = await supabase
      .from('agora_certificates')
      .insert({
        user_id: user.id,
        certificate_number: certificateData.certificateNumber,
        certificate_type: certificateData.certificateType,
        program_start_date: programStartDate,
        program_end_date: programEndDate,
        total_hours: certificateData.totalHours,
        total_xp: certificateData.totalXp,
        final_rank: certificateData.finalRank,
        final_level: certificateData.finalLevel,
        missions_completed: certificateData.missionsCompleted,
        articles_read: certificateData.articlesRead,
        conversations_count: certificateData.conversationsCount,
        verification_hash: certificateData.verificationHash,
        verification_url: `https://cidadao.ai/verify/${certificateData.certificateNumber}`,
      })
      .select()
      .single()

    if (error) throw error

    // Update profile status
    await supabase
      .from('agora_profiles')
      .update({
        program_status: 'completed',
        program_end_date: programEndDate,
      })
      .eq('user_id', user.id)

    revalidatePath('/pt/agora')
    return { success: true, certificate: data }
  } catch (error) {
    console.error('Failed to save certificate:', error)
    return { error: 'Failed to save certificate' }
  }
}

export async function getCertificates() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const { data, error } = await supabase
      .from('agora_certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to get certificates:', error)
    return { error: 'Failed to get certificates', data: null }
  }
}

// ============================================
// Telemetry Actions (for certificate validation)
// ============================================

export async function getTelemetryData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    // Get video progress
    const { data: videoProgress } = await supabase
      .from('agora_video_progress')
      .select('status, watched_seconds, total_seconds')
      .eq('user_id', user.id)

    const videosCompleted = videoProgress?.filter((v) => v.status === 'completed').length || 0
    const totalVideoWatchTime =
      videoProgress?.reduce((sum, v) => sum + (v.watched_seconds || 0), 0) || 0

    // Get reading progress
    const { data: readingProgress } = await supabase
      .from('agora_reading_progress')
      .select('status')
      .eq('user_id', user.id)

    const readingsCompleted = readingProgress?.filter((r) => r.status === 'completed').length || 0

    // Get diary entries count
    const { count: diaryCount } = await supabase
      .from('agora_diary_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get sessions count
    const { count: sessionsCount } = await supabase
      .from('agora_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get chat messages from XP transactions
    const { data: chatXp } = await supabase
      .from('agora_xp_transactions')
      .select('id')
      .eq('user_id', user.id)
      .in('source_type', ['chat', 'agent_chat'])

    const chatMessages = (chatXp?.length || 0) * 5

    // Get profile data
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('total_xp, total_time_minutes, current_streak')
      .eq('user_id', user.id)
      .single()

    return {
      success: true,
      data: {
        videosCompleted,
        totalVideos: 15,
        requiredVideosCompleted: videosCompleted, // Simplified - ideally check is_required
        totalRequiredVideos: 3,
        totalVideoWatchTimeSeconds: totalVideoWatchTime,
        requiredVideoWatchTimeSeconds: 10020, // ~2.8 hours
        readingsCompleted,
        totalReadings: 8,
        requiredReadingsCompleted: readingsCompleted,
        totalRequiredReadings: 2,
        totalXp: profile?.total_xp || 0,
        totalTimeMinutes: profile?.total_time_minutes || 0,
        totalSessions: sessionsCount || 0,
        diaryEntries: diaryCount || 0,
        chatMessages,
        currentStreak: profile?.current_streak || 0,
      },
    }
  } catch (error) {
    console.error('Failed to get telemetry data:', error)
    return { error: 'Failed to get telemetry data', data: null }
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
