/**
 * Mobile Touch Feedback Utilities
 *
 * Standardized touch feedback classes and utilities for consistent
 * mobile interactions across all components.
 *
 * Design Tokens:
 * - Touch targets: 44px minimum (WCAG AAA)
 * - Active scale: 0.95 (subtle feedback)
 * - Transition: 150ms cubic-bezier(0.4, 0, 0.2, 1)
 * - Tap highlight: transparent (iOS)
 *
 * Usage:
 * ```tsx
 * import { touchFeedback, tapTarget } from '@/lib/mobile-touch'
 *
 * <button className={cn(touchFeedback.button, tapTarget.medium)}>
 *   Click me
 * </button>
 * ```
 */

/**
 * Touch Feedback Classes
 *
 * Provides consistent active/pressed states for interactive elements.
 * Uses scale transformation for immediate visual feedback on touch.
 */
export const touchFeedback = {
  /**
   * Primary button feedback
   * - Scale down to 95% on active
   * - Fast transition (150ms)
   * - No tap highlight color (iOS)
   */
  button:
    'active:scale-95 transition-transform duration-150 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * Card/Surface feedback
   * - Subtle scale (98%)
   * - Slightly slower transition (200ms)
   * - For larger tappable areas
   */
  card: 'active:scale-[0.98] transition-transform duration-200 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * Icon button feedback
   * - Same as primary button
   * - Optimized for small circular buttons
   */
  icon: 'active:scale-95 transition-transform duration-150 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * List item feedback
   * - Very subtle scale (99%)
   * - Background highlight on active
   * - For dense lists
   */
  listItem:
    'active:scale-[0.99] active:bg-gray-100 dark:active:bg-gray-800 transition-all duration-150 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * Link feedback
   * - Opacity change instead of scale
   * - Maintains text layout
   */
  link: 'active:opacity-70 transition-opacity duration-150 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * FAB (Floating Action Button) feedback
   * - Moderate scale (97%)
   * - Elevation change simulation
   */
  fab: 'active:scale-97 active:shadow-lg transition-all duration-150 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent]',

  /**
   * Minimal feedback
   * - Only removes tap highlight
   * - For elements with custom feedback
   */
  minimal: 'touch-manipulation [-webkit-tap-highlight-color:transparent]',
} as const

/**
 * Touch Target Sizes
 *
 * Ensures minimum touch target sizes per WCAG AAA (44x44px).
 * Use these classes to guarantee accessible tap targets.
 */
export const tapTarget = {
  /**
   * Small touch target (44x44px)
   * - WCAG AAA minimum
   * - For dense interfaces
   */
  small: 'min-h-[44px] min-w-[44px]',

  /**
   * Medium touch target (48x48px)
   * - iOS Human Interface Guidelines
   * - Recommended default
   */
  medium: 'min-h-[48px] min-w-[48px]',

  /**
   * Large touch target (56x56px)
   * - Material Design guideline
   * - For primary actions
   */
  large: 'min-h-[56px] min-w-[56px]',

  /**
   * Extra large touch target (64x64px)
   * - For FABs and prominent actions
   */
  xlarge: 'min-h-[64px] min-w-[64px]',
} as const

/**
 * Scroll Behavior
 *
 * Optimizes scrolling performance on mobile devices.
 */
export const scrollBehavior = {
  /**
   * Smooth momentum scrolling (iOS)
   * - -webkit-overflow-scrolling: touch
   * - Enables inertia scrolling
   */
  momentum: 'overflow-y-auto [-webkit-overflow-scrolling:touch]',

  /**
   * Prevent overscroll (iOS bounce)
   * - Useful for fixed layouts
   */
  noOverscroll: 'overscroll-none',

  /**
   * Snap to grid while scrolling
   * - For carousels and galleries
   */
  snap: 'snap-x snap-mandatory scroll-smooth',
} as const

