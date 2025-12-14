/**
 * Tests for Agora Analytics Tracker
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const mockTrackEvent = vi.hoisted(() => vi.fn())
const mockHasUserConsent = vi.hoisted(() => vi.fn().mockReturnValue(true))

vi.mock('./posthog-config', () => ({
  trackEvent: mockTrackEvent,
  hasUserConsent: mockHasUserConsent,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
  },
}))

// Import after mocks
import {
  trackAgendaView,
  trackAgendaEventCreated,
  trackAgendaEventCompleted,
  trackAgendaEventDeleted,
  trackAgendaViewChange,
  trackGoogleCalendarExport,
  trackStudySession,
  trackContentProgress,
  trackVideoCompleted,
  trackReadingCompleted,
  trackDiaryEntryCreated,
  trackMilestone,
  trackLevelUp,
  trackBadgeEarned,
  trackRankUp,
  trackStreakMilestone,
  trackCertificateDownload,
  trackReportDownload,
  trackMentorChat,
  trackTrackEnrollment,
  trackTrackCompleted,
} from './agora-tracker'

describe('Agora Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackAgendaView', () => {
    it('should track agenda view event', () => {
      trackAgendaView()

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_viewed',
        expect.objectContaining({
          component: 'agenda',
          action: 'view',
        })
      )
    })
  })

  describe('trackAgendaEventCreated', () => {
    it('should track agenda event creation', () => {
      trackAgendaEventCreated({
        eventType: 'study',
        eventTitle: 'Study Session',
        duration: 60,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_event_created',
        expect.objectContaining({
          component: 'agenda',
          action: 'create',
          event_type: 'study',
          event_title: 'Study Session',
        })
      )
    })
  })

  describe('trackAgendaEventCompleted', () => {
    it('should track agenda event completion with XP', () => {
      trackAgendaEventCompleted({
        eventType: 'video',
        eventTitle: 'Watch Tutorial',
        duration: 30,
        xpEarned: 50,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_event_completed',
        expect.objectContaining({
          component: 'agenda',
          action: 'complete',
          xp_earned: 50,
        })
      )
    })
  })

  describe('trackAgendaEventDeleted', () => {
    it('should track agenda event deletion', () => {
      trackAgendaEventDeleted({
        eventType: 'reading',
        eventTitle: 'Read Article',
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_event_deleted',
        expect.objectContaining({
          component: 'agenda',
          action: 'delete',
        })
      )
    })
  })

  describe('trackAgendaViewChange', () => {
    it('should track view change to month', () => {
      trackAgendaViewChange('month')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_view_changed',
        expect.objectContaining({
          view_type: 'month',
        })
      )
    })

    it('should track view change to week', () => {
      trackAgendaViewChange('week')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_view_changed',
        expect.objectContaining({
          view_type: 'week',
        })
      )
    })
  })

  describe('trackGoogleCalendarExport', () => {
    it('should track Google Calendar export', () => {
      trackGoogleCalendarExport(5)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_agenda_google_export',
        expect.objectContaining({
          event_count: 5,
        })
      )
    })
  })

  describe('trackStudySession', () => {
    it('should track study session completion', () => {
      trackStudySession({
        duration: 45,
        activities: ['video', 'reading'],
        xpEarned: 100,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_study_session',
        expect.objectContaining({
          component: 'study',
          duration_minutes: 45,
          xp_earned: 100,
        })
      )
    })
  })

  describe('trackContentProgress', () => {
    it('should track content progress', () => {
      trackContentProgress({
        contentType: 'video',
        contentId: 'video-123',
        contentTitle: 'Introduction',
        progress: 50,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_content_progress',
        expect.objectContaining({
          component: 'content',
          action: 'progress',
          progress_percent: 50,
        })
      )
    })

    it('should track completed content', () => {
      trackContentProgress({
        contentType: 'reading',
        contentId: 'reading-123',
        contentTitle: 'Article',
        progress: 100,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_content_progress',
        expect.objectContaining({
          action: 'completed',
        })
      )
    })
  })

  describe('trackVideoCompleted', () => {
    it('should track video completion', () => {
      trackVideoCompleted('video-123', 'Tutorial', 600)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_video_completed',
        expect.objectContaining({
          video_id: 'video-123',
          video_title: 'Tutorial',
          duration_seconds: 600,
        })
      )
    })
  })

  describe('trackReadingCompleted', () => {
    it('should track reading completion', () => {
      trackReadingCompleted('reading-123', 'Article Title')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_reading_completed',
        expect.objectContaining({
          reading_id: 'reading-123',
          reading_title: 'Article Title',
        })
      )
    })
  })

  describe('trackDiaryEntryCreated', () => {
    it('should track diary entry creation', () => {
      trackDiaryEntryCreated('happy', 150)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_diary_entry_created',
        expect.objectContaining({
          mood: 'happy',
          word_count: 150,
        })
      )
    })
  })

  describe('trackMilestone', () => {
    it('should track milestone achievement', () => {
      trackMilestone({
        milestoneType: 'level_up',
        previousValue: 1,
        newValue: 2,
        xpTotal: 1000,
      })

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_milestone_achieved',
        expect.objectContaining({
          milestone_type: 'level_up',
          new_value: 2,
        })
      )
    })
  })

  describe('trackLevelUp', () => {
    it('should track level up', () => {
      trackLevelUp(5, 6, 5000)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_milestone_achieved',
        expect.objectContaining({
          milestone_type: 'level_up',
          previous_value: 5,
          new_value: 6,
        })
      )
    })
  })

  describe('trackBadgeEarned', () => {
    it('should track badge earned', () => {
      trackBadgeEarned('first-video', 'First Video')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_badge_earned',
        expect.objectContaining({
          badge_id: 'first-video',
          badge_name: 'First Video',
        })
      )
    })
  })

  describe('trackRankUp', () => {
    it('should track rank advancement', () => {
      trackRankUp('novato', 'aprendiz', 5)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_milestone_achieved',
        expect.objectContaining({
          milestone_type: 'rank_up',
        })
      )
    })
  })

  describe('trackStreakMilestone', () => {
    it('should track streak milestone', () => {
      trackStreakMilestone(7)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_milestone_achieved',
        expect.objectContaining({
          milestone_type: 'streak',
          new_value: 7,
        })
      )
    })
  })

  describe('trackCertificateDownload', () => {
    it('should track certificate download', () => {
      trackCertificateDownload(10, 5)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_certificate_downloaded',
        expect.objectContaining({
          total_hours: 10,
          level: 5,
        })
      )
    })
  })

  describe('trackReportDownload', () => {
    it('should track report download', () => {
      trackReportDownload(15, 3000)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_report_downloaded',
        expect.objectContaining({
          total_hours: 15,
          total_xp: 3000,
        })
      )
    })
  })

  describe('trackMentorChat', () => {
    it('should track mentor chat interaction', () => {
      trackMentorChat('machado', 5)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_mentor_chat',
        expect.objectContaining({
          agent_id: 'machado',
          message_count: 5,
        })
      )
    })
  })

  describe('trackTrackEnrollment', () => {
    it('should track track enrollment', () => {
      trackTrackEnrollment('track-1', 'Transparency Basics')

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_track_enrolled',
        expect.objectContaining({
          track_id: 'track-1',
          track_name: 'Transparency Basics',
        })
      )
    })
  })

  describe('trackTrackCompleted', () => {
    it('should track track completion', () => {
      trackTrackCompleted('track-1', 'Transparency Basics', 500)

      expect(mockTrackEvent).toHaveBeenCalledWith(
        'agora_track_completed',
        expect.objectContaining({
          track_id: 'track-1',
          track_name: 'Transparency Basics',
          total_xp: 500,
        })
      )
    })
  })
})
