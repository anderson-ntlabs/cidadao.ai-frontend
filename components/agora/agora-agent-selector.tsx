/**
 * Agora Agent Selector Component
 *
 * Simplified agent selector for Agora Academy showing only educational mentors.
 * Based on main app's AgentSelector with same accessibility features.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getEducationalAgents } from '@/data/agents'
import Image from 'next/image'

export interface AgentOption {
  id: string
  name: string
  role: string
  image: string
  description: string
}

interface AgoraAgentSelectorProps {
  selectedAgentId: string
  onSelectAgent: (agentId: string) => void
  disabled?: boolean
  className?: string
}

// Get educational agents as options
const getAgentOptions = (): AgentOption[] =>
  getEducationalAgents().map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role.pt,
    image: a.image,
    description: a.description.pt,
  }))

export function AgoraAgentSelector({
  selectedAgentId,
  onSelectAgent,
  disabled = false,
  className,
}: AgoraAgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const options = getAgentOptions()

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
      const selectedIndex = options.findIndex((opt) => opt.id === selectedAgentId)
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    } else {
      setFocusedIndex(-1)
    }
  }, [isOpen, selectedAgentId, options])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [focusedIndex])

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
            setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1))
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

        case 'Enter':
        case ' ':
          event.preventDefault()
          if (isOpen && focusedIndex >= 0) {
            const option = options[focusedIndex]
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
          if (isOpen) {
            setIsOpen(false)
          }
          break
      }
    },
    [disabled, isOpen, focusedIndex, options, onSelectAgent]
  )

  // Get current selected agent
  const selectedAgent = options.find((opt) => opt.id === selectedAgentId) || options[0]

  // Generate unique IDs for ARIA
  const listboxId = 'agora-agent-selector-listbox'

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
        aria-label={`Selecionar mentor. Mentor atual: ${selectedAgent.name}`}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          'hover:border-green-400 dark:hover:border-green-500',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-green-500 ring-2 ring-green-500/20'
        )}
      >
        {/* Agent Avatar */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md ring-2 ring-white dark:ring-gray-900">
          <Image
            src={selectedAgent.image}
            alt={selectedAgent.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        {/* Agent Info */}
        <div className="flex-1 text-left">
          <p className="font-bold text-gray-900 dark:text-gray-100">{selectedAgent.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAgent.role}</p>
        </div>

        {/* Badge + Chevron */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <GraduationCap className="w-3 h-3" />
            Mentor
          </span>
          <ChevronDown
            className={cn('w-5 h-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Lista de mentores da Academy"
          aria-activedescendant={
            focusedIndex >= 0 ? `agora-agent-option-${focusedIndex}` : undefined
          }
          tabIndex={-1}
          className={cn(
            'absolute left-0 right-0 mt-2 rounded-xl border-2 shadow-xl z-50 overflow-hidden',
            'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-500" />
              Mentores da Academy
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Escolha um mentor para sua jornada de aprendizado
            </p>
          </div>

          {/* Agent Options */}
          <div className="py-2">
            {options.map((option, index) => {
              const isSelected = option.id === selectedAgentId
              const isFocused = index === focusedIndex

              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    optionRefs.current[index] = el
                  }}
                  id={`agora-agent-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectAgent(option.id)
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    'w-full flex items-start gap-4 px-4 py-4 text-left transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    'focus:outline-none',
                    isSelected && 'bg-green-50 dark:bg-green-900/20',
                    isFocused && 'bg-gray-100 dark:bg-gray-700 ring-2 ring-inset ring-green-500'
                  )}
                >
                  {/* Agent Avatar */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 shadow-md">
                    <Image
                      src={option.image}
                      alt={option.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{option.name}</p>
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {option.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        {isOpen
          ? `Menu aberto. ${options.length} mentores disponíveis. Use setas para navegar, Enter para selecionar, Escape para fechar.`
          : ''}
      </div>
    </div>
  )
}
