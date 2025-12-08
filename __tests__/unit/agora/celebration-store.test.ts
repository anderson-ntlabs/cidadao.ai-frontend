/**
 * @vitest-environment jsdom
 *
 * Celebration Store Tests
 *
 * Tests for the global celebration store:
 * - showCelebration
 * - hideCelebration
 * - Queue management
 * - Helper functions
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCelebrationStore } from '@/store/celebration-store'

describe('Celebration Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCelebrationStore.setState({
      isOpen: false,
      celebration: null,
      queue: [],
    })
  })

  describe('showCelebration', () => {
    it('should open modal with celebration data', () => {
      const store = useCelebrationStore.getState()

      store.showCelebration({
        type: 'badge',
        title: 'Badge Conquistado!',
        subtitle: 'Pioneiro',
        emoji: '🚀',
      })

      const state = useCelebrationStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.celebration).not.toBeNull()
      expect(state.celebration?.title).toBe('Badge Conquistado!')
      expect(state.celebration?.emoji).toBe('🚀')
    })

    it('should queue celebration if one is already showing', () => {
      const store = useCelebrationStore.getState()

      // Show first celebration
      store.showCelebration({
        type: 'badge',
        title: 'First',
        subtitle: 'First Badge',
        emoji: '🥇',
      })

      // Try to show second while first is open
      store.showCelebration({
        type: 'level_up',
        title: 'Second',
        subtitle: 'Level Up',
        emoji: '🚀',
      })

      const state = useCelebrationStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.celebration?.title).toBe('First')
      expect(state.queue.length).toBe(1)
      expect(state.queue[0].title).toBe('Second')
    })
  })

  describe('hideCelebration', () => {
    it('should close modal when no queue', () => {
      const store = useCelebrationStore.getState()

      store.showCelebration({
        type: 'badge',
        title: 'Test',
        subtitle: 'Test',
        emoji: '🎉',
      })

      store.hideCelebration()

      const state = useCelebrationStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.celebration).toBeNull()
    })

    it('should show next in queue when hiding', () => {
      const store = useCelebrationStore.getState()

      // Show first
      store.showCelebration({
        type: 'badge',
        title: 'First',
        subtitle: 'First',
        emoji: '🥇',
      })

      // Queue second
      store.showCelebration({
        type: 'level_up',
        title: 'Second',
        subtitle: 'Second',
        emoji: '🥈',
      })

      // Queue third
      store.showCelebration({
        type: 'streak',
        title: 'Third',
        subtitle: 'Third',
        emoji: '🥉',
      })

      // Hide first
      store.hideCelebration()

      const state = useCelebrationStore.getState()
      expect(state.isOpen).toBe(true)
      expect(state.celebration?.title).toBe('Second')
      expect(state.queue.length).toBe(1)
      expect(state.queue[0].title).toBe('Third')
    })
  })

  describe('clearQueue', () => {
    it('should clear all queued celebrations', () => {
      const store = useCelebrationStore.getState()

      // Show and queue
      store.showCelebration({ type: 'badge', title: '1', subtitle: '1', emoji: '1️⃣' })
      store.showCelebration({ type: 'badge', title: '2', subtitle: '2', emoji: '2️⃣' })
      store.showCelebration({ type: 'badge', title: '3', subtitle: '3', emoji: '3️⃣' })

      expect(useCelebrationStore.getState().queue.length).toBe(2)

      store.clearQueue()

      expect(useCelebrationStore.getState().queue.length).toBe(0)
      // Current celebration should still be showing
      expect(useCelebrationStore.getState().isOpen).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    describe('celebrateBadge', () => {
      it('should create badge celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateBadge('Pioneiro', '🚀', 50)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('badge')
        expect(state.celebration?.title).toBe('Badge Conquistado!')
        expect(state.celebration?.subtitle).toBe('Pioneiro')
        expect(state.celebration?.emoji).toBe('🚀')
        expect(state.celebration?.xpReward).toBe(50)
      })
    })

    describe('celebrateLevelUp', () => {
      it('should create level up celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateLevelUp(5, 100)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('level_up')
        expect(state.celebration?.title).toBe('Level Up!')
        expect(state.celebration?.subtitle).toBe('Nivel 5')
        expect(state.celebration?.xpReward).toBe(100)
      })
    })

    describe('celebrateRankUp', () => {
      it('should create rank up celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateRankUp('contribuidor', 200)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('rank_up')
        expect(state.celebration?.title).toBe('Novo Rank!')
        expect(state.celebration?.subtitle).toBe('Contribuidor')
      })

      it('should use correct emoji for rank', () => {
        const store = useCelebrationStore.getState()

        store.celebrateRankUp('mentor')

        const state = useCelebrationStore.getState()
        expect(state.celebration?.emoji).toBe('🎓')
      })
    })

    describe('celebrateStreak', () => {
      it('should create streak celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateStreak(7, 50)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('streak')
        expect(state.celebration?.title).toBe('Streak Incrivel!')
        expect(state.celebration?.subtitle).toBe('7 dias consecutivos!')
        expect(state.celebration?.emoji).toBe('🔥')
      })
    })

    describe('celebrateVideo', () => {
      it('should create video celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateVideo('Introdução ao Next.js', 25)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('video')
        expect(state.celebration?.title).toBe('Video Concluido!')
        expect(state.celebration?.subtitle).toBe('Introdução ao Next.js')
        expect(state.celebration?.xpReward).toBe(25)
      })
    })

    describe('celebrateMilestone', () => {
      it('should create custom milestone celebration', () => {
        const store = useCelebrationStore.getState()

        store.celebrateMilestone('Desafio Concluido!', '+50 XP', '🎯', 50)

        const state = useCelebrationStore.getState()
        expect(state.celebration?.type).toBe('milestone')
        expect(state.celebration?.title).toBe('Desafio Concluido!')
        expect(state.celebration?.subtitle).toBe('+50 XP')
        expect(state.celebration?.emoji).toBe('🎯')
        expect(state.celebration?.xpReward).toBe(50)
      })
    })
  })
})
