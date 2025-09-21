import * as React from "react"
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-button font-medium transition-button focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-white hover:shadow-card-hover hover-lift hover-glow",
        secondary: "border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-brand-green-600 dark:hover:border-brand-green-400 text-gray-700 dark:text-gray-300",
        ghost: "text-gray-700 dark:text-gray-300 hover:text-brand-green-600 dark:hover:text-brand-green-400 hover:bg-gray-50 dark:hover:bg-gray-800",
        destructive: "bg-brand-red-600 text-white hover:bg-red-700 hover:shadow-card-hover",
        success: "bg-brand-green-600 text-white hover:bg-brand-green-700 hover:shadow-card-hover",
        warning: "bg-brand-yellow-600 text-white hover:bg-brand-yellow-500 hover:shadow-card-hover"
      },
      size: {
        sm: "h-8 p-button-sm text-sm",
        md: "h-10 p-button text-base",
        lg: "h-12 p-button-lg text-lg",
        xl: "h-14 px-10 py-4 text-xl",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

export interface ButtonV2Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonV2Props>(
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
)

ButtonV2.displayName = "ButtonV2"

export { ButtonV2, buttonVariants }