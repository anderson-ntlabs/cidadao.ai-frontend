import { Agent, InternTrack } from '@/types/agent'

export const agents: Agent[] = [
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: {
      pt: 'Coordenador Central',
      en: 'Central Coordinator',
    },
    description: {
      pt: 'Inspirado na obra de Tarsila do Amaral, Abaporu é o coordenador central que supervisiona e orquestra todas as operações do sistema.',
      en: "Inspired by Tarsila do Amaral's artwork, Abaporu is the central coordinator who oversees and orchestrates all system operations.",
    },
    image: '/agents/abaporu.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Abaporu',
  },
  {
    id: 'anita',
    name: 'Anita Garibaldi',
    role: {
      pt: 'Analista de Anomalias',
      en: 'Anomaly Analyst',
    },
    description: {
      pt: 'Guerreira e estrategista, detecta padrões suspeitos e anomalias nos dados públicos com precisão militar.',
      en: 'Warrior and strategist, detects suspicious patterns and anomalies in public data with military precision.',
    },
    image: '/agents/anita.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Anita_Garibaldi',
  },
  {
    id: 'senna',
    name: 'Ayrton Senna',
    role: {
      pt: 'Otimizador de Performance',
      en: 'Performance Optimizer',
    },
    description: {
      pt: 'Veloz e preciso, otimiza consultas e melhora a performance do sistema em tempo real.',
      en: 'Fast and precise, optimizes queries and improves system performance in real-time.',
    },
    image: '/agents/senna.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Ayrton_Senna',
  },
  {
    id: 'zumbi',
    name: 'Zumbi dos Palmares',
    role: {
      pt: 'Guardião da Transparência',
      en: 'Transparency Guardian',
    },
    description: {
      pt: 'Líder quilombola que luta pela transparência, protege o acesso democrático aos dados públicos e combate a opacidade governamental.',
      en: 'Quilombola leader who fights for transparency, protects democratic access to public data and combats governmental opacity.',
    },
    image: '/agents/zumbi.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Zumbi_dos_Palmares',
  },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: {
      pt: 'Repórter de Irregularidades',
      en: 'Irregularities Reporter',
    },
    description: {
      pt: 'Mártir da independência, identifica e reporta irregularidades em contratos e licitações públicas.',
      en: 'Independence martyr, identifies and reports irregularities in public contracts and bids.',
    },
    image: '/agents/tiradentes.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Tiradentes',
  },
  {
    id: 'obaluaie',
    name: 'Obaluaiê',
    role: {
      pt: 'Curandeiro de Dados',
      en: 'Data Healer',
    },
    description: {
      pt: 'Orixá da cura, limpa e corrige inconsistências nos dados, garantindo sua integridade.',
      en: 'Orisha of healing, cleanses and corrects data inconsistencies, ensuring data integrity.',
    },
    image: '/agents/obaluaie.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Obaluai%C3%AA',
  },
  {
    id: 'niemeyer',
    name: 'Oscar Niemeyer',
    role: {
      pt: 'Arquiteto de Informações',
      en: 'Information Architect',
    },
    description: {
      pt: 'Mestre das curvas, projeta estruturas de dados elegantes e interfaces intuitivas.',
      en: 'Master of curves, designs elegant data structures and intuitive interfaces.',
    },
    image: '/agents/niemeyer.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Oscar_Niemeyer',
  },
  {
    id: 'nana',
    name: 'Nanã Buruku',
    role: {
      pt: 'Guardiã da Memória',
      en: 'Memory Guardian',
    },
    description: {
      pt: 'Orixá anciã, preserva registros históricos e mantém a memória institucional.',
      en: 'Elder Orisha, preserves historical records and maintains institutional memory.',
    },
    image: '/agents/nana.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Nan%C3%A3_Buruqu%C3%AA',
  },
  {
    id: 'lampiao',
    name: 'Lampião',
    role: {
      pt: 'Auditor do Sertão',
      en: 'Backlands Auditor',
    },
    description: {
      pt: 'Rei do cangaço, audita gastos públicos em regiões remotas e esquecidas.',
      en: 'King of cangaço, audits public spending in remote and forgotten regions.',
    },
    image: '/agents/lampiao.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Lampi%C3%A3o_(cangaceiro)',
  },
  {
    id: 'ceuci',
    name: 'Ceuci',
    role: {
      pt: 'Protetora dos Recursos',
      en: 'Resources Protector',
    },
    description: {
      pt: 'Deusa tupi-guarani, protege recursos naturais e monitora concessões ambientais.',
      en: 'Tupi-Guarani goddess, protects natural resources and monitors environmental concessions.',
    },
    image: '/agents/ceuci.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Mitologia_tupi-guarani',
  },
  {
    id: 'dandara',
    name: 'Dandara',
    role: {
      pt: 'Estrategista de Defesa',
      en: 'Defense Strategist',
    },
    description: {
      pt: 'Guerreira de Palmares, desenvolve estratégias para proteger dados sensíveis.',
      en: 'Palmares warrior, develops strategies to protect sensitive data.',
    },
    image: '/agents/dandara.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Dandara',
  },
  {
    id: 'machado',
    name: 'Machado de Assis',
    role: {
      pt: 'Cronista de Relatórios',
      en: 'Reports Chronicler',
    },
    description: {
      pt: 'Mestre da literatura, transforma dados complexos em narrativas compreensíveis.',
      en: 'Master of literature, transforms complex data into understandable narratives.',
    },
    image: '/agents/machado.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Machado_de_Assis',
  },
  {
    id: 'bonifacio',
    name: 'José Bonifácio',
    role: {
      pt: 'Patriarca da Integridade',
      en: 'Integrity Patriarch',
    },
    description: {
      pt: 'Patriarca da independência, estabelece padrões éticos e de integridade.',
      en: 'Independence patriarch, establishes ethical and integrity standards.',
    },
    image: '/agents/bonifacio.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Jos%C3%A9_Bonif%C3%A1cio_de_Andrada_e_Silva',
  },
  {
    id: 'deodoro',
    name: 'Marechal Deodoro',
    role: {
      pt: 'Executor de Comandos',
      en: 'Command Executor',
    },
    description: {
      pt: 'Proclamador da República, executa ações corretivas com autoridade.',
      en: 'Republic proclaimer, executes corrective actions with authority.',
    },
    image: '/agents/deodoro.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Deodoro_da_Fonseca',
  },
  {
    id: 'drummond',
    name: 'Carlos Drummond',
    role: {
      pt: 'Poeta dos Dados',
      en: 'Data Poet',
    },
    description: {
      pt: 'Poeta maior, encontra beleza e significado em meio aos números.',
      en: 'Greatest poet, finds beauty and meaning amidst the numbers.',
    },
    image: '/agents/drummond.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Carlos_Drummond_de_Andrade',
  },
  {
    id: 'quiteria',
    name: 'Maria Quitéria',
    role: {
      pt: 'Soldado da Verdade',
      en: 'Truth Soldier',
    },
    description: {
      pt: 'Primeira mulher soldado do Brasil, combate a desinformação com coragem.',
      en: "Brazil's first female soldier, combats misinformation with courage.",
    },
    image: '/agents/quiteria.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Maria_Quit%C3%A9ria',
  },
  {
    id: 'oxossi',
    name: 'Oxóssi',
    role: {
      pt: 'Caçador de Fraudes',
      en: 'Fraud Hunter',
    },
    description: {
      pt: 'Orixá caçador, rastreia e identifica fraudes com precisão certeira.',
      en: 'Hunter Orisha, tracks and identifies fraud with unerring precision.',
    },
    image: '/agents/oxossi.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Ox%C3%B3ssi',
  },
  {
    id: 'bobardi',
    name: 'Lina Bo Bardi',
    role: {
      pt: 'Mentora de UI/UX',
      en: 'UI/UX Mentor',
    },
    description: {
      pt: 'Arquiteta modernista criadora do MASP, ensina design funcional, acessibilidade e a beleza das formas simples. Especialista em interfaces que unem estética e propósito.',
      en: 'Modernist architect creator of MASP, teaches functional design, accessibility and the beauty of simple forms. Specialist in interfaces that unite aesthetics and purpose.',
    },
    image: '/agents/Lina_Bo_Bardi.jpg',
    wikipedia: 'https://pt.wikipedia.org/wiki/Lina_Bo_Bardi',
    tracks: ['ui-ux', 'frontend', 'design'],
  },
  {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    role: {
      pt: 'Mentor de Engenharia',
      en: 'Engineering Mentor',
    },
    description: {
      pt: 'Pai da aviação, ensina inovação, arquitetura de software e engenharia criativa. Inspira estudantes a sonhar grande e construir soluções elegantes para problemas complexos.',
      en: 'Father of aviation, teaches innovation, software architecture and creative engineering. Inspires students to dream big and build elegant solutions to complex problems.',
    },
    image: '/agents/santos-dumont.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Santos_Dumont',
    tracks: ['backend', 'devops', 'data'],
  },
  // Kids Mode Agents
  {
    id: 'monteiro-lobato',
    name: 'Monteiro Lobato',
    role: {
      pt: 'Contador de Histórias',
      en: 'Storyteller',
    },
    description: {
      pt: 'Criador do Sítio do Picapau Amarelo! Vou te contar histórias incríveis enquanto você aprende a programar. Junto com a Emília e o Visconde, vamos descobrir o mundo mágico do código!',
      en: 'Creator of Sítio do Picapau Amarelo! I will tell you amazing stories while you learn to code. Together with Emília and Visconde, we will discover the magical world of code!',
    },
    image: '/agents/monteiro_lobato.jpg',
    wikipedia: 'https://pt.wikipedia.org/wiki/Monteiro_Lobato',
    isKidsAgent: true,
  },
  {
    id: 'tarsila-amaral',
    name: 'Tarsila do Amaral',
    role: {
      pt: 'Artista Criativa',
      en: 'Creative Artist',
    },
    description: {
      pt: 'Pintora do Abaporu e da Negra! Vou te ensinar a criar coisas lindas com cores, formas e muita imaginação. Programar é como pintar: você cria algo novo do zero!',
      en: 'Painter of Abaporu and A Negra! I will teach you to create beautiful things with colors, shapes and lots of imagination. Coding is like painting: you create something new from scratch!',
    },
    image: '/agents/tarsila_a_musa.png',
    wikipedia: 'https://pt.wikipedia.org/wiki/Tarsila_do_Amaral',
    isKidsAgent: true,
  },
]

