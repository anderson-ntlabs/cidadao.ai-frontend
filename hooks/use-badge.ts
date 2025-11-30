/**
 * Badge Hook
 *
 * Convenience hook for badge-related actions
 * Provides simple API to check and display badges
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useBadgeStore, selectHasColaboradorBadge, selectBadgeCount } from '@/store/badge-store'
import { BADGES } from '@/data/badges'
import type { BadgeType } from '@/types/badge'

export function useBadge() {
  const {
    badges,
    isLoading,
    newBadgeAnimation,
    loadBadges,
    hasBadge,
    getBadge,
    showNewBadgeAnimation,
    clearNewBadgeAnimation,
  } = useBadgeStore()

  // Get badge info with localization
  const getBadgeInfo = (type: BadgeType, locale: 'pt' | 'en' = 'pt') => {
    const badge = BADGES[type]
    if (!badge) return null

    return {
      type: badge.type,
      name: locale === 'pt' ? badge.name_pt : badge.name_en,
      description: locale === 'pt' ? badge.description_pt : badge.description_en,
      icon: badge.icon,
      color: badge.color,
      rarity: badge.rarity,
    }
  }

  // Check if user has collaborator badge
  const hasCollaboratorBadge = hasBadge('colaborador')

  // Count badges
  const badgeCount = badges.length

  // Check if there's an active animation
  const hasAnimation = newBadgeAnimation !== null

  return {
    // State
    badges,
    isLoading,
    badgeCount,
    hasCollaboratorBadge,
    hasAnimation,
    newBadgeAnimation,

    // Actions
    loadBadges,
    hasBadge,
    getBadge,
    getBadgeInfo,
    showNewBadgeAnimation,
    clearNewBadgeAnimation,
  }
}
