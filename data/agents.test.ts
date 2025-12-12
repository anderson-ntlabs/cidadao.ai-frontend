/**
 * Agents Data Tests
 *
 * Tests for agent definitions and utility functions
 */

import { describe, it, expect } from 'vitest'
import {
  agents,
  EDUCATIONAL_AGENT_IDS,
  KIDS_AGENT_IDS,
  getEducationalAgents,
  isEducationalAgent,
  getAgentById,
  getAgentsByRole,
  getAgentsByTrack,
  getAgentsByTracks,
  getTrackExclusiveAgents,
  getKidsAgents,
  isKidsAgent,
  getKidsAgentById,
} from './agents'

describe('Agents Data', () => {
  describe('agents array', () => {
    it('should have at least 15 agents', () => {
      expect(agents.length).toBeGreaterThanOrEqual(15)
    })

    it('should have unique agent IDs', () => {
      const ids = agents.map((a) => a.id)
      const uniqueIds = [...new Set(ids)]
      expect(uniqueIds.length).toBe(ids.length)
    })

    it('should have required properties for each agent', () => {
      agents.forEach((agent) => {
        expect(agent.id).toBeDefined()
        expect(agent.name).toBeDefined()
        expect(agent.role).toBeDefined()
        expect(agent.role.pt).toBeDefined()
        expect(agent.role.en).toBeDefined()
        expect(agent.description).toBeDefined()
        expect(agent.description.pt).toBeDefined()
        expect(agent.description.en).toBeDefined()
        expect(agent.image).toBeDefined()
      })
    })

    it('should have valid image paths', () => {
      agents.forEach((agent) => {
        expect(agent.image).toMatch(/^\/agents\/.*\.(webp|png|jpg)$/)
      })
    })

    it('should have Wikipedia links for most agents', () => {
      const agentsWithWikipedia = agents.filter((a) => a.wikipedia)
      expect(agentsWithWikipedia.length).toBeGreaterThan(10)
    })
  })

  describe('EDUCATIONAL_AGENT_IDS', () => {
    it('should be an array of strings', () => {
      expect(Array.isArray(EDUCATIONAL_AGENT_IDS)).toBe(true)
      EDUCATIONAL_AGENT_IDS.forEach((id) => {
        expect(typeof id).toBe('string')
      })
    })
  })

  describe('KIDS_AGENT_IDS', () => {
    it('should contain monteiro_lobato and tarsila', () => {
      expect(KIDS_AGENT_IDS).toContain('monteiro_lobato')
      expect(KIDS_AGENT_IDS).toContain('tarsila')
    })
  })

  describe('getEducationalAgents', () => {
    it('should return an array of agents', () => {
      const educationalAgents = getEducationalAgents()
      expect(Array.isArray(educationalAgents)).toBe(true)
    })

    it('should only return agents with educational IDs', () => {
      const educationalAgents = getEducationalAgents()
      educationalAgents.forEach((agent) => {
        expect(EDUCATIONAL_AGENT_IDS).toContain(agent.id)
      })
    })
  })

  describe('isEducationalAgent', () => {
    it('should return true for educational agent IDs', () => {
      EDUCATIONAL_AGENT_IDS.forEach((id) => {
        expect(isEducationalAgent(id)).toBe(true)
      })
    })

    it('should return false for non-educational agent IDs', () => {
      expect(isEducationalAgent('abaporu')).toBe(false)
      expect(isEducationalAgent('zumbi')).toBe(false)
      expect(isEducationalAgent('invalid')).toBe(false)
    })
  })

  describe('getAgentById', () => {
    it('should return agent for valid ID', () => {
      const abaporu = getAgentById('abaporu')
      expect(abaporu).toBeDefined()
      expect(abaporu?.id).toBe('abaporu')
      expect(abaporu?.name).toBe('Abaporu')
    })

    it('should return undefined for invalid ID', () => {
      expect(getAgentById('invalid')).toBeUndefined()
      expect(getAgentById('')).toBeUndefined()
    })

    it('should find all core agents', () => {
      const coreAgents = ['abaporu', 'zumbi', 'tiradentes', 'anita', 'senna']
      coreAgents.forEach((id) => {
        expect(getAgentById(id)).toBeDefined()
      })
    })
  })

  describe('getAgentsByRole', () => {
    it('should return agents matching role in Portuguese', () => {
      const coordinators = getAgentsByRole('Coordenador', 'pt')
      expect(coordinators.length).toBeGreaterThan(0)
      coordinators.forEach((agent) => {
        expect(agent.role.pt.toLowerCase()).toContain('coordenador')
      })
    })

    it('should return agents matching role in English', () => {
      const coordinators = getAgentsByRole('Coordinator', 'en')
      expect(coordinators.length).toBeGreaterThan(0)
      coordinators.forEach((agent) => {
        expect(agent.role.en.toLowerCase()).toContain('coordinator')
      })
    })

    it('should return empty array for non-matching role', () => {
      expect(getAgentsByRole('NonExistentRole')).toEqual([])
    })

    it('should default to Portuguese', () => {
      const result = getAgentsByRole('Coordenador')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getAgentsByTrack', () => {
    it('should return agents for governance track', () => {
      const governanceAgents = getAgentsByTrack('governance')
      expect(Array.isArray(governanceAgents)).toBe(true)
    })

    it('should return agents for data-analysis track', () => {
      const dataAgents = getAgentsByTrack('data-analysis')
      expect(Array.isArray(dataAgents)).toBe(true)
    })

    it('should return agents for cidadania-digital track', () => {
      const cidadaniaAgents = getAgentsByTrack('cidadania-digital')
      expect(Array.isArray(cidadaniaAgents)).toBe(true)
    })
  })

  describe('getAgentsByTracks', () => {
    it('should return agents for multiple tracks', () => {
      const agents = getAgentsByTracks(['governance', 'data-analysis'])
      expect(Array.isArray(agents)).toBe(true)
    })

    it('should return unique agents', () => {
      const agents = getAgentsByTracks(['governance', 'data-analysis'])
      const ids = agents.map((a) => a.id)
      const uniqueIds = [...new Set(ids)]
      expect(uniqueIds.length).toBe(ids.length)
    })

    it('should handle empty tracks array', () => {
      const result = getAgentsByTracks([])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getTrackExclusiveAgents', () => {
    it('should return an array of agents', () => {
      const trackAgents = getTrackExclusiveAgents()
      expect(Array.isArray(trackAgents)).toBe(true)
    })
  })

  describe('getKidsAgents', () => {
    it('should return kids agents', () => {
      const kidsAgents = getKidsAgents()
      expect(Array.isArray(kidsAgents)).toBe(true)
      expect(kidsAgents.length).toBeGreaterThan(0)
    })

    it('should include Monteiro Lobato', () => {
      const kidsAgents = getKidsAgents()
      const lobato = kidsAgents.find((a) => a.id === 'monteiro_lobato')
      expect(lobato).toBeDefined()
    })

    it('should include Tarsila', () => {
      const kidsAgents = getKidsAgents()
      const tarsila = kidsAgents.find((a) => a.id === 'tarsila')
      expect(tarsila).toBeDefined()
    })
  })

  describe('isKidsAgent', () => {
    it('should return true for kids agent IDs', () => {
      expect(isKidsAgent('monteiro_lobato')).toBe(true)
      expect(isKidsAgent('tarsila')).toBe(true)
    })

    it('should return false for non-kids agent IDs', () => {
      expect(isKidsAgent('abaporu')).toBe(false)
      expect(isKidsAgent('zumbi')).toBe(false)
      expect(isKidsAgent('invalid')).toBe(false)
    })
  })

  describe('getKidsAgentById', () => {
    it('should return agent for valid kids agent ID', () => {
      const lobato = getKidsAgentById('monteiro_lobato')
      expect(lobato).toBeDefined()
      expect(lobato?.id).toBe('monteiro_lobato')
    })

    it('should return agent for tarsila', () => {
      const tarsila = getKidsAgentById('tarsila')
      expect(tarsila).toBeDefined()
      expect(tarsila?.id).toBe('tarsila')
    })
  })
})
