/**
 * Chat Empty State Component - Personalized agent greeting
 *
 * Shows personalized welcome when an agent is selected
 * Adapts to Maritaca mode with model-specific greeting
 *
 * @see https://www.nngroup.com/articles/empty-state-interface/
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

'use client'

import { useState } from 'react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Sparkles, MessageSquare, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agents } from '@/data/agents'
import { getAgentVisualConfig, MARITACA_CONFIG } from '@/data/agent-config'
import type { MaritacaModel } from '@/lib/chat'

interface ChatEmptyStateProps {
  userName?: string
  onSuggestionClick: (suggestion: string) => void
  /** Selected agent ID (null = automatic) */
  selectedAgentId?: string | null
  /** Chat mode */
  chatMode?: 'cidadao' | 'maritaca'
  /** Selected Maritaca model */
  maritacaModel?: MaritacaModel
}

// Default suggestions for automatic mode
const defaultSuggestions = [
  {
    icon: TrendingUp,
    text: 'Analisar gastos públicos de 2024',
    description: 'Tendências e anomalias',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Shield,
    text: 'Investigar contratos suspeitos',
    description: 'Detecção de irregularidades',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    text: 'Quais os órgãos com maior orçamento?',
    description: 'Ranking e comparações',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: Sparkles,
    text: 'Resumir despesas do Ministério da Educação',
    description: 'Análise detalhada',
    gradient: 'from-yellow-500 to-orange-600',
  },
]

