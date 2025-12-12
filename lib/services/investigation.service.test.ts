/**
 * Investigation Service Tests
 *
 * Tests for InvestigationService with Result<T> pattern.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Updated for Result<T> pattern
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InvestigationService } from './investigation.service'
import { isSuccess, isFailure, ErrorCodes } from '@/lib/types/result'
import type { Investigation } from '@/types/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('InvestigationService', () => {
  let service: InvestigationService
  let mockSupabase: any
  let mockFrom: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new InvestigationService()
    mockSupabase = (service as any).supabase

    // Setup default mock chain
    mockFrom = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    // Make all methods return mockFrom for chaining
    Object.keys(mockFrom).forEach((method) => {
      mockFrom[method].mockReturnValue(mockFrom)
    })

    mockSupabase.from = vi.fn().mockReturnValue(mockFrom)
  })

  describe('createInvestigation', () => {
    const mockUser = { id: 'user-123' }
    const mockInvestigation: Investigation = {
      id: 'inv-123',
      user_id: 'user-123',
      title: 'Test Investigation',
      description: 'Test description',
      agents_used: ['abaporu'],
      metadata: { test: true },
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Investigation

    it('should return success with investigation when created successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockInvestigation, error: null })

      const result = await service.createInvestigation({
        title: 'Test Investigation',
        description: 'Test description',
        agents_used: ['abaporu'],
        metadata: { test: true },
      })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockInvestigation)
      }
      expect(mockSupabase.from).toHaveBeenCalledWith('investigations')
      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: 'Test Investigation',
        description: 'Test description',
        agents_used: ['abaporu'],
        metadata: { test: true },
        status: 'active',
      })
    })

    it('should return failure when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.createInvestigation({ title: 'Test' })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED)
      }
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return failure when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'DB error' } })

      const result = await service.createInvestigation({ title: 'Test' })

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_ERROR)
      }
    })

    it('should create investigation with defaults when optional fields not provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockInvestigation, error: null })

      await service.createInvestigation({
        title: 'Test Investigation',
      })

      expect(mockFrom.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: 'Test Investigation',
        description: undefined,
        agents_used: [],
        metadata: {},
        status: 'active',
      })
    })
  })

  describe('getUserInvestigations', () => {
    const mockUser = { id: 'user-123' }
    const mockInvestigations = [
      { id: '1', title: 'Investigation 1', status: 'active' },
      { id: '2', title: 'Investigation 2', status: 'completed' },
    ]

    it('should return success with investigations array', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.order.mockResolvedValue({ data: mockInvestigations, error: null })

      const result = await service.getUserInvestigations()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockInvestigations)
      }
      expect(mockSupabase.from).toHaveBeenCalledWith('investigations')
      expect(mockFrom.select).toHaveBeenCalledWith('*')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should filter investigations by status', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Create a new query object that will be returned after order()
      const queryAfterOrder = {
        eq: vi.fn().mockResolvedValue({ data: mockInvestigations, error: null }),
      }

      // order returns the new query object
      mockFrom.order.mockReturnValue(queryAfterOrder)

      const result = await service.getUserInvestigations({ status: 'active' })

      expect(isSuccess(result)).toBe(true)
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(queryAfterOrder.eq).toHaveBeenCalledWith('status', 'active')
    })

    it('should return failure when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.getUserInvestigations()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED)
      }
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return failure when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.order.mockResolvedValue({ data: null, error: { message: 'DB error' } })

      const result = await service.getUserInvestigations()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR)
      }
    })

    it('should return empty array when data is null but no error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.order.mockResolvedValue({ data: null, error: null })

      const result = await service.getUserInvestigations()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('getInvestigation', () => {
    const mockUser = { id: 'user-123' }
    const mockInvestigation = { id: 'inv-123', title: 'Test Investigation' }

    it('should return success with investigation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockInvestigation, error: null })

      const result = await service.getInvestigation('inv-123')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockInvestigation)
      }
      expect(mockSupabase.from).toHaveBeenCalledWith('investigations')
      expect(mockFrom.select).toHaveBeenCalledWith('*')
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'inv-123')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockFrom.single).toHaveBeenCalled()
    })

    it('should return failure when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.getInvestigation('inv-123')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED)
      }
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return NOT_FOUND failure when investigation not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await service.getInvestigation('inv-123')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_FOUND)
      }
    })

    it('should return failure when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'DB error' } })

      const result = await service.getInvestigation('inv-123')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_QUERY_ERROR)
      }
    })
  })

  describe('updateInvestigation', () => {
    const mockUser = { id: 'user-123' }
    const mockUpdatedInvestigation = {
      id: 'inv-123',
      title: 'Updated Investigation',
      updated_at: '2024-01-01T00:00:00Z',
    }

    it('should return success with updated investigation', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockUpdatedInvestigation, error: null })

      const updates = { title: 'Updated Investigation' }
      const result = await service.updateInvestigation('inv-123', updates)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockUpdatedInvestigation)
      }
      expect(mockFrom.update).toHaveBeenCalledWith({
        title: 'Updated Investigation',
        updated_at: expect.any(String),
      })
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'inv-123')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should return failure when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.updateInvestigation('inv-123', {})

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED)
      }
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return NOT_FOUND failure when investigation not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })

      const result = await service.updateInvestigation('inv-123', {})

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_FOUND)
      }
    })

    it('should return failure when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'Update failed' } })

      const result = await service.updateInvestigation('inv-123', {})

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_ERROR)
      }
    })
  })

  describe('deleteInvestigation', () => {
    const mockUser = { id: 'user-123' }

    it('should return success when deleted successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Override the last eq to return the final result
      let eqCallCount = 0
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++
        if (eqCallCount === 2) {
          return Promise.resolve({ error: null })
        }
        return mockFrom
      })

      const result = await service.deleteInvestigation('inv-123')

      expect(isSuccess(result)).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('investigations')
      expect(mockFrom.delete).toHaveBeenCalled()
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'inv-123')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should return failure when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.deleteInvestigation('inv-123')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED)
      }
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return failure when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Override the last eq to return an error
      let eqCallCount = 0
      mockFrom.eq.mockImplementation(() => {
        eqCallCount++
        if (eqCallCount === 2) {
          return Promise.resolve({ error: { message: 'Delete failed' } })
        }
        return mockFrom
      })

      const result = await service.deleteInvestigation('inv-123')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error.code).toBe(ErrorCodes.DB_ERROR)
      }
    })
  })

  describe('archiveInvestigation', () => {
    it('should call updateInvestigation with archived status', async () => {
      const mockUser = { id: 'user-123' }
      const mockArchivedInvestigation = {
        id: 'inv-123',
        status: 'archived',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockArchivedInvestigation, error: null })

      const result = await service.archiveInvestigation('inv-123')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockArchivedInvestigation)
      }
      expect(mockFrom.update).toHaveBeenCalledWith({
        status: 'archived',
        updated_at: expect.any(String),
      })
    })
  })

  describe('completeInvestigation', () => {
    it('should call updateInvestigation with completed status', async () => {
      const mockUser = { id: 'user-123' }
      const mockCompletedInvestigation = {
        id: 'inv-123',
        status: 'completed',
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockCompletedInvestigation, error: null })

      const result = await service.completeInvestigation('inv-123')

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCompletedInvestigation)
      }
      expect(mockFrom.update).toHaveBeenCalledWith({
        status: 'completed',
        updated_at: expect.any(String),
      })
    })
  })
})
