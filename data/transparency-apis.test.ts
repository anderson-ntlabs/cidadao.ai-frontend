/**
 * Tests for Transparency APIs Data
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  transparencyAPIs,
  statesWithoutAPIs,
  estadoNomes,
  calculateMapSummary,
  type APIStatus,
  type StateAPICoverage,
} from './transparency-apis'

describe('Transparency APIs Data', () => {
  describe('transparencyAPIs', () => {
    it('should contain states with APIs', () => {
      expect(Object.keys(transparencyAPIs).length).toBeGreaterThan(0)
    })

    it('should have SP state with healthy status', () => {
      expect(transparencyAPIs['SP']).toBeDefined()
      expect(transparencyAPIs['SP'].overall_status).toBe('healthy')
      expect(transparencyAPIs['SP'].name).toBe('São Paulo')
    })

    it('should have MG state with blocked status', () => {
      expect(transparencyAPIs['MG']).toBeDefined()
      expect(transparencyAPIs['MG'].overall_status).toBe('blocked')
    })

    it('should have RO state with server_error status', () => {
      expect(transparencyAPIs['RO']).toBeDefined()
      expect(transparencyAPIs['RO'].overall_status).toBe('server_error')
    })

    it('should have valid region for each state', () => {
      const validRegions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
      Object.values(transparencyAPIs).forEach((state) => {
        expect(validRegions).toContain(state.region)
      })
    })

    it('should have valid API types', () => {
      const validTypes = ['TCE', 'CKAN', 'Portal', 'Federal']
      Object.values(transparencyAPIs).forEach((state) => {
        state.apis.forEach((api) => {
          expect(validTypes).toContain(api.type)
        })
      })
    })

    it('should have valid API statuses', () => {
      const validStatuses: APIStatus[] = [
        'healthy',
        'degraded',
        'blocked',
        'no_api',
        'server_error',
      ]
      Object.values(transparencyAPIs).forEach((state) => {
        expect(validStatuses).toContain(state.overall_status)
        state.apis.forEach((api) => {
          expect(validStatuses).toContain(api.status)
        })
      })
    })

    it('should have population data for states', () => {
      expect(transparencyAPIs['SP'].population).toBeGreaterThan(0)
      expect(transparencyAPIs['RJ'].population).toBeGreaterThan(0)
    })
  })

  describe('statesWithoutAPIs', () => {
    it('should be an array', () => {
      expect(Array.isArray(statesWithoutAPIs)).toBe(true)
    })

    it('should not include states that have APIs', () => {
      const statesWithAPIs = Object.keys(transparencyAPIs)
      statesWithoutAPIs.forEach((state) => {
        expect(statesWithAPIs).not.toContain(state)
      })
    })

    it('should contain known states without APIs', () => {
      expect(statesWithoutAPIs).toContain('AC')
      expect(statesWithoutAPIs).toContain('DF')
    })
  })

  describe('estadoNomes', () => {
    it('should contain all Brazilian states', () => {
      expect(Object.keys(estadoNomes).length).toBe(27)
    })

    it('should map state codes to names correctly', () => {
      expect(estadoNomes['SP']).toBe('São Paulo')
      expect(estadoNomes['RJ']).toBe('Rio de Janeiro')
      expect(estadoNomes['MG']).toBe('Minas Gerais')
      expect(estadoNomes['DF']).toBe('Distrito Federal')
    })

    it('should have all state codes as two uppercase letters', () => {
      Object.keys(estadoNomes).forEach((code) => {
        expect(code).toMatch(/^[A-Z]{2}$/)
      })
    })
  })

  describe('calculateMapSummary', () => {
    it('should return MapSummary object', () => {
      const summary = calculateMapSummary()

      expect(summary).toHaveProperty('total_states')
      expect(summary).toHaveProperty('states_with_apis')
      expect(summary).toHaveProperty('states_working')
      expect(summary).toHaveProperty('states_degraded')
      expect(summary).toHaveProperty('states_blocked')
      expect(summary).toHaveProperty('states_no_api')
      expect(summary).toHaveProperty('overall_coverage_percentage')
      expect(summary).toHaveProperty('total_apis')
      expect(summary).toHaveProperty('healthy_apis')
    })

    it('should have total_states as 27', () => {
      const summary = calculateMapSummary()
      expect(summary.total_states).toBe(27)
    })

    it('should have consistent state counts', () => {
      const summary = calculateMapSummary()
      const statesWithAPIs = Object.keys(transparencyAPIs).length

      expect(summary.states_with_apis).toBe(statesWithAPIs)
      expect(summary.states_no_api).toBe(27 - statesWithAPIs)
    })

    it('should count healthy states correctly', () => {
      const summary = calculateMapSummary()
      const healthyStates = Object.values(transparencyAPIs).filter(
        (s) => s.overall_status === 'healthy'
      ).length

      expect(summary.states_working).toBe(healthyStates)
    })

    it('should count blocked states correctly', () => {
      const summary = calculateMapSummary()
      const blockedStates = Object.values(transparencyAPIs).filter(
        (s) => s.overall_status === 'blocked'
      ).length

      expect(summary.states_blocked).toBe(blockedStates)
    })

    it('should count total APIs correctly', () => {
      const summary = calculateMapSummary()
      const totalAPIs = Object.values(transparencyAPIs).reduce((sum, s) => sum + s.apis.length, 0)

      expect(summary.total_apis).toBe(totalAPIs)
    })

    it('should count healthy APIs correctly', () => {
      const summary = calculateMapSummary()
      const healthyAPIs = Object.values(transparencyAPIs).reduce(
        (sum, s) => sum + s.apis.filter((api) => api.status === 'healthy').length,
        0
      )

      expect(summary.healthy_apis).toBe(healthyAPIs)
    })

    it('should calculate coverage percentage', () => {
      const summary = calculateMapSummary()
      const expectedPercentage = (summary.states_working / 27) * 100

      expect(summary.overall_coverage_percentage).toBeCloseTo(expectedPercentage)
    })
  })
})
