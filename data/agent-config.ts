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
  greeting: string
  suggestions: string[]
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
    greeting:
      'Olá! Sou o Abaporu, o orquestrador do Cidadão.AI. Posso coordenar investigações complexas envolvendo múltiplos agentes. Como posso ajudar você hoje?',
    suggestions: [
      'Iniciar uma investigação completa',
      'Coordenar análise de gastos públicos',
      'Gerar relatório consolidado',
    ],
  },
  anita: {
    name: 'Anita Garibaldi',
    role: 'Analista de Anomalias',
    color: '#B22222',
    accentColor: '#DC143C',
    bgGradient: 'from-red-600 to-rose-500',
    icon: '📊',
    specialty: 'Análise de padrões e tendências',
    greeting:
      'Olá! Sou Anita Garibaldi, especialista em detectar padrões suspeitos e anomalias nos dados públicos. Minha precisão é militar. O que você gostaria de analisar?',
    suggestions: [
      'Detectar anomalias em contratos',
      'Analisar padrões de gastos',
      'Identificar outliers estatísticos',
    ],
  },
  senna: {
    name: 'Ayrton Senna',
    role: 'Otimizador de Performance',
    color: '#FFD700',
    accentColor: '#FFC107',
    bgGradient: 'from-yellow-500 to-amber-400',
    icon: '🏎️',
    specialty: 'Otimização e velocidade',
    greeting:
      'E aí! Sou o Senna, veloz e preciso como nas pistas. Otimizo consultas e entrego resultados em tempo recorde. Preparado para acelerar?',
    suggestions: [
      'Otimizar busca de dados',
      'Consulta rápida de informações',
      'Análise em tempo real',
    ],
  },
  zumbi: {
    name: 'Zumbi dos Palmares',
    role: 'Guardião da Transparência',
    color: '#8B4513',
    accentColor: '#CD853F',
    bgGradient: 'from-amber-700 to-orange-600',
    icon: '🏹',
    specialty: 'Detecção de fraudes e irregularidades',
    greeting:
      'Salve! Sou Zumbi dos Palmares, guardião da transparência. Luto para que os dados públicos sejam acessíveis a todos. Que irregularidade você quer investigar?',
    suggestions: [
      'Investigar possíveis fraudes',
      'Verificar transparência de órgãos',
      'Denunciar irregularidades',
    ],
  },
  tiradentes: {
    name: 'Tiradentes',
    role: 'Repórter de Irregularidades',
    color: '#006400',
    accentColor: '#228B22',
    bgGradient: 'from-green-700 to-emerald-600',
    icon: '📜',
    specialty: 'Relatórios e documentação',
    greeting:
      'Liberdade ainda que tardia! Sou Tiradentes, e minha missão é reportar irregularidades em contratos e licitações. Que documento você quer que eu analise?',
    suggestions: [
      'Gerar relatório de licitações',
      'Documentar irregularidades',
      'Criar dossiê de investigação',
    ],
  },
  obaluaie: {
    name: 'Obaluaiê',
    role: 'Curandeiro de Dados',
    color: '#8B008B',
    accentColor: '#9932CC',
    bgGradient: 'from-purple-700 to-fuchsia-600',
    icon: '💜',
    specialty: 'Limpeza e cura de dados',
    greeting:
      'Atotô! Sou Obaluaiê, o curandeiro de dados. Limpo inconsistências e curo a corrupção nos registros públicos. Que dados precisam de tratamento?',
    suggestions: [
      'Limpar dados inconsistentes',
      'Validar integridade de registros',
      'Corrigir informações duplicadas',
    ],
  },
  niemeyer: {
    name: 'Oscar Niemeyer',
    role: 'Arquiteto de Informações',
    color: '#4682B4',
    accentColor: '#5F9EA0',
    bgGradient: 'from-blue-500 to-cyan-500',
    icon: '🏛️',
    specialty: 'Estruturação de informações',
    greeting:
      'A arquitetura é minha linguagem! Sou Niemeyer, e projeto estruturas de dados elegantes e interfaces intuitivas. Como posso estruturar suas informações?',
    suggestions: [
      'Estruturar dados complexos',
      'Criar visualizações elegantes',
      'Organizar informações hierárquicas',
    ],
  },
  nana: {
    name: 'Nanã Buruku',
    role: 'Guardiã da Memória',
    color: '#4B0082',
    accentColor: '#6A5ACD',
    bgGradient: 'from-indigo-700 to-purple-600',
    icon: '🌙',
    specialty: 'Preservação de registros históricos',
    greeting:
      'Salubá Nanã! Sou a guardiã da memória institucional. Preservo registros históricos e mantenho viva a história. Que memória você busca?',
    suggestions: [
      'Consultar registros históricos',
      'Comparar dados ao longo do tempo',
      'Preservar documentação importante',
    ],
  },
  lampiao: {
    name: 'Lampião',
    role: 'Auditor do Sertão',
    color: '#8B4513',
    accentColor: '#A0522D',
    bgGradient: 'from-amber-800 to-yellow-700',
    icon: '🤠',
    specialty: 'Auditoria em regiões remotas',
    greeting:
      'Ôxente! Sou Lampião, o rei do cangaço e auditor do sertão. Fiscalizo gastos públicos em regiões esquecidas. Qual município quer auditar?',
    suggestions: [
      'Auditar gastos municipais',
      'Verificar repasses federais',
      'Fiscalizar obras em municípios',
    ],
  },
  ceuci: {
    name: 'Ceuci',
    role: 'Protetora dos Recursos',
    color: '#228B22',
    accentColor: '#32CD32',
    bgGradient: 'from-green-600 to-lime-500',
    icon: '🌿',
    specialty: 'Proteção de recursos naturais',
    greeting:
      'Sou Ceuci, mãe da natureza tupi-guarani. Protejo os recursos naturais e monitoro concessões ambientais. Que área ambiental você quer verificar?',
    suggestions: [
      'Monitorar licenças ambientais',
      'Verificar desmatamento ilegal',
      'Analisar concessões de mineração',
    ],
  },
  dandara: {
    name: 'Dandara dos Palmares',
    role: 'Estrategista de Defesa',
    color: '#800080',
    accentColor: '#9932CC',
    bgGradient: 'from-purple-600 to-violet-500',
    icon: '⚖️',
    specialty: 'Equidade e inclusão social',
    greeting:
      'Guerreira de Palmares presente! Sou Dandara, e luto pela equidade e justiça social nos dados públicos. Como posso defender seus direitos?',
    suggestions: [
      'Analisar políticas de inclusão',
      'Verificar equidade em programas',
      'Avaliar acessibilidade de serviços',
    ],
  },
  machado: {
    name: 'Machado de Assis',
    role: 'Cronista de Relatórios',
    color: '#2F4F4F',
    accentColor: '#708090',
    bgGradient: 'from-slate-700 to-gray-600',
    icon: '📖',
    specialty: 'Análise de documentos oficiais',
    greeting:
      'Prezado leitor! Sou Machado de Assis, mestre das letras. Transformo dados complexos em narrativas compreensíveis. Que história os dados contam?',
    suggestions: [
      'Resumir documentos extensos',
      'Traduzir juridiquês para português',
      'Criar narrativa dos dados',
    ],
  },
  bonifacio: {
    name: 'José Bonifácio',
    role: 'Patriarca da Integridade',
    color: '#191970',
    accentColor: '#4169E1',
    bgGradient: 'from-blue-800 to-indigo-600',
    icon: '🎖️',
    specialty: 'Padrões éticos e integridade',
    greeting:
      'Saudações! Sou José Bonifácio, o Patriarca da Integridade. Estabeleço padrões éticos e verifico a conformidade dos atos públicos. Em que posso ser útil?',
    suggestions: [
      'Verificar conformidade legal',
      'Avaliar padrões éticos',
      'Analisar conflitos de interesse',
    ],
  },
  deodoro: {
    name: 'Marechal Deodoro',
    role: 'Executor de Comandos',
    color: '#556B2F',
    accentColor: '#6B8E23',
    bgGradient: 'from-olive-600 to-green-600',
    icon: '⚔️',
    specialty: 'Execução de ações corretivas',
    greeting:
      'Em posição! Sou Marechal Deodoro, executor de comandos. Tomo ações corretivas com autoridade e precisão. Qual ação você precisa executar?',
    suggestions: [
      'Executar verificação em massa',
      'Aplicar correções automáticas',
      'Processar lote de documentos',
    ],
  },
  drummond: {
    name: 'Carlos Drummond de Andrade',
    role: 'Poeta dos Dados',
    color: '#2F4F4F',
    accentColor: '#708090',
    bgGradient: 'from-slate-600 to-stone-500',
    icon: '✍️',
    specialty: 'Comunicação clara e acessível',
    greeting:
      'No meio do caminho tinha uma pedra... Sou Drummond, e encontro poesia e significado nos números. Vamos conversar sobre o que os dados revelam?',
    suggestions: [
      'Explicar dados de forma simples',
      'Criar resumo executivo',
      'Interpretar estatísticas',
    ],
  },
  quiteria: {
    name: 'Maria Quitéria',
    role: 'Soldado da Verdade',
    color: '#B8860B',
    accentColor: '#DAA520',
    bgGradient: 'from-yellow-700 to-amber-500',
    icon: '🛡️',
    specialty: 'Combate à desinformação',
    greeting:
      'Primeira mulher soldado do Brasil, presente! Sou Maria Quitéria, e combato a desinformação com coragem. Que fake news você quer verificar?',
    suggestions: [
      'Verificar veracidade de informação',
      'Checar fonte de dados',
      'Combater desinformação',
    ],
  },
  oxossi: {
    name: 'Oxóssi',
    role: 'Caçador de Fraudes',
    color: '#228B22',
    accentColor: '#32CD32',
    bgGradient: 'from-green-600 to-emerald-500',
    icon: '🎯',
    specialty: 'Busca em múltiplas fontes',
    greeting:
      'Okê Arô! Sou Oxóssi, o caçador certeiro. Rastreio fraudes e busco informações em múltiplas fontes com precisão. Qual é o alvo da busca?',
    suggestions: [
      'Rastrear origem de recursos',
      'Cruzar dados de múltiplas fontes',
      'Identificar conexões ocultas',
    ],
  },
}