/**
 * Safe Areas
 *
 * Respects device notches and home indicators.
 * Use for fixed/absolute positioned elements.
 */
export const safeArea = {
  /**
   * Padding for top safe area (notch)
   */
  top: 'pt-[env(safe-area-inset-top)]',

  /**
   * Padding for bottom safe area (home indicator)
   */
  bottom: 'pb-[env(safe-area-inset-bottom)]',

  /**
   * Padding for left safe area
   */
  left: 'pl-[env(safe-area-inset-left)]',

  /**
   * Padding for right safe area
   */
  right: 'pr-[env(safe-area-inset-right)]',

  /**
   * All safe areas
   */
  all: 'p-[env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]',
} as const

/**
 * Mobile Animations
 *
 * Performance-optimized animations using hardware acceleration.
 */
export const mobileAnimation = {
  /**
   * Fast transition (150ms)
   * - For immediate feedback
   */
  fast: 'transition-all duration-150 ease-out',

  /**
   * Normal transition (300ms)
   * - For most animations
   */
  normal: 'transition-all duration-300 ease-out',

  /**
   * Slow transition (500ms)
   * - For complex animations
   */
  slow: 'transition-all duration-500 ease-out',

  /**
   * Spring animation
   * - Elastic easing
   */
  spring: 'transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',

  /**
   * Hardware accelerated
   * - Forces GPU rendering
   * - For smooth 60fps
   */
  hwAccelerated: 'transform-gpu will-change-transform',
} as const

/**
 * Gesture Hints
 *
 * Visual indicators for swipeable/draggable elements.
 */
export const gestureHint = {
  /**
   * Swipeable indicator
   * - Shows element can be swiped
   */
  swipeable: 'cursor-grab active:cursor-grabbing',

  /**
   * Draggable indicator
   * - Shows element can be dragged
   */
  draggable: 'cursor-move',

  /**
   * Horizontal scroll indicator
   * - For carousels
   */
  horizontalScroll: 'overflow-x-auto snap-x snap-mandatory scroll-smooth',
} as const

/**
 * Helper function to combine touch feedback with custom classes
 *
 * @param feedbackType - Type of touch feedback
 * @param customClasses - Additional classes
 * @returns Combined class string
 *
 * @example
 * ```tsx
 * <button className={withTouchFeedback('button', 'bg-blue-500 text-white')}>
 *   Click me
 * </button>
 * ```
 */
export function withTouchFeedback(
  feedbackType: keyof typeof touchFeedback,
  customClasses?: string
): string {
  return `${touchFeedback[feedbackType]} ${customClasses || ''}`
}

/**
 * Helper function to ensure minimum touch target size
 *
 * @param targetSize - Size preset
 * @param customClasses - Additional classes
 * @returns Combined class string
 *
 * @example
 * ```tsx
 * <button className={withTapTarget('medium', 'rounded-full bg-green-500')}>
 *   +
 * </button>
 * ```
 */
export function withTapTarget(targetSize: keyof typeof tapTarget, customClasses?: string): string {
  return `${tapTarget[targetSize]} ${customClasses || ''}`
}

/**
 * Combines touch feedback, tap target, and custom classes
 *
 * @param options - Configuration object
 * @returns Combined class string
 *
 * @example
 * ```tsx
 * <button className={mobileTouchClasses({
 *   feedback: 'button',
 *   tapTarget: 'medium',
 *   custom: 'bg-blue-500 text-white rounded-lg'
 * })}>
 *   Click me
 * </button>
 * ```
 */
export function mobileTouchClasses(options: {
  feedback: keyof typeof touchFeedback
  tapTarget?: keyof typeof tapTarget
  custom?: string
}): string {
  const classes: string[] = [touchFeedback[options.feedback]]

  if (options.tapTarget) {
    classes.push(tapTarget[options.tapTarget] as string)
  }

  if (options.custom) {
    classes.push(options.custom)
  }

  return classes.join(' ')
}
