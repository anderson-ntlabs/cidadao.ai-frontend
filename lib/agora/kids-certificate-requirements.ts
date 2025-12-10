/**
 * Kids Certificate Requirements - Cidadaozinho
 *
 * Simplified requirements for children (6-12 years)
 * Levels: v1.0 (Explorer), v2.0 (Creator), v3.0 (Master)
 *
 * Note: No gamification pressure - all progress is shared only with parents
 * Visual feedback uses friendly imagery, not scores
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-09
 */

export interface KidsTelemetryData {
  videosWatched: number
  totalVideos: number
  totalVideoWatchTimeSeconds: number
  mentorConversations: number
  daysActive: number
  totalTimeMinutes: number
  totalSessions: number
  favoriteAgent: 'lobato' | 'tarsila' | null
}

export interface KidsCertificateLevel {
  id: 'explorer' | 'creator' | 'master'
  version: string
  label: string
  description: string
  emoji: string
  color: string
  mascotImage: string
  requirements: {
    videosWatched: number
    mentorConversations: number
    daysActive: number
    totalTimeMinutes: number
  }
}

/**
 * Cidadaozinho Certificate Levels
 *
 * Progressive levels designed for children:
 * - v1.0 Explorer: Getting started, first steps
 * - v2.0 Creator: Building skills, exploring more
 * - v3.0 Master: Completed the journey
 */
export const KIDS_CERTIFICATE_LEVELS: KidsCertificateLevel[] = [
  {
    id: 'explorer',
    version: 'v1.0',
    label: 'Cidadaozinho Explorador',
    description: 'Primeiros passos na aventura do conhecimento!',
    emoji: '🌟',
    color: '#4ECDC4', // Turquoise
    mascotImage: '/kids/certificates/explorer.png',
    requirements: {
      videosWatched: 3,
      mentorConversations: 5,
      daysActive: 3,
      totalTimeMinutes: 30,
    },
  },
  {
    id: 'creator',
    version: 'v2.0',
    label: 'Cidadaozinho Criador',
    description: 'Aprendendo a criar coisas incríveis!',
    emoji: '🎨',
    color: '#FF6B6B', // Coral
    mascotImage: '/kids/certificates/creator.png',
    requirements: {
      videosWatched: 8,
      mentorConversations: 15,
      daysActive: 7,
      totalTimeMinutes: 90,
    },
  },
  {
    id: 'master',
    version: 'v3.0',
    label: 'Cidadaozinho Mestre',
    description: 'Um verdadeiro mestre da tecnologia!',
    emoji: '🏆',
    color: '#FFE66D', // Yellow
    mascotImage: '/kids/certificates/master.png',
    requirements: {
      videosWatched: 15,
      mentorConversations: 30,
      daysActive: 14,
      totalTimeMinutes: 180,
    },
  },
]

/**
 * Timeline milestones for visual progress (child-friendly)
 */
export interface KidsMilestone {
  id: string
  icon: string
  label: string
  description: string
  isCompleted: boolean
  completedAt?: string
}

/**
 * Calculate which certificate level the child has earned
 */
export function calculateKidsLevel(telemetry: KidsTelemetryData): {
  currentLevel: KidsCertificateLevel | null
  nextLevel: KidsCertificateLevel | null
  progress: number
  milestones: KidsMilestone[]
} {
  let currentLevel: KidsCertificateLevel | null = null
  let nextLevel: KidsCertificateLevel | null = KIDS_CERTIFICATE_LEVELS[0]

  // Find highest achieved level
  for (const level of KIDS_CERTIFICATE_LEVELS) {
    const meetsRequirements =
      telemetry.videosWatched >= level.requirements.videosWatched &&
      telemetry.mentorConversations >= level.requirements.mentorConversations &&
      telemetry.daysActive >= level.requirements.daysActive &&
      telemetry.totalTimeMinutes >= level.requirements.totalTimeMinutes

    if (meetsRequirements) {
      currentLevel = level
      const currentIndex = KIDS_CERTIFICATE_LEVELS.indexOf(level)
      nextLevel = KIDS_CERTIFICATE_LEVELS[currentIndex + 1] || null
    }
  }

  // Calculate progress to next level
  let progress = 0
  if (nextLevel) {
    const videoProgress = Math.min(
      telemetry.videosWatched / nextLevel.requirements.videosWatched,
      1
    )
    const chatProgress = Math.min(
      telemetry.mentorConversations / nextLevel.requirements.mentorConversations,
      1
    )
    const daysProgress = Math.min(telemetry.daysActive / nextLevel.requirements.daysActive, 1)
    const timeProgress = Math.min(
      telemetry.totalTimeMinutes / nextLevel.requirements.totalTimeMinutes,
      1
    )
    progress = Math.round(((videoProgress + chatProgress + daysProgress + timeProgress) / 4) * 100)
  } else {
    progress = 100 // Completed all levels
  }

  // Generate milestones for timeline
  const milestones = generateMilestones(telemetry)

  return { currentLevel, nextLevel, progress, milestones }
}

