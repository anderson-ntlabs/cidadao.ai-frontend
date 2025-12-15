import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TourAnalytics, type TourSession } from './tour-analytics'

// Note: localStorage is mocked globally in vitest.setup.ts

// Mock window.gtag using vi.stubGlobal
const mockGtag = vi.fn()

describe('TourAnalytics', () => {
  let analytics: TourAnalytics

  beforeEach(() => {
    vi.stubGlobal('gtag', mockGtag)
    analytics = new TourAnalytics()
    localStorage.clear()
    mockGtag.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('startSession', () => {
    it('should create a new quick mode session', () => {
      const sessionId = analytics.startSession('quick')

      expect(sessionId).toMatch(/^tour-\d+-[a-z0-9]+$/)
    })

    it('should create a new complete mode session', () => {
      const sessionId = analytics.startSession('complete')

      expect(sessionId).toBeTruthy()
      expect(sessionId).toContain('tour-')
    })

    it('should generate unique session IDs', () => {
      const session1 = analytics.startSession('quick')
      const session2 = analytics.startSession('quick')

      expect(session1).not.toBe(session2)
    })

    it('should initialize session with correct mode', () => {
      analytics.startSession('complete')

      // Track an event to trigger session save
      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      expect(sessions[sessions.length - 1].mode).toBe('complete')
    })
  })

  describe('track', () => {
    beforeEach(() => {
      analytics.startSession('quick')
    })

    it('should track event with data', () => {
      analytics.track('button_clicked', { button: 'next' })

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'tour_button_clicked',
        expect.objectContaining({
          button: 'next',
          elapsed_time: expect.any(Number),
        })
      )
    })

    it('should track event without data', () => {
      analytics.track('tour_started')

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'tour_tour_started',
        expect.objectContaining({
          elapsed_time: expect.any(Number),
        })
      )
    })

    it('should track step views and update session', () => {
      analytics.track('step_viewed', { step: 1 })
      analytics.track('step_viewed', { step: 2 })
      analytics.track('step_viewed', { step: 3 })

      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      const lastSession = sessions[sessions.length - 1]

      expect(lastSession.stepsViewed).toEqual([1, 2, 3])
    })

    it('should track interactions', () => {
      analytics.track('interaction', { type: 'skip' })
      analytics.track('interaction', { type: 'replay' })

      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      const lastSession = sessions[sessions.length - 1]

      expect(lastSession.interactions).toContain('skip')
      expect(lastSession.interactions).toContain('replay')
    })

    it('should complete session on tour_completed event', () => {
      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      const lastSession = sessions[sessions.length - 1]

      expect(lastSession.completed).toBe(true)
      expect(lastSession.timeSpent).toBeGreaterThanOrEqual(0)
    })

    it('should complete session with exit point on tour_exited', () => {
      analytics.track('tour_exited', { exitPoint: 'step-2' })

      const sessions = analytics.getSavedSessions()
      const lastSession = sessions[sessions.length - 1]

      expect(lastSession.completed).toBe(false)
      expect(lastSession.exitPoint).toBe('step-2')
    })

    it('should not throw when gtag is not available', () => {
      // Create analytics in environment without gtag
      const oldGtag = window.gtag
      // @ts-expect-error Testing undefined gtag
      window.gtag = undefined

      analytics.track('test_event')

      // Restore gtag
      window.gtag = oldGtag

      // Should not throw and should complete silently
    })
  })

  describe('completeSession', () => {
    beforeEach(() => {
      analytics.startSession('quick')
    })

    it('should mark session as completed', () => {
      analytics.track('step_viewed', { step: 1 })
      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      expect(sessions[0].completed).toBe(true)
    })

    it('should mark session as not completed with exit point', () => {
      analytics.track('tour_exited', { exitPoint: 'step-3' })

      const sessions = analytics.getSavedSessions()
      expect(sessions[0].completed).toBe(false)
      expect(sessions[0].exitPoint).toBe('step-3')
    })

    it('should calculate time spent', () => {
      // Wait a bit before completing
      const startTime = Date.now()
      analytics.track('tour_completed')

      const sessions = analytics.getSavedSessions()
      const timeSpent = sessions[0].timeSpent || 0

      expect(timeSpent).toBeGreaterThanOrEqual(0)
      expect(timeSpent).toBeLessThan(1000) // Should be less than 1 second
    })
  })

  describe('getSavedSessions', () => {
    it('should return empty array when no sessions saved', () => {
      const sessions = analytics.getSavedSessions()

      expect(sessions).toEqual([])
    })

    it('should return saved sessions', () => {
      const mockSessions: TourSession[] = [
        {
          id: 'test-1',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [1, 2],
          interactions: [],
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      const sessions = analytics.getSavedSessions()

      expect(sessions).toEqual(mockSessions)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('tour-sessions', 'invalid json')

      const sessions = analytics.getSavedSessions()

      expect(sessions).toEqual([])
    })

    it('should keep only last 10 sessions', () => {
      // Create 12 sessions
      for (let i = 0; i < 12; i++) {
        analytics.startSession('quick')
        analytics.track('tour_completed')
      }

      const sessions = analytics.getSavedSessions()

      expect(sessions).toHaveLength(10)
    })
  })

  describe('getMetrics', () => {
    it('should return zero metrics when no sessions', () => {
      const metrics = analytics.getMetrics()

      expect(metrics).toEqual({
        completion_rate: 0,
        average_time_spent: 0,
        most_common_exit_point: null,
        total_sessions: 0,
        quick_mode_preference: 0,
        complete_mode_preference: 0,
      })
    })

    it('should calculate completion rate correctly', () => {
      // Create 5 sessions: 3 completed, 2 not completed
      for (let i = 0; i < 3; i++) {
        analytics.startSession('quick')
        analytics.track('tour_completed')
      }
      for (let i = 0; i < 2; i++) {
        analytics.startSession('quick')
        analytics.track('tour_exited', { exitPoint: 'step-1' })
      }

      const metrics = analytics.getMetrics()

      expect(metrics.completion_rate).toBe(60) // 3/5 * 100
      expect(metrics.total_sessions).toBe(5)
    })

    it('should calculate average time spent', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
          timeSpent: 5000, // 5 seconds
        },
        {
          id: '2',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
          timeSpent: 15000, // 15 seconds
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      const metrics = analytics.getMetrics()

      expect(metrics.average_time_spent).toBe(10) // (5000 + 15000) / 2 / 1000
    })

    it('should find most common exit point', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: false,
          stepsViewed: [],
          interactions: [],
          exitPoint: 'step-2',
        },
        {
          id: '2',
          startTime: Date.now(),
          mode: 'quick',
          completed: false,
          stepsViewed: [],
          interactions: [],
          exitPoint: 'step-2',
        },
        {
          id: '3',
          startTime: Date.now(),
          mode: 'quick',
          completed: false,
          stepsViewed: [],
          interactions: [],
          exitPoint: 'step-3',
        },
        {
          id: '4',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      const metrics = analytics.getMetrics()

      expect(metrics.most_common_exit_point).toBe('step-2')
    })

    it('should calculate mode preferences', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
        {
          id: '2',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
        {
          id: '3',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
        {
          id: '4',
          startTime: Date.now(),
          mode: 'complete',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      const metrics = analytics.getMetrics()

      expect(metrics.quick_mode_preference).toBe(75) // 3/4 * 100
      expect(metrics.complete_mode_preference).toBe(25) // 1/4 * 100
    })
  })

  describe('needsImprovement', () => {
    it('should return true when completion rate is low', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: false,
          stepsViewed: [],
          interactions: [],
          exitPoint: 'step-1',
        },
        {
          id: '2',
          startTime: Date.now(),
          mode: 'quick',
          completed: false,
          stepsViewed: [],
          interactions: [],
          exitPoint: 'step-1',
        },
        {
          id: '3',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      expect(analytics.needsImprovement()).toBe(true) // 33% < 60%
    })

    it('should return true when average time is too long', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
          timeSpent: 400000, // 400 seconds
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      expect(analytics.needsImprovement()).toBe(true) // 400s > 300s
    })

    it('should return true when completion rate is low with many sessions', () => {
      const mockSessions: TourSession[] = Array(6)
        .fill(null)
        .map((_, i) => ({
          id: `${i}`,
          startTime: Date.now(),
          mode: 'quick' as const,
          completed: i < 4, // 4 completed, 2 not
          stepsViewed: [],
          interactions: [],
          exitPoint: i >= 4 ? 'step-1' : undefined,
        }))

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      expect(analytics.needsImprovement()).toBe(true) // 66% < 80% with >5 sessions
    })

    it('should return false when metrics are good', () => {
      const mockSessions: TourSession[] = [
        {
          id: '1',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
          timeSpent: 30000, // 30 seconds
        },
        {
          id: '2',
          startTime: Date.now(),
          mode: 'quick',
          completed: true,
          stepsViewed: [],
          interactions: [],
          timeSpent: 45000, // 45 seconds
        },
      ]

      localStorage.setItem('tour-sessions', JSON.stringify(mockSessions))

      expect(analytics.needsImprovement()).toBe(false) // 100% completion, 37.5s average
    })
  })
})
