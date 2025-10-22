import * as React from "react"
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

/**
 * Variant configuration for Button component styling
 * Uses class-variance-authority for type-safe variant management
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:shadow-xl focus:ring-green-500 hover-lift hover-glow",
        secondary: "border-2 border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:border-green-600 dark:hover:border-green-400 hover:shadow-lg text-gray-700 dark:text-gray-300 transition-all",
        ghost: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 backdrop-blur-sm",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-xl focus:ring-red-500",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl focus:ring-green-500",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl focus:ring-yellow-500"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 py-4 text-xl",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

/**
 * Props for Button and ButtonV2 components
 * 
 * @interface ButtonProps
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as child component for composition
   * @default false
   */
  asChild?: boolean
  
  /**
   * Show loading spinner and disable interactions
   * @default false
   */
  loading?: boolean
  
  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: React.ReactNode
  
  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: React.ReactNode
}

/**
 * ButtonV2 - Modern button component with multiple variants and states
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <ButtonV2 variant="primary">Click me</ButtonV2>
 * 
 * // With icons
 * <ButtonV2 
 *   leftIcon={<SaveIcon />} 
 *   variant="success"
 * >
 *   Save Changes
 * </ButtonV2>
 * 
 * // Loading state
 * <ButtonV2 loading>Processing...</ButtonV2>
 * ```
 * 
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Rendered button element
 * 
 * @since 2.0.0
 * @see {@link Button} - Original button component
 */
const ButtonV2 = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, type = "button", ...props }, ref) => {
    // Handle asChild prop for composition
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(buttonVariants({ variant, size }), className, (children as React.ReactElement<any>).props.className),
        ref,
        ...props
      })
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        type={type}
        {...props}
      >
        {/* Loading spinner */}
        {loading ? (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
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
        ) : leftIcon ? (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        ) : null}
        
        {/* Button content */}
        <span className="truncate">{children}</span>
        
        {/* Right icon */}
        {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  }
))

ButtonV2.displayName = "ButtonV2"

export { ButtonV2, ButtonV2 as Button, buttonVariants }