'use client'

/**
 * Certificate Data Hook
 *
 * Manages loading and state for certificate telemetry data.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

import { useState, useEffect, useCallback } from 'react'
import { useAgora } from '@/hooks/use-agora'
import { getTelemetryData, getDailyActivityData } from '@/app/pt/agora/actions'
import {
  validateCertificateRequirements,
  verifyTelemetryConsistency,
  determineCertificateType,
  formatCertificateType,
  type TelemetryData,
} from '@/lib/agora/certificate-requirements'
import {
  STORAGE_KEYS,
  VIDEO_DURATIONS,
  REQUIRED_CONTENT_IDS,
  type DailyActivity,
  type VideoProgressEntry,
  type ReadingProgressEntry,
} from '@/lib/agora/certificate'

/**
 * Initial telemetry state
 */
function getInitialTelemetry(): TelemetryData {
  return {
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
  }
}

/**
 * Parse video progress from localStorage
 */
function parseVideoProgress(videoProgress: string | null) {
  let videosCompleted = 0
  let requiredVideosCompleted = 0
  let totalVideoWatchTimeSeconds = 0

  if (videoProgress) {
    const parsed = JSON.parse(videoProgress) as Record<string, VideoProgressEntry>
    Object.entries(parsed).forEach(([id, v]) => {
      if (v.status === 'completed') {
        videosCompleted++
        if (REQUIRED_CONTENT_IDS.VIDEOS.includes(id)) {
          requiredVideosCompleted++
        }
      }
      totalVideoWatchTimeSeconds += v.watched_seconds || 0
    })
  }

  return { videosCompleted, requiredVideosCompleted, totalVideoWatchTimeSeconds }
}

/**
 * Parse reading progress from localStorage
 */
function parseReadingProgress(readingProgress: string | null) {
  let readingsCompleted = 0
  let requiredReadingsCompleted = 0

  if (readingProgress) {
    const parsed = JSON.parse(readingProgress) as Record<string, ReadingProgressEntry>
    Object.entries(parsed).forEach(([id, r]) => {
      if (r.status === 'completed') {
        readingsCompleted++
        if (REQUIRED_CONTENT_IDS.READINGS.includes(id)) {
          requiredReadingsCompleted++
        }
      }
    })
  }

  return { readingsCompleted, requiredReadingsCompleted }
}

/**
 * Hook return type
 */
export interface UseCertificateDataReturn {
  telemetry: TelemetryData
  validation: ReturnType<typeof validateCertificateRequirements> | null
  consistency: ReturnType<typeof verifyTelemetryConsistency> | null
  dailyActivity: DailyActivity[]
  canGenerateCertificate: boolean
  completionPercentage: number
  hasConsistencyWarnings: boolean
  certificateType: ReturnType<typeof formatCertificateType> | null
  isLoading: boolean
  reload: () => Promise<void>
}

/**
 * Hook for managing certificate telemetry data
 *
 * @param isOpen - Whether the certificate modal is open
 * @returns Certificate data state and controls
 */
export function useCertificateData(isOpen: boolean): UseCertificateDataReturn {
  const { user, xpTransactions, diaryEntries, sessions, isAuthenticated } = useAgora()

  const [telemetry, setTelemetry] = useState<TelemetryData>(getInitialTelemetry())
  const [validation, setValidation] = useState<ReturnType<
    typeof validateCertificateRequirements
  > | null>(null)
  const [consistency, setConsistency] = useState<ReturnType<
    typeof verifyTelemetryConsistency
  > | null>(null)
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadTelemetryData = useCallback(async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // If authenticated with real auth (Supabase), load real data
      if (isAuthenticated) {
        const [telemetryResult, activityResult] = await Promise.all([
          getTelemetryData(),
          getDailyActivityData(),
        ])

        if (telemetryResult.success && telemetryResult.data) {
          const data = telemetryResult.data as TelemetryData
          setTelemetry(data)
          setValidation(validateCertificateRequirements(data))
          setConsistency(verifyTelemetryConsistency(data))
        }

        if (activityResult.success && activityResult.data) {
          setDailyActivity(activityResult.data)
        }

        if (telemetryResult.success) return
      }

      // Fallback to localStorage (demo mode)
      const videoProgress = localStorage.getItem(STORAGE_KEYS.VIDEO_PROGRESS)
      const readingProgress = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS)

      const { videosCompleted, requiredVideosCompleted, totalVideoWatchTimeSeconds } =
        parseVideoProgress(videoProgress)

      const { readingsCompleted, requiredReadingsCompleted } = parseReadingProgress(readingProgress)

      // Count chat messages from XP transactions
      const chatXpTransactions = xpTransactions.filter(
        (t) => t.sourceType === 'chat' || t.sourceType === 'agent_chat'
      )
      const chatMessages = chatXpTransactions.length * 5 // Each transaction = 5 messages

      const newTelemetry: TelemetryData = {
        videosCompleted,
        totalVideos: 15,
        requiredVideosCompleted,
        totalRequiredVideos: 3,
        totalVideoWatchTimeSeconds,
        requiredVideoWatchTimeSeconds: VIDEO_DURATIONS.REQUIRED.reduce((a, b) => a + b, 0),
        readingsCompleted,
        totalReadings: 8,
        requiredReadingsCompleted,
        totalRequiredReadings: 2,
        totalXp: user.totalXp,
        totalTimeMinutes: user.totalTimeMinutes,
        totalSessions: sessions.length,
        diaryEntries: diaryEntries.length,
        chatMessages,
        currentStreak: user.currentStreak,
      }

      setTelemetry(newTelemetry)
      setValidation(validateCertificateRequirements(newTelemetry))
      setConsistency(verifyTelemetryConsistency(newTelemetry))
    } finally {
      setIsLoading(false)
    }
  }, [user, isAuthenticated, xpTransactions, diaryEntries, sessions])

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadTelemetryData()
    }
  }, [isOpen, user, loadTelemetryData])

  // Computed values
  const canGenerateCertificate = validation?.canGenerate ?? false
  const completionPercentage = validation?.progressPercentage ?? 0
  const hasConsistencyWarnings = consistency?.warnings && consistency.warnings.length > 0

  // Get certificate type if eligible
  let certificateType: ReturnType<typeof formatCertificateType> | null = null
  if (canGenerateCertificate) {
    try {
      const type = determineCertificateType(telemetry)
      certificateType = formatCertificateType(type)
    } catch {
      // Not eligible
    }
  }

  return {
    telemetry,
    validation,
    consistency,
    dailyActivity,
    canGenerateCertificate,
    completionPercentage,
    hasConsistencyWarnings: hasConsistencyWarnings ?? false,
    certificateType,
    isLoading,
    reload: loadTelemetryData,
  }
}
