/**
 * Tests for Agent Visual Configuration
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  AGENT_VISUAL_CONFIG,
  MARITACA_CONFIG,
  getAgentVisualConfig,
  getAgentGradient,
  getAgentAccentColor,
  type AgentVisualConfig,
} from './agent-config'

describe('Agent Visual Configuration', () => {
  describe('AGENT_VISUAL_CONFIG', () => {
    it('should be an object with agent configs', () => {
      expect(typeof AGENT_VISUAL_CONFIG).toBe('object')
      expect(Object.keys(AGENT_VISUAL_CONFIG).length).toBeGreaterThan(0)
    })

    it('should have required properties for each agent', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent).toHaveProperty('name')
        expect(agent).toHaveProperty('role')
        expect(agent).toHaveProperty('color')
        expect(agent).toHaveProperty('accentColor')
        expect(agent).toHaveProperty('bgGradient')
        expect(agent).toHaveProperty('icon')
        expect(agent).toHaveProperty('specialty')
        expect(agent).toHaveProperty('greeting')
        expect(agent).toHaveProperty('suggestions')
      })
    })

    it('should have valid hex colors', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        expect(agent.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })

    it('should have non-empty names', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent.name.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty roles', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent.role.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty greetings', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent.greeting.length).toBeGreaterThan(0)
      })
    })

    it('should have suggestions array with items', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(Array.isArray(agent.suggestions)).toBe(true)
        expect(agent.suggestions.length).toBeGreaterThan(0)
      })
    })

    it('should have bgGradient with Tailwind format', () => {
      Object.values(AGENT_VISUAL_CONFIG).forEach((agent) => {
        expect(agent.bgGradient).toMatch(/^from-[a-z]+-\d+ to-[a-z]+-\d+$/)
      })
    })

    it('should have abaporu as orchestrator', () => {
      expect(AGENT_VISUAL_CONFIG.abaporu).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.abaporu.name).toBe('Abaporu')
      expect(AGENT_VISUAL_CONFIG.abaporu.role).toContain('Orquestrador')
    })

    it('should have zumbi config', () => {
      expect(AGENT_VISUAL_CONFIG.zumbi).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.zumbi.name).toBe('Zumbi dos Palmares')
    })

    it('should have anita config', () => {
      expect(AGENT_VISUAL_CONFIG.anita).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.anita.name).toBe('Anita Garibaldi')
    })

    it('should have tiradentes config', () => {
      expect(AGENT_VISUAL_CONFIG.tiradentes).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.tiradentes.name).toBe('Tiradentes')
    })

    it('should have senna config', () => {
      expect(AGENT_VISUAL_CONFIG.senna).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.senna.name).toBe('Ayrton Senna')
    })

    it('should have oxossi config', () => {
      expect(AGENT_VISUAL_CONFIG.oxossi).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.oxossi.name).toBe('Oxóssi')
    })

    it('should have dandara config', () => {
      expect(AGENT_VISUAL_CONFIG.dandara).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.dandara.name).toBe('Dandara dos Palmares')
    })

    it('should have machado config', () => {
      expect(AGENT_VISUAL_CONFIG.machado).toBeDefined()
      expect(AGENT_VISUAL_CONFIG.machado.name).toBe('Machado de Assis')
    })
  })

  describe('MARITACA_CONFIG', () => {
    it('should have sabia-3 config', () => {
      expect(MARITACA_CONFIG['sabia-3']).toBeDefined()
      expect(MARITACA_CONFIG['sabia-3'].name).toBe('Sabiá-3.1')
    })

    it('should have sabiazinho-3 config', () => {
      expect(MARITACA_CONFIG['sabiazinho-3']).toBeDefined()
      expect(MARITACA_CONFIG['sabiazinho-3'].name).toBe('Sabiazinho-3')
    })

    it('should have required properties for Maritaca configs', () => {
      Object.values(MARITACA_CONFIG).forEach((config) => {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('role')
        expect(config).toHaveProperty('color')
        expect(config).toHaveProperty('accentColor')
        expect(config).toHaveProperty('bgGradient')
        expect(config).toHaveProperty('icon')
        expect(config).toHaveProperty('specialty')
        expect(config).toHaveProperty('greeting')
        expect(config).toHaveProperty('suggestions')
      })
    })
  })

  describe('getAgentVisualConfig', () => {
    it('should return abaporu for null', () => {
      const config = getAgentVisualConfig(null)
      expect(config.name).toBe('Abaporu')
    })

    it('should return abaporu for undefined', () => {
      const config = getAgentVisualConfig(undefined)
      expect(config.name).toBe('Abaporu')
    })

    it('should return correct config for valid agent', () => {
      const config = getAgentVisualConfig('zumbi')
      expect(config.name).toBe('Zumbi dos Palmares')
    })

    it('should return abaporu for unknown agent', () => {
      const config = getAgentVisualConfig('unknown-agent')
      expect(config.name).toBe('Abaporu')
    })

    it('should return config for all known agents', () => {
      Object.keys(AGENT_VISUAL_CONFIG).forEach((agentId) => {
        const config = getAgentVisualConfig(agentId)
        expect(config).toBeDefined()
        expect(config.name).toBe(AGENT_VISUAL_CONFIG[agentId].name)
      })
    })
  })

  describe('getAgentGradient', () => {
    it('should return gradient class for null', () => {
      const gradient = getAgentGradient(null)
      expect(gradient).toContain('bg-gradient-to-r')
      expect(gradient).toContain('from-')
      expect(gradient).toContain('to-')
    })

    it('should return gradient class for undefined', () => {
      const gradient = getAgentGradient(undefined)
      expect(gradient).toContain('bg-gradient-to-r')
    })

    it('should return correct gradient for valid agent', () => {
      const gradient = getAgentGradient('zumbi')
      expect(gradient).toContain('bg-gradient-to-r')
      expect(gradient).toContain(AGENT_VISUAL_CONFIG.zumbi.bgGradient)
    })

    it('should return abaporu gradient for unknown agent', () => {
      const gradient = getAgentGradient('unknown')
      expect(gradient).toContain(AGENT_VISUAL_CONFIG.abaporu.bgGradient)
    })
  })

  describe('getAgentAccentColor', () => {
    it('should return accent color for null', () => {
      const color = getAgentAccentColor(null)
      expect(color).toBe(AGENT_VISUAL_CONFIG.abaporu.accentColor)
    })

    it('should return accent color for undefined', () => {
      const color = getAgentAccentColor(undefined)
      expect(color).toBe(AGENT_VISUAL_CONFIG.abaporu.accentColor)
    })

    it('should return correct color for valid agent', () => {
      const color = getAgentAccentColor('tiradentes')
      expect(color).toBe(AGENT_VISUAL_CONFIG.tiradentes.accentColor)
    })

    it('should return abaporu color for unknown agent', () => {
      const color = getAgentAccentColor('unknown')
      expect(color).toBe(AGENT_VISUAL_CONFIG.abaporu.accentColor)
    })

    it('should return valid hex colors', () => {
      Object.keys(AGENT_VISUAL_CONFIG).forEach((agentId) => {
        const color = getAgentAccentColor(agentId)
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })
})
