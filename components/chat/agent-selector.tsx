/**
 * Agent Selector Component
 *
 * Allows user to select which agent they want to chat with
 * in conversation mode. Includes "Auto" option for automatic
 * agent selection by the backend.
 *
 * Accessibility features:
 * - Full keyboard navigation (Arrow keys, Enter, Space, Escape, Home, End)
 * - Typeahead search by agent name
 * - ARIA attributes for screen readers
 * - Focus management
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-25
 */

'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { agents } from '@/data/agents'
import { getAgentByIdOrNull } from '@/hooks/use-agent'
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

// All options including auto
const ALL_OPTIONS = [
  AUTO_OPTION,
  ...agents.map((a) => ({ id: a.id, name: a.name, role: a.role.pt, image: a.image })),
]

export function AgentSelector({
  selectedAgentId,
  onSelectAgent,
  disabled = false,
  className,
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [typeaheadQuery, setTypeaheadQuery] = useState('')
  const typeaheadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset focused index when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus first item or selected item
      const selectedIndex = ALL_OPTIONS.findIndex((opt) => opt.id === selectedAgentId)
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    } else {
      setFocusedIndex(-1)
      setTypeaheadQuery('')
    }
  }, [isOpen, selectedAgentId])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [focusedIndex])

  // Clear typeahead after timeout
  useEffect(() => {
    if (typeaheadQuery) {
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current)
      }
      typeaheadTimeoutRef.current = setTimeout(() => {
        setTypeaheadQuery('')
      }, 500)
    }
    return () => {
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current)
      }
    }
  }, [typeaheadQuery])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, ALL_OPTIONS.length - 1))
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setFocusedIndex((prev) => Math.max(prev - 1, 0))
          }
          break

        case 'Home':
          event.preventDefault()
          if (isOpen) {
            setFocusedIndex(0)
          }
          break

        case 'End':
          event.preventDefault()
          if (isOpen) {
            setFocusedIndex(ALL_OPTIONS.length - 1)
          }
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          if (isOpen && focusedIndex >= 0) {
            const option = ALL_OPTIONS[focusedIndex]
            onSelectAgent(option.id)
            setIsOpen(false)
            triggerRef.current?.focus()
          } else if (!isOpen) {
            setIsOpen(true)
          }
          break

        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
          break

        case 'Tab':
          // Allow Tab to close dropdown naturally
          if (isOpen) {
            setIsOpen(false)
          }
          break

        default:
          // Typeahead: search by typing agent name
          if (isOpen && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            const newQuery = typeaheadQuery + event.key.toLowerCase()
            setTypeaheadQuery(newQuery)

            const matchIndex = ALL_OPTIONS.findIndex((opt) =>
              opt.name.toLowerCase().startsWith(newQuery)
            )
            if (matchIndex >= 0) {
              setFocusedIndex(matchIndex)
            }
          }
          break
      }
    },
    [disabled, isOpen, focusedIndex, typeaheadQuery, onSelectAgent]
  )

  // Get current selected agent
  const selectedAgent = getAgentByIdOrNull(selectedAgentId)

  const displayName = selectedAgent?.name || AUTO_OPTION.name
  const displayRole = selectedAgent?.role.pt || AUTO_OPTION.role

  // Generate unique IDs for ARIA
  const listboxId = 'agent-selector-listbox'

  return (
    <div ref={dropdownRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={`Selecionar agente. Agente atual: ${displayName}`}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
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
          <Sparkles className="w-5 h-5 text-green-500" aria-hidden="true" />
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
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Lista de agentes disponíveis"
          aria-activedescendant={focusedIndex >= 0 ? `agent-option-${focusedIndex}` : undefined}
          tabIndex={-1}
          className={cn(
            'absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border shadow-xl z-50',
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Agent Options */}
          <div className="py-1">
            {ALL_OPTIONS.map((option, index) => {
              const isSelected = option.id === selectedAgentId
              const isFocused = index === focusedIndex
              const isAuto = option.id === null

              return (
                <button
                  key={option.id ?? 'auto'}
                  ref={(el) => {
                    optionRefs.current[index] = el
                  }}
                  id={`agent-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectAgent(option.id)
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-gray-700',
                    'focus:outline-none',
                    isSelected && 'bg-green-50 dark:bg-green-900/20',
                    isFocused && 'bg-gray-100 dark:bg-gray-700 ring-2 ring-inset ring-green-500'
                  )}
                >
                  {/* Agent Avatar or Auto Icon */}
                  {isAuto ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <Image
                        src={option.image!}
                        alt={option.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {option.role}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div
                      className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        {isOpen
          ? `Menu aberto. ${ALL_OPTIONS.length} agentes disponíveis. Use setas para navegar, Enter para selecionar, Escape para fechar.`
          : ''}
      </div>
    </div>
  )
}
