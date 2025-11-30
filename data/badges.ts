/**
 * Badge Definitions
 *
 * Gamification badge system for Cidadao.AI
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import type { BadgeInfo, BadgeType } from '@/types/badge'

/**
 * Badge definitions with localized content
 */
export const BADGES: Record<BadgeType, BadgeInfo> = {
  colaborador: {
    type: 'colaborador',
    name_pt: 'Colaborador',
    name_en: 'Collaborator',
    description_pt:
      'Você participou da pesquisa de experiência e nos ajudou a melhorar a plataforma!',
    description_en: 'You participated in the experience survey and helped us improve the platform!',
    icon: 'Medal',
    color: 'amber',
    gradient: 'from-amber-400 to-amber-600',
    rarity: 'common',
  },

  pioneiro: {
    type: 'pioneiro',
    name_pt: 'Pioneiro',
    name_en: 'Pioneer',
    description_pt: 'Um dos primeiros usuários a explorar o Cidadão.AI!',
    description_en: 'One of the first users to explore Cidadão.AI!',
    icon: 'Rocket',
    color: 'purple',
    gradient: 'from-purple-400 to-purple-600',
    rarity: 'uncommon',
  },

  especialista: {
    type: 'especialista',
    name_pt: 'Especialista',
    name_en: 'Expert',
    description_pt: 'Usuário avançado que domina todas as funcionalidades da plataforma.',
    description_en: 'Advanced user who masters all platform features.',
    icon: 'Star',
    color: 'blue',
    gradient: 'from-blue-400 to-blue-600',
    rarity: 'rare',
  },

  guardiao: {
    type: 'guardiao',
    name_pt: 'Guardião da Transparência',
    name_en: 'Transparency Guardian',
    description_pt: 'Defensor incansável da transparência pública brasileira.',
    description_en: 'Tireless defender of Brazilian public transparency.',
    icon: 'Shield',
    color: 'green',
    gradient: 'from-green-400 to-emerald-600',
    rarity: 'legendary',
  },
}

/**
 * Get badge info by type
 */
export function getBadgeInfo(type: BadgeType): BadgeInfo {
  return BADGES[type]
}

/**
 * Get localized badge name
 */
export function getBadgeName(type: BadgeType, locale: 'pt' | 'en' = 'pt'): string {
  const badge = BADGES[type]
  return locale === 'pt' ? badge.name_pt : badge.name_en
}

/**
 * Get localized badge description
 */
export function getBadgeDescription(type: BadgeType, locale: 'pt' | 'en' = 'pt'): string {
  const badge = BADGES[type]
  return locale === 'pt' ? badge.description_pt : badge.description_en
}

/**
 * Get all badges sorted by rarity
 */
export function getAllBadgesSortedByRarity(): BadgeInfo[] {
  const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 }
  return Object.values(BADGES).sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])
}

/**
 * Rarity colors for visual distinction
 */
export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
  },
  uncommon: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-700 dark:text-purple-300',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    border: 'border-amber-400 dark:border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
}
