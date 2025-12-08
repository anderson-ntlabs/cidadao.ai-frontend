'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

const textareaVariants = cva(
  'flex w-full rounded-md border bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation resize-none',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      textareaSize: {
        default: 'min-h-[120px] px-4 py-3',
        sm: 'min-h-[80px] px-3 py-2 text-xs',
        lg: 'min-h-[160px] px-5 py-4',
        xl: 'min-h-[200px] px-6 py-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'default',
    },
  }
)

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  success?: boolean
  helperText?: string
  label?: string
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      error,
      success,
      helperText,
      label,
      maxLength,
      showCount = false,
      autoResize = false,
      value,
      defaultValue,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const textareaVariant = error ? 'error' : success ? 'success' : variant
    const textareaId = id || React.useId()
    const [internalValue, setInternalValue] = React.useState(defaultValue?.toString() || '')
    const currentValue = value?.toString() ?? internalValue
    const charCount = currentValue.length

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value

      // Respect maxLength
      if (maxLength && newValue.length > maxLength) {
        return
      }

      setInternalValue(newValue)
      onChange?.(e)

      // Auto resize
      if (autoResize) {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-2',
              error && 'text-destructive',
              success && 'text-green-600'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            className={cn(
              textareaVariants({ variant: textareaVariant, textareaSize }),
              autoResize && 'overflow-hidden',
              className
            )}
            {...props}
          />
        </div>
        <div className="flex justify-between mt-1">
          {helperText && (
            <p
              className={cn(
                'text-xs',
                error && 'text-destructive',
                success && 'text-green-600',
                !error && !success && 'text-muted-foreground'
              )}
            >
              {helperText}
            </p>
          )}
          {showCount && (
            <p
              className={cn(
                'text-xs text-muted-foreground ml-auto',
                maxLength && charCount >= maxLength && 'text-destructive'
              )}
            >
              {charCount}
              {maxLength && ` / ${maxLength}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export { TextArea, textareaVariants }
