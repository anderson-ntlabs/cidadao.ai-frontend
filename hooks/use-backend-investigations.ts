import { useState, useEffect, useCallback } from 'react';
import {
  createPublicInvestigation,
  getInvestigationStatus,
  getInvestigationResults,
  listInvestigations,
  cancelInvestigation,
  pollInvestigationStatus,
  type CreateInvestigationRequest,
  type InvestigationStatusResponse,
  type InvestigationResultsResponse,
} from '@/lib/api/investigation-adapter';
import { logger } from '@/lib/utils/logger';

/**
 * Backend Investigation Hook
 *
 * React hook for managing investigations with Railway backend integration
 * Replaces Supabase-based investigation service with real backend data
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

export interface UseBackendInvestigationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseBackendInvestigationsReturn {
  investigations: InvestigationStatusResponse[];
  isLoading: boolean;
  error: Error | null;
  createInvestigation: (request: CreateInvestigationRequest) => Promise<string>;
  refreshInvestigations: () => Promise<void>;
  cancelInvestigation: (id: string) => Promise<boolean>;
}

/**
 * Hook to manage list of backend investigations
 */
export function useBackendInvestigations(
  options: UseBackendInvestigationsOptions = {}
): UseBackendInvestigationsReturn {
  const [investigations, setInvestigations] = useState<InvestigationStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshInvestigations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await listInvestigations();
      setInvestigations(data);

      logger.debug('Backend investigations refreshed', { count: data.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(error, { context: 'useBackendInvestigations' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInvestigation = useCallback(async (
    request: CreateInvestigationRequest
  ): Promise<string> => {
    try {
      setError(null);
      const result = await createPublicInvestigation(request);

      // Refresh list to include new investigation
      await refreshInvestigations();

      return result.investigation_id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(error, { context: 'useBackendInvestigations - create' });
      throw error;
    }
  }, [refreshInvestigations]);

  const handleCancelInvestigation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await cancelInvestigation(id);

      if (success) {
        // Refresh list to update status
        await refreshInvestigations();
      }

      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(error, { context: 'useBackendInvestigations - cancel', id });
      return false;
    }
  }, [refreshInvestigations]);

  // Initial load
  useEffect(() => {
    refreshInvestigations();
  }, [refreshInvestigations]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(
      refreshInvestigations,
      options.refreshInterval || 5000
    );

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, refreshInvestigations]);

  return {
    investigations,
    isLoading,
    error,
    createInvestigation,
    refreshInvestigations,
    cancelInvestigation: handleCancelInvestigation,
  };
}

/**
 * Hook to manage a single investigation with status tracking
 */
export interface UseBackendInvestigationOptions {
  investigationId?: string;
  autoPoll?: boolean;
  pollInterval?: number;
}

export interface UseBackendInvestigationReturn {
  investigation: InvestigationStatusResponse | null;
  results: InvestigationResultsResponse | null;
  isLoading: boolean;
  error: Error | null;
  startPolling: () => void;
  stopPolling: () => void;
  refresh: () => Promise<void>;
}

export function useBackendInvestigation(
  options: UseBackendInvestigationOptions = {}
): UseBackendInvestigationReturn {
  const [investigation, setInvestigation] = useState<InvestigationStatusResponse | null>(null);
  const [results, setResults] = useState<InvestigationResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const refresh = useCallback(async () => {
    if (!options.investigationId) return;

    try {
      setIsLoading(true);
      setError(null);

      const status = await getInvestigationStatus(options.investigationId);
      setInvestigation(status);

      // If completed, fetch results
      if (status.status === 'completed') {
        const data = await getInvestigationResults(options.investigationId);
        setResults(data);
        setIsPolling(false);
      }

      logger.debug('Backend investigation refreshed', {
        id: options.investigationId,
        status: status.status,
        progress: status.progress
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error(error, { context: 'useBackendInvestigation', id: options.investigationId });
    } finally {
      setIsLoading(false);
    }
  }, [options.investigationId]);

  const startPolling = useCallback(() => {
    if (!options.investigationId) return;

    setIsPolling(true);

    pollInvestigationStatus(
      options.investigationId,
      (status) => {
        setInvestigation(status);
        logger.debug('Investigation status update', {
          id: options.investigationId,
          status: status.status,
          progress: Math.round(status.progress * 100)
        });
      },
      {
        interval: options.pollInterval || 1000,
        timeout: 300000 // 5 minutes
      }
    ).then(async (finalStatus) => {
      setInvestigation(finalStatus);
      setIsPolling(false);

      // Fetch final results
      if (finalStatus.status === 'completed' && options.investigationId) {
        const data = await getInvestigationResults(options.investigationId);
        setResults(data);
      }
    }).catch((err) => {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsPolling(false);
      logger.error(error, { context: 'useBackendInvestigation - polling', id: options.investigationId });
    });
  }, [options.investigationId, options.pollInterval]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Initial load
  useEffect(() => {
    if (options.investigationId) {
      refresh();
    }
  }, [options.investigationId, refresh]);

  // Auto-poll if enabled
  useEffect(() => {
    if (options.autoPoll && options.investigationId && !isPolling) {
      startPolling();
    }
  }, [options.autoPoll, options.investigationId, isPolling, startPolling]);

  return {
    investigation,
    results,
    isLoading,
    error,
    startPolling,
    stopPolling,
    refresh,
  };
}

/**
 * Hook to create and track a new investigation
 */
export interface UseCreateBackendInvestigationReturn {
  createAndTrack: (request: CreateInvestigationRequest) => Promise<void>;
  investigation: InvestigationStatusResponse | null;
  results: InvestigationResultsResponse | null;
  isCreating: boolean;
  isPolling: boolean;
  error: Error | null;
}

export function useCreateBackendInvestigation(): UseCreateBackendInvestigationReturn {
  const [investigation, setInvestigation] = useState<InvestigationStatusResponse | null>(null);
  const [results, setResults] = useState<InvestigationResultsResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAndTrack = useCallback(async (request: CreateInvestigationRequest) => {
    try {
      setIsCreating(true);
      setError(null);
      setInvestigation(null);
      setResults(null);

      // Create investigation
      logger.debug('Creating backend investigation', { query: request.query });
      const created = await createPublicInvestigation(request);

      logger.info('Backend investigation created', { id: created.investigation_id });

      // Start polling
      setIsCreating(false);
      setIsPolling(true);

      await pollInvestigationStatus(
        created.investigation_id,
        (status) => {
          setInvestigation(status);
          logger.debug('Investigation progress', {
            id: created.investigation_id,
            progress: Math.round(status.progress * 100),
            phase: status.current_phase
          });
        },
        { interval: 1000, timeout: 300000 }
      );

      // Get final results
      const finalResults = await getInvestigationResults(created.investigation_id);
      setResults(finalResults);
      setIsPolling(false);

      logger.info('Backend investigation completed', {
        id: created.investigation_id,
        anomalies: finalResults.anomalies_found
      });

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsCreating(false);
      setIsPolling(false);
      logger.error(error, { context: 'useCreateBackendInvestigation' });
      throw error;
    }
  }, []);

  return {
    createAndTrack,
    investigation,
    results,
    isCreating,
    isPolling,
    error,
  };
}
