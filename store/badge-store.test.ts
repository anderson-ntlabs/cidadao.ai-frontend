/**
 * Badge Store Tests
 *
 * Tests for the badge management Zustand store
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-12
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  useBadgeStore,
  selectBadgeCount,
  selectHasColaboradorBadge,
  selectBadgesSortedByDate,
  selectHasAnimation,
} from './badge-store'
import type { BadgeType, UserBadge } from '@/types/badge'

// Mock the badge service
vi.mock('@/lib/services/badge.service', () => ({
  badgeService: {
    getUserBadges: vi.fn(),
  },
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

import { badgeService } from '@/lib/services/badge.service'

describe('BadgeStore', () => {
  const mockBadges: UserBadge[] = [
    {
      id: 'badge-1',
      user_id: 'user-123',
      badge_type: 'colaborador',
      earned_at: '2025-12-01T10:00:00Z',
      source_type: 'survey',
      source_id: 'survey-1',
    },
    {
      id: 'badge-2',
      user_id: 'user-123',
      badge_type: 'pioneiro',
      earned_at: '2025-12-02T10:00:00Z',
      source_type: 'achievement',
      source_id: null,
    },
  ]

  beforeEach(() => {
    // Reset store state
    useBadgeStore.setState({
      badges: [],
      isLoading: false,
      error: null,
      lastFetch: null,
      newBadgeAnimation: null,
    })

    // Clear all mocks
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useBadgeStore.getState()
      expect(state.badges).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.lastFetch).toBeNull()
      expect(state.newBadgeAnimation).toBeNull()
    })
  })

  describe('loadBadges', () => {
    it('should load badges from service with userId', async () => {
      vi.mocked(badgeService.getUserBadges).mockResolvedValue(mockBadges)

      await useBadgeStore.getState().loadBadges('user-123')

      const state = useBadgeStore.getState()
      expect(state.badges).toEqual(mockBadges)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.lastFetch).not.toBeNull()
      expect(badgeService.getUserBadges).toHaveBeenCalledWith('user-123')
    })

    it('should use cached badges when no userId provided', async () => {
      // Set some cached badges
      useBadgeStore.setState({ badges: mockBadges })

      await useBadgeStore.getState().loadBadges()

      const state = useBadgeStore.getState()
      expect(state.badges).toEqual(mockBadges)
      expect(state.isLoading).toBe(false)
      expect(badgeService.getUserBadges).not.toHaveBeenCalled()
    })

    it('should not fetch if already loading', async () => {
      useBadgeStore.setState({ isLoading: true })

      await useBadgeStore.getState().loadBadges('user-123')

      expect(badgeService.getUserBadges).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(badgeService.getUserBadges).mockRejectedValue(new Error('Network error'))

      await useBadgeStore.getState().loadBadges('user-123')

      const state = useBadgeStore.getState()
      expect(state.badges).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Falha ao carregar badges')
    })
  })

  describe('refreshBadges', () => {
    it('should skip refresh if last fetch was less than 1 minute ago', async () => {
      const recentDate = new Date().toISOString()
      useBadgeStore.setState({ lastFetch: recentDate })

      await useBadgeStore.getState().refreshBadges()

      expect(badgeService.getUserBadges).not.toHaveBeenCalled()
    })

    it('should refresh if last fetch was more than 1 minute ago', async () => {
      const oldDate = new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      useBadgeStore.setState({ lastFetch: oldDate })
      vi.mocked(badgeService.getUserBadges).mockResolvedValue(mockBadges)

      await useBadgeStore.getState().refreshBadges()

      // Should have cleared lastFetch and attempted to load
      const state = useBadgeStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('hasBadge', () => {
    it('should return true when user has the badge', () => {
      useBadgeStore.setState({ badges: mockBadges })

      const result = useBadgeStore.getState().hasBadge('colaborador')

      expect(result).toBe(true)
    })

    it('should return false when user does not have the badge', () => {
      useBadgeStore.setState({ badges: mockBadges })

      const result = useBadgeStore.getState().hasBadge('especialista')

      expect(result).toBe(false)
    })

    it('should return false when badges array is empty', () => {
      const result = useBadgeStore.getState().hasBadge('colaborador')

      expect(result).toBe(false)
    })
  })

  describe('getBadge', () => {
    it('should return the badge when found', () => {
      useBadgeStore.setState({ badges: mockBadges })

      const result = useBadgeStore.getState().getBadge('colaborador')

      expect(result).toEqual(mockBadges[0])
    })

    it('should return undefined when badge not found', () => {
      useBadgeStore.setState({ badges: mockBadges })

      const result = useBadgeStore.getState().getBadge('especialista')

      expect(result).toBeUndefined()
    })
  })

  describe('showNewBadgeAnimation', () => {
    it('should set the animation type', () => {
      useBadgeStore.getState().showNewBadgeAnimation('colaborador')

      const state = useBadgeStore.getState()
      expect(state.newBadgeAnimation).toBe('colaborador')
    })

    it('should add badge to local list if not present', () => {
      useBadgeStore.getState().showNewBadgeAnimation('pioneiro')

      const state = useBadgeStore.getState()
      expect(state.badges).toHaveLength(1)
      expect(state.badges[0].badge_type).toBe('pioneiro')
      expect(state.badges[0].source_type).toBe('survey')
    })

    it('should not add duplicate badge', () => {
      useBadgeStore.setState({ badges: mockBadges })

      useBadgeStore.getState().showNewBadgeAnimation('colaborador')

      const state = useBadgeStore.getState()
      expect(state.badges).toHaveLength(2) // Original count, no duplicate
    })

    it('should auto-clear animation after 5 seconds', () => {
      useBadgeStore.getState().showNewBadgeAnimation('colaborador')

      expect(useBadgeStore.getState().newBadgeAnimation).toBe('colaborador')

      // Advance timers by 5 seconds
      vi.advanceTimersByTime(5000)

      expect(useBadgeStore.getState().newBadgeAnimation).toBeNull()
    })
  })

  describe('clearNewBadgeAnimation', () => {
    it('should clear the animation', () => {
      useBadgeStore.setState({ newBadgeAnimation: 'colaborador' })

      useBadgeStore.getState().clearNewBadgeAnimation()

      expect(useBadgeStore.getState().newBadgeAnimation).toBeNull()
    })
  })

  describe('clearBadges', () => {
    it('should reset badges state', () => {
      useBadgeStore.setState({
        badges: mockBadges,
        lastFetch: new Date().toISOString(),
        newBadgeAnimation: 'colaborador',
      })

      useBadgeStore.getState().clearBadges()

      const state = useBadgeStore.getState()
      expect(state.badges).toEqual([])
      expect(state.lastFetch).toBeNull()
      expect(state.newBadgeAnimation).toBeNull()
    })
  })

  describe('Selectors', () => {
    describe('selectBadgeCount', () => {
      it('should return the number of badges', () => {
        useBadgeStore.setState({ badges: mockBadges })

        const count = selectBadgeCount(useBadgeStore.getState())

        expect(count).toBe(2)
      })

      it('should return 0 for empty badges', () => {
        const count = selectBadgeCount(useBadgeStore.getState())

        expect(count).toBe(0)
      })
    })

    describe('selectHasColaboradorBadge', () => {
      it('should return true when colaborador badge exists', () => {
        useBadgeStore.setState({ badges: mockBadges })

        const result = selectHasColaboradorBadge(useBadgeStore.getState())

        expect(result).toBe(true)
      })

      it('should return false when colaborador badge does not exist', () => {
        useBadgeStore.setState({
          badges: [mockBadges[1]], // Only pioneiro
        })

        const result = selectHasColaboradorBadge(useBadgeStore.getState())

        expect(result).toBe(false)
      })
    })

    describe('selectBadgesSortedByDate', () => {
      it('should return badges sorted by earned date (newest first)', () => {
        useBadgeStore.setState({ badges: mockBadges })

        const sorted = selectBadgesSortedByDate(useBadgeStore.getState())

        expect(sorted[0].badge_type).toBe('pioneiro') // Dec 2
        expect(sorted[1].badge_type).toBe('colaborador') // Dec 1
      })

      it('should not mutate original array', () => {
        useBadgeStore.setState({ badges: mockBadges })

        const sorted = selectBadgesSortedByDate(useBadgeStore.getState())
        const original = useBadgeStore.getState().badges

        expect(sorted).not.toBe(original)
        expect(original[0].badge_type).toBe('colaborador') // Original order preserved
      })
    })

    describe('selectHasAnimation', () => {
      it('should return true when animation is active', () => {
        useBadgeStore.setState({ newBadgeAnimation: 'colaborador' })

        const result = selectHasAnimation(useBadgeStore.getState())

        expect(result).toBe(true)
      })

      it('should return false when no animation', () => {
        const result = selectHasAnimation(useBadgeStore.getState())

        expect(result).toBe(false)
      })
    })
  })
})
