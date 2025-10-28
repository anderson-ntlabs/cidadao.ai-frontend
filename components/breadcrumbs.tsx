'use client'

import Link from 'next/link'
import { ChevronRight, Home, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const breadcrumbVariants = cva(
  "flex items-center py-3 text-sm",
  {
    variants: {
      variant: {
        default: "text-gray-600 dark:text-gray-400",
        subtle: "text-gray-500 dark:text-gray-500",
        prominent: "text-gray-700 dark:text-gray-300"
      },
      spacing: {
        compact: "gap-1",
        normal: "gap-2",
        relaxed: "gap-3"
      }
    },
    defaultVariants: {
      variant: "default",
      spacing: "normal"
    }
  }
)

const separatorVariants = cva(
  "flex-shrink-0 text-gray-400 dark:text-gray-600",
  {
    variants: {
      size: {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
      }
    },
    defaultVariants: {
      size: "sm"
    }
  }
)

export interface BreadcrumbItemV2 {
  label: string
  href?: string
  icon?: LucideIcon
  current?: boolean
}

interface BreadcrumbsV2Props extends VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItemV2[]
  separator?: 'chevron' | 'slash' | 'arrow' | 'dot'
  showHome?: boolean
  homeHref?: string
  homeLabel?: string
  className?: string
  maxItems?: number
  onItemClick?: (item: BreadcrumbItemV2) => void
}

export function BreadcrumbsV2({ 
  items,
  variant,
  spacing,
  separator = 'chevron',
  showHome = true,
  homeHref = '/pt/app',
  homeLabel = 'Início',
  className,
  maxItems,
  onItemClick
}: BreadcrumbsV2Props) {
  // Handle collapsed breadcrumbs if maxItems is set
  const displayItems = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { label: '...', href: undefined },
        ...items.slice(-(maxItems - 1))
      ]
    : items

  const getSeparator = () => {
    switch (separator) {
      case 'slash':
        return <span className="text-gray-400 dark:text-gray-600">/</span>
      case 'arrow':
        return <span className="text-gray-400 dark:text-gray-600">→</span>
      case 'dot':
        return <span className="text-gray-400 dark:text-gray-600">•</span>
      default:
        return <ChevronRight className={separatorVariants()} />
    }
  }

  return (
    <nav 
      className={cn(breadcrumbVariants({ variant, spacing }), className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center" style={{ gap: `var(--breadcrumb-gap, ${spacing === 'compact' ? '0.25rem' : spacing === 'relaxed' ? '0.75rem' : '0.5rem'})` }}>
        {/* Home link */}
        {showHome && (
          <>
            <li className="flex items-center">
              <Link 
                href={homeHref} 
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1",
                  "hover:text-brand-green-600 dark:hover:text-brand-green-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:ring-offset-2",
                  "relative after:content-[''] after:absolute after:inset-0",
                  "after:rounded-md after:transition-transform after:duration-200",
                  "hover:after:scale-105 active:after:scale-95"
                )}
                aria-label={homeLabel}
                onClick={() => onItemClick?.({ label: homeLabel, href: homeHref })}
              >
                <Home className="w-4 h-4" />
                <span className="sr-only">{homeLabel}</span>
              </Link>
            </li>
            {displayItems.length > 0 && (
              <li aria-hidden="true" className="select-none">
                {getSeparator()}
              </li>
            )}
          </>
        )}
        
        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const Icon = item.icon
          const isCurrent = item.current || isLast
          
          return (
            <li key={index} className="flex items-center">
              {item.href && !isCurrent ? (
                <Link 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1",
                    "hover:text-brand-green-600 dark:hover:text-brand-green-400",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:ring-offset-2",
                    "relative after:content-[''] after:absolute after:inset-0",
                    "after:rounded-md after:transition-transform after:duration-200",
                    "hover:after:scale-105 active:after:scale-95",
                    "group",
                    item.label === '...' && "cursor-default hover:bg-transparent"
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  {Icon && <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md relative",
                    isCurrent && [
                      "text-gray-900 dark:text-gray-100 font-semibold",
                      "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50",
                      "border border-gray-200 dark:border-gray-700",
                      "shadow-sm"
                    ]
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {Icon && <Icon className={cn(
                    "w-4 h-4",
                    isCurrent && "text-brand-green-600 dark:text-brand-green-400"
                  )} />}
                  <span>{item.label}</span>
                  {isCurrent && (
                    <span 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-green-500 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </span>
              )}
              
              {!isLast && (
                <span aria-hidden="true" className="ml-2">
                  {getSeparator()}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Mobile-optimized breadcrumbs
export function BreadcrumbsV2Mobile({ 
  items,
  className,
  onBack
}: { 
  items: BreadcrumbItemV2[]
  className?: string
  onBack?: () => void 
}) {
  const currentPage = items[items.length - 1]
  const previousPage = items.length > 1 ? items[items.length - 2] : null
  
  return (
    <div className={cn("flex items-center gap-2 py-3", className)}>
      {previousPage && (
        <Link
          href={previousPage.href || '#'}
          onClick={(e) => {
            if (onBack) {
              e.preventDefault()
              onBack()
            }
          }}
          className={cn(
            "flex items-center gap-1 text-sm",
            "text-gray-600 dark:text-gray-400",
            "hover:text-brand-green-600 dark:hover:text-brand-green-400",
            "transition-colors duration-200"
          )}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>{previousPage.label}</span>
        </Link>
      )}
      
      {!previousPage && currentPage && (
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {currentPage.label}
        </h1>
      )}
    </div>
  )
}

// Structured data for SEO
export function BreadcrumbsV2Schema({ items, baseUrl }: { items: BreadcrumbItemV2[], baseUrl: string }) {
  const schemaItems = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.label,
    "item": item.href ? `${baseUrl}${item.href}` : undefined
  })).filter(item => item.item)

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": schemaItems
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}