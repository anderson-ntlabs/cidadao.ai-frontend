import { describe, it, expect } from 'vitest'
import {
  agentColors,
  getAgentColorTheme,
  buildGradientClasses,
  getAgentRingClass,
  type AgentColorTheme
} from './agent-colors'

describe('agent-colors', () => {
  describe('agentColors', () => {
    it('should have color themes for all agents', () => {
      const expectedAgents = [
        'abaporu',
        'zumbi',
        'anita',
        'tiradentes',
        'senna',
        'nana',
        'bonifacio',
        'machado',
        'drummond',
        'default'
      ]

      expectedAgents.forEach(agentId => {
        expect(agentColors[agentId]).toBeDefined()
        expect(agentColors[agentId]).toHaveProperty('from')
        expect(agentColors[agentId]).toHaveProperty('to')
        expect(agentColors[agentId]).toHaveProperty('ring')
        expect(agentColors[agentId]).toHaveProperty('text')
      })
    })

    it('should have valid Tailwind classes for each theme', () => {
      Object.values(agentColors).forEach(theme => {
        expect(theme.from).toMatch(/^from-/)
        expect(theme.to).toMatch(/^to-/)
        expect(theme.ring).toMatch(/^ring-/)
        expect(theme.text).toBe('text-white')
      })
    })

    it('should have unique color themes for each agent', () => {
      const themes = Object.entries(agentColors)
        .filter(([key]) => key !== 'default')
        .map(([, theme]) => `${theme.from}-${theme.to}`)

      const uniqueThemes = new Set(themes)
      expect(uniqueThemes.size).toBe(themes.length)
    })
  })

  describe('getAgentColorTheme', () => {
    it('should return correct theme for known agent', () => {
      const zumbiTheme = getAgentColorTheme('zumbi')

      expect(zumbiTheme).toEqual({
        from: 'from-purple-500',
        to: 'to-indigo-600',
        ring: 'ring-purple-400/50',
        text: 'text-white'
      })
    })

    it('should return default theme for unknown agent', () => {
      const unknownTheme = getAgentColorTheme('unknown-agent')

      expect(unknownTheme).toEqual(agentColors.default)
    })

    it('should return default theme when agentId is undefined', () => {
      const undefinedTheme = getAgentColorTheme(undefined)

      expect(undefinedTheme).toEqual(agentColors.default)
    })

    it('should return default theme when agentId is empty string', () => {
      const emptyTheme = getAgentColorTheme('')

      expect(emptyTheme).toEqual(agentColors.default)
    })

    it('should return correct themes for all known agents', () => {
      const agents = ['abaporu', 'zumbi', 'anita', 'tiradentes', 'senna', 'nana', 'bonifacio', 'machado', 'drummond']

      agents.forEach(agentId => {
        const theme = getAgentColorTheme(agentId)
        expect(theme).toEqual(agentColors[agentId])
      })
    })
  })

  describe('buildGradientClasses', () => {
    it('should build correct gradient classes for a theme', () => {
      const theme: AgentColorTheme = {
        from: 'from-purple-500',
        to: 'to-indigo-600',
        ring: 'ring-purple-400/50',
        text: 'text-white'
      }

      const classes = buildGradientClasses(theme)

      expect(classes).toBe('bg-gradient-to-r from-purple-500 to-indigo-600 text-white')
    })

    it('should include all required classes', () => {
      const theme: AgentColorTheme = {
        from: 'from-emerald-500',
        to: 'to-teal-600',
        ring: 'ring-emerald-400/50',
        text: 'text-white'
      }

      const classes = buildGradientClasses(theme)

      expect(classes).toContain('bg-gradient-to-r')
      expect(classes).toContain(theme.from)
      expect(classes).toContain(theme.to)
      expect(classes).toContain(theme.text)
    })

    it('should work with all agent themes', () => {
      Object.values(agentColors).forEach(theme => {
        const classes = buildGradientClasses(theme)

        expect(classes).toBeTruthy()
        expect(classes).toContain('bg-gradient-to-r')
        expect(classes).toContain(theme.from)
        expect(classes).toContain(theme.to)
        expect(classes).toContain(theme.text)
      })
    })
  })

  describe('getAgentRingClass', () => {
    it('should return correct ring classes for known agent', () => {
      const ringClass = getAgentRingClass('zumbi')

      expect(ringClass).toBe('ring-2 ring-purple-400/50')
    })

    it('should return default ring classes for unknown agent', () => {
      const ringClass = getAgentRingClass('unknown-agent')

      expect(ringClass).toBe('ring-2 ring-emerald-400/50')
    })

    it('should return default ring classes when agentId is undefined', () => {
      const ringClass = getAgentRingClass(undefined)

      expect(ringClass).toBe('ring-2 ring-emerald-400/50')
    })

    it('should always include ring-2 base class', () => {
      const agents = ['abaporu', 'zumbi', 'anita', 'tiradentes', undefined, 'unknown']

      agents.forEach(agentId => {
        const ringClass = getAgentRingClass(agentId)
        expect(ringClass).toContain('ring-2')
      })
    })

    it('should return correct ring classes for all agents', () => {
      const agents = {
        abaporu: 'ring-2 ring-emerald-400/50',
        zumbi: 'ring-2 ring-purple-400/50',
        anita: 'ring-2 ring-rose-400/50',
        tiradentes: 'ring-2 ring-blue-400/50',
        senna: 'ring-2 ring-amber-400/50',
        nana: 'ring-2 ring-violet-400/50',
        bonifacio: 'ring-2 ring-blue-500/50',
        machado: 'ring-2 ring-slate-400/50',
        drummond: 'ring-2 ring-teal-400/50'
      }

      Object.entries(agents).forEach(([agentId, expected]) => {
        const ringClass = getAgentRingClass(agentId)
        expect(ringClass).toBe(expected)
      })
    })
  })

  describe('integration', () => {
    it('should work together to style an agent message', () => {
      const agentId = 'anita'

      const theme = getAgentColorTheme(agentId)
      const gradientClasses = buildGradientClasses(theme)
      const ringClass = getAgentRingClass(agentId)

      expect(gradientClasses).toContain('from-rose-500')
      expect(gradientClasses).toContain('to-pink-600')
      expect(ringClass).toContain('ring-rose-400/50')
    })

    it('should handle gracefully when agent does not exist', () => {
      const agentId = 'non-existent-agent'

      const theme = getAgentColorTheme(agentId)
      const gradientClasses = buildGradientClasses(theme)
      const ringClass = getAgentRingClass(agentId)

      // Should fallback to default (abaporu colors)
      expect(gradientClasses).toContain('from-emerald-500')
      expect(gradientClasses).toContain('to-teal-600')
      expect(ringClass).toContain('ring-emerald-400/50')
    })
  })
})