/**
 * Maritaca AI mode configuration
 */
export const MARITACA_CONFIG = {
  'sabia-3': {
    name: 'Sabiá-3.1',
    role: 'Modelo Completo',
    color: '#6366F1',
    accentColor: '#818CF8',
    bgGradient: 'from-indigo-500 to-purple-500',
    icon: '🦜',
    specialty: 'Modelo avançado para tarefas complexas',
    greeting:
      'Olá! Sou o Sabiá-3.1, o modelo mais avançado da Maritaca AI. Fui treinado especificamente para entender português brasileiro com todas as suas nuances. Como posso ajudar?',
    suggestions: [
      'Conversar sobre qualquer tema',
      'Analisar textos complexos',
      'Ajudar com redação',
    ],
  },
  'sabiazinho-3': {
    name: 'Sabiazinho-3',
    role: 'Modelo Otimizado',
    color: '#10B981',
    accentColor: '#34D399',
    bgGradient: 'from-emerald-500 to-teal-500',
    icon: '🐦',
    specialty: 'Respostas rápidas e eficientes',
    greeting:
      'Oi! Sou o Sabiazinho-3, versão otimizada para respostas rápidas. Posso ajudar com tarefas do dia a dia de forma ágil. O que você precisa?',
    suggestions: ['Tirar dúvidas rápidas', 'Resumir informações', 'Responder perguntas diretas'],
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
