/**
 * Tests for Investigation Adapter
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks
const mockApiGet = vi.hoisted(() => vi.fn())
const mockApiPost = vi.hoisted(() => vi.fn())
const mockApiDelete = vi.hoisted(() => vi.fn())

// Mock api client
vi.mock('./client', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
    delete: mockApiDelete,
  },
}))

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    performance: vi.fn(),
  },
}))

import {
  createPublicInvestigation,
  getInvestigationStatus,
  getInvestigationResults,
  listInvestigations,
  cancelInvestigation,
  pollInvestigationStatus,
  createAndPollInvestigation,
  mapInvestigationToUI,
} from './investigation-adapter'

describe('Investigation Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPublicInvestigation', () => {
    it('should create investigation with default values', async () => {
      const mockResponse = {
        investigation_id: 'inv-123',
        status: 'pending',
        message: 'Created',
      }
      mockApiPost.mockResolvedValueOnce({ success: true, data: mockResponse })

      const result = await createPublicInvestigation({ query: 'test query' })

      expect(mockApiPost).toHaveBeenCalledWith('/api/v1/investigations/public/create', {
        query: 'test query',
        data_source: 'contracts',
        filters: {},
        anomaly_types: ['price', 'vendor', 'temporal'],
        include_explanations: true,
        stream_results: false,
      })
      expect(result.investigation_id).toBe('inv-123')
    })

    it('should create investigation with custom parameters', async () => {
      const mockResponse = { investigation_id: 'inv-456', status: 'pending', message: 'Created' }
      mockApiPost.mockResolvedValueOnce({ success: true, data: mockResponse })

      await createPublicInvestigation({
        query: 'custom query',
        data_source: 'expenses',
        filters: { organization: 'test-org' },
        anomaly_types: ['price'],
        include_explanations: false,
        stream_results: true,
      })

      expect(mockApiPost).toHaveBeenCalledWith('/api/v1/investigations/public/create', {
        query: 'custom query',
        data_source: 'expenses',
        filters: { organization: 'test-org' },
        anomaly_types: ['price'],
        include_explanations: false,
        stream_results: true,
      })
    })

    it('should throw error on API failure', async () => {
      mockApiPost.mockResolvedValueOnce({
        success: false,
        error: { message: 'Server error' },
      })

      await expect(createPublicInvestigation({ query: 'test' })).rejects.toThrow('Server error')
    })

    it('should throw error when no data returned', async () => {
      mockApiPost.mockResolvedValueOnce({ success: true, data: null })

      await expect(createPublicInvestigation({ query: 'test' })).rejects.toThrow(
        'Failed to create investigation'
      )
    })
  })

  describe('getInvestigationStatus', () => {
    it('should fetch investigation status', async () => {
      const mockStatus = {
        investigation_id: 'inv-123',
        status: 'running',
        progress: 0.5,
        current_phase: 'analyzing',
        records_processed: 100,
        anomalies_detected: 5,
        estimated_completion: '2025-01-01T12:00:00Z',
      }
      mockApiGet.mockResolvedValueOnce({ success: true, data: mockStatus })

      const result = await getInvestigationStatus('inv-123')

      expect(mockApiGet).toHaveBeenCalledWith('/api/v1/investigations/public/status/inv-123')
      expect(result.status).toBe('running')
      expect(result.progress).toBe(0.5)
    })

    it('should throw error on API failure', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: false,
        error: { message: 'Not found' },
      })

      await expect(getInvestigationStatus('inv-404')).rejects.toThrow('Not found')
    })
  })

  describe('getInvestigationResults', () => {
    it('should fetch investigation results', async () => {
      const mockResults = {
        investigation_id: 'inv-123',
        status: 'completed',
        query: 'test',
        data_source: 'contracts',
        started_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T10:30:00Z',
        anomalies_found: 3,
        total_records_analyzed: 1000,
        results: [],
        summary: 'Summary text',
        confidence_score: 0.9,
        processing_time: 1800,
      }
      mockApiGet.mockResolvedValueOnce({ success: true, data: mockResults })

      const result = await getInvestigationResults('inv-123')

      expect(mockApiGet).toHaveBeenCalledWith('/api/v1/investigations/public/results/inv-123')
      expect(result.anomalies_found).toBe(3)
    })

    it('should throw error on API failure', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: false,
        error: { message: 'Results not ready' },
      })

      await expect(getInvestigationResults('inv-123')).rejects.toThrow('Results not ready')
    })
  })

  describe('listInvestigations', () => {
    it('should list investigations', async () => {
      const mockList = [
        { investigation_id: 'inv-1', status: 'completed' },
        { investigation_id: 'inv-2', status: 'running' },
      ]
      mockApiGet.mockResolvedValueOnce({ success: true, data: mockList })

      const result = await listInvestigations()

      expect(mockApiGet).toHaveBeenCalledWith('/api/v1/investigations/')
      expect(result).toHaveLength(2)
    })

    it('should return empty array on 401 error', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: false,
        error: { message: 'Unauthorized', status: 401 },
      })

      const result = await listInvestigations()

      expect(result).toEqual([])
    })

    it('should return empty array on 403 error', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: false,
        error: { message: 'Forbidden', status: 403 },
      })

      const result = await listInvestigations()

      expect(result).toEqual([])
    })

    it('should return empty array when data is null', async () => {
      mockApiGet.mockResolvedValueOnce({ success: true, data: null })

      const result = await listInvestigations()

      expect(result).toEqual([])
    })

    it('should return empty array on network error', async () => {
      const error = new Error('Network error')
      ;(error as any).response = { status: 403 }
      mockApiGet.mockRejectedValueOnce(error)

      const result = await listInvestigations()

      expect(result).toEqual([])
    })
  })

  describe('cancelInvestigation', () => {
    it('should cancel investigation', async () => {
      mockApiDelete.mockResolvedValueOnce({ success: true })

      const result = await cancelInvestigation('inv-123')

      expect(mockApiDelete).toHaveBeenCalledWith('/api/v1/investigations/inv-123')
      expect(result).toBe(true)
    })

    it('should return false on API failure', async () => {
      mockApiDelete.mockResolvedValueOnce({
        success: false,
        error: { message: 'Cannot cancel' },
      })

      const result = await cancelInvestigation('inv-123')

      expect(result).toBe(false)
    })

    it('should return false on exception', async () => {
      mockApiDelete.mockRejectedValueOnce(new Error('Network error'))

      const result = await cancelInvestigation('inv-123')

      expect(result).toBe(false)
    })
  })

  describe('pollInvestigationStatus', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should poll until completed', async () => {
      const onUpdate = vi.fn()
      mockApiGet
        .mockResolvedValueOnce({
          success: true,
          data: { investigation_id: 'inv-123', status: 'running', progress: 0.5 },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { investigation_id: 'inv-123', status: 'completed', progress: 1 },
        })

      const pollPromise = pollInvestigationStatus('inv-123', onUpdate, { interval: 100 })

      await vi.advanceTimersByTimeAsync(100)
      await vi.advanceTimersByTimeAsync(100)

      const result = await pollPromise

      expect(result.status).toBe('completed')
      expect(onUpdate).toHaveBeenCalledTimes(2)
    })

    it('should poll until failed', async () => {
      const onUpdate = vi.fn()
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: { investigation_id: 'inv-123', status: 'failed', progress: 0.3 },
      })

      const result = await pollInvestigationStatus('inv-123', onUpdate)

      expect(result.status).toBe('failed')
    })

    it('should use default options', async () => {
      const onUpdate = vi.fn()
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: { investigation_id: 'inv-123', status: 'completed', progress: 1 },
      })

      const result = await pollInvestigationStatus('inv-123', onUpdate)

      expect(result.status).toBe('completed')
      expect(onUpdate).toHaveBeenCalledTimes(1)
    })

    it('should reject on API error', async () => {
      const onUpdate = vi.fn()
      mockApiGet.mockRejectedValueOnce(new Error('API Error'))

      await expect(pollInvestigationStatus('inv-123', onUpdate)).rejects.toThrow('API Error')
    })
  })

  describe('createAndPollInvestigation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should create, poll, and return results', async () => {
      const onUpdate = vi.fn()

      // Mock create
      mockApiPost.mockResolvedValueOnce({
        success: true,
        data: { investigation_id: 'inv-123', status: 'pending' },
      })

      // Mock poll (completed immediately)
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: { investigation_id: 'inv-123', status: 'completed', progress: 1 },
      })

      // Mock results
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: {
          investigation_id: 'inv-123',
          status: 'completed',
          anomalies_found: 2,
          results: [],
        },
      })

      const resultPromise = createAndPollInvestigation({ query: 'test' }, onUpdate)
      await vi.runAllTimersAsync()
      const result = await resultPromise

      expect(result.anomalies_found).toBe(2)
    })
  })

  describe('mapInvestigationToUI', () => {
    it('should map investigation to UI format', () => {
      const investigation = {
        investigation_id: 'inv-12345678-abcd',
        status: 'completed' as const,
        progress: 0.85,
        current_phase: 'analyzing',
        records_processed: 500,
        anomalies_detected: 10,
        created_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T11:00:00Z',
        estimated_completion: null,
      }

      const result = mapInvestigationToUI(investigation)

      expect(result).toEqual({
        id: 'inv-12345678-abcd',
        title: 'Investigation inv-1234',
        status: 'completed',
        progress: 85,
        current_phase: 'analyzing',
        records_processed: 500,
        anomalies_detected: 10,
        created_at: '2025-01-01T10:00:00Z',
        completed_at: '2025-01-01T11:00:00Z',
        estimated_completion: null,
      })
    })
  })
})
