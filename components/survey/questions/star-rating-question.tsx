'use client'

/**
 * Star Rating Question Component
 *
 * 1-5 star rating component with hover preview
 * WCAG AAA compliant with keyboard navigation
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingQuestionProps {
  value: number | undefined
  onChange: (value: number) => void
  maxStars?: number
  labels?: string[]
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const defaultLabels = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
}

export function StarRatingQuestion({
  value,
  onChange,
  maxStars = 5,
  labels = defaultLabels,
  disabled = false,
  error,
  size = 'lg',
}: StarRatingQuestionProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentStar: number) => {
      if (disabled) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        const newValue = Math.min(maxStars, currentStar + 1)
        onChange(newValue)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        const newValue = Math.max(1, currentStar - 1)
        onChange(newValue)
      }
    },
    [disabled, maxStars, onChange]
  )

  const getStarState = (starIndex: number) => {
    const displayValue = hoveredStar !== null ? hoveredStar : value
    if (displayValue === undefined) return 'empty'
    return starIndex <= displayValue ? 'filled' : 'empty'
  }

  const currentLabel =
    hoveredStar !== null ? labels[hoveredStar - 1] : value !== undefined ? labels[value - 1] : null

  return (
    <div className="w-full space-y-4">
      {/* Stars */}
      <div role="radiogroup" aria-label="Star Rating" className="flex justify-center gap-2">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => {
          const state = getStarState(star)
          const isFilled = state === 'filled'

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} de ${maxStars} estrelas - ${labels[star - 1]}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className={cn(
                'p-1 rounded-lg transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:scale-110 active:scale-95'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-200',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-gray-300 dark:text-gray-600'
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Current label */}
      <div className="h-6 text-center">
        {currentLabel && (
          <span
            className={cn(
              'text-sm font-medium transition-opacity duration-200',
              hoveredStar !== null
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {currentLabel}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
