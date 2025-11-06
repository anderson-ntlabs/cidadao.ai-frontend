'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface VirtualKeyboardSpacerProps {
  /** Custom class name */
  className?: string
  /** Minimum spacer height (default: 0) */
  minHeight?: number
  /** Maximum spacer height (default: 500) */
  maxHeight?: number
  /** Transition duration in ms (default: 300) */
  transitionDuration?: number
}

/**
 * Virtual Keyboard Spacer Component
 *
 * Automatically adjusts height to accommodate virtual keyboard on mobile devices.
 * Prevents content from being hidden behind the keyboard (especially on iOS).
 *
 * How it works:
 * - Uses visualViewport API to detect keyboard appearance
 * - Calculates keyboard height dynamically
 * - Smoothly animates spacer height
 * - Collapses when keyboard is dismissed
 *
 * Features:
 * - iOS Safari keyboard detection
 * - Android Chrome keyboard detection
 * - Smooth height transitions
 * - Configurable min/max heights
 * - Zero-height when keyboard is hidden
 * - Accessibility-friendly (aria-hidden)
 *
 * @example
 * ```tsx
 * // Place at bottom of scrollable container
 * <div className="flex-1 overflow-y-auto">
 *   <ChatMessages />
 *   <VirtualKeyboardSpacer />
 * </div>
 * <ChatInput />
 * ```
 *
 * @example
 * ```tsx
 * // With custom min height for safe area
 * <VirtualKeyboardSpacer
 *   minHeight={34} // iPhone home indicator
 *   maxHeight={400}
 *   transitionDuration={250}
 * />
 * ```
 */
export function VirtualKeyboardSpacer({
  className,
  minHeight = 0,
  maxHeight = 500,
  transitionDuration = 300,
}: VirtualKeyboardSpacerProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Check if visualViewport API is available (iOS Safari, modern browsers)
    if (typeof window === 'undefined' || !window.visualViewport) {
      return
    }

    const visualViewport = window.visualViewport

    const handleResize = () => {
      // Calculate keyboard height based on viewport height difference
      const windowHeight = window.innerHeight
      const viewportHeight = visualViewport.height

      // Keyboard is shown when viewport height is significantly less than window height
      const calculatedHeight = windowHeight - viewportHeight

      // Only set height if keyboard is actually shown
      // (some browsers have small differences even without keyboard)
      if (calculatedHeight > 100) {
        const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, calculatedHeight))
        setKeyboardHeight(constrainedHeight)
      } else {
        setKeyboardHeight(minHeight)
      }
    }

    // Listen for viewport resize (keyboard show/hide)
    visualViewport.addEventListener('resize', handleResize)
    visualViewport.addEventListener('scroll', handleResize)

    // Initial check
    handleResize()

    return () => {
      visualViewport.removeEventListener('resize', handleResize)
      visualViewport.removeEventListener('scroll', handleResize)
    }
  }, [minHeight, maxHeight])

  return (
    <div
      className={cn('w-full', className)}
      style={{
        height: `${keyboardHeight}px`,
        transition: `height ${transitionDuration}ms ease-out`,
      }}
      aria-hidden="true"
      data-keyboard-spacer
    />
  )
}

/**
 * Virtual Keyboard Spacer with Safe Area
 *
 * Variant that automatically includes safe area insets (iPhone notch/home indicator).
 * Useful for fixed bottom elements that need to stay above keyboard and safe areas.
 *
 * @example
 * ```tsx
 * <div className="flex flex-col h-screen">
 *   <ChatMessages />
 *   <ChatInput />
 *   <VirtualKeyboardSpacerSafe />
 * </div>
 * ```
 */
export function VirtualKeyboardSpacerSafe(props: Omit<VirtualKeyboardSpacerProps, 'minHeight'>) {
  // Default minHeight to safe-area-inset-bottom (typically 34px on iPhone X+)
  return (
    <VirtualKeyboardSpacer {...props} minHeight={34} className={cn('pb-safe', props.className)} />
  )
}

/**
 * Hook to detect virtual keyboard visibility
 *
 * Returns keyboard state and height for custom implementations
 *
 * @example
 * ```tsx
 * const { isKeyboardVisible, keyboardHeight } = useVirtualKeyboard()
 *
 * return (
 *   <div className={cn(
 *     'fixed bottom-0',
 *     isKeyboardVisible && 'transform -translate-y-[var(--keyboard-height)]'
 *   )}
 *   style={{ '--keyboard-height': `${keyboardHeight}px` }}
 *   >
 *     <ChatInput />
 *   </div>
 * )
 * ```
 */
export function useVirtualKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return
    }

    const visualViewport = window.visualViewport

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const viewportHeight = visualViewport.height
      const calculatedHeight = windowHeight - viewportHeight

      if (calculatedHeight > 100) {
        setKeyboardHeight(calculatedHeight)
        setIsKeyboardVisible(true)
      } else {
        setKeyboardHeight(0)
        setIsKeyboardVisible(false)
      }
    }

    visualViewport.addEventListener('resize', handleResize)
    visualViewport.addEventListener('scroll', handleResize)

    handleResize()

    return () => {
      visualViewport.removeEventListener('resize', handleResize)
      visualViewport.removeEventListener('scroll', handleResize)
    }
  }, [])

  return {
    isKeyboardVisible,
    keyboardHeight,
  }
}
