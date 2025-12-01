/**
 * Mobile Agent Selector Sheet
 *
 * Full-screen bottom sheet with tabs for selecting between:
 * - Cidadão.AI mode (17 Brazilian AI agents)
 * - Maritaca.AI mode (Sabiá-3.1 and Sabiazinho-3 models)
 *
 * Features touch-optimized scrolling and haptic feedback.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Check, Zap, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agents } from '@/data/agents'
import { touchFeedback, tapTarget } from '@/lib/mobile-touch'
import { useHaptic } from '@/hooks/use-haptic'
import type { MaritacaModel } from '@/lib/chat'

export type ChatMode = 'cidadao' | 'maritaca'

export interface MobileAgentSelectorProps {
  /** Whether the selector is open */
  isOpen: boolean

  /** Close handler */
  onClose: () => void

  /** Currently selected agent ID */
  selectedAgentId: string | null

  /** Selection handler */
  onSelectAgent: (agentId: string) => void

  /** Current chat mode */
  chatMode?: ChatMode

  /** Maritaca model if in maritaca mode */
  maritacaModel?: MaritacaModel

  /** Mode change handler */
  onModeChange?: (mode: ChatMode) => void

  /** Maritaca model change handler */
  onMaritacaModelChange?: (model: MaritacaModel) => void

  /** Additional CSS classes */
  className?: string
}

// Maritaca models configuration
const MARITACA_MODELS = [
  {
    id: 'sabiazinho-3' as MaritacaModel,
    name: 'Sabiazinho-3',
    description: 'Modelo otimizado para velocidade e eficiência',
    image: '/sabiazinho.png',
    icon: '🐦',
    badge: 'Rápido',
    badgeColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    IconComponent: Zap,
    iconColor: 'text-yellow-500',
  },
  {
    id: 'sabia-3' as MaritacaModel,
    name: 'Sabiá-3.1',
    description: 'Modelo completo com máxima qualidade',
    image: '/sabia3.1.png',
    icon: '🦜',
    badge: 'Avançado',
    badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    IconComponent: Brain,
    iconColor: 'text-purple-500',
  },
]

export function MobileAgentSelector({
  isOpen,
  onClose,
  selectedAgentId,
  onSelectAgent,
  chatMode = 'cidadao',
  maritacaModel = 'sabia-3',
  onModeChange,
  onMaritacaModelChange,
  className,
}: MobileAgentSelectorProps) {
  const { vibrate } = useHaptic()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<ChatMode>(chatMode)

  // Sync activeTab with chatMode prop
  useEffect(() => {
    setActiveTab(chatMode)
  }, [chatMode])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Animate on open/close
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable body scroll
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle agent selection (Cidadão.AI mode)
  const handleSelectAgent = (agentId: string) => {
    vibrate('light')
    if (activeTab !== 'cidadao') {
      onModeChange?.('cidadao')
    }
    onSelectAgent(agentId)
    onClose()
  }

  // Handle Maritaca model selection
  const handleSelectMaritacaModel = (model: MaritacaModel) => {
    vibrate('light')
    if (activeTab !== 'maritaca') {
      onModeChange?.('maritaca')
    }
    onMaritacaModelChange?.(model)
    onClose()
  }

  // Handle tab change
  const handleTabChange = (tab: ChatMode) => {
    vibrate('light')
    setActiveTab(tab)
  }

  if (!isOpen && !isAnimating) return null

  // Effective agent ID (defaults to abaporu)
  const effectiveAgentId = selectedAgentId || 'abaporu'

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar modo e agente"
        className={cn(
          'fixed inset-x-0 bottom-0 z-[100]',
          'bg-white dark:bg-gray-900',
          'rounded-t-3xl shadow-2xl',
          'max-h-[85vh] flex flex-col',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        onTransitionEnd={() => {
          if (!isOpen) setIsAnimating(false)
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Escolher Assistente</h2>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-full',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors',
              touchFeedback.icon
            )}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-4 pb-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {/* Cidadão.AI Tab */}
            <button
              onClick={() => handleTabChange('cidadao')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg',
                'font-medium text-sm transition-all duration-200',
                touchFeedback.button,
                activeTab === 'cidadao'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <span className="text-lg">🏛️</span>
              <span>Cidadão.AI</span>
            </button>

            {/* Maritaca.AI Tab */}
            <button
              onClick={() => handleTabChange('maritaca')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg',
                'font-medium text-sm transition-all duration-200',
                touchFeedback.button,
                activeTab === 'maritaca'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <span className="text-lg">🦜</span>
              <span>Maritaca.AI</span>
            </button>
          </div>
        </div>

        {/* Tab Description */}
        <div className="px-4 pb-3">
          {activeTab === 'cidadao' ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🏛️ Sistema multi-agente com 17 especialistas brasileiros para transparência pública
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🦜 Acesso direto aos modelos Maritaca.AI otimizados para português brasileiro
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-none p-4 space-y-2">
          {activeTab === 'cidadao' ? (
            /* Cidadão.AI Agents List */
            agents.map((agent) => {
              const isSelected = agent.id === effectiveAgentId && chatMode === 'cidadao'

              return (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl',
                    'transition-all duration-150',
                    touchFeedback.button,
                    tapTarget.medium,
                    isSelected
                      ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {/* Agent Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-gray-900">
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {agent.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {agent.role.pt}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              )
            })
          ) : (
            /* Maritaca.AI Models List */
            <>
              {MARITACA_MODELS.map((model) => {
                const isSelected = model.id === maritacaModel && chatMode === 'maritaca'
                const IconComponent = model.IconComponent

                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelectMaritacaModel(model.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl',
                      'transition-all duration-150',
                      touchFeedback.button,
                      tapTarget.medium,
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {/* Model Avatar */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-gray-900">
                      <Image
                        src={model.image}
                        alt={model.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>

                    {/* Model Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{model.name}</p>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            model.badgeColor
                          )}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <IconComponent className={cn('w-3 h-3', model.iconColor)} />
                        <span className="text-xs text-gray-400">
                          {model.id === 'sabiazinho-3' ? 'Velocidade: Alta' : 'Qualidade: Máxima'}
                        </span>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}

              {/* Info box */}
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Uso gratuito para testes - Modelos otimizados para português brasileiro
                </p>
              </div>
            </>
          )}
        </div>

        {/* Safe area bottom padding */}
        <div className="h-8 flex-shrink-0" />
      </div>
    </>
  )
}
