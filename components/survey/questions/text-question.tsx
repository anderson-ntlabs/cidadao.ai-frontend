'use client'

/**
 * Text Question Component
 *
 * Free text input with character counter
 * WCAG AAA compliant
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { useCallback, useId } from 'react'
import { cn } from '@/lib/utils'

interface TextQuestionProps {
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minRows?: number
  maxRows?: number
  disabled?: boolean
  error?: string
  required?: boolean
}

export function TextQuestion({
  value = '',
  onChange,
  placeholder = 'Digite sua resposta...',
  maxLength = 1000,
  minRows = 3,
  maxRows = 8,
  disabled = false,
  error,
  required = false,
}: TextQuestionProps) {
  const id = useId()
  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.8
  const isAtLimit = charCount >= maxLength

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= maxLength) {
        onChange(newValue)
      }
    },
    [maxLength, onChange]
  )

  return (
    <div className="w-full space-y-2">
      {/* Textarea */}
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={minRows}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-counter`}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 resize-y',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'bg-white dark:bg-gray-800',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-green-500'
          )}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`,
          }}
        />
      </div>

      {/* Character counter and error */}
      <div className="flex justify-between items-center px-1">
        {/* Error message */}
        {error ? (
          <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : (
          <span /> // Spacer
        )}

        {/* Character counter */}
        <p
          id={`${id}-counter`}
          className={cn(
            'text-sm transition-colors duration-200',
            isAtLimit
              ? 'text-red-600 dark:text-red-400 font-medium'
              : isNearLimit
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {charCount.toLocaleString()}/{maxLength.toLocaleString()}
        </p>
      </div>

      {/* Helper text */}
      {!required && !error && charCount === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Esta pergunta é opcional
        </p>
      )}
    </div>
  )
}
