/**
 * Wikipedia Links Tests
 */

import { describe, it, expect } from 'vitest'
import { wikipediaLinks, getWikipediaLink } from './wikipedia-links'

describe('Wikipedia Links', () => {
  describe('wikipediaLinks', () => {
    it('should have links for all agents', () => {
      const expectedAgents = [
        'abaporu',
        'anita',
        'senna',
        'zumbi',
        'tiradentes',
        'obaluaie',
        'niemeyer',
        'nana',
        'lampiao',
        'ceuci',
        'dandara',
        'machado',
        'bonifacio',
        'deodoro',
        'drummond',
        'quiteria',
        'oxossi',
      ]

      expectedAgents.forEach((agent) => {
        expect(wikipediaLinks[agent]).toBeDefined()
        expect(wikipediaLinks[agent].pt).toBeDefined()
        expect(wikipediaLinks[agent].en).toBeDefined()
      })
    })

    it('should have valid URLs for all agents', () => {
      Object.entries(wikipediaLinks).forEach(([_agent, links]) => {
        expect(links.pt).toMatch(/^https:\/\/pt\.wikipedia\.org\/wiki\//)
        expect(links.en).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//)
      })
    })

    it('should have correct URL for zumbi', () => {
      expect(wikipediaLinks.zumbi.pt).toBe('https://pt.wikipedia.org/wiki/Zumbi_dos_Palmares')
      expect(wikipediaLinks.zumbi.en).toBe('https://en.wikipedia.org/wiki/Zumbi')
    })

    it('should have correct URL for anita', () => {
      expect(wikipediaLinks.anita.pt).toBe('https://pt.wikipedia.org/wiki/Anita_Garibaldi')
      expect(wikipediaLinks.anita.en).toBe('https://en.wikipedia.org/wiki/Anita_Garibaldi')
    })

    it('should have correct URL for tiradentes', () => {
      expect(wikipediaLinks.tiradentes.pt).toBe('https://pt.wikipedia.org/wiki/Tiradentes')
      expect(wikipediaLinks.tiradentes.en).toBe('https://en.wikipedia.org/wiki/Tiradentes')
    })
  })

  describe('getWikipediaLink', () => {
    it('should return Portuguese link for valid agent', () => {
      const link = getWikipediaLink('zumbi', 'pt')
      expect(link).toBe('https://pt.wikipedia.org/wiki/Zumbi_dos_Palmares')
    })

    it('should return English link for valid agent', () => {
      const link = getWikipediaLink('zumbi', 'en')
      expect(link).toBe('https://en.wikipedia.org/wiki/Zumbi')
    })

    it('should return undefined for invalid agent', () => {
      const link = getWikipediaLink('invalid-agent', 'pt')
      expect(link).toBeUndefined()
    })

    it('should return undefined for empty agent', () => {
      const link = getWikipediaLink('', 'pt')
      expect(link).toBeUndefined()
    })

    it('should work for all agents in both locales', () => {
      Object.keys(wikipediaLinks).forEach((agent) => {
        const ptLink = getWikipediaLink(agent, 'pt')
        const enLink = getWikipediaLink(agent, 'en')
        expect(ptLink).toBeDefined()
        expect(enLink).toBeDefined()
      })
    })
  })
})
