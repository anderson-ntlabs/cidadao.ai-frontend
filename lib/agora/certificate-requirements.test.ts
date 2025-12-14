/**
 * Tests for Certificate Requirements Validation
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  validateCertificateRequirements,
  calculateMinimumRequiredTime,
  verifyTelemetryConsistency,
  determineCertificateType,
  formatCertificateType,
  CERTIFICATE_REQUIREMENTS,
  type TelemetryData,
} from './certificate-requirements'

// Helper to create valid telemetry data
function createTelemetryData(overrides: Partial<TelemetryData> = {}): TelemetryData {
  return {
    videosCompleted: 5,
    totalVideos: 10,
    requiredVideosCompleted: 3,
    totalRequiredVideos: 3,
    totalVideoWatchTimeSeconds: 7200, // 2 hours
    requiredVideoWatchTimeSeconds: 7200,
    readingsCompleted: 4,
    totalReadings: 5,
    requiredReadingsCompleted: 2,
    totalRequiredReadings: 2,
    totalXp: 500,
    totalTimeMinutes: 180, // 3 hours
    totalSessions: 5,
    diaryEntries: 3,
    chatMessages: 10,
    currentStreak: 3,
    ...overrides,
  }
}

describe('CERTIFICATE_REQUIREMENTS', () => {
  it('should have 6 requirements defined', () => {
    expect(CERTIFICATE_REQUIREMENTS).toHaveLength(6)
  })

  it('should have unique IDs', () => {
    const ids = CERTIFICATE_REQUIREMENTS.map((r) => r.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have weights summing to 100', () => {
    const totalWeight = CERTIFICATE_REQUIREMENTS.reduce((sum, r) => sum + r.weight, 0)
    expect(totalWeight).toBe(100)
  })

  it('should have valid categories', () => {
    const validCategories = ['video', 'reading', 'engagement', 'time']
    CERTIFICATE_REQUIREMENTS.forEach((req) => {
      expect(validCategories).toContain(req.category)
    })
  })
})

describe('validateCertificateRequirements', () => {
  it('should return canGenerate true when all requirements are met', () => {
    const telemetry = createTelemetryData()
    const result = validateCertificateRequirements(telemetry)

    expect(result.canGenerate).toBe(true)
    expect(result.completedRequirements).toBe(result.totalRequirements)
    expect(result.missingRequirements).toHaveLength(0)
  })

  it('should return canGenerate false when requirements are not met', () => {
    const telemetry = createTelemetryData({
      requiredVideosCompleted: 1,
      totalRequiredVideos: 3,
      diaryEntries: 1,
      chatMessages: 5,
    })
    const result = validateCertificateRequirements(telemetry)

    expect(result.canGenerate).toBe(false)
    expect(result.missingRequirements.length).toBeGreaterThan(0)
  })

  it('should calculate progress percentage correctly', () => {
    const telemetry = createTelemetryData()
    const result = validateCertificateRequirements(telemetry)

    expect(result.progressPercentage).toBeGreaterThanOrEqual(0)
    expect(result.progressPercentage).toBeLessThanOrEqual(100)
  })

  it('should return detailed requirement results', () => {
    const telemetry = createTelemetryData()
    const result = validateCertificateRequirements(telemetry)

    expect(result.requirements).toHaveLength(CERTIFICATE_REQUIREMENTS.length)
    result.requirements.forEach((req) => {
      expect(req).toHaveProperty('met')
      expect(req).toHaveProperty('currentValue')
    })
  })

  it('should identify specific missing requirements', () => {
    const telemetry = createTelemetryData({
      totalVideoWatchTimeSeconds: 3600, // 1 hour (below 2 hour minimum)
      totalTimeMinutes: 60, // 1 hour (below 3 hour minimum)
    })
    const result = validateCertificateRequirements(telemetry)

    expect(result.missingRequirements).toContain('Tempo de Vídeo')
    expect(result.missingRequirements).toContain('Tempo Total')
  })
})

describe('calculateMinimumRequiredTime', () => {
  it('should calculate minimum time based on video durations', () => {
    const durations = [600, 900, 1200] // 10min, 15min, 20min = 45min total
    const result = calculateMinimumRequiredTime(durations)

    // Should be total * 1.2 / 60 = 45 * 1.2 / 60 = 0.9, rounded up = 1
    // Actually: 2700 * 1.2 / 60 = 54 minutes
    expect(result).toBe(54)
  })

  it('should return 0 for empty array', () => {
    const result = calculateMinimumRequiredTime([])
    expect(result).toBe(0)
  })

  it('should handle single video', () => {
    const result = calculateMinimumRequiredTime([3600]) // 1 hour
    // 3600 * 1.2 / 60 = 72 minutes
    expect(result).toBe(72)
  })
})

describe('verifyTelemetryConsistency', () => {
  it('should return isConsistent true for valid telemetry', () => {
    // Create telemetry with consistent XP based on activities
    // Expected XP: videos(5)*15 + readings(4)*10 + diary(3)*10 + chat(10/5)*5 = 75+40+30+10 = 155
    // Max allowed: 155 * 2 * 1.5 = 465
    const telemetry = createTelemetryData({
      totalXp: 200, // Within expected range
    })
    const result = verifyTelemetryConsistency(telemetry)

    expect(result.isConsistent).toBe(true)
    expect(result.warnings).toHaveLength(0)
  })

  it('should warn when video time exceeds total time', () => {
    const telemetry = createTelemetryData({
      totalVideoWatchTimeSeconds: 14400, // 4 hours
      totalTimeMinutes: 120, // 2 hours
    })
    const result = verifyTelemetryConsistency(telemetry)

    expect(result.isConsistent).toBe(false)
    expect(result.warnings).toContain('Tempo de vídeo excede tempo total registrado')
  })

  it('should warn when XP is suspiciously high', () => {
    const telemetry = createTelemetryData({
      totalXp: 50000, // Unreasonably high
    })
    const result = verifyTelemetryConsistency(telemetry)

    expect(result.isConsistent).toBe(false)
    expect(result.warnings.some((w) => w.includes('XP acumulado'))).toBe(true)
  })

  it('should warn when average session is too long', () => {
    const telemetry = createTelemetryData({
      totalTimeMinutes: 1200, // 20 hours
      totalSessions: 2, // 10 hours per session average
    })
    const result = verifyTelemetryConsistency(telemetry)

    expect(result.isConsistent).toBe(false)
    expect(result.warnings.some((w) => w.includes('sessão'))).toBe(true)
  })

  it('should handle zero sessions gracefully', () => {
    const telemetry = createTelemetryData({
      totalSessions: 0,
      totalTimeMinutes: 0,
      totalVideoWatchTimeSeconds: 0,
      videosCompleted: 0,
      readingsCompleted: 0,
      diaryEntries: 0,
      chatMessages: 0,
      totalXp: 0, // Consistent with zero activity
    })
    const result = verifyTelemetryConsistency(telemetry)

    expect(result.isConsistent).toBe(true)
  })
})

describe('determineCertificateType', () => {
  it('should return completion for minimum requirements', () => {
    const telemetry = createTelemetryData()
    const result = determineCertificateType(telemetry)

    expect(result).toBe('completion')
  })

  it('should return distinction for 150% of requirements', () => {
    const telemetry = createTelemetryData({
      videosCompleted: 7,
      totalVideos: 10,
      readingsCompleted: 4,
      totalReadings: 5,
      totalTimeMinutes: 300,
      diaryEntries: 6,
    })
    const result = determineCertificateType(telemetry)

    expect(result).toBe('distinction')
  })

  it('should return excellence for 200% of requirements', () => {
    const telemetry = createTelemetryData({
      videosCompleted: 9,
      totalVideos: 10,
      readingsCompleted: 5,
      totalReadings: 5,
      totalTimeMinutes: 400,
      diaryEntries: 12,
      chatMessages: 60,
    })
    const result = determineCertificateType(telemetry)

    expect(result).toBe('excellence')
  })

  it('should throw error when requirements are not met', () => {
    const telemetry = createTelemetryData({
      requiredVideosCompleted: 0,
      totalRequiredVideos: 3,
    })

    expect(() => determineCertificateType(telemetry)).toThrow('Requisitos mínimos não atendidos')
  })
})

describe('formatCertificateType', () => {
  it('should format completion type', () => {
    const result = formatCertificateType('completion')

    expect(result.label).toBe('Conclusão')
    expect(result.color).toBe('bronze')
    expect(result.emoji).toBe('🎓')
  })

  it('should format distinction type', () => {
    const result = formatCertificateType('distinction')

    expect(result.label).toBe('Com Distinção')
    expect(result.color).toBe('silver')
    expect(result.emoji).toBe('🥈')
  })

  it('should format excellence type', () => {
    const result = formatCertificateType('excellence')

    expect(result.label).toBe('Com Excelência')
    expect(result.color).toBe('gold')
    expect(result.emoji).toBe('🏆')
  })
})
