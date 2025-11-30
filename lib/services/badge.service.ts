/**
 * Badge Service
 *
 * Manages user achievement badges in Supabase
 * Handles badge awarding, querying, and display information
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import type { UserBadge, BadgeType, BadgeSourceType, BadgeInfo } from '@/types/badge'
import { BADGES, getBadgeInfo, getBadgeName, getBadgeDescription } from '@/data/badges'

class BadgeService {
  private supabase = createClient()

  /**
   * Get all badges for a user
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error

      return (data as UserBadge[]) || []
    } catch (error) {
      logger.error('Failed to get user badges', { userId, error })
      return []
    }
  }

  /**
   * Check if user has a specific badge
   */
  async hasBadge(userId: string, badgeType: BadgeType): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badgeType)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false
        }
        throw error
      }

      return !!data
    } catch (error) {
      logger.error('Failed to check badge', { userId, badgeType, error })
      return false
    }
  }

  /**
   * Award a badge to user (if not already owned)
   */
  async awardBadge(
    userId: string,
    badgeType: BadgeType,
    sourceType: BadgeSourceType = 'system',
    sourceId?: string
  ): Promise<boolean> {
    try {
      // Check if user already has this badge
      const hasIt = await this.hasBadge(userId, badgeType)
      if (hasIt) {
        logger.info('User already has badge', { userId, badgeType })
        return false
      }

      // Award the badge
      const { error } = await this.supabase.from('user_badges').insert({
        user_id: userId,
        badge_type: badgeType,
        source_type: sourceType,
        source_id: sourceId || null,
        metadata: {
          awarded_at: new Date().toISOString(),
        },
      })

      if (error) {
        // Handle unique constraint violation (race condition)
        if (error.code === '23505') {
          logger.info('Badge already awarded (race condition)', { userId, badgeType })
          return false
        }
        throw error
      }

      logger.info('Badge awarded successfully', { userId, badgeType, sourceType })
      return true
    } catch (error) {
      logger.error('Failed to award badge', { userId, badgeType, error })
      return false
    }
  }

  /**
   * Get badge display information with localization
   */
  getBadgeDisplayInfo(
    badgeType: BadgeType,
    locale: 'pt' | 'en' = 'pt'
  ): BadgeInfo & {
    name: string
    description: string
  } {
    const info = getBadgeInfo(badgeType)
    return {
      ...info,
      name: getBadgeName(badgeType, locale),
      description: getBadgeDescription(badgeType, locale),
    }
  }

  /**
   * Get all available badge types with display info
   */
  getAllBadgeTypes(
    locale: 'pt' | 'en' = 'pt'
  ): Array<BadgeInfo & { name: string; description: string }> {
    return Object.keys(BADGES).map((type) => this.getBadgeDisplayInfo(type as BadgeType, locale))
  }

  /**
   * Get count of users with a specific badge (for rarity display)
   */
  async getBadgeCount(badgeType: BadgeType): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('user_badges')
        .select('id', { count: 'exact', head: true })
        .eq('badge_type', badgeType)

      if (error) throw error

      return count || 0
    } catch (error) {
      logger.error('Failed to get badge count', { badgeType, error })
      return 0
    }
  }

  /**
   * Get badge statistics for dashboard
   */
  async getBadgeStats(): Promise<Record<BadgeType, number>> {
    try {
      const stats: Record<BadgeType, number> = {
        colaborador: 0,
        pioneiro: 0,
        especialista: 0,
        guardiao: 0,
      }

      for (const badgeType of Object.keys(stats) as BadgeType[]) {
        stats[badgeType] = await this.getBadgeCount(badgeType)
      }

      return stats
    } catch (error) {
      logger.error('Failed to get badge stats', { error })
      return {
        colaborador: 0,
        pioneiro: 0,
        especialista: 0,
        guardiao: 0,
      }
    }
  }
}

// Singleton instance
export const badgeService = new BadgeService()
