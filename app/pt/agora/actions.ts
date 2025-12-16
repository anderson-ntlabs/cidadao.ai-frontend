'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  AgoraProfile,
  AgoraVideoProgress,
  AgoraReadingProgress,
  AgoraXpTransaction,
  AgoraSession,
} from '@/types/supabase'

/**
 * Academy Server Actions
 *
 * Server-side mutations for Academy features.
 * These run on the server and can safely access the database.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

// Type for user metadata from Supabase auth
interface UserMetadata {
  full_name?: string
  name?: string
  avatar_url?: string
  user_name?: string
}

// Partial types for specific queries
type ProfileXpQuery = Pick<AgoraProfile, 'total_xp' | 'current_level'>
type ProfileSessionQuery = Pick<
  AgoraProfile,
  'total_time_minutes' | 'total_sessions' | 'current_streak' | 'last_activity_date'
>
type ProfileBadgesQuery = Pick<AgoraProfile, 'badges'>
type ProfileDatesQuery = Pick<AgoraProfile, 'program_start_date'> & { enrolled_at?: string }
type ProfileTelemetryQuery = Pick<
  AgoraProfile,
  'total_xp' | 'total_time_minutes' | 'current_streak'
>

// Video progress query types
type VideoProgressExistingQuery = Pick<AgoraVideoProgress, 'id' | 'status'> & {
  xp_awarded?: number
}
type VideoProgressTelemetryQuery = Pick<AgoraVideoProgress, 'status' | 'watched_seconds'> & {
  total_seconds?: number
}

// Reading progress query types
type ReadingProgressExistingQuery = Pick<AgoraReadingProgress, 'id' | 'status'>
type ReadingProgressTelemetryQuery = Pick<AgoraReadingProgress, 'status'>

// Session query types
type SessionDailyQuery = Pick<AgoraSession, 'started_at' | 'duration_minutes'> & {
  xp_earned?: number
}

// Certificate types
interface AgoraCertificate {
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
}

// Calendar event types from database
interface AgoraCalendarEventDB {
  id: string
  user_id: string
  title: string
  start_time: string
  end_time?: string
  event_type: 'study' | 'reading' | 'video' | 'chat' | 'deadline'
  description?: string
  xp_reward?: number
  completed: boolean
  completed_at?: string
  url?: string
  created_at: string
}

// Challenge progress from database
interface AgoraChallengeProgressDB {
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
  xp_claimed_at?: string
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

// ============================================
// Common Result Types
// ============================================

interface ActionResult {
  success?: boolean
  error?: string
}

interface ConsentActionResult extends ActionResult {
  alreadyAccepted?: boolean
}

interface BadgeActionResult extends ActionResult {
  alreadyHas?: boolean
  badges?: string[]
}

interface XpActionResult extends ActionResult {
  newXp?: number
  newLevel?: number
}

interface SessionActionResult extends ActionResult {
  newTotalTime?: number
  newTotalSessions?: number
  newStreak?: number
}

interface VideoProgressResult extends ActionResult {
  xpAwarded?: number
  alreadyCompleted?: boolean
  progressPercentage?: number
  status?: string
}

// Video progress query result type
interface VideoProgressMapEntry {
  video_id: string
  watched_seconds: number
  progress_percentage: number
  status: string
  completed_at: string | null
}

interface VideoProgressMapResult extends ActionResult {
  data?: Record<string, VideoProgressMapEntry>
}

interface ReadingProgressResult extends ActionResult {
  xpAwarded?: number
  alreadyCompleted?: boolean
  status?: string
}

// Reading progress map entry type
interface ReadingProgressMapEntry {
  reading_id: string
  status: string
  completed_at: string | null
  notes: string | null
  rating: number | null
}

interface ReadingProgressMapResult extends ActionResult {
  data?: Record<string, ReadingProgressMapEntry>
}

interface ChallengeProgressResult extends ActionResult {
  data?: AgoraChallengeProgressDB[]
}

interface ChallengeRewardResult extends ActionResult {
  xpAwarded?: number
  alreadyClaimed?: boolean
}

interface SyncChallengeResult extends ActionResult {
  syncedCount?: number
}

interface TelemetryResult extends ActionResult {
  data?: {
    videosCompleted: number
    totalVideos: number
    requiredVideosCompleted: number
    totalRequiredVideos: number
    totalVideoWatchTimeSeconds: number
    requiredVideoWatchTimeSeconds: number
    readingsCompleted: number
    totalReadings: number
    requiredReadingsCompleted: number
    totalRequiredReadings: number
    totalXp: number
    totalTimeMinutes: number
    totalSessions: number
    diaryEntries: number
    chatMessages: number
    currentStreak: number
  }
}

interface CalendarEventResult extends ActionResult {
  data?: AgoraCalendarEventDB[]
  event?: AgoraCalendarEventDB
}

interface CompleteCalendarEventResult extends ActionResult {
  xpAwarded?: number
  event?: AgoraCalendarEventDB
}

interface CertificateResult extends ActionResult {
  certificate?: AgoraCertificate
  alreadyExists?: boolean
}

interface AcademyUserData {
  id: string
  email: string
  name: string
  avatar: string
  githubUsername?: string
  totalXp: number
  currentLevel: number
  currentRank: string
  currentStreak: number
  longestStreak: number
  totalTimeMinutes: number
  totalSessions: number
  hasAcceptedLgpd: boolean
  badges: string[]
  xpTransactions: AgoraXpTransaction[]
}

interface AcademyUserDataResult extends ActionResult {
  data?: AcademyUserData
}

interface DailyActivityResult extends ActionResult {
  data?: Array<{ date: string; minutes: number; sessions: number; xp: number }>
}

interface VerifyCertificateResult extends ActionResult {
  valid?: boolean
  certificate?: AgoraCertificate
}

// ============================================
// XP & Progress Actions
// ============================================

export async function addXp(
  amount: number,
  description: string,
  sourceType?: string
): Promise<XpActionResult> {
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
      .single<ProfileXpQuery>()

    const currentXp = profile?.total_xp ?? 0
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

export async function recordSession(durationMinutes: number): Promise<SessionActionResult> {
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
      .select('total_time_minutes, total_sessions, current_streak, last_activity_date')
      .eq('user_id', user.id)
      .single<ProfileSessionQuery>()

    const today = new Date().toISOString().split('T')[0]
    const lastSession = profile?.last_activity_date ?? null
    let newStreak = profile?.current_streak ?? 0

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

    // Update profile - use last_activity_date for consistency
    await supabase
      .from('agora_profiles')
      .update({
        total_time_minutes: (profile?.total_time_minutes ?? 0) + durationMinutes,
        total_sessions: (profile?.total_sessions ?? 0) + 1,
        current_streak: newStreak,
        last_activity_date: today,
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

export async function acceptLgpdConsent(): Promise<ConsentActionResult> {
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
      .single<{ id: string }>()

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
    const metadata = (user.user_metadata ?? {}) as UserMetadata
    await supabase.from('agora_profiles').upsert(
      {
        user_id: user.id,
        email: user.email,
        full_name: metadata.full_name ?? metadata.name ?? 'Estudante',
        avatar_url: metadata.avatar_url,
        github_username: metadata.user_name,
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

/**
 * Award a badge to the user
 * Badges are stored as JSONB array in agora_profiles.badges
 * Each badge is stored as its ID string
 */
