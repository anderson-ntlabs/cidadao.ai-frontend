'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

const radioVariants = cva(
  'peer shrink-0 rounded-full border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-input data-[state=checked]:border-primary',
        error: 'border-destructive data-[state=checked]:border-destructive',
        success: 'border-green-500 data-[state=checked]:border-green-500',
      },
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Radio Group Context
interface RadioGroupContextValue {
  value?: string
  onChange?: (value: string) => void
  name?: string
  disabled?: boolean
  variant?: 'default' | 'error' | 'success' | null
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({})

// Radio Group
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  error?: boolean
  success?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      name,
      disabled,
      orientation = 'vertical',
      error,
      success,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value ?? internalValue

    const handleChange = (newValue: string) => {
      if (!disabled) {
        setInternalValue(newValue)
        onValueChange?.(newValue)
      }
    }

    const variant = error ? 'error' : success ? 'success' : 'default'

    return (
      <RadioGroupContext.Provider
        value={{ value: currentValue, onChange: handleChange, name, disabled, variant }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn(
            'flex gap-3',
            orientation === 'vertical' && 'flex-col',
            orientation === 'horizontal' && 'flex-row flex-wrap',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

// Radio Item
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string
  description?: string
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant, size, label, description, value, disabled, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value
    const radioId = id || React.useId()
    const isDisabled = disabled || context.disabled
    const radioVariant = context.variant || variant

    const handleChange = () => {
      if (!isDisabled && value && typeof value === 'string') {
        context.onChange?.(value)
      }
    }

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            type="radio"
            ref={ref}
            id={radioId}
            name={context.name}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            className="sr-only"
            {...props}
          />
          <div
            data-state={isChecked ? 'checked' : 'unchecked'}
            className={cn(
              radioVariants({ variant: radioVariant, size }),
              'flex items-center justify-center cursor-pointer',
              isDisabled && 'cursor-not-allowed opacity-50',
              className
            )}
            onClick={handleChange}
          >
            {isChecked && (
              <div
                className={cn(
                  'rounded-full',
                  radioVariant === 'default' && 'bg-primary',
                  radioVariant === 'error' && 'bg-destructive',
                  radioVariant === 'success' && 'bg-green-500',
                  size === 'sm' && 'h-2 w-2',
                  size === 'default' && 'h-2.5 w-2.5',
                  size === 'lg' && 'h-3 w-3'
                )}
              />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer',
                  isDisabled && 'cursor-not-allowed opacity-50',
                  radioVariant === 'error' && 'text-destructive'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs text-muted-foreground mt-1',
                  radioVariant === 'error' && 'text-destructive'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'

export { Radio, RadioGroup, radioVariants }
