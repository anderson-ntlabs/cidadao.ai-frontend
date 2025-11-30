/**
 * Badge Store
 *
 * Zustand store for managing user achievement badges
 * Handles badge fetching, caching, and animation state
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BadgeStore, UserBadge, BadgeType } from '@/types/badge'
import { badgeService } from '@/lib/services/badge.service'
import { logger } from '@/lib/utils/logger'

// Initial state
const initialState = {
  badges: [] as UserBadge[],
  isLoading: false,
  error: null as string | null,
  lastFetch: null as string | null,
  newBadgeAnimation: null as BadgeType | null,
}

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // =====================
      // Data Fetching
      // =====================

      loadBadges: async (userId?: string) => {
        // Don't fetch if already loading
        if (get().isLoading) return

        set({ isLoading: true, error: null })

        try {
          if (userId) {
            const badges = await badgeService.getUserBadges(userId)
            set({
              badges,
              isLoading: false,
              lastFetch: new Date().toISOString(),
            })
            logger.debug('Badges loaded', { count: badges.length })
          } else {
            // No userId - use cached badges from localStorage
            set({ isLoading: false })
            logger.debug('Using cached badges (no userId)')
          }
        } catch (error) {
          logger.error('Failed to load badges', { error })
          set({
            isLoading: false,
            error: 'Falha ao carregar badges',
          })
        }
      },

      refreshBadges: async () => {
        const { lastFetch } = get()

        // Only refresh if last fetch was more than 1 minute ago
        if (lastFetch) {
          const lastFetchTime = new Date(lastFetch).getTime()
          const now = Date.now()
          if (now - lastFetchTime < 60000) {
            logger.debug('Skipping badge refresh (too recent)')
            return
          }
        }

        // Force refresh
        set({ lastFetch: null })
        await get().loadBadges()
      },

      // =====================
      // Queries
      // =====================

      hasBadge: (type: BadgeType) => {
        const { badges } = get()
        return badges.some((b) => b.badge_type === type)
      },

      getBadge: (type: BadgeType) => {
        const { badges } = get()
        return badges.find((b) => b.badge_type === type)
      },

      // =====================
      // Animation
      // =====================

      showNewBadgeAnimation: (type: BadgeType) => {
        set({ newBadgeAnimation: type })

        // Add badge to local list if not already present
        const { badges } = get()
        if (!badges.some((b) => b.badge_type === type)) {
          const newBadge: UserBadge = {
            id: `local-${Date.now()}`,
            user_id: 'local',
            badge_type: type,
            earned_at: new Date().toISOString(),
            source_type: 'survey',
            source_id: null,
          }
          set({ badges: [...badges, newBadge] })
        }

        // Auto-clear animation after 5 seconds
        setTimeout(() => {
          set((state) => ({
            newBadgeAnimation: state.newBadgeAnimation === type ? null : state.newBadgeAnimation,
          }))
        }, 5000)

        logger.info('New badge animation triggered', { type })
      },

      clearNewBadgeAnimation: () => {
        set({ newBadgeAnimation: null })
      },

      // =====================
      // Reset
      // =====================

      clearBadges: () => {
        set({
          badges: [],
          lastFetch: null,
          newBadgeAnimation: null,
        })
        logger.info('Badges cleared')
      },
    }),
    {
      name: 'cidadao-ai-badges',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist badges list and last fetch time
      partialize: (state) => ({
        badges: state.badges,
        lastFetch: state.lastFetch,
      }),
    }
  )
)

// =====================
// Selectors
// =====================

/**
 * Select badge count
 */
export const selectBadgeCount = (state: BadgeStore) => state.badges.length

/**
 * Select if user has colaborador badge (survey completion)
 */
export const selectHasColaboradorBadge = (state: BadgeStore) =>
  state.badges.some((b) => b.badge_type === 'colaborador')

/**
 * Select badges sorted by earned date (newest first)
 */
export const selectBadgesSortedByDate = (state: BadgeStore) =>
  [...state.badges].sort(
    (a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
  )

/**
 * Select if there's an active badge animation
 */
export const selectHasAnimation = (state: BadgeStore) => state.newBadgeAnimation !== null
