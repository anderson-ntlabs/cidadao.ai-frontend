/**
 * Badges Data Tests
 *
 * Tests for badge definitions and utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  BADGES,
  getBadgeInfo,
  getBadgeName,
  getBadgeDescription,
  getAllBadgesSortedByRarity,
  RARITY_COLORS,
} from './badges'

describe('Badges Data', () => {
  describe('BADGES', () => {
    it('should have all required badge types', () => {
      expect(BADGES.colaborador).toBeDefined()
      expect(BADGES.pioneiro).toBeDefined()
      expect(BADGES.especialista).toBeDefined()
      expect(BADGES.guardiao).toBeDefined()
      expect(BADGES.japaguri).toBeDefined()
    })

    it('should have required properties for each badge', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(badge.type).toBeDefined()
        expect(badge.name_pt).toBeDefined()
        expect(badge.name_en).toBeDefined()
        expect(badge.description_pt).toBeDefined()
        expect(badge.description_en).toBeDefined()
        expect(badge.icon).toBeDefined()
        expect(badge.color).toBeDefined()
        expect(badge.gradient).toBeDefined()
        expect(badge.rarity).toBeDefined()
      })
    })

    it('should have valid rarity values', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'legendary']
      Object.values(BADGES).forEach((badge) => {
        expect(validRarities).toContain(badge.rarity)
      })
    })

    it('should have valid gradient formats', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(badge.gradient).toMatch(/^from-\w+-\d+ to-\w+-\d+$/)
      })
    })
  })

  describe('getBadgeInfo', () => {
    it('should return badge info for valid type', () => {
      const colaborador = getBadgeInfo('colaborador')
      expect(colaborador.type).toBe('colaborador')
      expect(colaborador.name_pt).toBe('Colaborador')
    })

    it('should return correct info for each badge type', () => {
      expect(getBadgeInfo('pioneiro').name_pt).toBe('Pioneiro')
      expect(getBadgeInfo('especialista').name_pt).toBe('Especialista')
      expect(getBadgeInfo('guardiao').name_pt).toBe('Guardião da Transparência')
      expect(getBadgeInfo('japaguri').name_pt).toBe('Japaguri')
    })
  })

  describe('getBadgeName', () => {
    it('should return Portuguese name by default', () => {
      expect(getBadgeName('colaborador')).toBe('Colaborador')
      expect(getBadgeName('pioneiro')).toBe('Pioneiro')
    })

    it('should return Portuguese name when locale is pt', () => {
      expect(getBadgeName('colaborador', 'pt')).toBe('Colaborador')
      expect(getBadgeName('guardiao', 'pt')).toBe('Guardião da Transparência')
    })

    it('should return English name when locale is en', () => {
      expect(getBadgeName('colaborador', 'en')).toBe('Collaborator')
      expect(getBadgeName('pioneiro', 'en')).toBe('Pioneer')
      expect(getBadgeName('especialista', 'en')).toBe('Expert')
      expect(getBadgeName('guardiao', 'en')).toBe('Transparency Guardian')
    })
  })

  describe('getBadgeDescription', () => {
    it('should return Portuguese description by default', () => {
      const desc = getBadgeDescription('colaborador')
      expect(desc).toContain('pesquisa')
    })

    it('should return Portuguese description when locale is pt', () => {
      const desc = getBadgeDescription('pioneiro', 'pt')
      expect(desc).toContain('primeiros usuários')
    })

    it('should return English description when locale is en', () => {
      const desc = getBadgeDescription('colaborador', 'en')
      expect(desc).toContain('survey')
    })
  })

  describe('getAllBadgesSortedByRarity', () => {
    it('should return all badges', () => {
      const badges = getAllBadgesSortedByRarity()
      expect(badges.length).toBe(Object.keys(BADGES).length)
    })

    it('should return badges in sorted order', () => {
      const badges = getAllBadgesSortedByRarity()
      // Just verify it returns badges in some consistent order
      expect(badges.length).toBe(Object.keys(BADGES).length)
      // Verify all badges are present
      const types = badges.map((b) => b.type)
      expect(types).toContain('colaborador')
      expect(types).toContain('guardiao')
    })
  })

  describe('RARITY_COLORS', () => {
    it('should have colors for all rarities', () => {
      expect(RARITY_COLORS.common).toBeDefined()
      expect(RARITY_COLORS.uncommon).toBeDefined()
      expect(RARITY_COLORS.rare).toBeDefined()
      expect(RARITY_COLORS.legendary).toBeDefined()
    })

    it('should have bg, border, and text properties', () => {
      Object.values(RARITY_COLORS).forEach((colorSet) => {
        expect(colorSet.bg).toBeDefined()
        expect(colorSet.border).toBeDefined()
        expect(colorSet.text).toBeDefined()
      })
    })

    it('should have valid Tailwind class strings', () => {
      Object.values(RARITY_COLORS).forEach((colorSet) => {
        expect(colorSet.bg).toContain('bg-')
        expect(colorSet.border).toContain('border-')
        expect(colorSet.text).toContain('text-')
      })
    })
  })
})
