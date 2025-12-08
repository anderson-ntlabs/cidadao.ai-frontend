'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import { Check } from 'lucide-react'

const checkboxVariants = cva(
  'peer shrink-0 rounded border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
        error:
          'border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
        success:
          'border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500',
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5', // 20px - accessible touch target when combined with label
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
  error?: boolean
  success?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      error,
      success,
      checked,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(checked ?? false)
    const checkboxVariant = error ? 'error' : success ? 'success' : variant
    const checkboxId = id || React.useId()

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        setIsChecked(e.target.checked)
        onChange?.(e)
      }
    }

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            data-state={isChecked ? 'checked' : 'unchecked'}
            className={cn(
              checkboxVariants({ variant: checkboxVariant, size }),
              'flex items-center justify-center cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            onClick={() => {
              if (!disabled) {
                const input = document.getElementById(checkboxId) as HTMLInputElement
                input?.click()
              }
            }}
          >
            {isChecked && (
              <Check
                className={cn(
                  'text-white',
                  size === 'sm' && 'h-3 w-3',
                  size === 'default' && 'h-3.5 w-3.5',
                  size === 'lg' && 'h-4 w-4'
                )}
              />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-50',
                  error && 'text-destructive'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn('text-xs text-muted-foreground mt-1', error && 'text-destructive')}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }
