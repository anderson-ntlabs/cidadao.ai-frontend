'use client'

import { cn } from '@/lib/utils'

export interface SafeAreaViewProps {
  /** Child elements */
  children: React.ReactNode
  /** Custom class name */
  className?: string
  /** Apply top safe area inset (default: true) */
  top?: boolean
  /** Apply bottom safe area inset (default: true) */
  bottom?: boolean
  /** Apply left safe area inset (default: true) */
  left?: boolean
  /** Apply right safe area inset (default: true) */
  right?: boolean
  /** Use padding instead of margin (default: true) */
  usePadding?: boolean
  /** HTML element type (default: 'div') */
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer'
}

/**
 * Safe Area View Component
 *
 * Wrapper component that handles safe area insets for notched devices (iPhone X+, Android with notches).
 * Ensures content doesn't render behind system UI elements like notches, status bars, and home indicators.
 *
 * How it works:
 * - Uses CSS env(safe-area-inset-*) variables
 * - Supports iOS, iPadOS, and modern Android devices
 * - Configurable per-edge (top, bottom, left, right)
 * - Can use padding or margin
 *
 * Safe Area Insets (typical values):
 * - Top: 44px (status bar) or 47px (Dynamic Island on iPhone 14 Pro+)
 * - Bottom: 34px (home indicator on iPhone X+)
 * - Left/Right: 0px (portrait) or 44px (landscape on notched iPhones)
 *
 * Features:
 * - Automatic safe area detection
 * - Configurable per edge
 * - Padding or margin mode
 * - Semantic HTML support
 * - Tailwind CSS integration
 * - Zero overhead on non-notched devices
 *
 * @example
 * ```tsx
 * // Full safe area (top + bottom + left + right)
 * <SafeAreaView>
 *   <Header />
 *   <Content />
 * </SafeAreaView>
 * ```
 *
 * @example
 * ```tsx
 * // Only top safe area (for fixed headers)
 * <SafeAreaView top bottom={false} left={false} right={false}>
 *   <Header />
 * </SafeAreaView>
 * ```
 *
 * @example
 * ```tsx
 * // Only bottom safe area (for fixed footers/navigation)
 * <SafeAreaView bottom top={false} left={false} right={false} as="footer">
 *   <BottomNav />
 * </SafeAreaView>
 * ```
 *
 * @example
 * ```tsx
 * // Use margin instead of padding
 * <SafeAreaView usePadding={false} className="bg-white">
 *   <Content />
 * </SafeAreaView>
 * ```
 */
export function SafeAreaView({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true,
  usePadding = true,
  as: Component = 'div',
}: SafeAreaViewProps) {
  const property = usePadding ? 'padding' : 'margin'

  const styles: React.CSSProperties = {
    ...(top && { [`${property}Top`]: 'env(safe-area-inset-top)' }),
    ...(bottom && { [`${property}Bottom`]: 'env(safe-area-inset-bottom)' }),
    ...(left && { [`${property}Left`]: 'env(safe-area-inset-left)' }),
    ...(right && { [`${property}Right`]: 'env(safe-area-inset-right)' }),
  }

  return (
    <Component className={cn(className)} style={styles}>
      {children}
    </Component>
  )
}

/**
 * Safe Area Top
 *
 * Convenient component for top-only safe area (status bar/notch).
 * Perfect for fixed headers and navigation bars.
 *
 * @example
 * ```tsx
 * <SafeAreaTop className="fixed top-0 left-0 right-0 bg-white">
 *   <Header />
 * </SafeAreaTop>
 * ```
 */
export function SafeAreaTop({
  children,
  className,
  ...props
}: Omit<SafeAreaViewProps, 'top' | 'bottom' | 'left' | 'right'>) {
  return (
    <SafeAreaView top bottom={false} left={false} right={false} className={className} {...props}>
      {children}
    </SafeAreaView>
  )
}

/**
 * Safe Area Bottom
 *
 * Convenient component for bottom-only safe area (home indicator).
 * Perfect for fixed footers and bottom navigation.
 *
 * @example
 * ```tsx
 * <SafeAreaBottom className="fixed bottom-0 left-0 right-0 bg-white">
 *   <BottomNav />
 * </SafeAreaBottom>
 * ```
 */
export function SafeAreaBottom({
  children,
  className,
  ...props
}: Omit<SafeAreaViewProps, 'top' | 'bottom' | 'left' | 'right'>) {
  return (
    <SafeAreaView bottom top={false} left={false} right={false} className={className} {...props}>
      {children}
    </SafeAreaView>
  )
}

/**
 * Safe Area Horizontal
 *
 * Convenient component for left+right safe areas.
 * Useful for landscape mode on notched devices.
 *
 * @example
 * ```tsx
 * <SafeAreaHorizontal className="flex flex-row">
 *   <Sidebar />
 *   <Content />
 * </SafeAreaHorizontal>
 * ```
 */
export function SafeAreaHorizontal({
  children,
  className,
  ...props
}: Omit<SafeAreaViewProps, 'top' | 'bottom' | 'left' | 'right'>) {
  return (
    <SafeAreaView left right top={false} bottom={false} className={className} {...props}>
      {children}
    </SafeAreaView>
  )
}

/**
 * Hook to get safe area inset values
 *
 * Returns current safe area insets in pixels.
 * Useful for dynamic calculations or custom implementations.
 *
 * @example
 * ```tsx
 * const { top, bottom, left, right } = useSafeAreaInsets()
 *
 * return (
 *   <div style={{ paddingTop: top, paddingBottom: bottom }}>
 *     Content with safe areas
 *   </div>
 * )
 * ```
 */
export function useSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const computedStyle = getComputedStyle(document.documentElement)

  const parseInset = (value: string): number => {
    return parseInt(value.replace('px', '')) || 0
  }

  return {
    top: parseInset(computedStyle.getPropertyValue('--safe-area-inset-top')),
    bottom: parseInset(computedStyle.getPropertyValue('--safe-area-inset-bottom')),
    left: parseInset(computedStyle.getPropertyValue('--safe-area-inset-left')),
    right: parseInset(computedStyle.getPropertyValue('--safe-area-inset-right')),
  }
}
