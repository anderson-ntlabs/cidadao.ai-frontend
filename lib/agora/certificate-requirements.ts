/**
 * Certificate Requirements Validation
 *
 * Validates telemetry data against requirements before allowing
 * certificate generation. Ensures genuine learning engagement.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

export interface TelemetryData {
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

export interface CertificateRequirement {
  id: string
  label: string
  description: string
  check: (telemetry: TelemetryData) => boolean
  current: (telemetry: TelemetryData) => number | string
  required: number | string
  weight: number // For calculating overall progress
  category: 'video' | 'reading' | 'engagement' | 'time'
}

/**
 * Minimum requirements for certificate generation
 *
 * These are designed to ensure:
 * 1. User actually watched required content
 * 2. User engaged with the platform (sessions, diary, chat)
 * 3. User spent minimum time learning
 * 4. XP accumulation validates activity
 */
export const CERTIFICATE_REQUIREMENTS: CertificateRequirement[] = [
  // VIDEO REQUIREMENTS
  {
    id: 'required_videos',
    label: 'Vídeos Obrigatórios',
    description: 'Completar todos os vídeos marcados como obrigatórios',
    check: (t) => t.requiredVideosCompleted >= t.totalRequiredVideos,
    current: (t) => t.requiredVideosCompleted,
    required: 3, // Will be dynamic based on actual required videos
    weight: 30,
    category: 'video',
  },
  {
    id: 'video_watch_time',
    label: 'Tempo de Vídeo',
    description: 'Assistir pelo menos 2 horas de conteúdo em vídeo',
    check: (t) => t.totalVideoWatchTimeSeconds >= 7200, // 2 hours in seconds
    current: (t) => Math.floor(t.totalVideoWatchTimeSeconds / 60),
    required: 120, // 120 minutes = 2 hours
    weight: 20,
    category: 'video',
  },

  // READING REQUIREMENTS
  {
    id: 'required_readings',
    label: 'Leituras Obrigatórias',
    description: 'Completar todas as leituras marcadas como obrigatórias',
    check: (t) => t.requiredReadingsCompleted >= t.totalRequiredReadings,
    current: (t) => t.requiredReadingsCompleted,
    required: 2, // Will be dynamic
    weight: 20,
    category: 'reading',
  },

  // ENGAGEMENT REQUIREMENTS
  {
    id: 'diary_entries',
    label: 'Diário de Bordo',
    description: 'Registrar pelo menos 3 entradas no diário',
    check: (t) => t.diaryEntries >= 3,
    current: (t) => t.diaryEntries,
    required: 3,
    weight: 10,
    category: 'engagement',
  },
  {
    id: 'chat_interactions',
    label: 'Interação com Mentores',
    description: 'Enviar pelo menos 10 mensagens aos mentores IA',
    check: (t) => t.chatMessages >= 10,
    current: (t) => t.chatMessages,
    required: 10,
    weight: 10,
    category: 'engagement',
  },

  // TIME REQUIREMENTS
  {
    id: 'total_time',
    label: 'Tempo Total',
    description: 'Acumular pelo menos 3 horas de estudo na plataforma',
    check: (t) => t.totalTimeMinutes >= 180, // 3 hours
    current: (t) => t.totalTimeMinutes,
    required: 180,
    weight: 10,
    category: 'time',
  },
]

/**
 * Validate all certificate requirements
 * @returns Object with validation results and detailed breakdown
 */
export function validateCertificateRequirements(telemetry: TelemetryData): {
  canGenerate: boolean
  completedRequirements: number
  totalRequirements: number
  progressPercentage: number
  requirements: Array<CertificateRequirement & { met: boolean; currentValue: number | string }>
  missingRequirements: string[]
} {
  const results = CERTIFICATE_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.check(telemetry),
    currentValue: req.current(telemetry),
  }))

  const completedRequirements = results.filter((r) => r.met).length
  const totalRequirements = results.length

  // Calculate weighted progress
  const progressPercentage = Math.round(
    results.reduce((acc, req) => {
      if (req.met) return acc + req.weight
      // Partial progress for non-met requirements
      const current =
        typeof req.currentValue === 'number' ? req.currentValue : parseInt(req.currentValue) || 0
      const required = typeof req.required === 'number' ? req.required : parseInt(req.required) || 1
      const partial = Math.min(current / required, 1) * req.weight
      return acc + partial * 0.5 // Half weight for partial progress
    }, 0)
  )

  const missingRequirements = results.filter((r) => !r.met).map((r) => r.label)

  return {
    canGenerate: completedRequirements === totalRequirements,
    completedRequirements,
    totalRequirements,
    progressPercentage,
    requirements: results,
    missingRequirements,
  }
}