export async function awardBadge(badgeId: string, badgeName: string): Promise<BadgeActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current badges from profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('badges')
      .eq('user_id', user.id)
      .single<ProfileBadgesQuery>()

    const currentBadges: string[] = profile?.badges ?? []

    // Check if already has badge
    if (currentBadges.includes(badgeId)) {
      return { success: true, alreadyHas: true }
    }

    // Add badge to array
    const updatedBadges = [...currentBadges, badgeId]

    await supabase
      .from('agora_profiles')
      .update({
        badges: updatedBadges,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Add XP for badge
    await addXp(50, `Badge ${badgeName} conquistado!`, 'badge')

    revalidatePath('/pt/agora')
    return { success: true, badges: updatedBadges }
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
): Promise<VideoProgressResult> {
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
      .single<VideoProgressExistingQuery>()

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
        xp_awarded: completed && !alreadyCompleted ? 25 : (existing?.xp_awarded ?? 0),
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
            .single<{ total_videos_completed?: number }>()
          await supabase
            .from('agora_profiles')
            .update({
              total_videos_completed: (profile?.total_videos_completed ?? 0) + 1,
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

export async function getVideoProgress(): Promise<VideoProgressMapResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('agora_video_progress')
      .select('video_id, watched_seconds, progress_percentage, status, completed_at')
      .eq('user_id', user.id)

    if (error) throw error

    const progressMap: Record<string, VideoProgressMapEntry> = {}

    const typedData = (data ?? []) as VideoProgressMapEntry[]
    typedData.forEach((p) => {
      progressMap[p.video_id] = p
    })

    return { success: true, data: progressMap }
  } catch (error) {
    console.error('Failed to get video progress:', error)
    return { error: 'Failed to get video progress' }
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
): Promise<ReadingProgressResult> {
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
      .single<ReadingProgressExistingQuery>()

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

export async function getReadingProgress(): Promise<ReadingProgressMapResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('agora_reading_progress')
      .select('reading_id, status, completed_at, notes, rating')
      .eq('user_id', user.id)

    if (error) throw error

    const progressMap: Record<string, ReadingProgressMapEntry> = {}

    const typedData = (data ?? []) as ReadingProgressMapEntry[]
    typedData.forEach((p) => {
      progressMap[p.reading_id] = p
    })

    return { success: true, data: progressMap }
  } catch (error) {
    console.error('Failed to get reading progress:', error)
    return { error: 'Failed to get reading progress' }
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
  holderName: string // Name to appear on public certificate
}): Promise<CertificateResult> {
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
      .single<ProfileDatesQuery>()

    const enrolledDate = profile?.enrolled_at ? profile.enrolled_at.split('T')[0] : null
    const programStartDate =
      profile?.program_start_date ?? enrolledDate ?? new Date().toISOString().split('T')[0]
    const programEndDate = new Date().toISOString().split('T')[0]

    // Insert certificate (user's private copy - deleted with account)
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
        verification_url: `https://cidadao.ai/pt/agora/verificar?code=${certificateData.certificateNumber}`,
      })
      .select()
      .single<AgoraCertificate>()

    if (error) throw error

    // Save to public certificates table (survives account deletion)
    // This requires service role - call via API
    try {
      await fetch('/api/certificate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode: certificateData.certificateNumber,
          verificationHash: certificateData.verificationHash,
          holderName: certificateData.holderName,
          certificateType: certificateData.certificateType,
          totalHours: certificateData.totalHours,
          totalXp: certificateData.totalXp,
          finalLevel: certificateData.finalLevel,
          finalRank: certificateData.finalRank,
          missionsCompleted: certificateData.missionsCompleted,
          programStartDate,
          programEndDate,
        }),
      })
    } catch (publicError) {
      // Log but don't fail - user still gets their certificate
      console.error('Failed to register public certificate:', publicError)
    }

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

