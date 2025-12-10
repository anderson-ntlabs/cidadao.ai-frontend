/**
 * Celebration Store
 *
 * Global state for managing achievement celebrations.
 * Triggers celebration modal from anywhere in the app.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { create } from 'zustand'

export type CelebrationType = 'badge' | 'level_up' | 'rank_up' | 'streak' | 'milestone' | 'video'

export interface CelebrationData {
  type: CelebrationType
  title: string
  subtitle: string
  emoji: string
  xpReward?: number
  description?: string
}

interface CelebrationState {
  // State
  isOpen: boolean
  celebration: CelebrationData | null
  queue: CelebrationData[]

  // Actions
  showCelebration: (data: CelebrationData) => void
  hideCelebration: () => void
  clearQueue: () => void

  // Helper functions
  celebrateBadge: (badgeName: string, badgeEmoji: string, xpReward?: number) => void
  celebrateLevelUp: (newLevel: number, xpReward?: number) => void
  celebrateRankUp: (newRank: string, xpReward?: number) => void
  celebrateStreak: (days: number, xpReward?: number) => void
  celebrateVideo: (videoTitle: string, xpReward?: number) => void
  celebrateMilestone: (title: string, subtitle: string, emoji: string, xpReward?: number) => void
}

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  // Initial state
  isOpen: false,
  celebration: null,
  queue: [],

  // Show celebration (queues if one is already showing)
  showCelebration: (data) => {
    const { isOpen, queue } = get()
    if (isOpen) {
      // Queue the celebration
      set({ queue: [...queue, data] })
    } else {
      // Show immediately
      set({ isOpen: true, celebration: data })
    }
  },

  // Hide current celebration and show next in queue
  hideCelebration: () => {
    const { queue } = get()
    if (queue.length > 0) {
      const [next, ...rest] = queue
      set({ celebration: next, queue: rest })
    } else {
      set({ isOpen: false, celebration: null })
    }
  },

  // Clear all queued celebrations
  clearQueue: () => {
    set({ queue: [] })
  },

  // Helper: Celebrate badge
  celebrateBadge: (badgeName, badgeEmoji, xpReward) => {
    get().showCelebration({
      type: 'badge',
      title: 'Badge Conquistado!',
      subtitle: badgeName,
      emoji: badgeEmoji,
      xpReward,
      description: 'Continue assim! Você está no caminho certo.',
    })
  },

  // Helper: Celebrate level up
  celebrateLevelUp: (newLevel, xpReward) => {
    get().showCelebration({
      type: 'level_up',
      title: 'Level Up!',
      subtitle: `Nivel ${newLevel}`,
      emoji: '🚀',
      xpReward,
      description: 'Seu conhecimento está crescendo!',
    })
  },

  // Helper: Celebrate rank up
  celebrateRankUp: (newRank, xpReward) => {
    const rankEmojis: Record<string, string> = {
      aprendiz: '📚',
      contribuidor: '🔧',
      mentor: '🎓',
      arquiteto: '🏛️',
    }
    get().showCelebration({
      type: 'rank_up',
      title: 'Novo Rank!',
      subtitle: newRank.charAt(0).toUpperCase() + newRank.slice(1),
      emoji: rankEmojis[newRank.toLowerCase()] || '⭐',
      xpReward,
      description: 'Sua dedicação está sendo reconhecida!',
    })
  },

  // Helper: Celebrate streak
  celebrateStreak: (days, xpReward) => {
    get().showCelebration({
      type: 'streak',
      title: 'Streak Incrivel!',
      subtitle: `${days} dias consecutivos!`,
      emoji: '🔥',
      xpReward,
      description: 'A consistência é a chave do sucesso!',
    })
  },

  // Helper: Celebrate video completion
  celebrateVideo: (videoTitle, xpReward) => {
    get().showCelebration({
      type: 'video',
      title: 'Video Concluido!',
      subtitle: videoTitle,
      emoji: '🎬',
      xpReward,
      description: 'Conhecimento adquirido com sucesso!',
    })
  },

  // Helper: Celebrate milestone
  celebrateMilestone: (title, subtitle, emoji, xpReward) => {
    get().showCelebration({
      type: 'milestone',
      title,
      subtitle,
      emoji,
      xpReward,
    })
  },
}))
