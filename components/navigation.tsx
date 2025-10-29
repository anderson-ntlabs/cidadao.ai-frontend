'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type LucideIcon, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect } from 'react'

const navigationVariants = cva(
  "flex items-center transition-colors duration-200",
  {
    variants: {
      variant: {
        horizontal: "gap-2 lg:gap-8",
        vertical: "flex-col gap-1 w-full",
        mobile: "flex-col gap-2 w-full"
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      variant: "horizontal",
      size: "md"
    }
  }
)

const navItemVariants = cva(
  "flex items-center gap-2 font-medium transition-all duration-200 relative cursor-pointer",
  {
    variants: {
      variant: {
        horizontal: "px-1 py-2 hover:text-brand-green-600 dark:hover:text-brand-green-400",
        vertical: "px-4 py-3 w-full hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg",
        mobile: "px-6 py-4 w-full hover:bg-gray-50 dark:hover:bg-gray-800"
      },
      active: {
        true: "",
        false: "text-gray-700 dark:text-gray-300"
      }
    },
    compoundVariants: [
      {
        variant: "horizontal",
        active: true,
        className: "text-brand-green-600 dark:text-brand-green-400"
      },
      {
        variant: ["vertical", "mobile"],
        active: true,
        className: "bg-gray-100 dark:bg-gray-800 text-brand-green-600 dark:text-brand-green-400"
      }
    ],
    defaultVariants: {
      variant: "horizontal",
      active: false
    }
  }
)

export interface NavigationItem {
  name: string
  href: string
  icon?: LucideIcon
  badge?: number | string
  external?: boolean
}

interface NavigationV2Props extends VariantProps<typeof navigationVariants> {
  items: NavigationItem[]
  className?: string
  showIcons?: boolean
  showLabels?: boolean
  onItemClick?: (item: NavigationItem) => void
}

export function NavigationV2({
  items,
  variant = "horizontal",
  size = "md",
  className,
  showIcons = true,
  showLabels = true,
  onItemClick
}: NavigationV2Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  const handleNavigation = (item: NavigationItem, e: React.MouseEvent) => {
    if (!item.external) {
      // Let Next.js handle the navigation via Link component
      // Only call onItemClick callback (e.g., to close mobile menu)
      onItemClick?.(item)
    }
  }

  // Handle undefined or empty items array
  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav
      className={cn(navigationVariants({ variant, size }), className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        
        const content = (
          <>
            {showIcons && Icon && (
              <Icon 
                className={cn(
                  "flex-shrink-0",
                  size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
                )} 
                aria-hidden="true"
              />
            )}
            {showLabels && (
              <span className="truncate">{item.name}</span>
            )}
            {item.badge !== undefined && (
              <span className={cn(
                "inline-flex items-center justify-center rounded-full bg-brand-red-600 text-white font-medium",
                size === "sm" ? "h-4 w-4 text-xs" : "h-5 w-5 text-xs"
              )}>
                {item.badge}
              </span>
            )}
            {/* Active indicator for horizontal variant */}
            {variant === "horizontal" && active && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand-green-600 dark:bg-brand-green-400 pointer-events-none" />
            )}
          </>
        )
        
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(navItemVariants({ variant, active }))}
              onClick={() => onItemClick?.(item)}
              aria-current={active ? "page" : undefined}
            >
              {content}
            </a>
          )
        }
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(navItemVariants({ variant, active }))}
            onClick={(e) => handleNavigation(item, e)}
            aria-current={active ? "page" : undefined}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

// Sub-components for advanced navigation patterns
export function NavigationV2Group({ 
  title, 
  children,
  className
}: { 
  title?: string
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

// Mobile-specific navigation drawer
export function NavigationV2Drawer({ 
  isOpen, 
  onClose,
  items,
  children
}: { 
  isOpen: boolean
  onClose: () => void
  items: NavigationItem[]
  children?: React.ReactNode
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900",
        "transform transition-transform duration-300 ease-in-out lg:hidden",
        "shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <NavigationV2 
              items={items} 
              variant="mobile"
              onItemClick={onClose}
            />
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Tab navigation variant
export function NavigationV2Tabs({ 
  items,
  className 
}: { 
  items: NavigationItem[]
  className?: string 
}) {
  const pathname = usePathname()
  
  return (
    <div className={cn(
      "border-b border-gray-200 dark:border-gray-800",
      className
    )}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                active 
                  ? "border-brand-green-600 text-brand-green-600 dark:text-brand-green-400" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              aria-current={active ? "page" : undefined}
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.name}
              {item.badge !== undefined && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Export with both names for compatibility
export { 
  NavigationV2 as Navigation,
  NavigationV2Drawer as NavigationDrawer,
  NavigationV2Group as NavigationGroup,
  NavigationV2Tabs as NavigationTabs
}