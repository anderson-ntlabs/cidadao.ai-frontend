/**
 * Kids Activity Tracker
 *
 * Tracks children's activity for parent reports ONLY.
 * Does NOT send data to PostHog or any external analytics.
 * All data is stored locally and in Supabase (parent access only).
 *
 * Privacy-first, LGPD/ECA compliant:
 * - No external tracking
 * - Data only accessible to authenticated parent
 * - Stored in kids_sessions table
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-09
 */

import { logger } from '@/lib/logger'
import type { KidsTelemetryData } from '@/lib/agora/kids-certificate-requirements'

// Local storage keys for session tracking
const KIDS_SESSION_KEY = 'agora_kids_current_session'
const KIDS_ACTIVITY_KEY = 'agora_kids_activity_log'

interface KidsActivityEvent {
  type: 'video_watched' | 'video_progress' | 'chat_message' | 'session_start' | 'session_end'
  timestamp: string
  data: Record<string, any>
}

interface KidsSession {
  id: string
  startedAt: string
  endedAt?: string
  videosWatched: string[]
  agentsInteracted: string[]
  events: KidsActivityEvent[]
}

/**
 * Start a new Kids session
 * Called when child enters Kids area
 */
export function startKidsSession(profileId: string): string {
  const sessionId = `kids-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const session: KidsSession = {
    id: sessionId,
    startedAt: new Date().toISOString(),
    videosWatched: [],
    agentsInteracted: [],
    events: [
      {
        type: 'session_start',
        timestamp: new Date().toISOString(),
        data: { profileId },
      },
    ],
  }

  localStorage.setItem(KIDS_SESSION_KEY, JSON.stringify(session))

  logger.info('[Kids Tracker] Session started', { sessionId, profileId })

  return sessionId
}

/**
 * End current Kids session
 * Called when child exits Kids area or logs out
 */
export function endKidsSession(): KidsSession | null {
  const sessionData = localStorage.getItem(KIDS_SESSION_KEY)
  if (!sessionData) return null

  const session: KidsSession = JSON.parse(sessionData)
  session.endedAt = new Date().toISOString()
  session.events.push({
    type: 'session_end',
    timestamp: new Date().toISOString(),
    data: {},
  })

  // Save to activity log for later sync
  saveSessionToActivityLog(session)

  // Clear current session
  localStorage.removeItem(KIDS_SESSION_KEY)

  logger.info('[Kids Tracker] Session ended', {
    sessionId: session.id,
    duration: calculateSessionDuration(session),
    videosWatched: session.videosWatched.length,
  })

  return session
}

/**
 * Track video watched
 */
export function trackKidsVideoWatched(
  videoId: string,
  videoTitle: string,
  durationSeconds: number
) {
  const session = getCurrentSession()
  if (!session) return

  if (!session.videosWatched.includes(videoId)) {
    session.videosWatched.push(videoId)
  }

  session.events.push({
    type: 'video_watched',
    timestamp: new Date().toISOString(),
    data: { videoId, videoTitle, durationSeconds },
  })

  saveCurrentSession(session)

  logger.debug('[Kids Tracker] Video watched', { videoId, videoTitle })
}

/**
 * Track video progress (for partial watches)
 */
export function trackKidsVideoProgress(
  videoId: string,
  progressPercent: number,
  watchedSeconds: number
) {
  const session = getCurrentSession()
  if (!session) return

  session.events.push({
    type: 'video_progress',
    timestamp: new Date().toISOString(),
    data: { videoId, progressPercent, watchedSeconds },
  })

  saveCurrentSession(session)
}

/**
 * Track chat message with mentor
 */
export function trackKidsChatMessage(agentId: string, messageLength: number) {
  const session = getCurrentSession()
  if (!session) return

  if (!session.agentsInteracted.includes(agentId)) {
    session.agentsInteracted.push(agentId)
  }

  session.events.push({
    type: 'chat_message',
    timestamp: new Date().toISOString(),
    data: { agentId, messageLength },
  })

  saveCurrentSession(session)

  logger.debug('[Kids Tracker] Chat message', { agentId })
}

/**
 * Get current session
 */
function getCurrentSession(): KidsSession | null {
  const sessionData = localStorage.getItem(KIDS_SESSION_KEY)
  if (!sessionData) return null
  return JSON.parse(sessionData)
}

/**
 * Save current session to localStorage
 */
function saveCurrentSession(session: KidsSession) {
  localStorage.setItem(KIDS_SESSION_KEY, JSON.stringify(session))
}

/**
 * Save completed session to activity log
 */
function saveSessionToActivityLog(session: KidsSession) {
  const logData = localStorage.getItem(KIDS_ACTIVITY_KEY)
  const log: KidsSession[] = logData ? JSON.parse(logData) : []

  log.push(session)

  // Keep only last 100 sessions
  if (log.length > 100) {
    log.splice(0, log.length - 100)
  }

  localStorage.setItem(KIDS_ACTIVITY_KEY, JSON.stringify(log))
}

/**
 * Calculate session duration in minutes
 */
function calculateSessionDuration(session: KidsSession): number {
  if (!session.endedAt) return 0
  const start = new Date(session.startedAt).getTime()
  const end = new Date(session.endedAt).getTime()
  return Math.round((end - start) / 60000)
}

/**
 * Get all activity logs (for parent report)
 */
export function getKidsActivityLog(): KidsSession[] {
  const logData = localStorage.getItem(KIDS_ACTIVITY_KEY)
  return logData ? JSON.parse(logData) : []
}

/**
 * Calculate telemetry from activity log
 */
export function calculateKidsTelemetry(): KidsTelemetryData {
  const sessions = getKidsActivityLog()
  const currentSession = getCurrentSession()

  // Combine all sessions including current
  const allSessions = currentSession ? [...sessions, currentSession] : sessions

  // Calculate unique videos watched
  const videosWatched = new Set<string>()
  let totalVideoWatchTimeSeconds = 0
  let mentorConversations = 0
  const agentsInteracted = new Set<string>()
  const daysActive = new Set<string>()
  let totalTimeMinutes = 0

  allSessions.forEach((session) => {
    // Add session day
    const sessionDate = new Date(session.startedAt).toDateString()
    daysActive.add(sessionDate)

    // Add session duration
    totalTimeMinutes += calculateSessionDuration(session)

    // Process events
    session.events.forEach((event) => {
      switch (event.type) {
        case 'video_watched':
          videosWatched.add(event.data.videoId)
          totalVideoWatchTimeSeconds += event.data.durationSeconds || 0
          break
        case 'video_progress':
          totalVideoWatchTimeSeconds += event.data.watchedSeconds || 0
          break
        case 'chat_message':
          mentorConversations++
          agentsInteracted.add(event.data.agentId)
          break
      }
    })
  })

  // Determine favorite agent
  const agentCounts: Record<string, number> = {}
  allSessions.forEach((session) => {
    session.events
      .filter((e) => e.type === 'chat_message')
      .forEach((e) => {
        agentCounts[e.data.agentId] = (agentCounts[e.data.agentId] || 0) + 1
      })
  })

  let favoriteAgent: 'lobato' | 'tarsila' | null = null
  if (agentCounts['monteiro-lobato'] > (agentCounts['tarsila-amaral'] || 0)) {
    favoriteAgent = 'lobato'
  } else if (agentCounts['tarsila-amaral'] > 0) {
    favoriteAgent = 'tarsila'
  }

  return {
    videosWatched: videosWatched.size,
    totalVideos: 15, // From kids-videos.ts
    totalVideoWatchTimeSeconds,
    mentorConversations,
    daysActive: daysActive.size,
    totalTimeMinutes,
    totalSessions: allSessions.length,
    favoriteAgent,
  }
}

/**
 * Get list of watched video IDs
 * Useful for tracking progress across video tracks
 */
export function getWatchedVideoIds(): string[] {
  const sessions = getKidsActivityLog()
  const currentSession = getCurrentSession()

  const allSessions = currentSession ? [...sessions, currentSession] : sessions

  const videosWatched = new Set<string>()

  allSessions.forEach((session) => {
    session.events.forEach((event) => {
      if (event.type === 'video_watched') {
        videosWatched.add(event.data.videoId)
      }
    })
  })

  return Array.from(videosWatched)
}

/**
 * Clear all Kids activity data
 * Called when parent disables Kids mode
 */
export function clearKidsActivityData() {
  localStorage.removeItem(KIDS_SESSION_KEY)
  localStorage.removeItem(KIDS_ACTIVITY_KEY)
  logger.info('[Kids Tracker] Activity data cleared')
}

/**
 * Get daily activity summary for parent report
 */
export function getDailyActivitySummary(): Array<{
  date: string
  minutes: number
  videosWatched: number
  chatMessages: number
}> {
  const sessions = getKidsActivityLog()
  const dailyMap = new Map<
    string,
    { minutes: number; videosWatched: Set<string>; chatMessages: number }
  >()

  sessions.forEach((session) => {
    const date = new Date(session.startedAt).toISOString().split('T')[0]

    if (!dailyMap.has(date)) {
      dailyMap.set(date, { minutes: 0, videosWatched: new Set(), chatMessages: 0 })
    }

    const daily = dailyMap.get(date)!
    daily.minutes += calculateSessionDuration(session)

    session.events.forEach((event) => {
      if (event.type === 'video_watched') {
        daily.videosWatched.add(event.data.videoId)
      } else if (event.type === 'chat_message') {
        daily.chatMessages++
      }
    })
  })

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      minutes: data.minutes,
      videosWatched: data.videosWatched.size,
      chatMessages: data.chatMessages,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
