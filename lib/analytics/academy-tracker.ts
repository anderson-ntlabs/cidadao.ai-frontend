/**
 * Academy Analytics Tracker
 *
 * Tracks user interactions within the Academy module for:
 * - Agenda events (create, complete, delete)
 * - Study sessions
 * - Content consumption
 * - Gamification milestones
 *
 * Uses PostHog for privacy-first, LGPD-compliant tracking
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

import { trackEvent, hasUserConsent } from './posthog-config'
import { logger } from '@/lib/logger'

/**
 * Wrapper for trackEvent with development logging
 * Helps verify telemetry is working correctly
 */
function trackAcademyEvent(eventName: string, properties: Record<string, any>) {
  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    const hasConsent = hasUserConsent()
    logger.debug(`[Academy Telemetry] ${eventName}`, {
      context: 'AcademyTracker',
      eventName,
      properties,
      hasConsent,
      willSend: hasConsent,
    })

    // Log to console for easy browser verification
    console.log(
      `%c[Academy Telemetry] ${eventName}`,
      'background: #10b981; color: white; padding: 2px 6px; border-radius: 3px;',
      {
        ...properties,
        _consent: hasConsent ? '✅ ACCEPTED' : '❌ REJECTED',
        _willSend: hasConsent,
      }
    )
  }

  // Send to PostHog (respects consent internally)
  trackEvent(eventName, properties)
}

// Event types for structured tracking
export type AgendaEventType = 'study' | 'reading' | 'video' | 'chat' | 'deadline'

interface AgendaTrackingData {
  eventType: AgendaEventType
  eventTitle: string
  duration?: number // in minutes
  xpEarned?: number
}

interface StudySessionData {
  duration: number // in minutes
  activities: string[]
  xpEarned: number
}

interface ContentData {
  contentType: 'video' | 'reading' | 'diary'
  contentId: string
  contentTitle: string
  progress?: number // 0-100
}

interface MilestoneData {
  milestoneType: 'level_up' | 'badge_earned' | 'rank_up' | 'streak'
  previousValue?: number | string
  newValue: number | string
  xpTotal?: number
}

/**
 * Track agenda page view
 */
export function trackAgendaView() {
  trackAcademyEvent('academy_agenda_viewed', {
    component: 'agenda',
    action: 'view',
  })
}

/**
 * Track agenda event creation
 */
export function trackAgendaEventCreated(data: AgendaTrackingData) {
  trackAcademyEvent('academy_agenda_event_created', {
    component: 'agenda',
    action: 'create',
    event_type: data.eventType,
    event_title: data.eventTitle,
    duration_minutes: data.duration,
  })
}

/**
 * Track agenda event completion
 */
export function trackAgendaEventCompleted(data: AgendaTrackingData) {
  trackAcademyEvent('academy_agenda_event_completed', {
    component: 'agenda',
    action: 'complete',
    event_type: data.eventType,
    event_title: data.eventTitle,
    duration_minutes: data.duration,
    xp_earned: data.xpEarned,
  })
}

/**
 * Track agenda event deletion
 */
export function trackAgendaEventDeleted(data: AgendaTrackingData) {
  trackAcademyEvent('academy_agenda_event_deleted', {
    component: 'agenda',
    action: 'delete',
    event_type: data.eventType,
    event_title: data.eventTitle,
  })
}

/**
 * Track calendar view change
 */
export function trackAgendaViewChange(viewType: 'month' | 'week' | 'list') {
  trackAcademyEvent('academy_agenda_view_changed', {
    component: 'agenda',
    action: 'view_change',
    view_type: viewType,
  })
}

/**
 * Track Google Calendar export
 */
export function trackGoogleCalendarExport(eventCount: number) {
  trackAcademyEvent('academy_agenda_google_export', {
    component: 'agenda',
    action: 'export',
    event_count: eventCount,
  })
}

/**
 * Track study session
 */
export function trackStudySession(data: StudySessionData) {
  trackAcademyEvent('academy_study_session', {
    component: 'study',
    action: 'session_completed',
    duration_minutes: data.duration,
    activities: data.activities,
    xp_earned: data.xpEarned,
  })
}