/**
 * Calculate minimum required time based on video durations
 * This ensures user can't claim more time than actual content duration
 */
export function calculateMinimumRequiredTime(videosDurationSeconds: number[]): number {
  const totalVideoTime = videosDurationSeconds.reduce((sum, d) => sum + d, 0)
  // Minimum time = video duration + 20% for reading/engagement
  return Math.ceil((totalVideoTime * 1.2) / 60) // Return in minutes
}

/**
 * Verify telemetry consistency
 * Checks if claimed time matches activity patterns
 */
export function verifyTelemetryConsistency(telemetry: TelemetryData): {
  isConsistent: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check if watch time exceeds total time (impossible)
  const videoTimeMinutes = telemetry.totalVideoWatchTimeSeconds / 60
  if (videoTimeMinutes > telemetry.totalTimeMinutes) {
    warnings.push('Tempo de vídeo excede tempo total registrado')
  }

  // Check if XP is suspiciously high for the activity
  const expectedMinXp =
    telemetry.videosCompleted * 15 +
    telemetry.readingsCompleted * 10 +
    telemetry.diaryEntries * 10 +
    Math.floor(telemetry.chatMessages / 5) * 5
  const expectedMaxXp = expectedMinXp * 2 // Allow for bonuses, badges, etc.

  if (telemetry.totalXp > expectedMaxXp * 1.5) {
    warnings.push('XP acumulado parece inconsistente com atividades registradas')
  }

  // Check if sessions are reasonable
  const averageSessionMinutes =
    telemetry.totalSessions > 0 ? telemetry.totalTimeMinutes / telemetry.totalSessions : 0
  if (averageSessionMinutes > 240) {
    // More than 4 hours per session average
    warnings.push('Duração média de sessão parece anormalmente longa')
  }

  return {
    isConsistent: warnings.length === 0,
    warnings,
  }
}

/**
 * Certificate types based on achievement level
 */
export type CertificateType = 'completion' | 'distinction' | 'excellence'

export function determineCertificateType(telemetry: TelemetryData): CertificateType {
  const validation = validateCertificateRequirements(telemetry)

  if (!validation.canGenerate) {
    throw new Error('Requisitos mínimos não atendidos')
  }

  // Excellence: All requirements + 200% of minimums
  if (
    telemetry.videosCompleted >= telemetry.totalVideos * 0.9 &&
    telemetry.readingsCompleted >= telemetry.totalReadings * 0.9 &&
    telemetry.totalTimeMinutes >= 360 && // 6+ hours
    telemetry.diaryEntries >= 10 &&
    telemetry.chatMessages >= 50
  ) {
    return 'excellence'
  }

  // Distinction: All requirements + 150% of minimums
  if (
    telemetry.videosCompleted >= telemetry.totalVideos * 0.7 &&
    telemetry.readingsCompleted >= telemetry.totalReadings * 0.7 &&
    telemetry.totalTimeMinutes >= 270 && // 4.5+ hours
    telemetry.diaryEntries >= 5
  ) {
    return 'distinction'
  }

  // Completion: Minimum requirements met
  return 'completion'
}

/**
 * Format certificate type for display
 */
export function formatCertificateType(type: CertificateType): {
  label: string
  color: string
  emoji: string
} {
  switch (type) {
    case 'excellence':
      return { label: 'Com Excelência', color: 'gold', emoji: '🏆' }
    case 'distinction':
      return { label: 'Com Distinção', color: 'silver', emoji: '🥈' }
    case 'completion':
    default:
      return { label: 'Conclusão', color: 'bronze', emoji: '🎓' }
  }
}
