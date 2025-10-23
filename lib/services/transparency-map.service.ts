/**
 * Transparency Map Service
 *
 * Autor: Anderson Henrique da Silva
 * Localização: Minas Gerais, Brasil
 * Data de Criação: 2025-10-23 13:15:00 -0300
 * Última Atualização: 2025-10-23 14:40:00 -0300
 *
 * Service for fetching transparency API coverage map data
 * Updated to match Railway backend v2 structure
 */

// Backend API structure (Railway v2)
export interface BackendAPIDetail {
  name: string;
  url: string;
  endpoints: number;
  status: 'operational' | 'partial' | 'down';
}

export interface BackendStateData {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  apis: BackendAPIDetail[];
}

export interface BackendSummaryStats {
  total_states: number;
  states_with_apis: number;
  states_working: number;
  overall_coverage_percentage: number;
  total_apis: number;
  total_endpoints: number;
}

export interface BackendCacheInfo {
  cached: boolean;
  last_update: string;
  age_minutes: number;
  note?: string;
}

export interface BackendTransparencyMapData {
  last_update: string;
  summary: BackendSummaryStats;
  states: Record<string, BackendStateData>;
  cache_info: BackendCacheInfo;
}

// Frontend-friendly interface (normalized)
export interface APIDetail {
  id: string;
  name: string;
  url: string;
  endpoints: number;
  status: 'operational' | 'partial' | 'down';
}

export interface StateData {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'no_api';
  apis: APIDetail[];
  apiCount: number;
  endpointCount: number;
  color: string;
}

export interface SummaryStats {
  total_states: number;
  states_with_apis: number;
  states_working: number;
  overall_coverage_percentage: number;
  total_apis: number;
  total_endpoints: number;
  states_no_api: number;
}

export interface TransparencyMapData {
  last_update: string;
  cache_info: BackendCacheInfo;
  states: Record<string, StateData>;
  summary: SummaryStats;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';
const COVERAGE_MAP_ENDPOINT = '/api/v1/transparency/coverage/map';
const CACHE_KEY = 'transparencyMapCache';
const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Normalize backend data to frontend format
 */
function normalizeBackendData(backendData: BackendTransparencyMapData): TransparencyMapData {
  const normalizedStates: Record<string, StateData> = {};

  // Convert backend states to frontend format
  Object.entries(backendData.states).forEach(([stateCode, stateData]) => {
    const apis: APIDetail[] = stateData.apis.map((api, index) => ({
      id: `${stateCode}-${index}`,
      name: api.name,
      url: api.url,
      endpoints: api.endpoints,
      status: api.status
    }));

    const totalEndpoints = apis.reduce((sum, api) => sum + api.endpoints, 0);

    normalizedStates[stateCode] = {
      name: stateData.name,
      status: stateData.status,
      apis,
      apiCount: apis.length,
      endpointCount: totalEndpoints,
      color: getStateColor(stateData.status)
    };
  });

  return {
    last_update: backendData.last_update,
    cache_info: backendData.cache_info,
    states: normalizedStates,
    summary: {
      ...backendData.summary,
      states_no_api: 27 - backendData.summary.states_with_apis
    }
  };
}

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

    const backendData: BackendTransparencyMapData = await response.json();
    const normalizedData = normalizeBackendData(backendData);

    // Cache data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: normalizedData,
        timestamp: Date.now()
      }));
    }

    return normalizedData;
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
 * Get color for state based on status
 */
export function getStateColor(status: StateData['status']): string {
  const colors: Record<StateData['status'], string> = {
    healthy: '#22c55e',    // green-500
    degraded: '#f59e0b',   // amber-500
    unhealthy: '#ef4444',  // red-500
    no_api: '#9ca3af'      // gray-400
  };
  return colors[status] || colors.no_api;
}

/**
 * Get status badge color class for API status
 */
export function getAPIStatusBadgeClass(status: APIDetail['status']): string {
  const classes: Record<APIDetail['status'], string> = {
    operational: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    down: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };
  return classes[status] || classes.down;
}

/**
 * Get status badge color class for state overall status
 */
export function getStateStatusBadgeClass(status: StateData['status']): string {
  const classes: Record<StateData['status'], string> = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    unhealthy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    no_api: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
  };
  return classes[status] || classes.no_api;
}

/**
 * Get status emoji for API status
 */
export function getAPIStatusEmoji(status: APIDetail['status']): string {
  const emojis: Record<APIDetail['status'], string> = {
    operational: '🟢',
    partial: '🟡',
    down: '🔴'
  };
  return emojis[status] || '⚫';
}

/**
 * Get status emoji for state overall status
 */
export function getStateStatusEmoji(status: StateData['status']): string {
  const emojis: Record<StateData['status'], string> = {
    healthy: '🟢',
    degraded: '🟡',
    unhealthy: '🔴',
    no_api: '⚫'
  };
  return emojis[status] || '⚫';
}