export async function getCertificates(): Promise<ActionResult & { data?: AgoraCertificate[] }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('agora_certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data as AgoraCertificate[] }
  } catch (error) {
    console.error('Failed to get certificates:', error)
    return { error: 'Failed to get certificates' }
  }
}

// ============================================
// Telemetry Actions (for certificate validation)
// ============================================

export async function getTelemetryData(): Promise<TelemetryResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get video progress
    const { data: videoProgress } = await supabase
      .from('agora_video_progress')
      .select('status, watched_seconds, total_seconds')
      .eq('user_id', user.id)

    const typedVideoProgress = (videoProgress ?? []) as VideoProgressTelemetryQuery[]
    const videosCompleted = typedVideoProgress.filter((v) => v.status === 'completed').length
    const totalVideoWatchTime = typedVideoProgress.reduce(
      (sum, v) => sum + (v.watched_seconds ?? 0),
      0
    )

    // Get reading progress
    const { data: readingProgress } = await supabase
      .from('agora_reading_progress')
      .select('status')
      .eq('user_id', user.id)

    const typedReadingProgress = (readingProgress ?? []) as ReadingProgressTelemetryQuery[]
    const readingsCompleted = typedReadingProgress.filter((r) => r.status === 'completed').length

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

    const typedChatXp = (chatXp ?? []) as Array<{ id: string }>
    const chatMessages = typedChatXp.length * 5

    // Get profile data
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('total_xp, total_time_minutes, current_streak')
      .eq('user_id', user.id)
      .single<ProfileTelemetryQuery>()

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
        totalXp: profile?.total_xp ?? 0,
        totalTimeMinutes: profile?.total_time_minutes ?? 0,
        totalSessions: sessionsCount ?? 0,
        diaryEntries: diaryCount ?? 0,
        chatMessages,
        currentStreak: profile?.current_streak ?? 0,
      },
    }
  } catch (error) {
    console.error('Failed to get telemetry data:', error)
    return { error: 'Failed to get telemetry data' }
  }
}