/**
 * Generate child-friendly milestones for timeline view
 */
function generateMilestones(telemetry: KidsTelemetryData): KidsMilestone[] {
  return [
    {
      id: 'first_video',
      icon: '🎬',
      label: 'Primeiro Vídeo!',
      description: 'Assistiu o primeiro vídeo',
      isCompleted: telemetry.videosWatched >= 1,
    },
    {
      id: 'first_chat',
      icon: '💬',
      label: 'Primeira Conversa!',
      description: 'Conversou com um mentor',
      isCompleted: telemetry.mentorConversations >= 1,
    },
    {
      id: 'three_videos',
      icon: '🎥',
      label: '3 Vídeos!',
      description: 'Assistiu 3 vídeos',
      isCompleted: telemetry.videosWatched >= 3,
    },
    {
      id: 'explorer_badge',
      icon: '🌟',
      label: 'Explorador!',
      description: 'Ganhou o selo Explorador',
      isCompleted:
        telemetry.videosWatched >= 3 &&
        telemetry.mentorConversations >= 5 &&
        telemetry.daysActive >= 3,
    },
    {
      id: 'five_chats',
      icon: '🗣️',
      label: '5 Conversas!',
      description: 'Fez 5 perguntas aos mentores',
      isCompleted: telemetry.mentorConversations >= 5,
    },
    {
      id: 'one_week',
      icon: '📅',
      label: 'Uma Semana!',
      description: 'Estudou por 7 dias',
      isCompleted: telemetry.daysActive >= 7,
    },
    {
      id: 'creator_badge',
      icon: '🎨',
      label: 'Criador!',
      description: 'Ganhou o selo Criador',
      isCompleted:
        telemetry.videosWatched >= 8 &&
        telemetry.mentorConversations >= 15 &&
        telemetry.daysActive >= 7,
    },
    {
      id: 'ten_videos',
      icon: '🎞️',
      label: '10 Vídeos!',
      description: 'Assistiu 10 vídeos',
      isCompleted: telemetry.videosWatched >= 10,
    },
    {
      id: 'two_weeks',
      icon: '🏅',
      label: 'Duas Semanas!',
      description: 'Estudou por 14 dias',
      isCompleted: telemetry.daysActive >= 14,
    },
    {
      id: 'master_badge',
      icon: '🏆',
      label: 'Mestre!',
      description: 'Completou toda a jornada!',
      isCompleted:
        telemetry.videosWatched >= 15 &&
        telemetry.mentorConversations >= 30 &&
        telemetry.daysActive >= 14,
    },
  ]
}

/**
 * Format time in kid-friendly way
 */
export function formatKidsTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutinhos`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'horinha' : 'horinhas'}`
  }
  return `${hours}h ${mins}min`
}

/**
 * Get encouragement message based on progress
 */
export function getEncouragementMessage(
  progress: number,
  currentLevel: KidsCertificateLevel | null
): string {
  if (!currentLevel) {
    if (progress < 25) return 'Você está começando sua aventura! Continue assim! 🚀'
    if (progress < 50) return 'Muito bem! Já aprendeu muitas coisas! 🌈'
    if (progress < 75) return 'Uau! Quase lá! Você é incrível! ⭐'
    return 'Falta pouquinho! Você consegue! 💪'
  }

  switch (currentLevel.id) {
    case 'explorer':
      return 'Parabéns, Explorador! Continue descobrindo coisas novas! 🌟'
    case 'creator':
      return 'Incrível, Criador! Você já sabe criar coisas legais! 🎨'
    case 'master':
      return 'Você é um MESTRE! Que orgulho! 🏆'
    default:
      return 'Continue aprendendo! Você é demais! 💫'
  }
}
