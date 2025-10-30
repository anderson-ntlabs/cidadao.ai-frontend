import { api } from './client';
import { logger } from '@/lib/utils/logger';

/**
 * Investigation Adapter
 *
 * Integrates with Railway backend investigation endpoints
 * to replace mock data with real investigation data
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

// Investigation Types
export type InvestigationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type AnomalyType = 'price' | 'vendor' | 'temporal' | 'payment' | 'duplicate' | 'pattern';
export type DataSource = 'contracts' | 'expenses' | 'agreements' | 'biddings' | 'servants';

export interface CreateInvestigationRequest {
  query: string;
  data_source?: DataSource;
  filters?: {
    organization?: string;
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
  };
  anomaly_types?: AnomalyType[];
  include_explanations?: boolean;
  stream_results?: boolean;
}

export interface InvestigationStatusResponse {
  investigation_id: string;
  status: InvestigationStatus;
  progress: number; // 0-1
  current_phase: string;
  records_processed: number;
  anomalies_detected: number;
  estimated_completion: string | null;
  created_at?: string;
  started_at?: string;
  completed_at?: string | null;
}

export interface AnomalyResult {
  anomaly_id: string;
  type: AnomalyType;
  severity: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  description: string;
  explanation: string;
  affected_records: Array<{
    id: string;
    data: Record<string, any>;
  }>;
  suggested_actions: string[];
  metadata?: Record<string, any>;
}

export interface InvestigationResultsResponse {
  investigation_id: string;
  status: InvestigationStatus;
  query: string;
  data_source: string;
  started_at: string;
  completed_at: string | null;
  anomalies_found: number;
  total_records_analyzed: number;
  results: AnomalyResult[];
  summary: string;
  confidence_score: number;
  processing_time: number;
  metadata?: {
    is_demo_mode?: boolean;
    sources?: string[];
    [key: string]: any;
  };
}

export interface CreateInvestigationResponse {
  investigation_id: string;
  status: string;
  message: string;
  system_user_id?: string;
}

/**
 * Create a new public investigation
 * No authentication required
 */
export async function createPublicInvestigation(
  request: CreateInvestigationRequest
): Promise<CreateInvestigationResponse> {
  const startTime = Date.now();

  try {
    logger.debug('Investigation Adapter: Creating public investigation', {
      query: request.query,
      data_source: request.data_source
    });

    const payload = {
      query: request.query,
      data_source: request.data_source || 'contracts',
      filters: request.filters || {},
      anomaly_types: request.anomaly_types || ['price', 'vendor', 'temporal'],
      include_explanations: request.include_explanations !== false,
      stream_results: request.stream_results || false
    };

    const response = await api.post<CreateInvestigationResponse>(
      '/api/v1/investigations/public/create',
      payload
    );

    const duration = Date.now() - startTime;

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create investigation');
    }

    logger.performance('Investigation created', duration, {
      investigation_id: response.data.investigation_id
    });

    return response.data;

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Investigation Adapter - Create' }
    );
    throw error;
  }
}

/**
 * Get investigation status
 * Polls this endpoint to track progress
 */
export async function getInvestigationStatus(
  investigationId: string
): Promise<InvestigationStatusResponse> {
  try {
    const response = await api.get<InvestigationStatusResponse>(
      `/api/v1/investigations/public/status/${investigationId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get investigation status');
    }

    logger.debug('Investigation status retrieved', {
      investigation_id: investigationId,
      status: response.data.status,
      progress: response.data.progress
    });

    return response.data;

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Investigation Adapter - Status', investigation_id: investigationId }
    );
    throw error;
  }
}

/**
 * Get investigation results
 * Only available when status is 'completed'
 */
export async function getInvestigationResults(
  investigationId: string
): Promise<InvestigationResultsResponse> {
  try {
    logger.debug('Investigation Adapter: Fetching results', { investigation_id: investigationId });

    const response = await api.get<InvestigationResultsResponse>(
      `/api/v1/investigations/${investigationId}/results`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get investigation results');
    }

    logger.debug('Investigation results retrieved', {
      investigation_id: investigationId,
      anomalies_found: response.data.anomalies_found,
      is_demo_mode: response.data.metadata?.is_demo_mode
    });

    return response.data;

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Investigation Adapter - Results', investigation_id: investigationId }
    );
    throw error;
  }
}

/**
 * List all investigations (requires authentication)
 * Returns empty array if not authenticated
 */
export async function listInvestigations(): Promise<InvestigationStatusResponse[]> {
  try {
    const response = await api.get<InvestigationStatusResponse[]>(
      '/api/v1/investigations/'
    );

    if (!response.success) {
      // Not authenticated - return empty array
      if (response.error?.status === 401) {
        logger.debug('Investigation Adapter: Not authenticated, returning empty list');
        return [];
      }
      throw new Error(response.error?.message || 'Failed to list investigations');
    }

    const investigations = response.data || [];
    logger.debug('Investigation list retrieved', { count: investigations.length });

    return investigations;

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Investigation Adapter - List' }
    );
    // Return empty array on error (graceful degradation)
    return [];
  }
}

/**
 * Cancel an investigation
 */
export async function cancelInvestigation(investigationId: string): Promise<boolean> {
  try {
    logger.debug('Investigation Adapter: Cancelling investigation', { investigation_id: investigationId });

    const response = await api.delete(
      `/api/v1/investigations/${investigationId}`
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel investigation');
    }

    logger.debug('Investigation cancelled', { investigation_id: investigationId });
    return true;

  } catch (error: any) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { context: 'Investigation Adapter - Cancel', investigation_id: investigationId }
    );
    return false;
  }
}

/**
 * Poll investigation status until completion
 * Returns status updates via callback
 */
export async function pollInvestigationStatus(
  investigationId: string,
  onUpdate: (status: InvestigationStatusResponse) => void,
  options: {
    interval?: number; // ms between polls (default: 1000)
    timeout?: number; // max time to poll (default: 300000 = 5min)
  } = {}
): Promise<InvestigationStatusResponse> {
  const interval = options.interval || 1000;
  const timeout = options.timeout || 300000;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        // Check timeout
        if (Date.now() - startTime > timeout) {
          reject(new Error('Investigation polling timeout'));
          return;
        }

        const status = await getInvestigationStatus(investigationId);
        onUpdate(status);

        // Check if completed
        if (status.status === 'completed' || status.status === 'failed') {
          resolve(status);
          return;
        }

        // Continue polling
        setTimeout(poll, interval);

      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Create investigation with automatic status polling
 * Convenience function that combines create + poll
 */
export async function createAndPollInvestigation(
  request: CreateInvestigationRequest,
  onUpdate: (status: InvestigationStatusResponse) => void
): Promise<InvestigationResultsResponse> {
  // Create investigation
  const created = await createPublicInvestigation(request);

  // Poll status until completion
  await pollInvestigationStatus(created.investigation_id, onUpdate);

  // Get final results
  const results = await getInvestigationResults(created.investigation_id);

  return results;
}

/**
 * Map backend investigation to frontend format
 * Converts backend response to format expected by UI
 */
export function mapInvestigationToUI(investigation: InvestigationStatusResponse) {
  return {
    id: investigation.investigation_id,
    title: `Investigation ${investigation.investigation_id.slice(0, 8)}`,
    status: investigation.status,
    progress: Math.round(investigation.progress * 100),
    current_phase: investigation.current_phase,
    records_processed: investigation.records_processed,
    anomalies_detected: investigation.anomalies_detected,
    created_at: investigation.created_at,
    completed_at: investigation.completed_at,
    estimated_completion: investigation.estimated_completion,
  };
}
