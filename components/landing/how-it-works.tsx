/**
 * HowItWorks Component
 *
 * Visual step-by-step guide showing how the platform works.
 * Features animated steps with icons and descriptions.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-18
 */

'use client'

import { cn } from '@/lib/utils'
import { ArrowRight, LogIn, MessageSquare, Search } from 'lucide-react'

interface StepProps {
  number: string
  icon: React.ReactNode
  title: string
  description: string
  isLast?: boolean
}

function Step({ number, icon, title, description, isLast = false }: StepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector line - hidden on last step */}
      {!isLast && (
        <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-500 to-blue-500 -z-10">
          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 bg-white dark:bg-gray-900 rounded-full p-1" />
        </div>
      )}

      {/* Step number badge */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {number}
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Como Funciona
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Em 3 passos simples, você estará investigando gastos públicos como um profissional
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
          <Step
            number="1"
            icon={<LogIn className="w-6 h-6 text-green-600" />}
            title="Faça Login"
            description="Entre com Google ou GitHub. Sem cadastro complicado, sem cartão de crédito."
          />
          <Step
            number="2"
            icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
            title="Converse com IAs"
            description="Pergunte sobre gastos públicos em linguagem natural. Nossas IAs entendem português!"
          />
          <Step
            number="3"
            icon={<Search className="w-6 h-6 text-purple-600" />}
            title="Investigue"
            description="Veja anomalias detectadas, gere relatórios e compartilhe suas descobertas."
            isLast
          />
        </div>

        {/* CTA at bottom */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Pronto para começar a fiscalizar?</p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Começar Agora - É Grátis
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
