/**
 * Chat Adapter - Mock Data
 *
 * Provides fallback mock data for agents and suggestions
 * when the backend API is unavailable.
 *
 * @deprecated These mocks are only used as fallback when backend fails.
 * Real data should come from the backend API.
 */

import type { AgentInfo, QuickAction } from '@/types/chat'

/**
 * Get mock agents for fallback
 * Used when backend /api/v1/chat/agents endpoint fails
 */
export function getMockAgents(): AgentInfo[] {
  return [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      avatar: '🔍',
      role: 'Investigador Universal',
      status: 'active' as const,
      specialty: 'Análise de dados governamentais',
      type: 'investigator' as const,
      description: 'Especialista em detectar anomalias em dados do governo',
      capabilities: [
        'Busca de servidores públicos',
        'Análise de contratos',
        'Investigação de despesas',
        'Detecção de anomalias',
      ],
    },
  ]
}

/**
 * Get mock suggestions for fallback
 * Used when backend /api/v1/chat/suggestions endpoint fails
 */
export function getMockSuggestions(): QuickAction[] {
  return [
    {
      id: '1',
      label: 'Buscar servidor por nome',
      icon: 'User',
      action: 'Quanto ganha João Silva?',
    },
    {
      id: '2',
      label: 'Contratos suspeitos',
      icon: 'FileText',
      action: 'Contratos de TI acima de 1 milhão',
    },
    {
      id: '3',
      label: 'Gastos do governo',
      icon: 'DollarSign',
      action: 'Despesas do Ministério da Saúde em dezembro',
    },
    {
      id: '4',
      label: 'Empresas punidas',
      icon: 'AlertCircle',
      action: 'Empresas sancionadas em 2024',
    },
  ]
}
