'use client'

import { useEffect, useState } from 'react'

/**
 * Viewport Height Hook (iOS Safari Fix)
 *
 * Solves the infamous iOS Safari address bar problem where viewport height
 * changes as the user scrolls (address bar hides/shows).
 *
 * Returns a stable viewport height that accounts for the address bar,
 * preventing layout jumps and content shifting.
 *
 * @returns {number} Stable viewport height in pixels
 *
 * @example
 * ```tsx
 * const viewportHeight = useViewportHeight()
 *
 * return (
 *   <div style={{ height: `${viewportHeight}px` }}>
 *     <FullScreenComponent />
 *   </div>
 * )
 * ```
 *
 * @example
 * ```tsx
 * // With Tailwind (use CSS custom property)
 * const viewportHeight = useViewportHeight()
 *
 * useEffect(() => {
 *   document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
 * }, [viewportHeight])
 *
 * // In CSS: height: calc(var(--vh, 1vh) * 100)
 * ```
 */
export function useViewportHeight(): number {
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const updateHeight = () => {
      // Prefer visualViewport API (iOS Safari 13+)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        // Fallback to window.innerHeight
        setViewportHeight(window.innerHeight)
      }
    }

    // Initial measurement
    updateHeight()

    // Update on resize (address bar show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight)
      window.visualViewport.addEventListener('scroll', updateHeight)
    } else {
      window.addEventListener('resize', updateHeight)
    }

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight)
        window.visualViewport.removeEventListener('scroll', updateHeight)
      } else {
        window.removeEventListener('resize', updateHeight)
      }
    }
  }, [])

  return viewportHeight
}

/**
 * Apply viewport height as CSS custom property
 *
 * Sets --vh CSS variable that can be used in stylesheets
 * to create stable full-height layouts on iOS Safari.
 *
 * @example
 * ```tsx
 * function App() {
 *   useViewportHeightCSS()
 *
 *   return <div className="h-screen-ios">Content</div>
 * }
 *
 * // tailwind.config.js
 * theme: {
 *   extend: {
 *     height: {
 *       'screen-ios': 'calc(var(--vh, 1vh) * 100)',
 *     }
 *   }
 * }
 * ```
 */
export function useViewportHeightCSS(): void {
  const viewportHeight = useViewportHeight()

  useEffect(() => {
    if (viewportHeight > 0) {
      // Set CSS custom property (--vh = 1% of viewport height)
      document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
    }
  }, [viewportHeight])
}
