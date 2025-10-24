'use client'

import { useState } from 'react'
import { Calendar, Code, Rocket, Users, Award, Sparkles } from 'lucide-react'

interface TimelineEvent {
  date: string
  title: string
  description: string
  icon: any
  category: 'development' | 'milestone' | 'achievement'
  highlights?: string[]
}

const timelineEvents: TimelineEvent[] = [
  {
    date: '2024-09',
    title: 'Concepção do Projeto',
    description: 'Identificação do problema de acesso aos dados públicos brasileiros e definição da proposta de TCC.',
    icon: Sparkles,
    category: 'milestone',
    highlights: [
      'Escolha do tema: Transparência Pública + IA',
      'Aprovação da proposta pela banca',
      'Definição dos 17 agentes brasileiros'
    ]
  },
  {
    date: '2024-10',
    title: 'Arquitetura Multi-Agente',
    description: 'Desenvolvimento da arquitetura de sistema multi-agente com identidades culturais brasileiras.',
    icon: Users,
    category: 'development',
    highlights: [
      'Design dos 17 agentes com nomes de figuras históricas',
      'Abaporu como orquestrador principal',
      'Sistema de reflexão e qualidade (threshold 0.8)'
    ]
  },
  {
    date: '2024-11',
    title: 'Backend FastAPI',
    description: 'Implementação completa do backend com FastAPI, agents CrewAI e integração com Portal da Transparência.',
    icon: Code,
    category: 'development',
    highlights: [
      '8 de 17 agentes operacionais',
      'FastAPI com documentação temática brasileira',
      '80% de cobertura de testes'
    ]
  },
  {
    date: '2024-12',
    title: 'Frontend Next.js 15',
    description: 'Desenvolvimento do frontend moderno com Next.js 15, PWA e sistema de chat em tempo real.',
    icon: Code,
    category: 'development',
    highlights: [
      'Next.js 15 App Router + React Server Components',
      'Sistema de chat com SSE streaming',
      'PWA com Serwist para uso offline',
      'Acessibilidade WCAG AA + VLibras (LIBRAS)'
    ]
  },
  {
    date: '2025-01',
    title: 'Deploy em Produção',
    description: 'Sistema completo no ar com backend Railway e frontend Vercel.',
    icon: Rocket,
    category: 'milestone',
    highlights: [
      'Backend: Railway (HuggingFace Spaces backup)',
      'Frontend: Vercel com CI/CD',
      'Monitoramento: Grafana + Prometheus + Sentry',
      'Integração Portal da Transparência (22% endpoints)'
    ]
  },
  {
    date: '2025-01',
    title: 'Documentação Completa',
    description: 'Documentação técnica abrangente com 97 arquivos cobrindo toda a arquitetura.',
    icon: Award,
    category: 'achievement',
    highlights: [
      '11.400+ linhas de documentação técnica',
      'Guias de API, deployment, testes e segurança',
      'Documentação de 41 scripts de teste manual',
      'Sistema de geração automática de types'
    ]
  },
  {
    date: '2025-02',
    title: 'Defesa do TCC',
    description: 'Apresentação do trabalho para a banca examinadora do IFSULDEMINAS.',
    icon: Award,
    category: 'milestone',
    highlights: [
      'Apresentação da arquitetura multi-agente',
      'Demonstração do sistema em produção',
      'Resultados e impacto social'
    ]
  }
]

const categoryColors = {
  development: 'from-blue-500 to-blue-600',
  milestone: 'from-green-500 to-green-600',
  achievement: 'from-yellow-500 to-yellow-600'
}

const categoryLabels = {
  development: 'Desenvolvimento',
  milestone: 'Marco',
  achievement: 'Conquista'
}

export function ProjectTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)

  return (
    <div className="w-full py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Linha do Tempo do Projeto
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A jornada de desenvolvimento do Cidadão.AI, do conceito à realidade
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Linha vertical central */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-500 via-yellow-500 to-blue-500 opacity-30" />

        {/* Eventos */}
        <div className="space-y-12">
          {timelineEvents.map((event, index) => {
            const isLeft = index % 2 === 0
            const Icon = event.icon
            const isSelected = selectedEvent === index

            return (
              <div
                key={index}
                className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Conteúdo do evento */}
                <div className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <button
                    onClick={() => setSelectedEvent(isSelected ? null : index)}
                    className={`
                      w-full p-6 rounded-lg transition-all duration-300
                      ${isSelected
                        ? 'bg-white dark:bg-gray-800 shadow-xl scale-105'
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 shadow-md hover:shadow-lg'
                      }
                      border border-gray-200 dark:border-gray-700
                    `}
                  >
                    {/* Data */}
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {event.date}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                      {event.title}
                    </h3>

                    {/* Categoria */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categoryColors[event.category]} mb-3`}>
                      {categoryLabels[event.category]}
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {event.description}
                    </p>

                    {/* Highlights (expandido) */}
                    {isSelected && event.highlights && (
                      <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${isLeft ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Destaques:
                        </p>
                        <ul className={`space-y-1 text-sm text-gray-600 dark:text-gray-400 ${isLeft ? 'text-right' : 'text-left'}`}>
                          {event.highlights.map((highlight, i) => (
                            <li key={i} className={`flex items-start gap-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-green-500">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Indicador de clique */}
                    {!isSelected && event.highlights && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Clique para ver detalhes
                      </p>
                    )}
                  </button>
                </div>

                {/* Ícone central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    bg-gradient-to-br ${categoryColors[event.category]}
                    shadow-lg transition-transform duration-300
                    ${isSelected ? 'scale-125' : 'hover:scale-110'}
                  `}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Espaçador do outro lado */}
                <div className="w-5/12" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-6 mt-12 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${categoryColors.development}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">Desenvolvimento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${categoryColors.milestone}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">Marcos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${categoryColors.achievement}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">Conquistas</span>
        </div>
      </div>
    </div>
  )
}
