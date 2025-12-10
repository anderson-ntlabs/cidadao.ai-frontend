/**
 * Certificate Data Hook Tests
 *
 * Tests for parsing functions and initial state.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { VIDEO_DURATIONS } from '@/lib/agora/certificate'

// Mock dependencies
vi.mock('@/hooks/use-agora', () => ({
  useAgora: vi.fn(() => ({
    user: null,
    xpTransactions: [],
    diaryEntries: [],
    sessions: [],
    isAuthenticated: false,
  })),
}))

vi.mock('@/app/pt/agora/actions', () => ({
  getTelemetryData: vi.fn(() => Promise.resolve({ success: false })),
  getDailyActivityData: vi.fn(() => Promise.resolve({ success: false })),
}))

vi.mock('@/lib/agora/certificate-requirements', () => ({
  validateCertificateRequirements: vi.fn(() => ({
    canGenerate: false,
    progressPercentage: 0,
    requirements: [],
  })),
  verifyTelemetryConsistency: vi.fn(() => ({ warnings: [] })),
  determineCertificateType: vi.fn(),
  formatCertificateType: vi.fn(),
}))

// Import after mocks
import { useCertificateData } from './use-certificate-data'
import { useAgora } from '@/hooks/use-agora'

describe('useCertificateData', () => {
  const mockLocalStorage: Record<string, string> = {}

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => mockLocalStorage[key] || null
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockLocalStorage[key] = value
    })
  })

  afterEach(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key])
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should return initial telemetry values when modal is closed', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.telemetry).toEqual({
        videosCompleted: 0,
        totalVideos: 15,
        requiredVideosCompleted: 0,
        totalRequiredVideos: 3,
        totalVideoWatchTimeSeconds: 0,
        requiredVideoWatchTimeSeconds: VIDEO_DURATIONS.REQUIRED.reduce((a, b) => a + b, 0),
        readingsCompleted: 0,
        totalReadings: 8,
        requiredReadingsCompleted: 0,
        totalRequiredReadings: 2,
        totalXp: 0,
        totalTimeMinutes: 0,
        totalSessions: 0,
        diaryEntries: 0,
        chatMessages: 0,
        currentStreak: 0,
      })
    })

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.isLoading).toBe(false)
    })

    it('should not be able to generate certificate initially', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.canGenerateCertificate).toBe(false)
    })

    it('should have 0 completion percentage initially', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.completionPercentage).toBe(0)
    })

    it('should have empty daily activity initially', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.dailyActivity).toEqual([])
    })

    it('should have null validation and consistency initially', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.validation).toBe(null)
      expect(result.current.consistency).toBe(null)
    })
  })

  describe('With User', () => {
    beforeEach(() => {
      vi.mocked(useAgora).mockReturnValue({
        user: {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com',
          totalXp: 1000,
          totalTimeMinutes: 120,
          currentLevel: 5,
          currentRank: 'estudante',
          currentStreak: 7,
        },
        xpTransactions: [],
        diaryEntries: [],
        sessions: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
        refreshUser: vi.fn(),
        refreshXpTransactions: vi.fn(),
        refreshDiaryEntries: vi.fn(),
        refreshSessions: vi.fn(),
        createSession: vi.fn(),
        endSession: vi.fn(),
        createDiaryEntry: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    })

    it('should load data when modal opens with user present', async () => {
      mockLocalStorage['agora_demo_video_progress'] = JSON.stringify({
        '1': { status: 'completed', watched_seconds: 720 },
        '2': { status: 'watching', watched_seconds: 500 },
      })
      mockLocalStorage['agora_demo_reading_progress'] = JSON.stringify({
        '1': { status: 'completed' },
      })

      const { result } = renderHook(() => useCertificateData(true))

      await waitFor(() => {
        expect(result.current.telemetry.videosCompleted).toBe(1)
      })

      expect(result.current.telemetry.requiredVideosCompleted).toBe(1)
      expect(result.current.telemetry.totalVideoWatchTimeSeconds).toBe(1220)
      expect(result.current.telemetry.readingsCompleted).toBe(1)
      expect(result.current.telemetry.requiredReadingsCompleted).toBe(1)
    })

    it('should count chat messages from XP transactions', async () => {
      vi.mocked(useAgora).mockReturnValue({
        user: {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com',
          totalXp: 1000,
          totalTimeMinutes: 120,
          currentLevel: 5,
          currentRank: 'estudante',
          currentStreak: 7,
        },
        xpTransactions: [
          { id: '1', sourceType: 'chat', amount: 10 },
          { id: '2', sourceType: 'agent_chat', amount: 10 },
          { id: '3', sourceType: 'diary', amount: 10 },
        ],
        diaryEntries: [{ id: '1' }],
        sessions: [{ id: '1' }],
        isAuthenticated: false,
        isLoading: false,
        error: null,
        refreshUser: vi.fn(),
        refreshXpTransactions: vi.fn(),
        refreshDiaryEntries: vi.fn(),
        refreshSessions: vi.fn(),
        createSession: vi.fn(),
        endSession: vi.fn(),
        createDiaryEntry: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)

      const { result } = renderHook(() => useCertificateData(true))

      await waitFor(() => {
        expect(result.current.telemetry.chatMessages).toBe(10) // 2 chat transactions * 5 messages
      })

      expect(result.current.telemetry.diaryEntries).toBe(1)
      expect(result.current.telemetry.totalSessions).toBe(1)
    })
  })

  describe('reload function', () => {
    it('should provide reload function', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(typeof result.current.reload).toBe('function')
    })
  })

  describe('hasConsistencyWarnings', () => {
    it('should be false when no warnings', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.hasConsistencyWarnings).toBe(false)
    })
  })

  describe('certificateType', () => {
    it('should be null when cannot generate certificate', () => {
      const { result } = renderHook(() => useCertificateData(false))

      expect(result.current.certificateType).toBe(null)
    })
  })
})
