/**
 * Smart Suggestions Component
 *
 * Context-aware suggestions that change based on conversation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { FileSearch, TrendingUp, AlertTriangle, Users, BarChart3, Lightbulb, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Suggestion {
  text: string
  icon?: React.ReactNode
  category?: 'investigation' | 'analysis' | 'anomaly' | 'report' | 'help'
}

export interface SmartSuggestionsProps {
  suggestions: Suggestion[]
  onSelect: (text: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'pills'
}

const categoryIcons = {
  investigation: FileSearch,
  analysis: BarChart3,
  anomaly: AlertTriangle,
  report: TrendingUp,
  help: Lightbulb
}

const categoryColors = {
  investigation: 'from-blue-500 to-cyan-500 text-white',
  analysis: 'from-purple-500 to-pink-500 text-white',
  anomaly: 'from-red-500 to-orange-500 text-white',
  report: 'from-green-500 to-emerald-500 text-white',
  help: 'from-yellow-500 to-amber-500 text-white'
}

export function SmartSuggestions({
  suggestions,
  onSelect,
  className,
  variant = 'default'
}: SmartSuggestionsProps) {
  if (suggestions.length === 0) return null

  if (variant === 'pills') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.category ? categoryIcons[suggestion.category] : Sparkles

          return (
            <button
              key={index}
              onClick={() => onSelect(suggestion.text)}
              className={cn(
                "group flex items-center gap-2 px-4 py-2 rounded-full",
                "border border-gray-200 dark:border-gray-700",
                "hover:border-green-500 dark:hover:border-green-500",
                "bg-white dark:bg-gray-800",
                "hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50",
                "dark:hover:from-green-900/20 dark:hover:to-blue-900/20",
                "transition-all duration-200",
                "hover:scale-105 hover:shadow-md"
              )}
            >
              <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {suggestion.text}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs",
              "bg-gray-100 dark:bg-gray-800",
              "hover:bg-green-100 dark:hover:bg-green-900/30",
              "text-gray-700 dark:text-gray-300",
              "hover:text-green-700 dark:hover:text-green-300",
              "transition-all duration-200",
              "border border-transparent hover:border-green-500/30"
            )}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    )
  }

  // Default variant - card style
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.category ? categoryIcons[suggestion.category] : Sparkles
        const colors = suggestion.category ? categoryColors[suggestion.category] : 'from-gray-500 to-gray-600 text-white'

        return (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              "group relative overflow-hidden",
              "p-4 rounded-xl border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800",
              "hover:border-transparent",
              "transition-all duration-300",
              "hover:scale-105 hover:shadow-lg",
              "text-left"
            )}
          >
            {/* Gradient overlay on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
              colors
            )} />

            <div className="relative flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br transition-all",
                "group-hover:scale-110",
                colors
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  "text-gray-700 dark:text-gray-300",
                  "group-hover:text-gray-900 dark:group-hover:text-white"
                )}>
                  {suggestion.text}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Get contextual suggestions based on conversation state
 */
export function getContextualSuggestions(
  messageCount: number,
  lastMessageContent?: string,
  hasInvestigation?: boolean
): Suggestion[] {
  // First message - general suggestions
  if (messageCount === 0) {
    return [
      {
        text: 'Investigar contratos suspeitos em SP',
        category: 'investigation',
      },
      {
        text: 'Analisar anomalias em licitações federais',
        category: 'anomaly',
      },
      {
        text: 'Gerar relatório de gastos públicos 2024',
        category: 'report',
      },
      {
        text: 'Como funciona a análise de transparência?',
        category: 'help',
      },
    ]
  }

  // After investigation started
  if (hasInvestigation) {
    return [
      {
        text: 'Aprofundar análise de padrões',
        category: 'analysis',
      },
      {
        text: 'Verificar histórico do fornecedor',
        category: 'investigation',
      },
      {
        text: 'Comparar com casos similares',
        category: 'analysis',
      },
      {
        text: 'Gerar relatório detalhado',
        category: 'report',
      },
    ]
  }

  // General follow-up suggestions
  return [
    {
      text: 'Explicar melhor',
      category: 'help',
    },
    {
      text: 'Ver exemplos práticos',
      category: 'analysis',
    },
    {
      text: 'Iniciar nova investigação',
      category: 'investigation',
    },
    {
      text: 'Exportar conversa',
      category: 'report',
    },
  ]
}
