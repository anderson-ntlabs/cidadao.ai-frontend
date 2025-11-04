import * as React from 'react'
import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

const inputVariants = cva(
  'flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      inputSize: {
        default: 'h-11 px-4 py-3', // Mobile-optimized: 44px min height (WCAG AAA)
        sm: 'h-10 px-3 py-2 text-xs', // Still WCAG AA compliant (40px)
        lg: 'h-12 px-5 py-3.5', // 48px for extra comfort
        xl: 'h-14 px-6 py-4 text-base', // 56px for large displays
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  /**
   * Mobile input mode for virtual keyboard optimization
   * - 'none': No virtual keyboard
   * - 'text': Standard keyboard (default)
   * - 'decimal': Numeric keyboard with decimal point
   * - 'numeric': Numeric keyboard
   * - 'tel': Telephone keypad
   * - 'search': Search-optimized keyboard
   * - 'email': Email-optimized keyboard
   * - 'url': URL-optimized keyboard
   */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      error,
      success,
      leftIcon,
      rightIcon,
      helperText,
      inputMode,
      ...props
    },
    ref
  ) => {
    const inputVariant = error ? 'error' : success ? 'success' : variant

    // Auto-detect inputMode based on type if not explicitly provided
    const autoInputMode =
      inputMode ||
      (type === 'email'
        ? 'email'
        : type === 'tel'
          ? 'tel'
          : type === 'number'
            ? 'numeric'
            : type === 'search'
              ? 'search'
              : type === 'url'
                ? 'url'
                : 'text')

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            inputMode={autoInputMode}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              error && 'text-destructive',
              success && 'text-green-600',
              !error && !success && 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
