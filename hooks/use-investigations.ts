import { useState, useCallback, useEffect } from 'react'
import { investigationService } from '@/lib/services/investigation.service'
import type { Investigation } from '@/types/supabase'

/**
 * Data for creating a new investigation
 *
 * @interface CreateInvestigationData
 */
interface CreateInvestigationData {
  /** Investigation title (required) */
  title: string
  /** Optional description */
  description?: string
  /** List of agent IDs used in the investigation */
  agents_used?: string[]
  /** Additional metadata */
  metadata?: Record<string, any>
}

/**
 * useInvestigations - Hook for managing user investigations
 *
 * Provides CRUD operations for investigations with automatic loading
 * states and error handling. Integrates with Supabase backend.
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
 * @returns {Investigation[]} returns.investigations - List of user investigations
 * @returns {Function} returns.loadInvestigations - Load investigations (with optional status filter)
 * @returns {Function} returns.loadInvestigation - Load single investigation by ID
 * @returns {Function} returns.createInvestigation - Create new investigation
 * @returns {Function} returns.updateInvestigation - Update investigation
 * @returns {Function} returns.deleteInvestigation - Delete investigation
 * @returns {Function} returns.archiveInvestigation - Archive investigation
 * @returns {Function} returns.completeInvestigation - Mark investigation as completed
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {string|null} returns.error - Error message if any
 *
 * @since 1.0.0
 */
export function useInvestigations() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all investigations for the current user
   *
   * @param {string} [status] - Optional status filter ('active' | 'completed' | 'archived')
   */
  const loadInvestigations = useCallback(async (
    status?: 'active' | 'completed' | 'archived'
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await investigationService.getUserInvestigations(status)
      setInvestigations(data)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar investigações'
      setError(errorMessage)
      console.error('Error loading investigations:', err)
    } finally {
      setIsLoading(false)
    }
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

    try {
      const investigation = await investigationService.getInvestigation(id)
      return investigation
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar investigação'
      setError(errorMessage)
      console.error('Error loading investigation:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Create a new investigation
   *
   * @param {CreateInvestigationData} data - Investigation data
   * @returns {Promise<Investigation|null>} The created investigation or null on error
   */
  const createInvestigation = useCallback(async (
    data: CreateInvestigationData
  ): Promise<Investigation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const investigation = await investigationService.createInvestigation(data)

      if (investigation) {
        // Add to local state
        setInvestigations((prev) => [investigation, ...prev])
      }

      return investigation
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar investigação'
      setError(errorMessage)
      console.error('Error creating investigation:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Update an investigation
   *
   * @param {string} id - Investigation ID
   * @param {Partial<Investigation>} updates - Fields to update
   * @returns {Promise<Investigation|null>} The updated investigation or null on error
   */
  const updateInvestigation = useCallback(async (
    id: string,
    updates: Partial<Investigation>
  ): Promise<Investigation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const investigation = await investigationService.updateInvestigation(id, updates)

      if (investigation) {
        // Update local state
        setInvestigations((prev) =>
          prev.map((inv) => (inv.id === id ? investigation : inv))
        )
      }

      return investigation
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar investigação'
      setError(errorMessage)
      console.error('Error updating investigation:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Delete an investigation
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  const deleteInvestigation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await investigationService.deleteInvestigation(id)

      if (success) {
        // Remove from local state
        setInvestigations((prev) => prev.filter((inv) => inv.id !== id))
      }

      return success
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar investigação'
      setError(errorMessage)
      console.error('Error deleting investigation:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Archive an investigation
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<Investigation|null>} The archived investigation or null on error
   */
  const archiveInvestigation = useCallback(async (id: string): Promise<Investigation | null> => {
    return updateInvestigation(id, { status: 'archived' })
  }, [updateInvestigation])

  /**
   * Mark investigation as completed
   *
   * @param {string} id - Investigation ID
   * @returns {Promise<Investigation|null>} The completed investigation or null on error
   */
  const completeInvestigation = useCallback(async (id: string): Promise<Investigation | null> => {
    return updateInvestigation(id, { status: 'completed' })
  }, [updateInvestigation])

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
    error
  }
}
