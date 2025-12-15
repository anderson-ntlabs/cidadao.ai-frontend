import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchTransparencyMap,
  getCachedMapData,
  isCacheFresh,
  clearCachedMapData,
  getStateColor,
  getAPIStatusBadgeClass,
  getStateStatusBadgeClass,
  getAPIStatusEmoji,
  getStateStatusEmoji,
  type BackendTransparencyMapData,
  type TransparencyMapData,
} from './transparency-map.service'

// Note: localStorage is mocked globally in vitest.setup.ts

// Mock fetch using vi.spyOn
const mockFetch = vi.fn()

// Mock console
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('transparency-map.service', () => {
  const mockBackendData: BackendTransparencyMapData = {
    last_update: '2025-10-25T12:00:00Z',
    summary: {
      total_states: 27,
      states_with_apis: 5,
      states_working: 3,
      overall_coverage_percentage: 18.5,
      total_apis: 8,
      total_endpoints: 45,
    },
    states: {
      SP: {
        name: 'São Paulo',
        status: 'healthy',
        apis: [
          {
            name: 'Contratos SP',
            url: 'https://api.sp.gov.br/contratos',
            endpoints: 10,
            status: 'operational',
            response_time_ms: 250,
            error: null,
          },
          {
            name: 'Despesas SP',
            url: 'https://api.sp.gov.br/despesas',
            endpoints: 8,
            status: 'partial',
            response_time_ms: 500,
            error: null,
          },
        ],
      },
      RJ: {
        name: 'Rio de Janeiro',
        status: 'degraded',
        apis: [
          {
            name: 'Transparência RJ',
            url: 'https://api.rj.gov.br/transparencia',
            endpoints: 5,
            status: 'timeout',
            response_time_ms: null,
            error: 'Connection timeout',
          },
        ],
      },
    },
    cache_info: {
      cached: false,
      last_update: '2025-10-25T12:00:00Z',
      age_minutes: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', mockFetch)
    localStorage.clear()
    consoleErrorSpy.mockClear()
    consoleWarnSpy.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchTransparencyMap', () => {
    it('should fetch and normalize transparency map data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBackendData,
      })

      const result = await fetchTransparencyMap()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/transparency/coverage/map'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      expect(result).toHaveProperty('last_update')
      expect(result).toHaveProperty('cache_info')
      expect(result).toHaveProperty('states')
      expect(result).toHaveProperty('summary')
    })

    it('should normalize state data correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBackendData,
      })

      const result = await fetchTransparencyMap()

      // Check SP state normalization
      expect(result.states.SP).toMatchObject({
        name: 'São Paulo',
        status: 'healthy',
        apiCount: 2,
        endpointCount: 18,
        color: '#22c55e',
      })

      // Check API normalization
      expect(result.states.SP.apis[0]).toMatchObject({
        id: 'SP-0',
        name: 'Contratos SP',
        endpoints: 10,
        status: 'operational',
      })
    })

    it('should cache data in localStorage after successful fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBackendData,
      })

      await fetchTransparencyMap()

      const cached = localStorage.getItem('transparencyMapCache')
      expect(cached).toBeTruthy()

      const parsedCache = JSON.parse(cached!)
      expect(parsedCache).toHaveProperty('data')
      expect(parsedCache).toHaveProperty('timestamp')
    })

    it('should throw error on HTTP failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(fetchTransparencyMap()).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('should return cached data when fetch fails', async () => {
      // First, populate cache
      const cachedData: TransparencyMapData = {
        last_update: '2025-10-25T10:00:00Z',
        cache_info: { cached: true, last_update: '2025-10-25T10:00:00Z', age_minutes: 120 },
        states: {},
        summary: {
          total_states: 27,
          states_with_apis: 0,
          states_working: 0,
          overall_coverage_percentage: 0,
          total_apis: 0,
          total_endpoints: 0,
          states_no_api: 27,
        },
      }

      localStorage.setItem(
        'transparencyMapCache',
        JSON.stringify({
          data: cachedData,
          timestamp: Date.now(),
        })
      )

      // Then, make fetch fail
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await fetchTransparencyMap()

      // Should return cached data as fallback
      expect(result).toEqual(cachedData)
    })

    it('should throw when fetch fails and no cache available', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(fetchTransparencyMap()).rejects.toThrow('Network error')
    })

    it('should use 65 second timeout', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBackendData,
      })

      await fetchTransparencyMap()

      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[1].signal).toBeDefined()
    })

    it('should calculate states_no_api correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockBackendData,
      })

      const result = await fetchTransparencyMap()

      expect(result.summary.states_no_api).toBe(22) // 27 - 5
    })
  })

  describe('getCachedMapData', () => {
    it('should return cached data when fresh', () => {
      const cachedData: TransparencyMapData = {
        last_update: '2025-10-25T12:00:00Z',
        cache_info: { cached: true, last_update: '2025-10-25T12:00:00Z', age_minutes: 10 },
        states: {},
        summary: {
          total_states: 27,
          states_with_apis: 0,
          states_working: 0,
          overall_coverage_percentage: 0,
          total_apis: 0,
          total_endpoints: 0,
          states_no_api: 27,
        },
      }

      localStorage.setItem(
        'transparencyMapCache',
        JSON.stringify({
          data: cachedData,
          timestamp: Date.now(),
        })
      )

      const result = getCachedMapData()

      expect(result).toEqual(cachedData)
    })

    it('should return stale data with warning', () => {
      const cachedData: TransparencyMapData = {
        last_update: '2025-10-25T06:00:00Z',
        cache_info: { cached: true, last_update: '2025-10-25T06:00:00Z', age_minutes: 360 },
        states: {},
        summary: {
          total_states: 27,
          states_with_apis: 0,
          states_working: 0,
          overall_coverage_percentage: 0,
          total_apis: 0,
          total_endpoints: 0,
          states_no_api: 27,
        },
      }

      // Cache from 7 hours ago (stale)
      const staleTimestamp = Date.now() - 7 * 60 * 60 * 1000
      localStorage.setItem(
        'transparencyMapCache',
        JSON.stringify({
          data: cachedData,
          timestamp: staleTimestamp,
        })
      )

      const result = getCachedMapData()

      // Should still return data even if stale
      expect(result).toEqual(cachedData)
    })

    it('should return null when no cache exists', () => {
      const result = getCachedMapData()

      expect(result).toBeNull()
    })

    it('should return null when cache is corrupted', () => {
      localStorage.setItem('transparencyMapCache', 'invalid json')

      const result = getCachedMapData()

      // Should gracefully handle corrupted cache
      expect(result).toBeNull()
    })
  })

  describe('isCacheFresh', () => {
    it('should return true when cache is fresh', () => {
      localStorage.setItem(
        'transparencyMapCache',
        JSON.stringify({
          data: {},
          timestamp: Date.now(),
        })
      )

      expect(isCacheFresh()).toBe(true)
    })

    it('should return false when cache is stale', () => {
      const staleTimestamp = Date.now() - 7 * 60 * 60 * 1000 // 7 hours ago
      localStorage.setItem(
        'transparencyMapCache',
        JSON.stringify({
          data: {},
          timestamp: staleTimestamp,
        })
      )

      expect(isCacheFresh()).toBe(false)
    })

    it('should return false when no cache exists', () => {
      expect(isCacheFresh()).toBe(false)
    })

    it('should return false when cache is corrupted', () => {
      localStorage.setItem('transparencyMapCache', 'invalid')

      expect(isCacheFresh()).toBe(false)
    })
  })

  describe('clearCachedMapData', () => {
    it('should remove cached data from localStorage', () => {
      localStorage.setItem('transparencyMapCache', JSON.stringify({ data: {} }))

      clearCachedMapData()

      expect(localStorage.getItem('transparencyMapCache')).toBeNull()
    })

    it('should not throw when no cache exists', () => {
      expect(() => clearCachedMapData()).not.toThrow()
    })
  })

  describe('getStateColor', () => {
    it('should return correct colors for each status', () => {
      expect(getStateColor('healthy')).toBe('#22c55e')
      expect(getStateColor('degraded')).toBe('#f59e0b')
      expect(getStateColor('unhealthy')).toBe('#ef4444')
      expect(getStateColor('no_api')).toBe('#9ca3af')
    })

    it('should return default color for unknown status', () => {
      // @ts-expect-error Testing invalid status
      expect(getStateColor('unknown')).toBe('#9ca3af')
    })
  })

  describe('getAPIStatusBadgeClass', () => {
    it('should return correct classes for each API status', () => {
      expect(getAPIStatusBadgeClass('operational')).toContain('bg-green-100')
      expect(getAPIStatusBadgeClass('partial')).toContain('bg-amber-100')
      expect(getAPIStatusBadgeClass('timeout')).toContain('bg-orange-100')
      expect(getAPIStatusBadgeClass('error')).toContain('bg-red-100')
      expect(getAPIStatusBadgeClass('down')).toContain('bg-red-100')
    })

    it('should include dark mode classes', () => {
      expect(getAPIStatusBadgeClass('operational')).toContain('dark:bg-green-900/30')
    })
  })

  describe('getStateStatusBadgeClass', () => {
    it('should return correct classes for each state status', () => {
      expect(getStateStatusBadgeClass('healthy')).toContain('bg-green-100')
      expect(getStateStatusBadgeClass('degraded')).toContain('bg-amber-100')
      expect(getStateStatusBadgeClass('unhealthy')).toContain('bg-red-100')
      expect(getStateStatusBadgeClass('no_api')).toContain('bg-gray-100')
    })
  })

  describe('getAPIStatusEmoji', () => {
    it('should return correct emojis for each API status', () => {
      expect(getAPIStatusEmoji('operational')).toBe('🟢')
      expect(getAPIStatusEmoji('partial')).toBe('🟡')
      expect(getAPIStatusEmoji('timeout')).toBe('🟠')
      expect(getAPIStatusEmoji('error')).toBe('🔴')
      expect(getAPIStatusEmoji('down')).toBe('🔴')
    })

    it('should return default emoji for unknown status', () => {
      // @ts-expect-error Testing invalid status
      expect(getAPIStatusEmoji('unknown')).toBe('⚫')
    })
  })

  describe('getStateStatusEmoji', () => {
    it('should return correct emojis for each state status', () => {
      expect(getStateStatusEmoji('healthy')).toBe('🟢')
      expect(getStateStatusEmoji('degraded')).toBe('🟡')
      expect(getStateStatusEmoji('unhealthy')).toBe('🔴')
      expect(getStateStatusEmoji('no_api')).toBe('⚫')
    })
  })
})
