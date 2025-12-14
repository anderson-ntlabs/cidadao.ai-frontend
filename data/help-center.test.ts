/**
 * Tests for Help Center Data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  helpCategories,
  helpArticles,
  popularArticles,
  recentArticles,
  type HelpCategory,
  type HelpArticle,
} from './help-center'

describe('Help Center Data', () => {
  describe('helpCategories', () => {
    it('should be an array of categories', () => {
      expect(Array.isArray(helpCategories)).toBe(true)
      expect(helpCategories.length).toBeGreaterThan(0)
    })

    it('should have required properties for each category', () => {
      helpCategories.forEach((category) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('icon')
        expect(category).toHaveProperty('articles')
      })
    })

    it('should have unique category IDs', () => {
      const ids = helpCategories.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should include getting-started category', () => {
      const gettingStarted = helpCategories.find((c) => c.id === 'getting-started')
      expect(gettingStarted).toBeDefined()
      expect(gettingStarted?.name).toBe('Primeiros Passos')
    })

    it('should include agents category', () => {
      const agents = helpCategories.find((c) => c.id === 'agents')
      expect(agents).toBeDefined()
      expect(agents?.name).toBe('Agentes de IA')
    })

    it('should include investigations category', () => {
      const investigations = helpCategories.find((c) => c.id === 'investigations')
      expect(investigations).toBeDefined()
    })

    it('should have positive article counts', () => {
      helpCategories.forEach((category) => {
        expect(category.articles).toBeGreaterThan(0)
      })
    })
  })

  describe('helpArticles', () => {
    it('should be an array of articles', () => {
      expect(Array.isArray(helpArticles)).toBe(true)
      expect(helpArticles.length).toBeGreaterThan(0)
    })

    it('should have required properties for each article', () => {
      helpArticles.forEach((article) => {
        expect(article).toHaveProperty('id')
        expect(article).toHaveProperty('title')
        expect(article).toHaveProperty('description')
        expect(article).toHaveProperty('category')
        expect(article).toHaveProperty('tags')
        expect(article).toHaveProperty('content')
      })
    })

    it('should have unique article IDs', () => {
      const ids = helpArticles.map((a) => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have articles with valid categories', () => {
      const validCategories = helpCategories.map((c) => c.id)
      helpArticles.forEach((article) => {
        expect(validCategories).toContain(article.category)
      })
    })

    it('should have non-empty tags array', () => {
      helpArticles.forEach((article) => {
        expect(Array.isArray(article.tags)).toBe(true)
        expect(article.tags.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty content', () => {
      helpArticles.forEach((article) => {
        expect(article.content).toBeTruthy()
        expect(article.content.length).toBeGreaterThan(0)
      })
    })

    it('should include what-is-cidadao-ai article', () => {
      const article = helpArticles.find((a) => a.id === 'what-is-cidadao-ai')
      expect(article).toBeDefined()
      expect(article?.category).toBe('getting-started')
    })

    it('should include how-to-start article', () => {
      const article = helpArticles.find((a) => a.id === 'how-to-start')
      expect(article).toBeDefined()
    })

    it('should have optional relatedArticles as array', () => {
      helpArticles.forEach((article) => {
        if (article.relatedArticles) {
          expect(Array.isArray(article.relatedArticles)).toBe(true)
        }
      })
    })

    it('should have non-negative helpful/notHelpful counts', () => {
      helpArticles.forEach((article) => {
        if (article.helpful !== undefined) {
          expect(article.helpful).toBeGreaterThanOrEqual(0)
        }
        if (article.notHelpful !== undefined) {
          expect(article.notHelpful).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('popularArticles', () => {
    it('should be an array', () => {
      expect(Array.isArray(popularArticles)).toBe(true)
    })

    it('should contain valid article IDs', () => {
      const articleIds = helpArticles.map((a) => a.id)
      popularArticles.forEach((id) => {
        expect(articleIds).toContain(id)
      })
    })

    it('should include what-is-cidadao-ai', () => {
      expect(popularArticles).toContain('what-is-cidadao-ai')
    })

    it('should include how-to-start', () => {
      expect(popularArticles).toContain('how-to-start')
    })
  })

  describe('recentArticles', () => {
    it('should be an array', () => {
      expect(Array.isArray(recentArticles)).toBe(true)
    })

    it('should contain valid article IDs', () => {
      const articleIds = helpArticles.map((a) => a.id)
      recentArticles.forEach((id) => {
        expect(articleIds).toContain(id)
      })
    })
  })
})
