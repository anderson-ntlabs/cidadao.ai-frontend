/**
 * Mobile Agent Selector Sheet
 *
 * Full-screen bottom sheet for selecting agents on mobile.
 * Features touch-optimized scrolling and haptic feedback.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agents } from '@/data/agents'
import { touchFeedback, tapTarget } from '@/lib/mobile-touch'
import { useHaptic } from '@/hooks/use-haptic'

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
  chatMode?: 'cidadao' | 'maritaca'

  /** Maritaca model if in maritaca mode */
  maritacaModel?: string

  /** Additional CSS classes */
  className?: string
}

export function MobileAgentSelector({
  isOpen,
  onClose,
  selectedAgentId,
  onSelectAgent,
  chatMode = 'cidadao',
  maritacaModel,
  className,
}: MobileAgentSelectorProps) {
  const { vibrate } = useHaptic()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

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

  // Handle agent selection
  const handleSelect = (agentId: string) => {
    vibrate('light')
    onSelectAgent(agentId)
    onClose()
  }

  if (!isOpen && !isAnimating) return null

  // Effective agent ID (defaults to abaporu)
  const effectiveAgentId = selectedAgentId || 'abaporu'

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
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
        aria-label="Selecionar agente"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
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
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Selecionar Agente</h2>
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

        {/* Mode indicator */}
        {chatMode === 'maritaca' && (
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Modo Maritaca.AI ativo ({maritacaModel === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'})
            </p>
          </div>
        )}

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto overscroll-none p-4 space-y-2">
          {agents.map((agent) => {
            const isSelected = agent.id === effectiveAgentId

            return (
              <button
                key={agent.id}
                onClick={() => handleSelect(agent.id)}
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
          })}
        </div>

        {/* Safe area bottom padding */}
        <div className="h-8 flex-shrink-0" />
      </div>
    </>
  )
}
