'use client'

import { useRef, useState, ReactNode } from 'react'
import { Trash2, Archive, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useHaptic } from '@/hooks/use-haptic'
import { touchFeedback, gestureHint } from '@/lib/mobile-touch'

interface SwipeAction {
  /** Action identifier */
  id: string
  /** Action label */
  label: string
  /** Action icon component */
  icon: typeof Trash2
  /** Background color for action */
  color: string
  /** Text color for action */
  textColor: string
  /** Callback when action is triggered */
  onAction: () => void | Promise<void>
  /** Haptic feedback type */
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
}

interface SwipeableCardProps {
  /** Card content to render */
  children: ReactNode
  /** Left swipe action (e.g., archive) */
  leftAction?: SwipeAction
  /** Right swipe action (e.g., delete) */
  rightAction?: SwipeAction
  /** Callback when card is clicked/tapped */
  onClick?: () => void
  /** Custom class name */
  className?: string
  /** Swipe threshold to trigger action (default: 100px) */
  threshold?: number
}

/**
 * Swipeable Card Component
 *
 * Mobile-friendly card with swipe-to-reveal actions.
 * Commonly used for lists with delete, archive, or mark actions.
 *
 * Features:
 * - Swipe left/right to reveal actions
 * - Threshold-based action triggering
 * - Smooth animations and haptic feedback
 * - Customizable action colors and icons
 * - Tap to execute on full swipe
 *
 * @example
 * ```tsx
 * function InvestigationList() {
 *   const handleDelete = async (id: string) => {
 *     await deleteInvestigation(id)
 *   }
 *
 *   const handleArchive = async (id: string) => {
 *     await archiveInvestigation(id)
 *   }
 *
 *   return (
 *     <div className="space-y-2">
 *       {investigations.map(inv => (
 *         <SwipeableCard
 *           key={inv.id}
 *           onClick={() => router.push(`/investigacoes/${inv.id}`)}
 *           leftAction={{
 *             id: 'archive',
 *             label: 'Arquivar',
 *             icon: Archive,
 *             color: 'bg-blue-600',
 *             textColor: 'text-white',
 *             onAction: () => handleArchive(inv.id),
 *             hapticType: 'medium',
 *           }}
 *           rightAction={{
 *             id: 'delete',
 *             label: 'Excluir',
 *             icon: Trash2,
 *             color: 'bg-red-600',
 *             textColor: 'text-white',
 *             onAction: () => handleDelete(inv.id),
 *             hapticType: 'error',
 *           }}
 *         >
 *           <InvestigationCard {...inv} />
 *         </SwipeableCard>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  onClick,
  className,
  threshold = 100,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const { vibrate } = useHaptic()

  // Track swipe state
  const { isSwiping, swipeDistance, swipeDirection } = useSwipeGesture(cardRef, {
    threshold,
    onSwipeLeft: async () => {
      if (!rightAction || swipeDistance < threshold) return

      // Trigger haptic feedback
      vibrate(rightAction.hapticType || 'medium')

      // Execute action
      setIsExecuting(true)
      try {
        await rightAction.onAction()
      } finally {
        setIsExecuting(false)
      }
    },
    onSwipeRight: async () => {
      if (!leftAction || swipeDistance < threshold) return

      // Trigger haptic feedback
      vibrate(leftAction.hapticType || 'medium')

      // Execute action
      setIsExecuting(true)
      try {
        await leftAction.onAction()
      } finally {
        setIsExecuting(false)
      }
    },
  })

  // Calculate action reveal progress (0-1)
  const revealProgress = Math.min(Math.abs(swipeDistance) / threshold, 1)
  const isActionReady = revealProgress >= 1

  // Determine which action is being revealed
  const activeAction =
    swipeDirection === 'left' ? rightAction : swipeDirection === 'right' ? leftAction : null

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {leftAction && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-start px-6',
            leftAction.color,
            leftAction.textColor,
            'transition-opacity duration-200'
          )}
          style={{
            width: swipeDirection === 'right' ? `${Math.abs(swipeDistance)}px` : '0',
            opacity: swipeDirection === 'right' ? revealProgress : 0,
          }}
        >
          <div className="flex items-center gap-2">
            <leftAction.icon
              className={cn('w-6 h-6 transition-transform', isActionReady && 'scale-110')}
            />
            {isActionReady && <span className="font-semibold">{leftAction.label}</span>}
          </div>
        </div>
      )}

      {rightAction && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-end px-6',
            rightAction.color,
            rightAction.textColor,
            'transition-opacity duration-200'
          )}
          style={{
            width: swipeDirection === 'left' ? `${Math.abs(swipeDistance)}px` : '0',
            opacity: swipeDirection === 'left' ? revealProgress : 0,
          }}
        >
          <div className="flex items-center gap-2">
            {isActionReady && <span className="font-semibold">{rightAction.label}</span>}
            <rightAction.icon
              className={cn('w-6 h-6 transition-transform', isActionReady && 'scale-110')}
            />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        className={cn(
          'relative bg-white dark:bg-gray-800',
          // Touch feedback when tappable
          onClick && !isSwiping && touchFeedback.card,
          // Swipe gesture hint
          (leftAction || rightAction) && gestureHint.swipeable,
          // Disabled state during execution
          isExecuting && 'opacity-50 pointer-events-none',
          className
        )}
        style={{
          transform: isSwiping ? `translateX(${swipeDistance}px)` : 'translateX(0)',
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onClick={() => {
          if (!isSwiping && onClick) {
            onClick()
          }
        }}
      >
        {children}
      </div>

      {/* Loading overlay when executing action */}
      {isExecuting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/30">
          <div className="flex items-center gap-2 text-white">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">{activeAction?.label}...</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Preset Swipe Actions
 *
 * Common action configurations for quick use
 */
export const SwipeActions = {
  /**
   * Delete action (red, destructive)
   */
  delete: (onDelete: () => void | Promise<void>): SwipeAction => ({
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    color: 'bg-red-600',
    textColor: 'text-white',
    onAction: onDelete,
    hapticType: 'error',
  }),

  /**
   * Archive action (blue, neutral)
   */
  archive: (onArchive: () => void | Promise<void>): SwipeAction => ({
    id: 'archive',
    label: 'Arquivar',
    icon: Archive,
    color: 'bg-blue-600',
    textColor: 'text-white',
    onAction: onArchive,
    hapticType: 'medium',
  }),

  /**
   * Complete/Mark action (green, positive)
   */
  complete: (onComplete: () => void | Promise<void>): SwipeAction => ({
    id: 'complete',
    label: 'Concluir',
    icon: Check,
    color: 'bg-green-600',
    textColor: 'text-white',
    onAction: onComplete,
    hapticType: 'success',
  }),
}
