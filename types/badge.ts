/**
 * Badge Types
 *
 * TypeScript interfaces for the gamification badge system
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

// ===========================================
// Badge Types
// ===========================================

export type BadgeType = 'colaborador' | 'pioneiro' | 'especialista' | 'guardiao' | 'japaguri'

export type BadgeSourceType = 'survey' | 'achievement' | 'admin' | 'system'

// ===========================================
// Badge Data
// ===========================================

export interface UserBadge {
  id: string
  user_id: string
  badge_type: BadgeType
  earned_at: string
  source_type: BadgeSourceType
  source_id: string | null
  metadata?: Record<string, unknown>
}

export interface BadgeInfo {
  type: BadgeType
  name_pt: string
  name_en: string
  description_pt: string
  description_en: string
  icon: string // Lucide icon name
  color: string // Tailwind color class
  gradient: string // Tailwind gradient classes
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

// ===========================================
// Badge Display
// ===========================================

export interface BadgeDisplayProps {
  badge: UserBadge
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  animate?: boolean
  locale?: 'pt' | 'en'
}

export interface BadgeIndicatorProps {
  badges: UserBadge[]
  maxDisplay?: number
  size?: 'sm' | 'md'
  locale?: 'pt' | 'en'
}

export interface BadgeShowcaseProps {
  badges: UserBadge[]
  locale?: 'pt' | 'en'
  onBadgeClick?: (badge: UserBadge) => void
}

// ===========================================
// Badge Store State
// ===========================================

export interface BadgeStoreState {
  badges: UserBadge[]
  isLoading: boolean
  error: string | null
  lastFetch: string | null

  // Animation state for newly earned badges
  newBadgeAnimation: BadgeType | null
}

export interface BadgeStoreActions {
  // Data fetching
  loadBadges: (userId?: string) => Promise<void>
  refreshBadges: () => Promise<void>

  // Queries
  hasBadge: (type: BadgeType) => boolean
  getBadge: (type: BadgeType) => UserBadge | undefined

  // Animation
  showNewBadgeAnimation: (type: BadgeType) => void
  clearNewBadgeAnimation: () => void

  // Reset
  clearBadges: () => void
}

export type BadgeStore = BadgeStoreState & BadgeStoreActions

// ===========================================
// Badge Analytics
// ===========================================

export interface BadgeAnalyticsEvent {
  event: 'badge_earned' | 'badge_viewed' | 'badge_shared'
  badge_type: BadgeType
  source_type?: BadgeSourceType
  source_id?: string
}
