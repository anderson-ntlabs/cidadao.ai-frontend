/**
 * Tests for Kids Activity Tracker
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

import {
  startKidsSession,
  endKidsSession,
  trackKidsVideoWatched,
  trackKidsVideoProgress,
  trackKidsChatMessage,
  getKidsActivityLog,
  calculateKidsTelemetry,
  getWatchedVideoIds,
  clearKidsActivityData,
  getDailyActivitySummary,
} from './kids-tracker'

describe('Kids Activity Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  describe('startKidsSession', () => {
    it('should create a new session with unique ID', () => {
      const sessionId = startKidsSession('profile-123')

      expect(sessionId).toMatch(/^kids-\d+-[a-z0-9]+$/)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should store session data in localStorage', () => {
      startKidsSession('profile-123')

      const storedData = localStorageMock.setItem.mock.calls[0]
      expect(storedData[0]).toBe('agora_kids_current_session')

      const session = JSON.parse(storedData[1])
      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('startedAt')
      expect(session.videosWatched).toEqual([])
      expect(session.agentsInteracted).toEqual([])
      expect(session.events).toHaveLength(1)
      expect(session.events[0].type).toBe('session_start')
    })
  })

  describe('endKidsSession', () => {
    it('should return null when no session exists', () => {
      const result = endKidsSession()

      expect(result).toBeNull()
    })

    it('should end session and return data', () => {
      // Start a session first
      const sessionId = startKidsSession('profile-123')

      // Clear the mock to track end session calls
      localStorageMock.getItem.mockImplementationOnce(() =>
        JSON.stringify({
          id: sessionId,
          startedAt: new Date().toISOString(),
          videosWatched: [],
          agentsInteracted: [],
          events: [{ type: 'session_start', timestamp: new Date().toISOString(), data: {} }],
        })
      )

      const result = endKidsSession()

      expect(result).not.toBeNull()
      expect(result?.endedAt).toBeDefined()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('agora_kids_current_session')
    })
  })

  describe('trackKidsVideoWatched', () => {
    it('should not track when no session exists', () => {
      trackKidsVideoWatched('video-1', 'Test Video', 120)

      // No session, so no storage update beyond initial
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should track video when session exists', () => {
      // Setup session
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          id: 'session-1',
          startedAt: new Date().toISOString(),
          videosWatched: [],
          agentsInteracted: [],
          events: [],
        })
      )

      trackKidsVideoWatched('video-1', 'Test Video', 120)

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should not duplicate video IDs', () => {
      const session = {
        id: 'session-1',
        startedAt: new Date().toISOString(),
        videosWatched: ['video-1'],
        agentsInteracted: [],
        events: [],
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(session))

      trackKidsVideoWatched('video-1', 'Test Video', 120)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.videosWatched).toHaveLength(1)
    })
  })

  describe('trackKidsVideoProgress', () => {
    it('should track progress when session exists', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          id: 'session-1',
          startedAt: new Date().toISOString(),
          videosWatched: [],
          agentsInteracted: [],
          events: [],
        })
      )

      trackKidsVideoProgress('video-1', 50, 60)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      const progressEvent = savedData.events.find((e: any) => e.type === 'video_progress')
      expect(progressEvent.data.progressPercent).toBe(50)
      expect(progressEvent.data.watchedSeconds).toBe(60)
    })
  })

  describe('trackKidsChatMessage', () => {
    it('should track chat message and agent', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          id: 'session-1',
          startedAt: new Date().toISOString(),
          videosWatched: [],
          agentsInteracted: [],
          events: [],
        })
      )

      trackKidsChatMessage('monteiro-lobato', 50)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.agentsInteracted).toContain('monteiro-lobato')
      expect(savedData.events[0].type).toBe('chat_message')
    })

    it('should not duplicate agent IDs', () => {
      const session = {
        id: 'session-1',
        startedAt: new Date().toISOString(),
        videosWatched: [],
        agentsInteracted: ['monteiro-lobato'],
        events: [],
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(session))

      trackKidsChatMessage('monteiro-lobato', 30)

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
      expect(savedData.agentsInteracted).toHaveLength(1)
    })
  })

  describe('getKidsActivityLog', () => {
    it('should return empty array when no log exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const log = getKidsActivityLog()

      expect(log).toEqual([])
    })

    it('should return parsed log data', () => {
      const mockLog = [{ id: 'session-1', startedAt: '2025-01-01' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLog))

      const log = getKidsActivityLog()

      expect(log).toEqual(mockLog)
    })
  })

  describe('calculateKidsTelemetry', () => {
    it('should calculate telemetry from activity log', () => {
      const mockSessions = [
        {
          id: 'session-1',
          startedAt: '2025-01-01T10:00:00Z',
          endedAt: '2025-01-01T10:30:00Z',
          videosWatched: ['video-1', 'video-2'],
          agentsInteracted: ['monteiro-lobato'],
          events: [
            {
              type: 'video_watched',
              timestamp: '',
              data: { videoId: 'video-1', durationSeconds: 120 },
            },
            {
              type: 'video_watched',
              timestamp: '',
              data: { videoId: 'video-2', durationSeconds: 180 },
            },
            {
              type: 'chat_message',
              timestamp: '',
              data: { agentId: 'monteiro-lobato', messageLength: 50 },
            },
          ],
        },
      ]

      // Mock getItem to return no current session and our mock sessions for activity log
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'agora_kids_current_session') return null
        if (key === 'agora_kids_activity_log') return JSON.stringify(mockSessions)
        return null
      })

      const telemetry = calculateKidsTelemetry()

      expect(telemetry.videosWatched).toBe(2)
      expect(telemetry.totalVideos).toBe(15)
      expect(telemetry.totalVideoWatchTimeSeconds).toBe(300)
      expect(telemetry.mentorConversations).toBe(1)
      expect(telemetry.daysActive).toBe(1)
      expect(telemetry.totalSessions).toBe(1)
    })

    it('should determine favorite agent', () => {
      const mockSessions = [
        {
          id: 'session-1',
          startedAt: '2025-01-01T10:00:00Z',
          endedAt: '2025-01-01T10:30:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [
            { type: 'chat_message', timestamp: '', data: { agentId: 'monteiro-lobato' } },
            { type: 'chat_message', timestamp: '', data: { agentId: 'monteiro-lobato' } },
            { type: 'chat_message', timestamp: '', data: { agentId: 'tarsila-amaral' } },
          ],
        },
      ]

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'agora_kids_current_session') return null
        if (key === 'agora_kids_activity_log') return JSON.stringify(mockSessions)
        return null
      })

      const telemetry = calculateKidsTelemetry()

      expect(telemetry.favoriteAgent).toBe('lobato')
    })
  })

  describe('getWatchedVideoIds', () => {
    it('should return unique video IDs', () => {
      const mockSessions = [
        {
          id: 'session-1',
          startedAt: '2025-01-01T10:00:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [
            { type: 'video_watched', timestamp: '', data: { videoId: 'video-1' } },
            { type: 'video_watched', timestamp: '', data: { videoId: 'video-1' } }, // Duplicate
            { type: 'video_watched', timestamp: '', data: { videoId: 'video-2' } },
          ],
        },
      ]

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'agora_kids_current_session') return null
        if (key === 'agora_kids_activity_log') return JSON.stringify(mockSessions)
        return null
      })

      const videoIds = getWatchedVideoIds()

      expect(videoIds).toHaveLength(2)
      expect(videoIds).toContain('video-1')
      expect(videoIds).toContain('video-2')
    })
  })

  describe('clearKidsActivityData', () => {
    it('should clear all kids activity data', () => {
      clearKidsActivityData()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('agora_kids_current_session')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('agora_kids_activity_log')
    })
  })

  describe('getDailyActivitySummary', () => {
    it('should aggregate activity by day', () => {
      const mockSessions = [
        {
          id: 'session-1',
          startedAt: '2025-01-01T10:00:00Z',
          endedAt: '2025-01-01T10:30:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [
            { type: 'video_watched', timestamp: '', data: { videoId: 'video-1' } },
            { type: 'chat_message', timestamp: '', data: { agentId: 'lobato' } },
          ],
        },
        {
          id: 'session-2',
          startedAt: '2025-01-01T14:00:00Z',
          endedAt: '2025-01-01T14:15:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [{ type: 'video_watched', timestamp: '', data: { videoId: 'video-2' } }],
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSessions))

      const summary = getDailyActivitySummary()

      expect(summary).toHaveLength(1)
      expect(summary[0].date).toBe('2025-01-01')
      expect(summary[0].videosWatched).toBe(2)
      expect(summary[0].chatMessages).toBe(1)
      expect(summary[0].minutes).toBe(45)
    })

    it('should sort by date', () => {
      const mockSessions = [
        {
          id: 'session-1',
          startedAt: '2025-01-03T10:00:00Z',
          endedAt: '2025-01-03T10:30:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [],
        },
        {
          id: 'session-2',
          startedAt: '2025-01-01T10:00:00Z',
          endedAt: '2025-01-01T10:30:00Z',
          videosWatched: [],
          agentsInteracted: [],
          events: [],
        },
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSessions))

      const summary = getDailyActivitySummary()

      expect(summary[0].date).toBe('2025-01-01')
      expect(summary[1].date).toBe('2025-01-03')
    })
  })
})
