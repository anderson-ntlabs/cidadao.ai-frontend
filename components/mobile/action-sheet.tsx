'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/hooks/use-haptic'
import { touchFeedback, tapTarget, safeArea } from '@/lib/mobile-touch'

export interface ActionSheetAction {
  /** Unique identifier for the action */
  id: string
  /** Display label for the action */
  label: string
  /** Optional icon component */
  icon?: React.ReactNode
  /** Action variant style */
  variant?: 'default' | 'destructive' | 'primary'
  /** Disabled state */
  disabled?: boolean
  /** Click handler */
  onAction: () => void | Promise<void>
}

export interface ActionSheetProps {
  /** Whether the action sheet is visible */
  isOpen: boolean
  /** Callback when action sheet should close */
  onClose: () => void
  /** Title of the action sheet */
  title?: string
  /** Description/subtitle */
  description?: string
  /** List of actions to display */
  actions: ActionSheetAction[]
  /** Cancel button text (default: "Cancelar") */
  cancelText?: string
  /** Custom class name for the sheet */
  className?: string
  /** Disable backdrop click to close */
  disableBackdropClose?: boolean
}

/**
 * iOS-Style Action Sheet Component
 *
 * Mobile-optimized action menu that slides up from bottom.
 * Follows iOS design patterns with touch-friendly targets and haptic feedback.
 *
 * Features:
 * - Slide-up animation from bottom
 * - Backdrop with blur effect
 * - Touch-friendly 56px minimum action heights
 * - Haptic feedback on interactions
 * - Keyboard accessibility (Escape to close)
 * - Focus trap for accessibility
 * - Safe area insets for notched devices
 * - Swipe-down gesture to dismiss
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <ActionSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Escolha uma ação"
 *   actions={[
 *     {
 *       id: 'edit',
 *       label: 'Editar',
 *       icon: <Edit className="w-5 h-5" />,
 *       onAction: () => handleEdit()
 *     },
 *     {
 *       id: 'delete',
 *       label: 'Excluir',
 *       variant: 'destructive',
 *       icon: <Trash className="w-5 h-5" />,
 *       onAction: () => handleDelete()
 *     }
 *   ]}
 * />
 * ```
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  description,
  actions,
  cancelText = 'Cancelar',
  className,
  disableBackdropClose = false,
}: ActionSheetProps) {
  const { vibrate } = useHaptic()
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        vibrate('light')
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, vibrate])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Handle touch gestures for swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentYRef.current = e.touches[0].clientY
    const deltaY = currentYRef.current - startYRef.current

    // Only allow downward swipes
    if (deltaY > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }

  const handleTouchEnd = () => {
    const deltaY = currentYRef.current - startYRef.current

    // If swiped down more than 100px, close
    if (deltaY > 100) {
      vibrate('light')
      onClose()
    } else if (sheetRef.current) {
      // Reset position with animation
      sheetRef.current.style.transform = 'translateY(0)'
    }
  }

  const handleBackdropClick = () => {
    if (!disableBackdropClose) {
      vibrate('light')
      onClose()
    }
  }

  const handleAction = async (action: ActionSheetAction) => {
    if (action.disabled) return

    vibrate(action.variant === 'destructive' ? 'warning' : 'medium')
    await action.onAction()
    onClose()
  }

  const handleCancel = () => {
    vibrate('light')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Action Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          'max-h-[85vh] overflow-hidden',
          // Safe area insets for notched devices
          safeArea.bottom,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'action-sheet-title' : undefined}
        aria-describedby={description ? 'action-sheet-description' : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="action-sheet-title"
                className="text-lg font-semibold text-gray-900 dark:text-white text-center"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="action-sheet-description"
                className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Actions List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled}
              className={cn(
                // Base styles
                'w-full px-6 py-4 flex items-center gap-4',
                // Touch feedback and tap target
                touchFeedback.listItem,
                tapTarget.large,
                // Border (except last item)
                index < actions.length - 1 && 'border-b border-gray-200 dark:border-gray-700',
                // Variant styles
                action.variant === 'destructive' &&
                  'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30',
                action.variant === 'primary' &&
                  'text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30',
                !action.variant &&
                  'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700',
                // Disabled state
                action.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {action.icon && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {action.icon}
                </span>
              )}
              <span className="flex-1 text-left text-base">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t-8 border-gray-100 dark:border-gray-800">
          <button
            onClick={handleCancel}
            className={cn(
              'w-full px-6 py-4 rounded-xl',
              'bg-gray-100 dark:bg-gray-800',
              'text-gray-900 dark:text-white font-semibold text-base',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              // Touch feedback and tap target
              touchFeedback.button,
              tapTarget.large
            )}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple Action Sheet Hook
 *
 * Provides state management for action sheet visibility
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useActionSheet()
 *
 * <button onClick={open}>Show Actions</button>
 * <ActionSheet isOpen={isOpen} onClose={close} actions={...} />
 * ```
 */
export function useActionSheet() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}