export function ChatEmptyState({
  userName,
  onSuggestionClick,
  selectedAgentId,
  chatMode = 'cidadao',
  maritacaModel = 'sabia-4',
}: ChatEmptyStateProps): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Get the appropriate config based on mode
  const isMaritacaMode = chatMode === 'maritaca'
  const maritacaConfig = MARITACA_CONFIG[maritacaModel] || MARITACA_CONFIG['sabia-4']

  // Get agent config (for Cidadão.AI mode)
  const selectedAgent = selectedAgentId ? agents.find((a) => a.id === selectedAgentId) : null
  const agentConfig = getAgentVisualConfig(selectedAgentId)

  // Determine what to show
  const showPersonalized = isMaritacaMode || selectedAgentId

  // Get display info - use Maritaca logo for Maritaca mode
  const displayImage = isMaritacaMode
    ? '/logos/maritaca.png'
    : selectedAgent?.image || '/agents/abaporu.webp'

  const displayName = isMaritacaMode ? maritacaConfig.name : selectedAgent?.name || 'Abaporu'

  const displayRole = isMaritacaMode
    ? maritacaConfig.role
    : selectedAgent?.role.pt || 'Orquestrador Master'

  const displayIcon = isMaritacaMode ? maritacaConfig.icon : agentConfig.icon

  const displayGreeting = isMaritacaMode ? maritacaConfig.greeting : agentConfig.greeting

  const displayColor = isMaritacaMode ? maritacaConfig.color : agentConfig.color

  const displayAccent = isMaritacaMode ? maritacaConfig.accentColor : agentConfig.accentColor

  const displayGradient = isMaritacaMode ? maritacaConfig.bgGradient : agentConfig.bgGradient

  const displaySuggestions = isMaritacaMode
    ? maritacaConfig.suggestions
    : selectedAgentId
      ? agentConfig.suggestions
      : defaultSuggestions.map((s) => s.text)

  // For personalized view
  if (showPersonalized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] md:min-h-[60vh] px-4 py-6 text-center">
        {/* Avatar with agent-themed glow - smaller on mobile */}
        <div className="mb-4 md:mb-6 relative">
          <div
            className={cn('absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse')}
            style={{ backgroundColor: displayAccent }}
          />
          <OptimizedImage
            src={displayImage}
            alt={displayName}
            width={120}
            height={120}
            className="relative mx-auto w-20 h-20 md:w-[120px] md:h-[120px] rounded-full shadow-2xl object-cover ring-4 ring-white/40 dark:ring-gray-700/40 animate-bounce-in"
            priority
          />
          <div
            className="absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg text-sm md:text-lg"
            style={{ backgroundColor: displayColor }}
          >
            {displayIcon}
          </div>
        </div>

        {/* Agent Name and Role - more compact on mobile */}
        <div className="mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1"
            style={{ color: displayColor }}
          >
            {displayIcon} {displayName}
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">{displayRole}</p>
        </div>

        {/* Personalized Greeting - hidden on small mobile, shorter on medium */}
        <div className="max-w-2xl mb-4 md:mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 hidden sm:block">
          <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 md:line-clamp-none">
            {displayGreeting}
          </p>
        </div>

        {/* Agent-specific Suggestions */}
        <div className="w-full max-w-2xl">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
            💡 O que posso fazer por você
          </h3>

          <div className="flex flex-col gap-3">
            {displaySuggestions.map((suggestion, index) => {
              const isHovered = hoveredIndex === index
              const delay = 300 + index * 100

              return (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    'group relative p-4 text-left',
                    'bg-white dark:bg-gray-800/50 backdrop-blur-sm',
                    'border-2 border-gray-200 dark:border-gray-700',
                    'rounded-xl',
                    'hover:shadow-xl transition-all duration-300',
                    'hover:-translate-y-0.5',
                    'active:scale-[0.99]',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'animate-in fade-in slide-in-from-bottom-3'
                  )}
                  style={{
                    animationDelay: `${delay}ms`,
                    animationDuration: '500ms',
                    borderColor: isHovered ? displayAccent : undefined,
                    // @ts-ignore - CSS custom property
                    '--tw-ring-color': displayAccent,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-lg',
                        'flex items-center justify-center text-white text-lg',
                        'transform transition-transform duration-300',
                        isHovered && 'scale-110'
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${displayColor}, ${displayAccent})`,
                      }}
                    >
                      {displayIcon}
                    </div>

                    <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                      {suggestion}
                    </span>

                    <svg
                      className={cn(
                        'w-5 h-5 text-gray-400 transition-all duration-300',
                        isHovered && 'translate-x-1'
                      )}
                      style={{ color: isHovered ? displayAccent : undefined }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tip - hidden on very small screens */}
        <p className="mt-4 md:mt-8 text-xs text-gray-400 dark:text-gray-600 animate-in fade-in duration-500 delay-700 hidden sm:block">
          💬 Digite sua pergunta abaixo para começar a conversa
        </p>
      </div>
    )
  }

  // Default view (Cidadão.AI automatic mode)
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] md:min-h-[60vh] px-4 py-6 text-center">
      {/* Avatar with subtle animation */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse" />
        <OptimizedImage
          src="/agents/abaporu.webp"
          alt="Abaporu"
          width={96}
          height={96}
          className="relative mx-auto rounded-full shadow-2xl object-cover ring-4 ring-green-500/20 animate-bounce-in"
          priority
        />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Greeting */}
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
        Olá{userName && `, ${userName.split(' ')[0]}`}! 👋
      </h2>

      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
        Sou o <span className="font-semibold text-green-600 dark:text-green-400">Abaporu</span>, seu
        assistente de transparência pública
      </p>

      <p className="text-base text-gray-500 dark:text-gray-500 mb-12 max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200">
        Pergunte sobre gastos públicos, contratos, licitações ou anomalias fiscais.
        <br />
        <span className="text-sm">Posso analisar dados de todo o Brasil 🇧🇷</span>
      </p>

      {/* Suggestion Cards */}
      <div className="w-full max-w-4xl">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
          💡 Sugestões para começar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {defaultSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon
            const isHovered = hoveredIndex === index
            const delay = 400 + index * 100

            return (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.text)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'group relative p-4 sm:p-5 text-left',
                  'bg-white dark:bg-gray-800/50 backdrop-blur-sm',
                  'border-2 border-gray-200 dark:border-gray-700',
                  'rounded-xl sm:rounded-2xl',
                  'hover:border-green-500 dark:hover:border-green-400',
                  'hover:shadow-xl hover:shadow-green-500/10',
                  'transition-all duration-300',
                  'hover:-translate-y-1',
                  'active:scale-[0.98]',
                  'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                  'min-h-[110px]',
                  'animate-in fade-in slide-in-from-bottom-3'
                )}
                style={{
                  animationDelay: `${delay}ms`,
                  animationDuration: '500ms',
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                    'bg-gradient-to-br',
                    suggestion.gradient
                  )}
                />

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl',
                      'flex items-center justify-center',
                      'bg-gradient-to-br',
                      suggestion.gradient,
                      'transform transition-transform duration-300',
                      isHovered && 'scale-110 rotate-3'
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base leading-tight">
                      {suggestion.text}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                      {suggestion.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={cn(
                      'flex-shrink-0 transform transition-transform duration-300',
                      isHovered && 'translate-x-1'
                    )}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Subtle tip */}
      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600 animate-in fade-in duration-500 delay-1000">
        💬 Você também pode digitar sua própria pergunta abaixo
      </p>
    </div>
  )
}