/**
 * Track content consumption
 */
export function trackContentProgress(data: ContentData) {
  trackAcademyEvent('academy_content_progress', {
    component: 'content',
    action: data.progress === 100 ? 'completed' : 'progress',
    content_type: data.contentType,
    content_id: data.contentId,
    content_title: data.contentTitle,
    progress_percent: data.progress,
  })
}

/**
 * Track video completion
 */
export function trackVideoCompleted(videoId: string, videoTitle: string, durationSeconds: number) {
  trackAcademyEvent('academy_video_completed', {
    component: 'videos',
    action: 'complete',
    video_id: videoId,
    video_title: videoTitle,
    duration_seconds: durationSeconds,
  })
}

/**
 * Track reading completion
 */
export function trackReadingCompleted(readingId: string, readingTitle: string) {
  trackAcademyEvent('academy_reading_completed', {
    component: 'readings',
    action: 'complete',
    reading_id: readingId,
    reading_title: readingTitle,
  })
}

/**
 * Track diary entry creation
 */
export function trackDiaryEntryCreated(mood: string, wordCount: number) {
  trackAcademyEvent('academy_diary_entry_created', {
    component: 'diary',
    action: 'create',
    mood: mood,
    word_count: wordCount,
  })
}

/**
 * Track milestone achievement
 */
export function trackMilestone(data: MilestoneData) {
  trackAcademyEvent('academy_milestone_achieved', {
    component: 'gamification',
    action: 'milestone',
    milestone_type: data.milestoneType,
    previous_value: data.previousValue,
    new_value: data.newValue,
    xp_total: data.xpTotal,
  })
}

/**
 * Track level up
 */
export function trackLevelUp(previousLevel: number, newLevel: number, totalXp: number) {
  trackMilestone({
    milestoneType: 'level_up',
    previousValue: previousLevel,
    newValue: newLevel,
    xpTotal: totalXp,
  })
}

/**
 * Track badge earned
 */
export function trackBadgeEarned(badgeId: string, badgeName: string) {
  trackAcademyEvent('academy_badge_earned', {
    component: 'gamification',
    action: 'badge',
    badge_id: badgeId,
    badge_name: badgeName,
  })
}

/**
 * Track rank advancement
 */
export function trackRankUp(previousRank: string, newRank: string, level: number) {
  trackMilestone({
    milestoneType: 'rank_up',
    previousValue: previousRank,
    newValue: newRank,
  })
}

/**
 * Track streak milestone
 */
export function trackStreakMilestone(streakDays: number) {
  trackMilestone({
    milestoneType: 'streak',
    newValue: streakDays,
  })
}

/**
 * Track certificate download
 */
export function trackCertificateDownload(totalHours: number, level: number) {
  trackAcademyEvent('academy_certificate_downloaded', {
    component: 'certificate',
    action: 'download',
    total_hours: totalHours,
    level: level,
  })
}

/**
 * Track report download
 */
export function trackReportDownload(totalHours: number, totalXp: number) {
  trackAcademyEvent('academy_report_downloaded', {
    component: 'certificate',
    action: 'download_report',
    total_hours: totalHours,
    total_xp: totalXp,
  })
}

/**
 * Track chat interaction with mentor
 */
export function trackMentorChat(agentId: string, messageCount: number) {
  trackAcademyEvent('academy_mentor_chat', {
    component: 'chat',
    action: 'message',
    agent_id: agentId,
    message_count: messageCount,
  })
}

/**
 * Track track enrollment
 */
export function trackTrackEnrollment(trackId: string, trackName: string) {
  trackAcademyEvent('academy_track_enrolled', {
    component: 'tracks',
    action: 'enroll',
    track_id: trackId,
    track_name: trackName,
  })
}

/**
 * Track track completion
 */
export function trackTrackCompleted(trackId: string, trackName: string, totalXp: number) {
  trackAcademyEvent('academy_track_completed', {
    component: 'tracks',
    action: 'complete',
    track_id: trackId,
    track_name: trackName,
    total_xp: totalXp,
  })
}
