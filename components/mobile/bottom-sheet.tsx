'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { touchFeedback, tapTarget } from '@/lib/mobile-touch'

interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  isOpen: boolean
  /** Callback when bottom sheet is closed */
  onClose: () => void
  /** Bottom sheet title */
  title?: string
  /** Bottom sheet content */
  children: ReactNode
  /** Custom height (default: 'auto', max: 90vh) */
  height?: string | number
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Bottom Sheet Component
 *
 * Mobile-friendly modal that slides up from bottom of screen.
 * Commonly used for filters, actions, and secondary content on mobile.
 *
 * Features:
 * - Slides up from bottom with smooth animation
 * - Swipe down to dismiss
 * - Backdrop click to dismiss
 * - Lock body scroll when open
 * - Accessible with ARIA attributes
 * - iOS-style rounded corners and handle
 *
 * @example
 * ```tsx
 * function FilterButton() {
 *   const [isOpen, setIsOpen] = useState(false)
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>
 *         Filtros
 *       </button>
 *
 *       <BottomSheet
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         title="Filtros"
 *       >
 *         <div className="space-y-4">
 *           <FilterOption label="Categoria" />
 *           <FilterOption label="Data" />
 *           <button onClick={() => setIsOpen(false)}>
 *             Aplicar Filtros
 *           </button>
 *         </div>
 *       </BottomSheet>
 *     </>
 *   )
 * }
 * ```
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showCloseButton = true,
  className,
}: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Swipe down to close
  const { swipeDistance, swipeDirection } = useSwipeGesture(sheetRef, {
    threshold: 100,
    onSwipeDown: () => {
      if (swipeDistance > 100) {
        onClose()
      }
    },
  })

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setIsAnimating(true)
    } else {
      document.body.style.overflow = ''
      setIsAnimating(false)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen && !isAnimating) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white dark:bg-gray-900',
          'rounded-t-3xl shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          maxHeight: '90vh',
          // Apply swipe offset during drag
          transform: isOpen
            ? swipeDirection === 'down' && swipeDistance > 0
              ? `translateY(${swipeDistance}px)`
              : 'translateY(0)'
            : 'translateY(100%)',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                  touchFeedback.icon,
                  tapTarget.medium
                )}
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {children}
        </div>
      </div>
    </>
  )
}
