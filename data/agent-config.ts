/**
 * Agent Visual Configuration
 *
 * Colors, icons, and visual theming for Brazilian AI agents
 * Based on backend guide for frontend integration
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

export interface AgentVisualConfig {
  name: string
  role: string
  color: string
  accentColor: string
  bgGradient: string
  icon: string
  specialty: string
}

export const AGENT_VISUAL_CONFIG: Record<string, AgentVisualConfig> = {
  abaporu: {
    name: 'Abaporu',
    role: 'Orquestrador Master',
    color: '#FF8C00',
    accentColor: '#FFA500',
    bgGradient: 'from-orange-500 to-amber-500',
    icon: '🎭',
    specialty: 'Coordenação de investigações complexas',
  },
  anita: {
    name: 'Anita Garibaldi',
    role: 'Analista de Anomalias',
    color: '#B22222',
    accentColor: '#DC143C',
    bgGradient: 'from-red-600 to-rose-500',
    icon: '📊',
    specialty: 'Análise de padrões e tendências',
  },
  senna: {
    name: 'Ayrton Senna',
    role: 'Otimizador de Performance',
    color: '#FFD700',
    accentColor: '#FFC107',
    bgGradient: 'from-yellow-500 to-amber-400',
    icon: '🏎️',
    specialty: 'Otimização e velocidade',
  },
  zumbi: {
    name: 'Zumbi dos Palmares',
    role: 'Guardião da Transparência',
    color: '#8B4513',
    accentColor: '#CD853F',
    bgGradient: 'from-amber-700 to-orange-600',
    icon: '🏹',
    specialty: 'Detecção de fraudes e irregularidades',
  },
  tiradentes: {
    name: 'Tiradentes',
    role: 'Repórter de Irregularidades',
    color: '#006400',
    accentColor: '#228B22',
    bgGradient: 'from-green-700 to-emerald-600',
    icon: '📜',
    specialty: 'Relatórios e documentação',
  },
  obaluaie: {
    name: 'Obaluaiê',
    role: 'Curandeiro de Dados',
    color: '#8B008B',
    accentColor: '#9932CC',
    bgGradient: 'from-purple-700 to-fuchsia-600',
    icon: '💜',
    specialty: 'Limpeza e cura de dados',
  },
  niemeyer: {
    name: 'Oscar Niemeyer',
    role: 'Arquiteto de Informações',
    color: '#4682B4',
    accentColor: '#5F9EA0',
    bgGradient: 'from-blue-500 to-cyan-500',
    icon: '🏛️',
    specialty: 'Estruturação de informações',
  },
  nana: {
    name: 'Nanã Buruku',
    role: 'Guardiã da Memória',
    color: '#4B0082',
    accentColor: '#6A5ACD',
    bgGradient: 'from-indigo-700 to-purple-600',
    icon: '🌙',
    specialty: 'Preservação de registros históricos',
  },
  lampiao: {
    name: 'Lampião',
    role: 'Auditor do Sertão',
    color: '#8B4513',
    accentColor: '#A0522D',
    bgGradient: 'from-amber-800 to-yellow-700',
    icon: '🤠',
    specialty: 'Auditoria em regiões remotas',
  },
  ceuci: {
    name: 'Ceuci',
    role: 'Protetora dos Recursos',
    color: '#228B22',
    accentColor: '#32CD32',
    bgGradient: 'from-green-600 to-lime-500',
    icon: '🌿',
    specialty: 'Proteção de recursos naturais',
  },
  dandara: {
    name: 'Dandara dos Palmares',
    role: 'Estrategista de Defesa',
    color: '#800080',
    accentColor: '#9932CC',
    bgGradient: 'from-purple-600 to-violet-500',
    icon: '⚖️',
    specialty: 'Equidade e inclusão social',
  },
  machado: {
    name: 'Machado de Assis',
    role: 'Cronista de Relatórios',
    color: '#2F4F4F',
    accentColor: '#708090',
    bgGradient: 'from-slate-700 to-gray-600',
    icon: '📖',
    specialty: 'Análise de documentos oficiais',
  },
  bonifacio: {
    name: 'José Bonifácio',
    role: 'Patriarca da Integridade',
    color: '#191970',
    accentColor: '#4169E1',
    bgGradient: 'from-blue-800 to-indigo-600',
    icon: '🎖️',
    specialty: 'Padrões éticos e integridade',
  },
  deodoro: {
    name: 'Marechal Deodoro',
    role: 'Executor de Comandos',
    color: '#556B2F',
    accentColor: '#6B8E23',
    bgGradient: 'from-olive-600 to-green-600',
    icon: '⚔️',
    specialty: 'Execução de ações corretivas',
  },
  drummond: {
    name: 'Carlos Drummond de Andrade',
    role: 'Poeta dos Dados',
    color: '#2F4F4F',
    accentColor: '#708090',
    bgGradient: 'from-slate-600 to-stone-500',
    icon: '✍️',
    specialty: 'Comunicação clara e acessível',
  },
  quiteria: {
    name: 'Maria Quitéria',
    role: 'Soldado da Verdade',
    color: '#B8860B',
    accentColor: '#DAA520',
    bgGradient: 'from-yellow-700 to-amber-500',
    icon: '🛡️',
    specialty: 'Combate à desinformação',
  },
  oxossi: {
    name: 'Oxóssi',
    role: 'Caçador de Fraudes',
    color: '#228B22',
    accentColor: '#32CD32',
    bgGradient: 'from-green-600 to-emerald-500',
    icon: '🎯',
    specialty: 'Busca em múltiplas fontes',
  },
}

/**
 * Get visual config for an agent
 * Falls back to Abaporu config if agent not found
 */
export function getAgentVisualConfig(agentId: string | null | undefined): AgentVisualConfig {
  if (!agentId) {
    return AGENT_VISUAL_CONFIG.abaporu
  }
  return AGENT_VISUAL_CONFIG[agentId] || AGENT_VISUAL_CONFIG.abaporu
}

/**
 * Get Tailwind gradient class for an agent
 */
export function getAgentGradient(agentId: string | null | undefined): string {
  const config = getAgentVisualConfig(agentId)
  return `bg-gradient-to-r ${config.bgGradient}`
}

/**
 * Get agent accent color as CSS variable compatible string
 */
export function getAgentAccentColor(agentId: string | null | undefined): string {
  const config = getAgentVisualConfig(agentId)
  return config.accentColor
}
