/**
 * Agent Selector Component
 *
 * Allows user to select which agent they want to chat with
 * in conversation mode. Includes "Auto" option for automatic
 * agent selection by the backend.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Bot, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agents } from '@/data/agents'
import Image from 'next/image'

export interface AgentOption {
  id: string | null
  name: string
  role: string
  image?: string
}

interface AgentSelectorProps {
  selectedAgentId: string | null
  onSelectAgent: (agentId: string | null) => void
  disabled?: boolean
  className?: string
}

// Auto option for automatic agent selection
const AUTO_OPTION: AgentOption = {
  id: null,
  name: 'Automático',
  role: 'O sistema escolhe o melhor agente',
  image: undefined,
}

export function AgentSelector({
  selectedAgentId,
  onSelectAgent,
  disabled = false,
  className,
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get current selected agent
  const selectedAgent = selectedAgentId ? agents.find((a) => a.id === selectedAgentId) : null

  const displayName = selectedAgent?.name || AUTO_OPTION.name
  const displayRole = selectedAgent?.role.pt || AUTO_OPTION.role

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-green-500/50'
        )}
      >
        {/* Agent Avatar or Icon */}
        {selectedAgent ? (
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Image
              src={selectedAgent.image}
              alt={selectedAgent.name}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
        ) : (
          <Sparkles className="w-5 h-5 text-green-500" />
        )}

        {/* Agent Name */}
        <div className="text-left">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn('w-4 h-4 text-gray-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border shadow-xl z-50',
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Auto Option */}
          <button
            onClick={() => {
              onSelectAgent(null)
              setIsOpen(false)
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              selectedAgentId === null && 'bg-green-50 dark:bg-green-900/20'
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {AUTO_OPTION.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {AUTO_OPTION.role}
              </p>
            </div>
            {selectedAgentId === null && <div className="w-2 h-2 rounded-full bg-green-500" />}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* Agent List */}
          <div className="py-1">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Agentes Disponíveis
            </p>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  selectedAgentId === agent.id && 'bg-green-50 dark:bg-green-900/20'
                )}
              >
                {/* Agent Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {agent.role.pt}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedAgentId === agent.id && (
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
