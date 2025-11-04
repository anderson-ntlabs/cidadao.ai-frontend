'use client'

import { useCallback } from 'react'

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'

/**
 * Haptic Feedback Hook
 *
 * Provides haptic vibration feedback for iOS and Android devices.
 * Uses Vibration API with fallback for unsupported devices.
 *
 * Vibration patterns:
 * - light: 10ms (tap confirmation)
 * - medium: 20ms (button press)
 * - heavy: 30ms (significant action)
 * - selection: 5ms (scrolling through options)
 * - success: [10, 50, 10] (two quick taps)
 * - warning: [20, 100, 20] (two medium taps)
 * - error: [30, 100, 30, 100, 30] (three heavy taps)
 *
 * @returns {Object} Haptic feedback functions
 *
 * @example
 * ```tsx
 * function HapticButton() {
 *   const { vibrate, canVibrate } = useHaptic()
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         vibrate('light')
 *         handleClick()
 *       }}
 *     >
 *       Tap me {canVibrate ? '📳' : ''}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In navigation component
 * function MobileNav() {
 *   const { vibrate } = useHaptic()
 *   const router = useRouter()
 *
 *   const handleNavigation = (path: string) => {
 *     vibrate('light') // Haptic feedback on tap
 *     router.push(path)
 *   }
 *
 *   return (
 *     <nav>
 *       <button onClick={() => handleNavigation('/dashboard')}>
 *         Dashboard
 *       </button>
 *     </nav>
 *   )
 * }
 * ```
 */
export function useHaptic() {
  // Check if Vibration API is supported
  const canVibrate =
    typeof window !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'

  /**
   * Trigger haptic vibration
   *
   * @param type - Type of haptic feedback
   */
  const vibrate = useCallback(
    (type: HapticFeedbackType = 'light') => {
      if (!canVibrate) return

      // Define vibration patterns
      const patterns: Record<HapticFeedbackType, number | number[]> = {
        light: 10, // Quick tap
        medium: 20, // Button press
        heavy: 30, // Significant action
        selection: 5, // Picker/scroll feedback
        success: [10, 50, 10], // Two quick taps
        warning: [20, 100, 20], // Two medium taps
        error: [30, 100, 30, 100, 30], // Three heavy taps
      }

      const pattern = patterns[type]

      try {
        navigator.vibrate(pattern)
      } catch (error) {
        // Silently fail on unsupported devices
        console.debug('Haptic feedback not supported:', error)
      }
    },
    [canVibrate]
  )

  /**
   * Cancel ongoing vibration
   */
  const cancel = useCallback(() => {
    if (!canVibrate) return

    try {
      navigator.vibrate(0)
    } catch (error) {
      console.debug('Cannot cancel vibration:', error)
    }
  }, [canVibrate])

  /**
   * Custom vibration pattern
   *
   * @param pattern - Array of vibration/pause durations in ms
   *
   * @example
   * ```tsx
   * // Custom pattern: 50ms vibrate, 100ms pause, 50ms vibrate
   * vibrateCustom([50, 100, 50])
   * ```
   */
  const vibrateCustom = useCallback(
    (pattern: number[]) => {
      if (!canVibrate) return

      try {
        navigator.vibrate(pattern)
      } catch (error) {
        console.debug('Custom vibration failed:', error)
      }
    },
    [canVibrate]
  )

  return {
    /** Trigger haptic feedback */
    vibrate,
    /** Cancel ongoing vibration */
    cancel,
    /** Custom vibration pattern */
    vibrateCustom,
    /** Whether device supports haptic feedback */
    canVibrate,
  }
}

/**
 * Helper function to add haptic feedback to onClick handlers
 *
 * @example
 * ```tsx
 * import { useHaptic } from '@/hooks/use-haptic'
 *
 * function MyButton() {
 *   const { vibrate } = useHaptic()
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         vibrate('medium')
 *         handleClick()
 *       }}
 *     >
 *       Click me
 *     </button>
 *   )
 * }
 * ```
 */
