/**
 * Tests for Celebration Store
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  useCelebrationStore,
  type CelebrationData,
  type CelebrationType,
} from './celebration-store'

describe('Celebration Store', () => {
  beforeEach(() => {
    // Reset store state before each test by setting state directly
    useCelebrationStore.setState({
      isOpen: false,
      celebration: null,
      queue: [],
    })
  })

  describe('Initial State', () => {
    it('should start with isOpen false', () => {
      const { result } = renderHook(() => useCelebrationStore())
      expect(result.current.isOpen).toBe(false)
    })

    it('should start with celebration null', () => {
      const { result } = renderHook(() => useCelebrationStore())
      expect(result.current.celebration).toBeNull()
    })

    it('should start with empty queue', () => {
      const { result } = renderHook(() => useCelebrationStore())
      expect(result.current.queue).toHaveLength(0)
    })
  })

  describe('showCelebration', () => {
    it('should show celebration immediately when not open', () => {
      const { result } = renderHook(() => useCelebrationStore())
      const celebration: CelebrationData = {
        type: 'badge',
        title: 'Test Badge',
        subtitle: 'First Badge',
        emoji: '🎯',
      }

      act(() => {
        result.current.showCelebration(celebration)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.celebration).toEqual(celebration)
    })

    it('should queue celebration when one is already showing', () => {
      const { result } = renderHook(() => useCelebrationStore())
      const first: CelebrationData = {
        type: 'badge',
        title: 'First',
        subtitle: 'First Badge',
        emoji: '🎯',
      }
      const second: CelebrationData = {
        type: 'level_up',
        title: 'Second',
        subtitle: 'Level 2',
        emoji: '🚀',
      }

      act(() => {
        result.current.showCelebration(first)
        result.current.showCelebration(second)
      })

      expect(result.current.celebration).toEqual(first)
      expect(result.current.queue).toHaveLength(1)
      expect(result.current.queue[0]).toEqual(second)
    })

    it('should queue multiple celebrations', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.showCelebration({
          type: 'badge',
          title: 'First',
          subtitle: '',
          emoji: '1',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Second',
          subtitle: '',
          emoji: '2',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Third',
          subtitle: '',
          emoji: '3',
        })
      })

      expect(result.current.queue).toHaveLength(2)
    })
  })

  describe('hideCelebration', () => {
    it('should hide celebration when queue is empty', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.showCelebration({
          type: 'badge',
          title: 'Test',
          subtitle: '',
          emoji: '🎯',
        })
      })

      act(() => {
        result.current.hideCelebration()
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.celebration).toBeNull()
    })

    it('should show next celebration from queue', () => {
      const { result } = renderHook(() => useCelebrationStore())
      const second: CelebrationData = {
        type: 'level_up',
        title: 'Second',
        subtitle: 'Level 2',
        emoji: '🚀',
      }

      act(() => {
        result.current.showCelebration({
          type: 'badge',
          title: 'First',
          subtitle: '',
          emoji: '1',
        })
        result.current.showCelebration(second)
      })

      act(() => {
        result.current.hideCelebration()
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.celebration).toEqual(second)
      expect(result.current.queue).toHaveLength(0)
    })

    it('should process queue in order', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.showCelebration({
          type: 'badge',
          title: 'First',
          subtitle: '',
          emoji: '1',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Second',
          subtitle: '',
          emoji: '2',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Third',
          subtitle: '',
          emoji: '3',
        })
      })

      act(() => {
        result.current.hideCelebration()
      })
      expect(result.current.celebration?.title).toBe('Second')

      act(() => {
        result.current.hideCelebration()
      })
      expect(result.current.celebration?.title).toBe('Third')

      act(() => {
        result.current.hideCelebration()
      })
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('clearQueue', () => {
    it('should clear all queued celebrations', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.showCelebration({
          type: 'badge',
          title: 'First',
          subtitle: '',
          emoji: '1',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Second',
          subtitle: '',
          emoji: '2',
        })
        result.current.showCelebration({
          type: 'badge',
          title: 'Third',
          subtitle: '',
          emoji: '3',
        })
      })

      expect(result.current.queue).toHaveLength(2)

      act(() => {
        result.current.clearQueue()
      })

      expect(result.current.queue).toHaveLength(0)
      expect(result.current.isOpen).toBe(true) // Current celebration still showing
    })
  })

  describe('celebrateBadge', () => {
    it('should create badge celebration', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateBadge('First Steps', '🎯', 100)
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.celebration?.type).toBe('badge')
      expect(result.current.celebration?.title).toBe('Badge Conquistado!')
      expect(result.current.celebration?.subtitle).toBe('First Steps')
      expect(result.current.celebration?.emoji).toBe('🎯')
      expect(result.current.celebration?.xpReward).toBe(100)
    })

    it('should work without xpReward', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateBadge('Achievement', '🏆')
      })

      expect(result.current.celebration?.xpReward).toBeUndefined()
    })
  })

  describe('celebrateLevelUp', () => {
    it('should create level up celebration', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateLevelUp(5, 200)
      })

      expect(result.current.celebration?.type).toBe('level_up')
      expect(result.current.celebration?.title).toBe('Level Up!')
      expect(result.current.celebration?.subtitle).toBe('Nivel 5')
      expect(result.current.celebration?.emoji).toBe('🚀')
      expect(result.current.celebration?.xpReward).toBe(200)
    })
  })

  describe('celebrateRankUp', () => {
    it('should create rank up celebration with aprendiz emoji', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('aprendiz', 300)
      })

      expect(result.current.celebration?.type).toBe('rank_up')
      expect(result.current.celebration?.title).toBe('Novo Rank!')
      expect(result.current.celebration?.subtitle).toBe('Aprendiz')
      expect(result.current.celebration?.emoji).toBe('📚')
    })

    it('should create rank up celebration with contribuidor emoji', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('contribuidor')
      })

      expect(result.current.celebration?.emoji).toBe('🔧')
    })

    it('should create rank up celebration with mentor emoji', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('mentor')
      })

      expect(result.current.celebration?.emoji).toBe('🎓')
    })

    it('should create rank up celebration with arquiteto emoji', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('arquiteto')
      })

      expect(result.current.celebration?.emoji).toBe('🏛️')
    })

    it('should use default emoji for unknown rank', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('unknown_rank')
      })

      expect(result.current.celebration?.emoji).toBe('⭐')
    })

    it('should capitalize rank name', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateRankUp('MENTOR')
      })

      expect(result.current.celebration?.subtitle).toBe('MENTOR')
    })
  })

  describe('celebrateStreak', () => {
    it('should create streak celebration', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateStreak(7, 150)
      })

      expect(result.current.celebration?.type).toBe('streak')
      expect(result.current.celebration?.title).toBe('Streak Incrivel!')
      expect(result.current.celebration?.subtitle).toBe('7 dias consecutivos!')
      expect(result.current.celebration?.emoji).toBe('🔥')
      expect(result.current.celebration?.xpReward).toBe(150)
    })
  })

  describe('celebrateVideo', () => {
    it('should create video completion celebration', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateVideo('Introduction to Python', 50)
      })

      expect(result.current.celebration?.type).toBe('video')
      expect(result.current.celebration?.title).toBe('Video Concluido!')
      expect(result.current.celebration?.subtitle).toBe('Introduction to Python')
      expect(result.current.celebration?.emoji).toBe('🎬')
      expect(result.current.celebration?.xpReward).toBe(50)
    })
  })

  describe('celebrateMilestone', () => {
    it('should create custom milestone celebration', () => {
      const { result } = renderHook(() => useCelebrationStore())

      act(() => {
        result.current.celebrateMilestone('100 Messages!', 'Chat Master', '💬', 500)
      })

      expect(result.current.celebration?.type).toBe('milestone')
      expect(result.current.celebration?.title).toBe('100 Messages!')
      expect(result.current.celebration?.subtitle).toBe('Chat Master')
      expect(result.current.celebration?.emoji).toBe('💬')
      expect(result.current.celebration?.xpReward).toBe(500)
    })
  })

  describe('CelebrationType', () => {
    it('should support all celebration types', () => {
      const types: CelebrationType[] = [
        'badge',
        'level_up',
        'rank_up',
        'streak',
        'milestone',
        'video',
      ]

      types.forEach((type) => {
        const celebration: CelebrationData = {
          type,
          title: 'Test',
          subtitle: 'Test',
          emoji: '🎯',
        }
        expect(celebration.type).toBe(type)
      })
    })
  })

  describe('CelebrationData', () => {
    it('should allow optional xpReward', () => {
      const celebration: CelebrationData = {
        type: 'badge',
        title: 'Test',
        subtitle: 'Test',
        emoji: '🎯',
      }
      expect(celebration.xpReward).toBeUndefined()
    })

    it('should allow optional description', () => {
      const celebration: CelebrationData = {
        type: 'badge',
        title: 'Test',
        subtitle: 'Test',
        emoji: '🎯',
      }
      expect(celebration.description).toBeUndefined()
    })

    it('should allow all properties', () => {
      const celebration: CelebrationData = {
        type: 'badge',
        title: 'Test',
        subtitle: 'Test',
        emoji: '🎯',
        xpReward: 100,
        description: 'Test description',
      }
      expect(celebration.xpReward).toBe(100)
      expect(celebration.description).toBe('Test description')
    })
  })
})
