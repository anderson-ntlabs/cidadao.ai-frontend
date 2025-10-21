import * as React from "react"
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

/**
 * Variant configuration for Card component styling
 * Provides multiple visual styles and padding options
 */
const cardVariants = cva(
  "rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        elevated: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl hover:shadow-2xl border border-gray-200/20 dark:border-gray-700/20",
        outlined: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-green-600/50 dark:hover:border-green-400/50",
        ghost: "bg-transparent hover:bg-white/5 dark:hover:bg-gray-800/5",
        filled: "bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-100/50 dark:border-gray-800/50"
      },
      padding: {
        none: "",
        sm: "p-card-sm",
        md: "p-card",
        lg: "p-card-lg",
        responsive: "p-card-sm md:p-card"
      },
      interactive: {
        true: "cursor-pointer hover-lift",
        false: ""
      }
    },
    defaultVariants: {
      variant: "elevated",
      padding: "md",
      interactive: false
    }
  }
)

/**
 * Props for CardV2 component
 * 
 * @interface CardV2Props
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
interface CardV2Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Render as child component for composition
   * @default false
   */
  asChild?: boolean
}

const CardV2 = React.memo(React.forwardRef<HTMLDivElement, CardV2Props>(
  ({ className, variant, padding, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div"

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        {...props}
      />
    )
  }
))

CardV2.displayName = "CardV2"

const CardV2Header = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 mb-4", className)}
    {...props}
  />
)))
CardV2Header.displayName = "CardV2Header"

const CardV2Title = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-heading-3 font-semibold text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
)))
CardV2Title.displayName = "CardV2Title"

const CardV2Description = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-600 dark:text-gray-400 leading-relaxed",
      className
    )}
    {...props}
  />
)))
CardV2Description.displayName = "CardV2Description"

const CardV2Content = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body text-gray-700 dark:text-gray-300", className)}
    {...props}
  />
)))
CardV2Content.displayName = "CardV2Content"

const CardV2Footer = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-6",
      className
    )}
    {...props}
  />
)))
CardV2Footer.displayName = "CardV2Footer"

// Compound components for specific use cases
const CardV2Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'success' | 'warning' | 'info' | 'danger'
  }
>(({ className, variant = 'info', ...props }, ref) => {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
CardV2Badge.displayName = "CardV2Badge"

// Specialized card variations
const CardV2Stat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    description?: string
    trend?: { value: number; isPositive: boolean }
    icon?: React.ReactNode
  }
>(({ className, title, value, description, trend, icon, ...props }, ref) => (
  <CardV2
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
          {value}
        </p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "inline-flex items-center gap-1 mt-2 text-sm font-medium",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      {icon && (
        <div className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {icon}
        </div>
      )}
    </div>
    {/* Decorative gradient */}
    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600" />
  </CardV2>
))
CardV2Stat.displayName = "CardV2Stat"

export { 
  CardV2, 
  CardV2 as Card,
  CardV2Header, 
  CardV2Header as CardHeader,
  CardV2Footer, 
  CardV2Footer as CardFooter,
  CardV2Title, 
  CardV2Title as CardTitle,
  CardV2Description, 
  CardV2Description as CardDescription,
  CardV2Content,
  CardV2Content as CardContent,
  CardV2Badge,
  CardV2Badge as CardBadge,
  CardV2Stat,
  CardV2Stat as CardStat,
  cardVariants 
}