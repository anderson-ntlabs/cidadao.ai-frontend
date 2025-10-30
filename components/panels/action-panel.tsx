/**
 * Action Panel Component
 *
 * Reusable action panel for settings, preferences, and actionable items
 * Supports various layouts and action types
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { LucideIcon, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActionPanelItem {
  /** Item title */
  title: string
  /** Item description */
  description?: string
  /** Icon to display */
  icon?: LucideIcon
  /** Action button label */
  actionLabel?: string
  /** Action handler */
  onAction?: () => void
  /** Whether action is loading */
  isLoading?: boolean
  /** Whether action is disabled */
  disabled?: boolean
  /** Optional badge */
  badge?: string | number
  /** Badge color */
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  /** Show chevron for navigation */
  showChevron?: boolean
  /** Custom action component */
  action?: React.ReactNode
}

interface ActionPanelProps {
  /** Panel items */
  items: ActionPanelItem[]
  /** Panel title */
  title?: string
  /** Panel description */
  description?: string
  /** Layout variant */
  variant?: 'default' | 'compact' | 'detailed'
  /** Whether to show dividers between items */
  showDividers?: boolean
  /** Custom class name */
  className?: string
}

const badgeColors = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
}

export function ActionPanel({
  items,
  title,
  description,
  variant = 'default',
  showDividers = true,
  className
}: ActionPanelProps) {
  const renderItem = (item: ActionPanelItem, index: number) => {
    const Icon = item.icon
    const isLast = index === items.length - 1
    const showDivider = showDividers && !isLast

    const itemContent = (
      <>
        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      badgeColors[item.badgeColor || 'blue']
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Action */}
            {item.action ? (
              item.action
            ) : item.onAction ? (
              <div className="flex-shrink-0">
                {item.showChevron ? (
                  <button
                    onClick={item.onAction}
                    disabled={item.disabled}
                    className={cn(
                      'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label={item.actionLabel || item.title}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={item.onAction}
                    disabled={item.disabled || item.isLoading}
                  >
                    {item.isLoading ? 'Aguarde...' : item.actionLabel || 'Ação'}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </>
    )

    const itemClasses = cn(
      'flex items-start gap-4',
      variant === 'compact' ? 'py-2' : 'py-4',
      showDivider && 'border-b border-gray-200/50 dark:border-gray-700/50',
      item.onAction && item.showChevron && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2 transition-colors'
    )

    if (item.onAction && item.showChevron) {
      return (
        <div
          key={index}
          className={itemClasses}
          onClick={item.disabled ? undefined : item.onAction}
        >
          {itemContent}
        </div>
      )
    }

    return (
      <div key={index} className={itemClasses}>
        {itemContent}
      </div>
    )
  }

  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-0">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  )
}

/**
 * Action Panel Section Component
 *
 * Groups multiple action panels with a section title
 */

interface ActionPanelSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}

export function ActionPanelSection({
  title,
  description,
  icon: Icon,
  children,
  className
}: ActionPanelSectionProps) {
  return (
    <div className={className}>
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
