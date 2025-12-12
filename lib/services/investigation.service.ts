/**
 * Investigation Service
 *
 * Service for managing user investigations with Result type pattern.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Refactored to use Result<T> pattern
 * @see ADR-001 Result Type Pattern for Error Handling
 */

import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { type Result, type AsyncResult, success, failure, ErrorCodes } from '@/lib/types/result'
import type { Investigation } from '@/types/supabase'

// ============================================
// Types
// ============================================

export interface CreateInvestigationData {
  title: string
  description?: string
  agents_used?: string[]
  metadata?: Record<string, unknown>
}

export interface InvestigationFilters {
  status?: 'active' | 'completed' | 'archived'
}

// ============================================
// Service Class
// ============================================

export class InvestigationService {
  private supabase = createClient()
  private logger = createLogger('InvestigationService')

  /**
   * Create a new investigation
   *
   * @param data Investigation data
   * @returns Result with created investigation or error
   *
   * @example
   * const result = await service.createInvestigation({ title: 'New Investigation' })
   * if (result.success) {
   *   console.log('Created:', result.data.id)
   * } else {
   *   console.error(result.error.code, result.error.message)
   * }
   */
  async createInvestigation(data: CreateInvestigationData): AsyncResult<Investigation> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return failure(
        ErrorCodes.NOT_AUTHENTICATED,
        'User must be authenticated to create an investigation'
      )
    }

    const { data: investigation, error } = await this.supabase
      .from('investigations')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        agents_used: data.agents_used || [],
        metadata: data.metadata || {},
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      this.logger.error('Error creating investigation:', error)
      return failure(ErrorCodes.DB_ERROR, 'Failed to create investigation', error)
    }

    return success(investigation)
  }

  /**
   * Get all investigations for the current user
   *
   * @param filters Optional filters (status)
   * @returns Result with array of investigations or error
   */
  async getUserInvestigations(filters?: InvestigationFilters): AsyncResult<Investigation[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return failure(
        ErrorCodes.NOT_AUTHENTICATED,
        'User must be authenticated to view investigations'
      )
    }

    let query = this.supabase
      .from('investigations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      this.logger.error('Error fetching investigations:', error)
      return failure(ErrorCodes.DB_QUERY_ERROR, 'Failed to fetch investigations', error)
    }

    return success(data || [])
  }

  /**
   * Get a single investigation by ID
   *
   * @param id Investigation ID
   * @returns Result with investigation or error
   */
  async getInvestigation(id: string): AsyncResult<Investigation> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return failure(
        ErrorCodes.NOT_AUTHENTICATED,
        'User must be authenticated to view investigation'
      )
    }

    const { data, error } = await this.supabase
      .from('investigations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, `Investigation with ID ${id} not found`)
      }
      this.logger.error('Error fetching investigation:', error)
      return failure(ErrorCodes.DB_QUERY_ERROR, 'Failed to fetch investigation', error)
    }

    return success(data)
  }

  /**
   * Update an investigation
   *
   * @param id Investigation ID
   * @param updates Partial investigation data to update
   * @returns Result with updated investigation or error
   */
  async updateInvestigation(
    id: string,
    updates: Partial<Investigation>
  ): AsyncResult<Investigation> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return failure(
        ErrorCodes.NOT_AUTHENTICATED,
        'User must be authenticated to update investigation'
      )
    }

    const { data, error } = await this.supabase
      .from('investigations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(ErrorCodes.NOT_FOUND, `Investigation with ID ${id} not found`)
      }
      this.logger.error('Error updating investigation:', error)
      return failure(ErrorCodes.DB_ERROR, 'Failed to update investigation', error)
    }

    return success(data)
  }

  /**
   * Delete an investigation
   *
   * @param id Investigation ID
   * @returns Result with void on success or error
   */
  async deleteInvestigation(id: string): AsyncResult<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) {
      return failure(
        ErrorCodes.NOT_AUTHENTICATED,
        'User must be authenticated to delete investigation'
      )
    }

    const { error } = await this.supabase
      .from('investigations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      this.logger.error('Error deleting investigation:', error)
      return failure(ErrorCodes.DB_ERROR, 'Failed to delete investigation', error)
    }

    return success(undefined)
  }

  /**
   * Archive an investigation
   *
   * @param id Investigation ID
   * @returns Result with updated investigation or error
   */
  async archiveInvestigation(id: string): AsyncResult<Investigation> {
    return this.updateInvestigation(id, { status: 'archived' })
  }

  /**
   * Mark an investigation as completed
   *
   * @param id Investigation ID
   * @returns Result with updated investigation or error
   */
  async completeInvestigation(id: string): AsyncResult<Investigation> {
    return this.updateInvestigation(id, { status: 'completed' })
  }
}

// ============================================
// Singleton Export
// ============================================

export const investigationService = new InvestigationService()
