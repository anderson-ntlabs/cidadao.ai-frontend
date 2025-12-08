/**
 * @vitest-environment jsdom
 *
 * Ágora Gamification Utils Tests
 *
 * Blackbox tests for gamification calculations:
 * - XP calculations
 * - Level calculations
 * - Rank determination
 * - Streak multipliers
 * - Challenge progress
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Gamification constants (same as in use-agora.tsx)
const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 250 },
  { level: 3, minXp: 250, maxXp: 500 },
  { level: 4, minXp: 500, maxXp: 1000 },
  { level: 5, minXp: 1000, maxXp: 2000 },
  { level: 6, minXp: 2000, maxXp: 3500 },
  { level: 7, minXp: 3500, maxXp: 5500 },
  { level: 8, minXp: 5500, maxXp: 8000 },
  { level: 9, minXp: 8000, maxXp: 11000 },
  { level: 10, minXp: 11000, maxXp: 15000 },
]

const RANKS = [
  { rank: 'novato', minLevel: 1, maxLevel: 2 },
  { rank: 'aprendiz', minLevel: 3, maxLevel: 4 },
  { rank: 'contribuidor', minLevel: 5, maxLevel: 6 },
  { rank: 'mentor', minLevel: 7, maxLevel: 8 },
  { rank: 'arquiteto', minLevel: 9, maxLevel: 10 },
]

// Utility functions to test
function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i].level
    }
  }
  return 1
}

function calculateRank(level: number): string {
  for (const r of RANKS) {
    if (level >= r.minLevel && level <= r.maxLevel) {
      return r.rank
    }
  }
  return 'novato'
}

function calculateStreakMultiplier(streak: number): number {
  if (streak >= 7) return 1.5
  if (streak >= 3) return 1.25
  return 1.0
}

function calculateXpForAction(
  baseXp: number,
  streakMultiplier: number,
  isFirstOfDay: boolean = false
): number {
  let xp = baseXp * streakMultiplier
  if (isFirstOfDay) {
    xp *= 1.1 // 10% bonus for first action of day
  }
  return Math.round(xp)
}

function calculateChallengeProgress(
  current: number,
  target: number
): { progress: number; completed: boolean } {
  const progress = Math.min((current / target) * 100, 100)
  return {
    progress,
    completed: current >= target,
  }
}

describe('Gamification Utils', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1)
    })

    it('should return level 1 for 50 XP', () => {
      expect(calculateLevel(50)).toBe(1)
    })

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2)
    })

    it('should return level 2 for 249 XP', () => {
      expect(calculateLevel(249)).toBe(2)
    })

    it('should return level 3 for 250 XP', () => {
      expect(calculateLevel(250)).toBe(3)
    })

    it('should return level 5 for 1000 XP', () => {
      expect(calculateLevel(1000)).toBe(5)
    })

    it('should return level 10 for 11000+ XP', () => {
      expect(calculateLevel(11000)).toBe(10)
      expect(calculateLevel(20000)).toBe(10)
    })

    it('should handle negative XP gracefully', () => {
      expect(calculateLevel(-100)).toBe(1)
    })
  })

  describe('calculateRank', () => {
    it('should return novato for levels 1-2', () => {
      expect(calculateRank(1)).toBe('novato')
      expect(calculateRank(2)).toBe('novato')
    })

    it('should return aprendiz for levels 3-4', () => {
      expect(calculateRank(3)).toBe('aprendiz')
      expect(calculateRank(4)).toBe('aprendiz')
    })

    it('should return contribuidor for levels 5-6', () => {
      expect(calculateRank(5)).toBe('contribuidor')
      expect(calculateRank(6)).toBe('contribuidor')
    })

    it('should return mentor for levels 7-8', () => {
      expect(calculateRank(7)).toBe('mentor')
      expect(calculateRank(8)).toBe('mentor')
    })

    it('should return arquiteto for levels 9-10', () => {
      expect(calculateRank(9)).toBe('arquiteto')
      expect(calculateRank(10)).toBe('arquiteto')
    })

    it('should handle edge cases', () => {
      expect(calculateRank(0)).toBe('novato')
      expect(calculateRank(11)).toBe('novato') // Beyond defined levels
    })
  })

  describe('calculateStreakMultiplier', () => {
    it('should return 1.0 for 0 days streak', () => {
      expect(calculateStreakMultiplier(0)).toBe(1.0)
    })

    it('should return 1.0 for 1 day streak', () => {
      expect(calculateStreakMultiplier(1)).toBe(1.0)
    })

    it('should return 1.0 for 2 days streak', () => {
      expect(calculateStreakMultiplier(2)).toBe(1.0)
    })

    it('should return 1.25 for 3 days streak', () => {
      expect(calculateStreakMultiplier(3)).toBe(1.25)
    })

    it('should return 1.25 for 6 days streak', () => {
      expect(calculateStreakMultiplier(6)).toBe(1.25)
    })

    it('should return 1.5 for 7 days streak', () => {
      expect(calculateStreakMultiplier(7)).toBe(1.5)
    })

    it('should return 1.5 for 30 days streak', () => {
      expect(calculateStreakMultiplier(30)).toBe(1.5)
    })
  })

  describe('calculateXpForAction', () => {
    it('should return base XP with no multipliers', () => {
      expect(calculateXpForAction(10, 1.0, false)).toBe(10)
    })

    it('should apply streak multiplier', () => {
      expect(calculateXpForAction(10, 1.25, false)).toBe(13)
      expect(calculateXpForAction(10, 1.5, false)).toBe(15)
    })

    it('should apply first of day bonus', () => {
      expect(calculateXpForAction(10, 1.0, true)).toBe(11)
    })

    it('should combine streak and first of day bonuses', () => {
      // 10 * 1.25 * 1.1 = 13.75, rounded to 14
      expect(calculateXpForAction(10, 1.25, true)).toBe(14)
    })

    it('should handle larger XP values', () => {
      // 100 * 1.5 * 1.1 = 165
      expect(calculateXpForAction(100, 1.5, true)).toBe(165)
    })
  })

  describe('calculateChallengeProgress', () => {
    it('should return 0% for no progress', () => {
      const result = calculateChallengeProgress(0, 5)
      expect(result.progress).toBe(0)
      expect(result.completed).toBe(false)
    })

    it('should return correct percentage for partial progress', () => {
      const result = calculateChallengeProgress(2, 4)
      expect(result.progress).toBe(50)
      expect(result.completed).toBe(false)
    })

    it('should return 100% for completed challenge', () => {
      const result = calculateChallengeProgress(5, 5)
      expect(result.progress).toBe(100)
      expect(result.completed).toBe(true)
    })

    it('should cap at 100% for over-completed challenges', () => {
      const result = calculateChallengeProgress(10, 5)
      expect(result.progress).toBe(100)
      expect(result.completed).toBe(true)
    })

    it('should handle decimal progress', () => {
      const result = calculateChallengeProgress(1, 3)
      expect(result.progress).toBeCloseTo(33.33, 1)
      expect(result.completed).toBe(false)
    })
  })
})

describe('XP Progression Scenarios', () => {
  it('should progress through levels correctly', () => {
    const progressions = [
      { xp: 0, expectedLevel: 1, expectedRank: 'novato' },
      { xp: 99, expectedLevel: 1, expectedRank: 'novato' },
      { xp: 100, expectedLevel: 2, expectedRank: 'novato' },
      { xp: 500, expectedLevel: 4, expectedRank: 'aprendiz' },
      { xp: 1000, expectedLevel: 5, expectedRank: 'contribuidor' },
      { xp: 5500, expectedLevel: 8, expectedRank: 'mentor' },
      { xp: 11000, expectedLevel: 10, expectedRank: 'arquiteto' },
    ]

    for (const p of progressions) {
      const level = calculateLevel(p.xp)
      const rank = calculateRank(level)
      expect(level).toBe(p.expectedLevel)
      expect(rank).toBe(p.expectedRank)
    }
  })
})

describe('Streak Scenarios', () => {
  it('should calculate correct bonus XP for different streaks', () => {
    const scenarios = [
      { streak: 0, baseXp: 10, expectedXp: 10 },
      { streak: 2, baseXp: 10, expectedXp: 10 },
      { streak: 3, baseXp: 10, expectedXp: 13 }, // 10 * 1.25 = 12.5 ~ 13
      { streak: 7, baseXp: 10, expectedXp: 15 }, // 10 * 1.5 = 15
      { streak: 30, baseXp: 10, expectedXp: 15 }, // Still 1.5x max
    ]

    for (const s of scenarios) {
      const multiplier = calculateStreakMultiplier(s.streak)
      const xp = calculateXpForAction(s.baseXp, multiplier, false)
      expect(xp).toBe(s.expectedXp)
    }
  })
})

describe('Challenge Completion Scenarios', () => {
  it('should track daily session challenge progress', () => {
    // Daily session challenge: complete 1 session
    const sessions = [0, 1, 2, 3]

    for (const count of sessions) {
      const result = calculateChallengeProgress(count, 1)
      if (count >= 1) {
        expect(result.completed).toBe(true)
      } else {
        expect(result.completed).toBe(false)
      }
    }
  })

  it('should track weekly XP challenge progress', () => {
    // Weekly XP challenge: earn 500 XP
    const xpAmounts = [0, 100, 250, 499, 500, 750]

    for (const xp of xpAmounts) {
      const result = calculateChallengeProgress(xp, 500)
      if (xp >= 500) {
        expect(result.completed).toBe(true)
      } else {
        expect(result.completed).toBe(false)
      }
      expect(result.progress).toBeLessThanOrEqual(100)
    }
  })
})
