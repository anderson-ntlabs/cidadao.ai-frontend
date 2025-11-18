/**
 * Chat Empty State Component - Engaging first impression
 *
 * Modern empty state with contextual suggestions and welcoming design
 * Reduces cognitive load and guides users to take action
 *
 * @see https://www.nngroup.com/articles/empty-state-interface/
 * @author Anderson Henrique da Silva
 * @date 2025-11-18
 */

'use client'

import { useState } from 'react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Sparkles, MessageSquare, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatEmptyStateProps {
  userName?: string
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
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

export function ChatEmptyState({ userName, onSuggestionClick }: ChatEmptyStateProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Avatar with subtle animation */}
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse" />
        <OptimizedImage
          src="/agents/abaporu.png"
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
          {suggestions.map((suggestion, index) => {
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
