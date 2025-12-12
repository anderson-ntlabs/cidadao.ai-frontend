/**
 * useInvestigations Hook
 *
 * Hook for managing user investigations with Result type pattern.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-12 - Updated to use Result<T> pattern
 */

import { useState, useCallback } from 'react'
import {
  investigationService,
  type CreateInvestigationData,
  type InvestigationFilters,
} from '@/lib/services/investigation.service'
import { isSuccess, isFailure } from '@/lib/types/result'
import { createLogger } from '@/lib/logger'
import type { Investigation } from '@/types/supabase'

const logger = createLogger('Investigations')

/**
 * useInvestigations - Hook for managing user investigations
 *
 * Provides CRUD operations for investigations with automatic loading
 * states and error handling. Uses Result type pattern for type-safe
 * error handling.
 *
 * @hook
 * @example
 * ```tsx
 * const {
 *   investigations,
 *   createInvestigation,
 *   updateInvestigation,
 *   deleteInvestigation,
 *   isLoading,
 *   error
 * } = useInvestigations();
 *
 * // Load all investigations
 * useEffect(() => {
 *   loadInvestigations();
 * }, [loadInvestigations]);
 *
 * // Create a new investigation
 * const newInvestigation = await createInvestigation({
 *   title: "Public Contracts Analysis 2024",
 *   description: "Investigating anomalies in public contracts",
 *   agents_used: ["zumbi", "anita"]
 * });
 *
 * // Update investigation status
 * await updateInvestigation(id, { status: 'completed' });
 *
 * // Archive investigation
 * await archiveInvestigation(id);
 * ```
 *
 * @returns {Object} Investigation methods and state
 */
export function useInvestigations() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all investigations for the current user
   *
   * @param {InvestigationFilters} [filters] - Optional filters
   */
  const loadInvestigations = useCallback(async (filters?: InvestigationFilters) => {
    setIsLoading(true)
    setError(null)

    const result = await investigationService.getUserInvestigations(filters)

    if (isSuccess(result)) {
      setInvestigations(result.data)
    } else {
      setError(result.error.message)
      logger.error('Error loading investigations', {
        code: result.error.code,
        message: result.error.message,
      })
    }

    setIsLoading(false)
  }, [])

  /**
   * Load a single investigation by ID
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<Investigation|null>} The investigation or null if not found
   */
  const loadInvestigation = useCallback(async (id: string): Promise<Investigation | null> => {
    setIsLoading(true)
    setError(null)

    const result = await investigationService.getInvestigation(id)

    setIsLoading(false)

    if (isSuccess(result)) {
      return result.data
    } else {
      setError(result.error.message)
      logger.error('Error loading investigation', {
        code: result.error.code,
        message: result.error.message,
      })
      return null
    }
  }, [])

  /**
   * Create a new investigation
   *
   * @param {CreateInvestigationData} data - Investigation data
   * @returns {Promise<Investigation|null>} The created investigation or null on error
   */
  const createInvestigation = useCallback(
    async (data: CreateInvestigationData): Promise<Investigation | null> => {
      setIsLoading(true)
      setError(null)

      const result = await investigationService.createInvestigation(data)

      setIsLoading(false)

      if (isSuccess(result)) {
        // Add to local state
        setInvestigations((prev) => [result.data, ...prev])
        return result.data
      } else {
        setError(result.error.message)
        logger.error('Error creating investigation', {
          code: result.error.code,
          message: result.error.message,
        })
        return null
      }
    },
    []
  )

  /**
   * Update an investigation
   *
   * @param {string} id - Investigation ID
   * @param {Partial<Investigation>} updates - Fields to update
   * @returns {Promise<Investigation|null>} The updated investigation or null on error
   */
  const updateInvestigation = useCallback(
    async (id: string, updates: Partial<Investigation>): Promise<Investigation | null> => {
      setIsLoading(true)
      setError(null)

      const result = await investigationService.updateInvestigation(id, updates)

      setIsLoading(false)

      if (isSuccess(result)) {
        // Update local state
        setInvestigations((prev) => prev.map((inv) => (inv.id === id ? result.data : inv)))
        return result.data
      } else {
        setError(result.error.message)
        logger.error('Error updating investigation', {
          code: result.error.code,
          message: result.error.message,
        })
        return null
      }
    },
    []
  )

  /**
   * Delete an investigation
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  const deleteInvestigation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    const result = await investigationService.deleteInvestigation(id)

    setIsLoading(false)

    if (isSuccess(result)) {
      // Remove from local state
      setInvestigations((prev) => prev.filter((inv) => inv.id !== id))
      return true
    } else {
      setError(result.error.message)
      logger.error('Error deleting investigation', {
        code: result.error.code,
        message: result.error.message,
      })
      return false
    }
  }, [])

  /**
   * Archive an investigation
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<Investigation|null>} The archived investigation or null on error
   */
  const archiveInvestigation = useCallback(
    async (id: string): Promise<Investigation | null> => {
      return updateInvestigation(id, { status: 'archived' })
    },
    [updateInvestigation]
  )

  /**
   * Mark investigation as completed
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<Investigation|null>} The completed investigation or null on error
   */
  const completeInvestigation = useCallback(
    async (id: string): Promise<Investigation | null> => {
      return updateInvestigation(id, { status: 'completed' })
    },
    [updateInvestigation]
  )

  return {
    investigations,
    loadInvestigations,
    loadInvestigation,
    createInvestigation,
    updateInvestigation,
    deleteInvestigation,
    archiveInvestigation,
    completeInvestigation,
    isLoading,
    error,
  }
}
