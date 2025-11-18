/**
 * SocialProofBar Component
 *
 * Displays key statistics and social proof metrics.
 * Eye-catching numbers that build trust and credibility.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-18
 */

'use client'

import { cn } from '@/lib/utils'

interface StatProps {
  icon: string
  number: string
  label: string
  sublabel?: string
  gradient?: string
}

function Stat({
  icon,
  number,
  label,
  sublabel,
  gradient = 'from-green-500 to-blue-600',
}: StatProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
      {/* Icon */}
      <div className="text-4xl mb-3" role="img" aria-label={label}>
        {icon}
      </div>

      {/* Number */}
      <div
        className={cn(
          'text-3xl sm:text-4xl font-bold mb-2',
          'bg-gradient-to-r bg-clip-text text-transparent',
          gradient
        )}
      >
        {number}
      </div>

      {/* Label */}
      <div className="text-gray-900 dark:text-gray-100 font-semibold text-sm sm:text-base mb-1">
        {label}
      </div>

      {/* Sublabel */}
      {sublabel && <div className="text-gray-600 dark:text-gray-400 text-xs">{sublabel}</div>}
    </div>
  )
}

export function SocialProofBar() {
  return (
    <section className="py-12 bg-gradient-to-r from-green-50/80 via-blue-50/50 to-green-50/80 dark:from-green-900/10 dark:via-blue-900/10 dark:to-green-900/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Stat
            icon="🤖"
            number="17"
            label="Agentes de IA"
            sublabel="Trabalhando 24/7"
            gradient="from-green-600 to-emerald-600"
          />
          <Stat
            icon="⚡"
            number="100%"
            label="Open Source"
            sublabel="Código aberto"
            gradient="from-blue-600 to-cyan-600"
          />
          <Stat
            icon="♿"
            number="WCAG AAA"
            label="Acessibilidade"
            sublabel="Inclusivo"
            gradient="from-purple-600 to-pink-600"
          />
        </div>
      </div>
    </section>
  )
}