/**
 * Educational agent IDs for Agora Academy
 * These mentors focus on teaching and guiding students
 */
export const EDUCATIONAL_AGENT_IDS = ['santos-dumont', 'bobardi'] as const
export type EducationalAgentId = (typeof EDUCATIONAL_AGENT_IDS)[number]

/**
 * Kids agent IDs for Agora Kids Mode
 * These mentors are designed specifically for children
 */
export const KIDS_AGENT_IDS = ['monteiro-lobato', 'tarsila-amaral'] as const
export type KidsAgentId = (typeof KIDS_AGENT_IDS)[number]

/**
 * Get all educational agents for Agora Academy
 * Returns only mentors designed for teaching purposes
 */
export function getEducationalAgents(): Agent[] {
  return agents.filter((agent) => EDUCATIONAL_AGENT_IDS.includes(agent.id as EducationalAgentId))
}

/**
 * Check if an agent is an educational mentor
 */
export function isEducationalAgent(agentId: string): boolean {
  return EDUCATIONAL_AGENT_IDS.includes(agentId as EducationalAgentId)
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id)
}

export function getAgentsByRole(role: string, lang: 'pt' | 'en' = 'pt'): Agent[] {
  return agents.filter((agent) => agent.role[lang].toLowerCase().includes(role.toLowerCase()))
}

