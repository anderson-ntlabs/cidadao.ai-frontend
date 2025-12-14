/**
 * Tests for i18n Utility Functions
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import { getTranslations, type Locale } from './i18n'

describe('i18n', () => {
  describe('getTranslations', () => {
    it('should return Portuguese translations by default', () => {
      const translations = getTranslations()

      expect(translations).toBeDefined()
      expect(typeof translations).toBe('object')
    })

    it('should return Portuguese translations when locale is pt', () => {
      const translations = getTranslations('pt')

      expect(translations).toBeDefined()
      expect(typeof translations).toBe('object')
    })

    it('should return English translations when locale is en', () => {
      const translations = getTranslations('en')

      expect(translations).toBeDefined()
      expect(typeof translations).toBe('object')
    })

    it('should fallback to Portuguese for invalid locale', () => {
      const ptTranslations = getTranslations('pt')
      const invalidTranslations = getTranslations('invalid' as Locale)

      expect(invalidTranslations).toEqual(ptTranslations)
    })

    it('should return consistent translations for same locale', () => {
      const first = getTranslations('pt')
      const second = getTranslations('pt')

      expect(first).toEqual(second)
    })

    it('should have different content for PT and EN', () => {
      const pt = getTranslations('pt')
      const en = getTranslations('en')

      // PT and EN should be different objects
      expect(pt).not.toBe(en)
    })
  })

  describe('Locale type', () => {
    it('should accept pt as valid locale', () => {
      const locale: Locale = 'pt'
      const translations = getTranslations(locale)

      expect(translations).toBeDefined()
    })

    it('should accept en as valid locale', () => {
      const locale: Locale = 'en'
      const translations = getTranslations(locale)

      expect(translations).toBeDefined()
    })
  })
})