/**
 * Get daily activity data for charts
 * Returns sessions grouped by date with total time
 */
export async function getDailyActivityData(): Promise<DailyActivityResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get sessions from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: sessions, error } = await supabase
      .from('agora_sessions')
      .select('started_at, duration_minutes, xp_earned')
      .eq('user_id', user.id)
      .gte('started_at', thirtyDaysAgo.toISOString())
      .order('started_at', { ascending: true })

    if (error) throw error

    // Group by date
    const dailyData: Record<
      string,
      { date: string; minutes: number; xp: number; sessions: number }
    > = {}

    const typedSessions = (sessions ?? []) as SessionDailyQuery[]
    typedSessions.forEach((session) => {
      const date = session.started_at.split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { date, minutes: 0, xp: 0, sessions: 0 }
      }
      dailyData[date].minutes += session.duration_minutes ?? 0
      dailyData[date].xp += session.xp_earned ?? 0
      dailyData[date].sessions += 1
    })

    // Convert to array sorted by date
    const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))

    return { success: true, data: chartData }
  } catch (error) {
    console.error('Failed to get daily activity data:', error)
    return { error: 'Failed to get daily activity data' }
  }
}

// ============================================
// Data Fetching (for Server Components)
// ============================================

export async function getAcademyUserData(): Promise<AcademyUserDataResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single<AgoraProfile>()

    // Fetch consent
    const { data: consent } = await supabase
      .from('agora_consent')
      .select('id')
      .eq('user_id', user.id)
      .single<{ id: string }>()

    // Badges are stored as JSONB array in profile
    // We'll return the array of badge IDs from the profile
    const badges: string[] = profile?.badges ?? []

    // Fetch recent XP transactions
    const { data: xpTransactions } = await supabase
      .from('agora_xp_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const metadata = (user.user_metadata ?? {}) as UserMetadata
    const typedXpTransactions = (xpTransactions ?? []) as AgoraXpTransaction[]

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email ?? '',
        name: profile?.full_name ?? metadata.full_name ?? metadata.name ?? 'Estudante',
        avatar:
          profile?.avatar_url ??
          metadata.avatar_url ??
          `https://ui-avatars.com/api/?name=Estudante&background=f59e0b&color=fff`,
        githubUsername: profile?.github_username ?? metadata.user_name,
        totalXp: profile?.total_xp ?? 0,
        currentLevel: profile?.current_level ?? 1,
        currentRank: profile?.current_rank ?? 'novato',
        currentStreak: profile?.current_streak ?? 0,
        longestStreak: profile?.longest_streak ?? 0,
        totalTimeMinutes: profile?.total_time_minutes ?? 0,
        totalSessions: profile?.total_sessions ?? 0,
        hasAcceptedLgpd: !!consent,
        badges,
        xpTransactions: typedXpTransactions,
      },
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return { error: 'Failed to fetch user data' }
  }
}

// ============================================
// Calendar Events (Diary/Agenda)
// ============================================

export interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time?: string
  event_type: 'study' | 'reading' | 'video' | 'chat' | 'deadline'
  description?: string
  xp_reward?: number
  completed?: boolean
  url?: string
  created_at?: string
}

/**
 * Get all calendar events for the authenticated user
 */
export async function getCalendarEvents(): Promise<CalendarEventResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data: events, error } = await supabase
      .from('agora_calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    if (error) throw error

    return { success: true, data: (events ?? []) as AgoraCalendarEventDB[] }
  } catch (error) {
    console.error('Failed to get calendar events:', error)
    return { error: 'Failed to get calendar events' }
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  event: Omit<CalendarEvent, 'id' | 'created_at'>
): Promise<CalendarEventResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('agora_calendar_events')
      .insert({
        user_id: user.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_type,
        description: event.description,
        xp_reward: event.xp_reward ?? 10,
        completed: false,
        url: event.url,
      })
      .select()
      .single<AgoraCalendarEventDB>()

    if (error) throw error

    return { success: true, event: data }
  } catch (error) {
    console.error('Failed to create calendar event:', error)
    return { error: 'Failed to create calendar event' }
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>
): Promise<CalendarEventResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('agora_calendar_events')
      .update(updates)
      .eq('id', eventId)
      .eq('user_id', user.id) // Security: only update own events
      .select()
      .single<AgoraCalendarEventDB>()

    if (error) throw error

    return { success: true, event: data }
  } catch (error) {
    console.error('Failed to update calendar event:', error)
    return { error: 'Failed to update calendar event' }
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('agora_calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id) // Security: only delete own events

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to delete calendar event:', error)
    return { error: 'Failed to delete calendar event' }
  }
}

/**
 * Mark a calendar event as completed and award XP
 */
export async function completeCalendarEvent(eventId: string): Promise<CompleteCalendarEventResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get the event to know XP reward
    const { data: event, error: fetchError } = await supabase
      .from('agora_calendar_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single<AgoraCalendarEventDB>()

    if (fetchError) throw fetchError
    if (!event) return { error: 'Event not found' }
    if (event.completed) return { error: 'Event already completed' }

    // Mark as completed
    const { error: updateError } = await supabase
      .from('agora_calendar_events')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', eventId)

    if (updateError) throw updateError

    // Award XP
    const xpReward = event.xp_reward ?? 10

    // Get current profile for balance
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('total_xp, current_level')
      .eq('user_id', user.id)
      .single<ProfileXpQuery>()

    const currentXp = profile?.total_xp ?? 0
    const newXp = currentXp + xpReward
    const newLevel = Math.floor(newXp / 100) + 1

    let newRank = 'novato'
    if (newXp >= 5000) newRank = 'arquiteto'
    else if (newXp >= 2000) newRank = 'mentor'
    else if (newXp >= 500) newRank = 'contribuidor'
    else if (newXp >= 100) newRank = 'aprendiz'

    // Update profile
    await supabase
      .from('agora_profiles')
      .update({
        total_xp: newXp,
        current_level: newLevel,
        current_rank: newRank,
        last_activity_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', user.id)

    // Log XP transaction
    await supabase.from('agora_xp_transactions').insert({
      user_id: user.id,
      amount: xpReward,
      balance_after: newXp,
      source_type: 'calendar_event',
      description: `Evento concluido: ${event.title}`,
    })

    return { success: true, xpAwarded: xpReward, event: { ...event, completed: true } }
  } catch (error) {
    console.error('Failed to complete calendar event:', error)
    return { error: 'Failed to complete calendar event' }
  }
}

// ============================================
// Challenge Progress Actions
// ============================================

export interface ChallengeProgress {
  id: string
  challenge_id: string
  challenge_type: 'daily' | 'weekly'
  current_progress: number
  target_value: number
  is_completed: boolean
  completed_at: string | null
  xp_reward: number
  xp_claimed: boolean
  period_start: string
  period_end: string
}

/**
 * Get the current period dates for a challenge type
 */
function getChallengePeriod(type: 'daily' | 'weekly'): { start: string; end: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (type === 'daily') {
    const dateStr = today.toISOString().split('T')[0]
    return { start: dateStr, end: dateStr }
  } else {
    // Weekly - starts on Monday
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    }
  }
}

