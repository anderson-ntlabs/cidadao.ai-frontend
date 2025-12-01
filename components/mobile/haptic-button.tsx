'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useHaptic, type HapticFeedbackType } from '@/hooks/use-haptic'
import { touchFeedback, tapTarget } from '@/lib/mobile-touch'

export interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Haptic feedback pattern (default: 'medium') */
  haptic?: HapticFeedbackType | false
  /** Button variant */
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
  /** Icon before text */
  leftIcon?: React.ReactNode
  /** Icon after text */
  rightIcon?: React.ReactNode
}

/**
 * Haptic Button Component
 *
 * Touch-optimized button with automatic haptic feedback.
 * Designed for mobile-first experiences with vibration on tap.
 *
 * Features:
 * - Automatic haptic feedback on click
 * - Touch-friendly minimum size (44px)
 * - Active/pressed states with visual feedback
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Multiple variants and sizes
 * - Disabled state handling
 * - Full accessibility support
 *
 * Haptic Patterns:
 * - 'light': Subtle feedback (10ms) - for secondary actions
 * - 'medium': Standard feedback (20ms) - for primary actions
 * - 'heavy': Strong feedback (30ms) - for important actions
 * - 'success': Success pattern (15ms + 10ms) - for confirmations
 * - 'warning': Warning pattern (25ms + 15ms) - for destructive actions
 * - 'error': Error pattern (30ms + 20ms) - for errors
 * - false: No haptic feedback
 *
 * @example
 * ```tsx
 * // Primary action button
 * <HapticButton variant="primary" haptic="medium">
 *   Save Changes
 * </HapticButton>
 * ```
 *
 * @example
 * ```tsx
 * // Destructive action with warning haptic
 * <HapticButton variant="destructive" haptic="warning">
 *   Delete Account
 * </HapticButton>
 * ```
 *
 * @example
 * ```tsx
 * // Button with icons
 * <HapticButton
 *   leftIcon={<Plus className="w-5 h-5" />}
 *   variant="primary"
 * >
 *   Add Item
 * </HapticButton>
 * ```
 *
 * @example
 * ```tsx
 * // Loading state
 * <HapticButton loading disabled>
 *   Saving...
 * </HapticButton>
 * ```
 */
export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  (
    {
      children,
      className,
      haptic = 'medium',
      variant = 'default',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const { vibrate } = useHaptic()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback if enabled and not disabled
      if (haptic && !disabled && !loading) {
        vibrate(haptic)
      }

      // Call original onClick handler
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed select-none',

          // Touch feedback (standardized)
          touchFeedback.button,

          // Size variants with tap targets (minimum 44px for WCAG AAA)
          size === 'sm' && cn(tapTarget.small, 'px-4 py-2.5 text-sm'),
          size === 'md' && cn(tapTarget.medium, 'px-6 py-3 text-base'),
          size === 'lg' && cn(tapTarget.large, 'px-8 py-4 text-lg'),

          // Variant styles
          variant === 'default' &&
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 focus:ring-gray-500',

          variant === 'primary' &&
            'bg-gradient-green-blue text-white hover:bg-gradient-green-blue-dark active:bg-gradient-green-blue-dark focus:ring-green-500 shadow-lg hover:shadow-xl',

          variant === 'destructive' &&
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-md hover:shadow-lg',

          variant === 'outline' &&
            'bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 focus:ring-gray-500',

          variant === 'ghost' &&
            'bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:ring-gray-500',

          // Full width
          fullWidth && 'w-full',

          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left Icon */}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}

        {/* Button Text */}
        <span>{children}</span>

        {/* Right Icon */}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

HapticButton.displayName = 'HapticButton'

/**
 * Haptic Icon Button
 *
 * Square icon-only button with haptic feedback.
 * Perfect for toolbars and action buttons.
 *
 * @example
 * ```tsx
 * <HapticIconButton
 *   aria-label="Settings"
 *   haptic="light"
 * >
 *   <Settings className="w-5 h-5" />
 * </HapticIconButton>
 * ```
 */
export const HapticIconButton = forwardRef<
  HTMLButtonElement,
  Omit<HapticButtonProps, 'leftIcon' | 'rightIcon'>
>(({ children, className, size = 'md', ...props }, ref) => {
  return (
    <HapticButton
      ref={ref}
      size={size}
      className={cn(
        // Square aspect ratio
        size === 'sm' && 'w-[44px] h-[44px] p-0',
        size === 'md' && 'w-[48px] h-[48px] p-0',
        size === 'lg' && 'w-[56px] h-[56px] p-0',
        className
      )}
      {...props}
    >
      {children}
    </HapticButton>
  )
})

HapticIconButton.displayName = 'HapticIconButton'

/**
 * Haptic FAB (Floating Action Button)
 *
 * Circular floating action button with haptic feedback.
 * Follows Material Design FAB patterns for mobile.
 *
 * @example
 * ```tsx
 * <HapticFAB
 *   className="fixed bottom-20 right-6"
 *   variant="primary"
 *   haptic="medium"
 *   aria-label="Add new item"
 * >
 *   <Plus className="w-6 h-6" />
 * </HapticFAB>
 * ```
 */
export const HapticFAB = forwardRef<
  HTMLButtonElement,
  Omit<HapticButtonProps, 'leftIcon' | 'rightIcon' | 'size'>
>(({ children, className, ...props }, ref) => {
  return (
    <HapticButton
      ref={ref}
      variant="primary"
      className={cn(
        // Circular shape with large tap target
        tapTarget.large,
        'rounded-full p-0',
        // Elevated shadow
        'shadow-lg hover:shadow-xl',
        // FAB-specific feedback (overrides button default)
        touchFeedback.fab,
        className
      )}
      {...props}
    >
      {children}
    </HapticButton>
  )
})

HapticFAB.displayName = 'HapticFAB'
