'use client'

import { useState, useEffect, useRef, RefObject } from 'react'

export interface SwipeGestureOptions {
  /** Minimum distance (px) to trigger swipe */
  threshold?: number
  /** Maximum time (ms) for swipe to be valid */
  timeThreshold?: number
  /** Prevent default touch behavior */
  preventDefault?: boolean
}

export interface SwipeDirection {
  type: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

/**
 * Swipe Gesture Hook
 *
 * Detects swipe gestures (left, right, up, down) on touch devices.
 * Returns swipe direction, distance, and velocity for implementing
 * swipe-to-delete, swipe-to-refresh, and other mobile gestures.
 *
 * @param elementRef - Reference to element to detect swipes on
 * @param options - Configuration options
 * @returns Swipe state and handlers
 *
 * @example
 * ```tsx
 * function SwipeableMessage({ message, onDelete }) {
 *   const messageRef = useRef<HTMLDivElement>(null)
 *   const { isSwiping, swipeDistance, swipeDirection } = useSwipeGesture(messageRef, {
 *     threshold: 100,
 *     onSwipeLeft: () => onDelete(message.id),
 *   })
 *
 *   return (
 *     <div
 *       ref={messageRef}
 *       style={{ transform: `translateX(${swipeDistance}px)` }}
 *     >
 *       <Message content={message.content} />
 *       {swipeDirection === 'left' && Math.abs(swipeDistance) > 50 && (
 *         <DeleteIcon className="absolute right-4" />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSwipeGesture(
  elementRef: RefObject<HTMLElement>,
  options: SwipeGestureOptions & {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    onSwipeStart?: () => void
    onSwipeEnd?: () => void
  } = {}
) {
  const {
    threshold = 80,
    timeThreshold = 300,
    preventDefault = true,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
  } = options

  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(
    null
  )

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      setIsSwiping(true)
      setSwipeDistance(0)
      setSwipeDirection(null)
      onSwipeStart?.()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      if (preventDefault) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // Determine primary direction (horizontal or vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        setSwipeDistance(deltaX)
        setSwipeDirection(deltaX > 0 ? 'right' : 'left')
      } else {
        // Vertical swipe
        setSwipeDistance(deltaY)
        setSwipeDirection(deltaY > 0 ? 'down' : 'up')
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return
      if (preventDefault) {
        e.preventDefault()
      }

      const touchEnd = e.changedTouches[0]
      const deltaX = touchEnd.clientX - touchStartRef.current.x
      const deltaY = touchEnd.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Calculate velocity (px/ms)
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime

      // Determine if swipe is valid (meets threshold and time requirements)
      const isValidSwipe = deltaTime <= timeThreshold

      if (isValidSwipe) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) >= threshold) {
            if (deltaX > 0) {
              onSwipeRight?.()
            } else {
              onSwipeLeft?.()
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) >= threshold) {
            if (deltaY > 0) {
              onSwipeDown?.()
            } else {
              onSwipeUp?.()
            }
          }
        }
      }

      // Reset state
      setIsSwiping(false)
      setSwipeDistance(0)
      setSwipeDirection(null)
      touchStartRef.current = null
      onSwipeEnd?.()
    }

    // Add event listeners with passive: false for preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [
    elementRef,
    threshold,
    timeThreshold,
    preventDefault,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
  ])

  return {
    isSwiping,
    swipeDistance,
    swipeDirection,
  }
}
