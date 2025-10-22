/**
 * Agent-specific color themes for chat bubbles
 * Each agent has a unique color scheme that reflects their personality and role
 */

export interface AgentColorTheme {
  from: string // Gradient start color
  to: string   // Gradient end color
  ring: string // Avatar ring color
  text: string // Text color (usually white for gradients)
}

export const agentColors: Record<string, AgentColorTheme> = {
  // Abaporu - Central Coordinator (Green/Blue - Primary brand colors)
  abaporu: {
    from: 'from-emerald-500',
    to: 'to-teal-600',
    ring: 'ring-emerald-400/50',
    text: 'text-white'
  },

  // Zumbi dos Palmares - Guardian of Transparency (Purple/Indigo - Dignity and strength)
  zumbi: {
    from: 'from-purple-500',
    to: 'to-indigo-600',
    ring: 'ring-purple-400/50',
    text: 'text-white'
  },

  // Anita Garibaldi - Anomaly Analyst (Red/Rose - Alert and precision)
  anita: {
    from: 'from-rose-500',
    to: 'to-pink-600',
    ring: 'ring-rose-400/50',
    text: 'text-white'
  },

  // Tiradentes - Report Generator (Blue/Cyan - Clarity and documentation)
  tiradentes: {
    from: 'from-blue-500',
    to: 'to-cyan-600',
    ring: 'ring-blue-400/50',
    text: 'text-white'
  },

  // Ayrton Senna - Performance Optimizer (Yellow/Orange - Speed and energy)
  senna: {
    from: 'from-amber-500',
    to: 'to-orange-600',
    ring: 'ring-amber-400/50',
    text: 'text-white'
  },

  // Nanã - Integration Manager (Violet/Purple - Wisdom and connection)
  nana: {
    from: 'from-violet-500',
    to: 'to-purple-600',
    ring: 'ring-violet-400/50',
    text: 'text-white'
  },

  // José Bonifácio - Constitutional Analyst (Navy/Blue - Authority and law)
  bonifacio: {
    from: 'from-blue-600',
    to: 'to-indigo-700',
    ring: 'ring-blue-500/50',
    text: 'text-white'
  },

  // Machado de Assis - Communication Specialist (Slate/Gray - Sophistication)
  machado: {
    from: 'from-slate-500',
    to: 'to-gray-600',
    ring: 'ring-slate-400/50',
    text: 'text-white'
  },

  // Carlos Drummond de Andrade - Validator (Teal/Emerald - Trust and verification)
  drummond: {
    from: 'from-teal-500',
    to: 'to-emerald-600',
    ring: 'ring-teal-400/50',
    text: 'text-white'
  },

  // Default fallback (matches Abaporu)
  default: {
    from: 'from-emerald-500',
    to: 'to-teal-600',
    ring: 'ring-emerald-400/50',
    text: 'text-white'
  }
}

/**
 * Get color theme for a specific agent
 */
export function getAgentColorTheme(agentId?: string): AgentColorTheme {
  if (!agentId) return agentColors.default
  return agentColors[agentId] || agentColors.default
}

/**
 * Build Tailwind gradient classes from theme
 */
export function buildGradientClasses(theme: AgentColorTheme): string {
  return `bg-gradient-to-r ${theme.from} ${theme.to} ${theme.text}`
}

/**
 * Get agent ring color class
 */
export function getAgentRingClass(agentId?: string): string {
  const theme = getAgentColorTheme(agentId)
  return `ring-2 ${theme.ring}`
}
