/**
 * Chat Adapter Tests
 *
 * Tests for mock data fallback functions
 */

import { describe, it, expect } from 'vitest'
import { getMockAgents, getMockSuggestions } from './chat-adapter'

describe('Chat Adapter - Mock Data', () => {
  describe('getMockAgents', () => {
    it('should return an array of agents', () => {
      const agents = getMockAgents()

      expect(Array.isArray(agents)).toBe(true)
      expect(agents.length).toBeGreaterThan(0)
    })

    it('should return agents with required properties', () => {
      const agents = getMockAgents()
      const agent = agents[0]

      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('avatar')
      expect(agent).toHaveProperty('role')
      expect(agent).toHaveProperty('status')
      expect(agent).toHaveProperty('specialty')
      expect(agent).toHaveProperty('type')
      expect(agent).toHaveProperty('description')
      expect(agent).toHaveProperty('capabilities')
    })

    it('should return Zumbi as the default agent', () => {
      const agents = getMockAgents()
      const zumbi = agents.find((a) => a.id === 'zumbi')

      expect(zumbi).toBeDefined()
      expect(zumbi?.name).toBe('Zumbi dos Palmares')
      expect(zumbi?.type).toBe('investigator')
    })

    it('should return agents with valid status', () => {
      const agents = getMockAgents()

      agents.forEach((agent) => {
        expect(['active', 'inactive', 'busy']).toContain(agent.status)
      })
    })
  })

  describe('getMockSuggestions', () => {
    it('should return an array of suggestions', () => {
      const suggestions = getMockSuggestions()

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should return suggestions with required properties', () => {
      const suggestions = getMockSuggestions()

      suggestions.forEach((suggestion) => {
        expect(suggestion).toHaveProperty('id')
        expect(suggestion).toHaveProperty('label')
        expect(suggestion).toHaveProperty('icon')
        expect(suggestion).toHaveProperty('action')
      })
    })

    it('should return 4 suggestions', () => {
      const suggestions = getMockSuggestions()

      expect(suggestions.length).toBe(4)
    })

    it('should have unique IDs', () => {
      const suggestions = getMockSuggestions()
      const ids = suggestions.map((s) => s.id)
      const uniqueIds = [...new Set(ids)]

      expect(uniqueIds.length).toBe(ids.length)
    })

    it('should have non-empty labels and actions', () => {
      const suggestions = getMockSuggestions()

      suggestions.forEach((suggestion) => {
        expect(suggestion.label.length).toBeGreaterThan(0)
        expect(suggestion.action.length).toBeGreaterThan(0)
      })
    })
  })
})
