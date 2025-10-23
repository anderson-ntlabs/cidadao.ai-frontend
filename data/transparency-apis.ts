/**
 * Transparency APIs Coverage Data
 *
 * Autor: Anderson Henrique da Silva
 * Localização: Minas Gerais, Brasil
 * Data de Criação: 2025-10-23 12:45:13 -0300
 *
 * Maps Brazilian states to their available transparency APIs
 * Based on research conducted in October 2024
 */

export type APIStatus = 'healthy' | 'degraded' | 'blocked' | 'no_api' | 'server_error';

export interface TransparencyAPI {
  id: string;
  name: string;
  type: 'TCE' | 'CKAN' | 'Portal' | 'Federal';
  status: APIStatus;
  url?: string;
  coverage: string[];
  responseTimeMs?: number;
  lastCheck?: string;
  error?: string;
  issue_url?: string;
  action?: string;
}

export interface StateAPICoverage {
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  apis: TransparencyAPI[];
  overall_status: APIStatus;
  coverage_percentage: number;
  population?: number;
  notes?: string;
}

export const transparencyAPIs: Record<string, StateAPICoverage> = {
  'SP': {
    name: 'São Paulo',
    region: 'Sudeste',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 46649132,
    apis: [
      {
        id: 'SP-tce',
        name: 'TCE-SP',
        type: 'TCE',
        status: 'healthy',
        url: 'https://transparencia.tce.sp.gov.br/',
        coverage: ['contracts', 'expenses', 'biddings', 'payroll'],
        responseTimeMs: 1200,
        lastCheck: '2025-10-23T10:00:00Z'
      },
      {
        id: 'SP-ckan',
        name: 'Portal CKAN-SP',
        type: 'CKAN',
        status: 'healthy',
        url: 'https://dados.sp.gov.br/',
        coverage: ['datasets', 'downloads', 'budget'],
        responseTimeMs: 890,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'RJ': {
    name: 'Rio de Janeiro',
    region: 'Sudeste',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 17463349,
    apis: [
      {
        id: 'RJ-tce',
        name: 'TCE-RJ',
        type: 'TCE',
        status: 'healthy',
        url: 'https://www.tcerj.tc.br/',
        coverage: ['contracts', 'expenses', 'biddings'],
        responseTimeMs: 1450,
        lastCheck: '2025-10-23T10:00:00Z'
      },
      {
        id: 'RJ-ckan',
        name: 'Portal Dados Abertos RJ',
        type: 'CKAN',
        status: 'healthy',
        url: 'http://www.data.rio/',
        coverage: ['datasets', 'municipal_data'],
        responseTimeMs: 980,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'MG': {
    name: 'Minas Gerais',
    region: 'Sudeste',
    overall_status: 'blocked',
    coverage_percentage: 0,
    population: 21411923,
    notes: 'TCE-MG requires firewall authentication - no public API access',
    apis: [
      {
        id: 'MG-tce',
        name: 'TCE-MG',
        type: 'TCE',
        status: 'blocked',
        url: 'https://www.tce.mg.gov.br/',
        coverage: [],
        error: 'Firewall authentication required - No API access',
        issue_url: 'https://github.com/anderson-ufrj/cidadao.ai/issues/123',
        action: 'Pedido LAI protocolado em 23/10/2025',
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'RS': {
    name: 'Rio Grande do Sul',
    region: 'Sul',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 11466630,
    apis: [
      {
        id: 'RS-ckan',
        name: 'Portal Dados Abertos RS',
        type: 'CKAN',
        status: 'healthy',
        url: 'https://dados.rs.gov.br/',
        coverage: ['datasets', 'budget', 'contracts'],
        responseTimeMs: 1100,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'SC': {
    name: 'Santa Catarina',
    region: 'Sul',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 7338473,
    apis: [
      {
        id: 'SC-ckan',
        name: 'Portal Dados Abertos SC',
        type: 'CKAN',
        status: 'healthy',
        url: 'http://dados.sc.gov.br/',
        coverage: ['datasets', 'transparency'],
        responseTimeMs: 950,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'BA': {
    name: 'Bahia',
    region: 'Nordeste',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 14985284,
    apis: [
      {
        id: 'BA-tce',
        name: 'TCE-BA',
        type: 'TCE',
        status: 'healthy',
        url: 'https://www.tce.ba.gov.br/',
        coverage: ['contracts', 'expenses'],
        responseTimeMs: 1350,
        lastCheck: '2025-10-23T10:00:00Z'
      },
      {
        id: 'BA-ckan',
        name: 'Portal Dados Abertos BA',
        type: 'CKAN',
        status: 'healthy',
        url: 'http://dados.ba.gov.br/',
        coverage: ['datasets'],
        responseTimeMs: 1020,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'PE': {
    name: 'Pernambuco',
    region: 'Nordeste',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 9674793,
    apis: [
      {
        id: 'PE-tce',
        name: 'TCE-PE',
        type: 'TCE',
        status: 'healthy',
        url: 'https://www.tce.pe.gov.br/',
        coverage: ['contracts', 'expenses', 'biddings'],
        responseTimeMs: 1280,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'CE': {
    name: 'Ceará',
    region: 'Nordeste',
    overall_status: 'healthy',
    coverage_percentage: 100,
    population: 9240580,
    apis: [
      {
        id: 'CE-tce',
        name: 'TCE-CE',
        type: 'TCE',
        status: 'healthy',
        url: 'https://www.tce.ce.gov.br/',
        coverage: ['contracts', 'expenses'],
        responseTimeMs: 1400,
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  },
  'RO': {
    name: 'Rondônia',
    region: 'Norte',
    overall_status: 'server_error',
    coverage_percentage: 0,
    population: 1815278,
    notes: 'Portal experiencing server errors',
    apis: [
      {
        id: 'RO-state',
        name: 'Portal Transparência RO',
        type: 'Portal',
        status: 'server_error',
        url: 'http://www.transparencia.ro.gov.br/',
        coverage: [],
        error: 'HTTP 500 Internal Server Error',
        action: 'Infrastructure issue - Not fixable from our side',
        lastCheck: '2025-10-23T10:00:00Z'
      }
    ]
  }
};

// Estados sem APIs públicas (para referência)
export const statesWithoutAPIs = [
  'AC', 'AL', 'AM', 'AP', 'DF', 'ES', 'GO', 'MA', 'MS', 'MT',
  'PA', 'PB', 'PI', 'PR', 'RN', 'RR', 'SE', 'TO'
];

export const estadoNomes: Record<string, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
};

export interface MapSummary {
  total_states: number;
  states_with_apis: number;
  states_working: number;
  states_degraded: number;
  states_blocked: number;
  states_no_api: number;
  overall_coverage_percentage: number;
  total_apis: number;
  healthy_apis: number;
}

export function calculateMapSummary(): MapSummary {
  const statesWithAPIsCount = Object.keys(transparencyAPIs).length;
  const statesWorking = Object.values(transparencyAPIs).filter(
    s => s.overall_status === 'healthy'
  ).length;
  const statesDegraded = Object.values(transparencyAPIs).filter(
    s => s.overall_status === 'degraded' || s.overall_status === 'server_error'
  ).length;
  const statesBlocked = Object.values(transparencyAPIs).filter(
    s => s.overall_status === 'blocked'
  ).length;

  const totalAPIs = Object.values(transparencyAPIs).reduce(
    (sum, state) => sum + state.apis.length, 0
  );
  const healthyAPIs = Object.values(transparencyAPIs).reduce(
    (sum, state) => sum + state.apis.filter(api => api.status === 'healthy').length, 0
  );

  return {
    total_states: 27,
    states_with_apis: statesWithAPIsCount,
    states_working: statesWorking,
    states_degraded: statesDegraded,
    states_blocked: statesBlocked,
    states_no_api: 27 - statesWithAPIsCount,
    overall_coverage_percentage: (statesWorking / 27) * 100,
    total_apis: totalAPIs,
    healthy_apis: healthyAPIs
  };
}
