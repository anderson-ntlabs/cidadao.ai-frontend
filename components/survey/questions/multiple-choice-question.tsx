'use client'

/**
 * Multiple Choice Question Component
 *
 * Single or multiple selection options
 * WCAG AAA compliant with keyboard navigation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useCallback } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionOption } from '@/types/survey'

interface MultipleChoiceQuestionProps {
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  options: QuestionOption[]
  multiple?: boolean
  locale?: 'pt' | 'en'
  disabled?: boolean
  error?: string
  columns?: 1 | 2 | 3
}

export function MultipleChoiceQuestion({
  value,
  onChange,
  options,
  multiple = false,
  locale = 'pt',
  disabled = false,
  error,
  columns = 2,
}: MultipleChoiceQuestionProps) {
  // Normalize value to array for easier handling
  const selectedValues = multiple ? (value as string[]) || [] : value ? [value as string] : []

  const isSelected = useCallback(
    (optionValue: string) => selectedValues.includes(optionValue),
    [selectedValues]
  )

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (disabled) return

      if (multiple) {
        // Toggle selection for multi-select
        const newValues = isSelected(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]
        onChange(newValues)
      } else {
        // Single select - just set the value
        onChange(optionValue)
      }
    },
    [disabled, multiple, isSelected, selectedValues, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, optionValue: string) => {
      if (disabled) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelect(optionValue)
      }
    },
    [disabled, handleSelect]
  )

  const getLabel = (option: QuestionOption) => (locale === 'pt' ? option.label_pt : option.label_en)

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div className="w-full space-y-4">
      {/* Options grid */}
      <div
        role={multiple ? 'group' : 'radiogroup'}
        aria-label="Options"
        className={cn('grid gap-3', gridCols[columns])}
      >
        {options.map((option) => {
          const selected = isSelected(option.value)

          return (
            <button
              key={option.value}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              disabled={disabled}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl border-2 text-left',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
            >
              {/* Checkbox/Radio indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center',
                  'transition-colors duration-200',
                  multiple ? 'rounded-md' : 'rounded-full',
                  selected
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-sm sm:text-base font-medium',
                  selected
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {getLabel(option)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selection count for multiple */}
      {multiple && selectedValues.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {selectedValues.length} selecionado{selectedValues.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