/**
 * Get agents available for a specific intern track
 * Returns agents without track restrictions + agents with matching track
 */
export function getAgentsByTrack(track: InternTrack): Agent[] {
  return agents.filter((agent) => !agent.tracks || agent.tracks.includes(track))
}

/**
 * Get agents available for multiple intern tracks
 * Returns agents without track restrictions + agents matching ANY of the provided tracks
 * Useful when a user has selected multiple tracks
 */
export function getAgentsByTracks(userTracks: InternTrack[]): Agent[] {
  if (!userTracks.length) return agents.filter((agent) => !agent.tracks)
  return agents.filter((agent) => !agent.tracks || agent.tracks.some((t) => userTracks.includes(t)))
}

/**
 * Get agents that are exclusive to specific tracks (not available to all)
 */
export function getTrackExclusiveAgents(): Agent[] {
  return agents.filter((agent) => agent.tracks && agent.tracks.length > 0)
}

/**
 * Get all Kids mode agents
 * Returns only mentors designed for children
 */
export function getKidsAgents(): Agent[] {
  return agents.filter((agent) => agent.isKidsAgent === true)
}

/**
 * Check if an agent is a Kids mode mentor
 */
export function isKidsAgent(agentId: string): boolean {
  return KIDS_AGENT_IDS.includes(agentId as KidsAgentId)
}

/**
 * Get a Kids agent by ID
 */
export function getKidsAgentById(id: KidsAgentId): Agent | undefined {
  return agents.find((agent) => agent.id === id && agent.isKidsAgent)
}
