'use client'

/**
 * NPS Question Component
 *
 * Net Promoter Score (0-10) rating component
 * WCAG AAA compliant with keyboard navigation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface NPSQuestionProps {
  value: number | undefined
  onChange: (value: number) => void
  labelMin?: string
  labelMax?: string
  disabled?: boolean
  error?: string
}

export function NPSQuestion({
  value,
  onChange,
  labelMin = 'Muito improvável',
  labelMax = 'Muito provável',
  disabled = false,
  error,
}: NPSQuestionProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentValue: number) => {
      if (disabled) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        const newValue = Math.min(10, currentValue + 1)
        onChange(newValue)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        const newValue = Math.max(0, currentValue - 1)
        onChange(newValue)
      }
    },
    [disabled, onChange]
  )

  const getButtonColor = (buttonValue: number) => {
    const isSelected = value === buttonValue
    const isHovered = hoveredValue === buttonValue

    // Color gradient: red (0-6) -> yellow (7-8) -> green (9-10)
    if (buttonValue <= 6) {
      if (isSelected) return 'bg-red-500 text-white border-red-600'
      if (isHovered) return 'bg-red-100 border-red-300 dark:bg-red-900/30'
      return 'border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
    } else if (buttonValue <= 8) {
      if (isSelected) return 'bg-yellow-500 text-white border-yellow-600'
      if (isHovered) return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30'
      return 'border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
    } else {
      if (isSelected) return 'bg-green-500 text-white border-green-600'
      if (isHovered) return 'bg-green-100 border-green-300 dark:bg-green-900/30'
      return 'border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* NPS Scale */}
      <div role="radiogroup" aria-label="NPS Score" className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((num) => (
          <button
            key={num}
            type="button"
            role="radio"
            aria-checked={value === num}
            aria-label={`${num} de 10`}
            disabled={disabled}
            onClick={() => onChange(num)}
            onKeyDown={(e) => handleKeyDown(e, num)}
            onMouseEnter={() => setHoveredValue(num)}
            onMouseLeave={() => setHoveredValue(null)}
            className={cn(
              'w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 font-semibold text-lg',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              getButtonColor(num)
            )}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
        <span>{labelMin}</span>
        <span>{labelMax}</span>
      </div>

      {/* Selected value display */}
      {value !== undefined && (
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-gray-500 dark:text-gray-400"> / 10</span>
        </div>
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
