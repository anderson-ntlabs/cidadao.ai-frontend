/**
 * Tests for Investigations Mock Data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import { mockInvestigations, type MockInvestigation } from './investigations'

describe('Investigations Mock Data', () => {
  describe('mockInvestigations', () => {
    it('should be an array of investigations', () => {
      expect(Array.isArray(mockInvestigations)).toBe(true)
      expect(mockInvestigations.length).toBeGreaterThan(0)
    })

    it('should have required properties for each investigation', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation).toHaveProperty('id')
        expect(investigation).toHaveProperty('title')
        expect(investigation).toHaveProperty('description')
        expect(investigation).toHaveProperty('type')
        expect(investigation).toHaveProperty('status')
        expect(investigation).toHaveProperty('confidence')
        expect(investigation).toHaveProperty('value')
        expect(investigation).toHaveProperty('dateCreated')
        expect(investigation).toHaveProperty('dateUpdated')
        expect(investigation).toHaveProperty('agents')
        expect(investigation).toHaveProperty('findings')
        expect(investigation).toHaveProperty('evidence')
        expect(investigation).toHaveProperty('riskLevel')
        expect(investigation).toHaveProperty('department')
        expect(investigation).toHaveProperty('location')
      })
    })

    it('should have unique investigation IDs', () => {
      const ids = mockInvestigations.map((inv) => inv.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid investigation types', () => {
      const validTypes = ['overpricing', 'pattern', 'fraud', 'anomaly']

      mockInvestigations.forEach((investigation) => {
        expect(validTypes).toContain(investigation.type)
      })
    })

    it('should have valid status values', () => {
      const validStatuses = ['critical', 'active', 'completed']

      mockInvestigations.forEach((investigation) => {
        expect(validStatuses).toContain(investigation.status)
      })
    })

    it('should have valid risk levels', () => {
      const validRiskLevels = ['crítico', 'alto', 'médio', 'baixo']

      mockInvestigations.forEach((investigation) => {
        expect(validRiskLevels).toContain(investigation.riskLevel)
      })
    })

    it('should have confidence between 0 and 100', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.confidence).toBeGreaterThanOrEqual(0)
        expect(investigation.confidence).toBeLessThanOrEqual(100)
      })
    })

    it('should have positive value amounts', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.value).toBeGreaterThan(0)
      })
    })

    it('should have Date objects for date fields', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.dateCreated).toBeInstanceOf(Date)
        expect(investigation.dateUpdated).toBeInstanceOf(Date)
      })
    })

    it('should have dateUpdated >= dateCreated', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.dateUpdated.getTime()).toBeGreaterThanOrEqual(
          investigation.dateCreated.getTime()
        )
      })
    })

    it('should have non-empty agents array', () => {
      mockInvestigations.forEach((investigation) => {
        expect(Array.isArray(investigation.agents)).toBe(true)
        expect(investigation.agents.length).toBeGreaterThan(0)
      })
    })

    it('should have non-negative findings count', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.findings).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have non-negative evidence count', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.evidence).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have non-empty department', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.department.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty location', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.location.length).toBeGreaterThan(0)
      })
    })

    it('should include critical status investigations', () => {
      const criticalInvestigations = mockInvestigations.filter((inv) => inv.status === 'critical')
      expect(criticalInvestigations.length).toBeGreaterThan(0)
    })

    it('should include active status investigations', () => {
      const activeInvestigations = mockInvestigations.filter((inv) => inv.status === 'active')
      expect(activeInvestigations.length).toBeGreaterThan(0)
    })

    it('should include overpricing type investigations', () => {
      const overpricingInvestigations = mockInvestigations.filter(
        (inv) => inv.type === 'overpricing'
      )
      expect(overpricingInvestigations.length).toBeGreaterThan(0)
    })

    it('should have ID format INV-YYYY-XXX', () => {
      mockInvestigations.forEach((investigation) => {
        expect(investigation.id).toMatch(/^INV-\d{4}-\d{3}$/)
      })
    })
  })
})
