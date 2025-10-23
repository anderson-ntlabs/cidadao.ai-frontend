/**
 * Transparency Map Service
 *
 * Autor: Anderson Henrique da Silva
 * Localização: Minas Gerais, Brasil
 * Data de Criação: 2025-10-23 13:15:00 -0300
 *
 * Service for fetching transparency API coverage map data
 */

export interface APIDetail {
  id: string;
  name: string;
  type: 'tce' | 'ckan' | 'state_portal' | 'federal';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'blocked' | 'unknown';
  response_time_ms: number | null;
  last_check: string;
  error: string | null;
  error_details: Record<string, any>;
  coverage: string[];
  action: string;
  url?: string; // Optional URL to the API portal
}

export interface StateData {
  name: string;
  apis: APIDetail[];
  overall_status: 'healthy' | 'degraded' | 'unhealthy' | 'no_api';
  coverage_percentage: number;
  color: string;
  region?: string; // Optional region name
  population?: number; // Optional population count
  notes?: string; // Optional additional notes
}

export interface SummaryStats {
  total_states: number;
  states_with_apis: number;
  states_working: number;
  states_degraded: number;
  states_no_api: number;
  overall_coverage_percentage: number;
  api_breakdown: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
}

export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_states: string[];
  action: string;
  legal_basis?: string;
}

export interface CallToAction {
  title: string;
  description: string;
  guide_url: string;
}

export interface TransparencyMapData {
  last_update: string;
  cache_info: {
    cached: boolean;
    last_update: string;
    age_minutes: number;
    age_hours?: number;
  };
  states: Record<string, StateData>;
  summary: SummaryStats;
  issues: Issue[];
  call_to_action: CallToAction;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';
const COVERAGE_MAP_ENDPOINT = '/api/v1/transparency/coverage/map';
const CACHE_KEY = 'transparencyMapCache';
const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch transparency coverage map from backend
 */
export async function fetchTransparencyMap(): Promise<TransparencyMapData> {
  const url = `${API_BASE_URL}${COVERAGE_MAP_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout after 65 seconds (to handle cold start)
      signal: AbortSignal.timeout(65000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: TransparencyMapData = await response.json();

    // Cache data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching transparency map:', error);

    // Try to return cached data if available
    const cachedData = getCachedMapData();
    if (cachedData) {
      console.warn('Using cached transparency map data');
      return cachedData;
    }

    throw error;
  }
}

/**
 * Get cached map data from localStorage
 */
export function getCachedMapData(): TransparencyMapData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return cached data even if expired (better than nothing)
    if (age < CACHE_EXPIRY_MS) {
      return data;
    }

    // Mark cache as stale but still return it
    console.warn('Cache is stale but returning anyway');
    return data;
  } catch (error) {
    console.error('Error reading cached map data:', error);
    return null;
  }
}

/**
 * Check if cached data is fresh
 */
export function isCacheFresh(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return false;
    }

    const { timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    return age < CACHE_EXPIRY_MS;
  } catch {
    return false;
  }
}

/**
 * Clear cached map data
 */
export function clearCachedMapData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
}

/**
 * Get color for state based on status (fallback if backend doesn't provide)
 */
export function getStateColor(status: StateData['overall_status']): string {
  const colors: Record<StateData['overall_status'], string> = {
    healthy: '#22c55e',    // green-500
    degraded: '#f59e0b',   // yellow-500
    unhealthy: '#ef4444',  // red-500
    no_api: '#6b7280'      // gray-500
  };
  return colors[status] || colors.no_api;
}

/**
 * Get status badge color class
 */
export function getStatusBadgeClass(status: APIDetail['status']): string {
  const classes: Record<APIDetail['status'], string> = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    unhealthy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    blocked: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
  };
  return classes[status] || classes.unknown;
}

/**
 * Format response time for display
 */
export function formatResponseTime(ms: number | null): string {
  if (ms === null) return 'N/A';
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 10000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 1000).toFixed(0)}s`;
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: APIDetail['status']): string {
  const emojis: Record<APIDetail['status'], string> = {
    healthy: '🟢',
    degraded: '🟡',
    unhealthy: '🔴',
    blocked: '🟠',
    unknown: '⚫'
  };
  return emojis[status] || '⚫';
}