/**
 * Get all active challenges for the current period
 */
export async function getChallengeProgress(): Promise<ChallengeProgressResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const dailyPeriod = getChallengePeriod('daily')
    const weeklyPeriod = getChallengePeriod('weekly')

    const { data, error } = await supabase
      .from('agora_challenge_progress')
      .select('*')
      .eq('user_id', user.id)
      .or(
        `and(challenge_type.eq.daily,period_start.eq.${dailyPeriod.start}),and(challenge_type.eq.weekly,period_start.eq.${weeklyPeriod.start})`
      )

    if (error) throw error

    return { success: true, data: (data ?? []) as AgoraChallengeProgressDB[] }
  } catch (error) {
    console.error('Failed to get challenge progress:', error)
    return { error: 'Failed to get challenge progress' }
  }
}

/**
 * Update or create challenge progress
 */
export async function updateChallengeProgress(
  challengeId: string,
  challengeType: 'daily' | 'weekly',
  currentProgress: number,
  targetValue: number,
  xpReward: number
): Promise<ActionResult & { data?: AgoraChallengeProgressDB; isCompleted?: boolean }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const period = getChallengePeriod(challengeType)
    const isCompleted = currentProgress >= targetValue

    const { data, error } = await supabase
      .from('agora_challenge_progress')
      .upsert(
        {
          user_id: user.id,
          challenge_id: challengeId,
          challenge_type: challengeType,
          current_progress: currentProgress,
          target_value: targetValue,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          xp_reward: xpReward,
          period_start: period.start,
          period_end: period.end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,challenge_id,period_start' }
      )
      .select()
      .single<AgoraChallengeProgressDB>()

    if (error) throw error

    return { success: true, data, isCompleted }
  } catch (error) {
    console.error('Failed to update challenge progress:', error)
    return { error: 'Failed to update challenge progress' }
  }
}

/**
 * Claim XP reward for a completed challenge
 */
export async function claimChallengeReward(
  challengeId: string,
  periodStart: string
): Promise<ChallengeRewardResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get the challenge
    const { data: challenge, error: fetchError } = await supabase
      .from('agora_challenge_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('period_start', periodStart)
      .single<AgoraChallengeProgressDB>()

    if (fetchError) throw fetchError
    if (!challenge) return { error: 'Challenge not found' }
    if (!challenge.is_completed) return { error: 'Challenge not completed' }
    if (challenge.xp_claimed) return { error: 'Reward already claimed', alreadyClaimed: true }

    // Mark as claimed
    const { error: updateError } = await supabase
      .from('agora_challenge_progress')
      .update({
        xp_claimed: true,
        xp_claimed_at: new Date().toISOString(),
      })
      .eq('id', challenge.id)

    if (updateError) throw updateError

    // Award XP
    const xpReward = challenge.xp_reward ?? 0
    if (xpReward > 0) {
      await addXp(xpReward, `Desafio concluído: ${challengeId}`, 'challenge')
    }

    revalidatePath('/pt/agora')
    return { success: true, xpAwarded: xpReward }
  } catch (error) {
    console.error('Failed to claim challenge reward:', error)
    return { error: 'Failed to claim challenge reward' }
  }
}

/**
 * Batch update multiple challenges at once
 * Used when syncing local state with server
 */
export async function syncChallengeProgress(
  challenges: Array<{
    challengeId: string
    challengeType: 'daily' | 'weekly'
    currentProgress: number
    targetValue: number
    xpReward: number
  }>
): Promise<SyncChallengeResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const results = await Promise.all(
      challenges.map((c) =>
        updateChallengeProgress(
          c.challengeId,
          c.challengeType,
          c.currentProgress,
          c.targetValue,
          c.xpReward
        )
      )
    )

    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.warn('Some challenges failed to sync:', errors)
    }

    return { success: true, syncedCount: results.filter((r) => r.success).length }
  } catch (error) {
    console.error('Failed to sync challenge progress:', error)
    return { error: 'Failed to sync challenge progress' }
  }
}
