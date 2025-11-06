'use client'

import { useEffect, useState } from 'react'

/**
 * Mobile Keyboard Detection Hook
 *
 * Detects when the virtual keyboard is visible on mobile devices (iOS/Android)
 * and returns the keyboard height for proper layout adjustments.
 *
 * Use Case: Chat input remains visible when keyboard appears on iOS Safari
 *
 * @returns {Object} Keyboard state
 * @returns {number} keyboardHeight - Height of virtual keyboard in pixels
 * @returns {boolean} isKeyboardVisible - Whether keyboard is currently visible
 *
 * @example
 * ```tsx
 * const { keyboardHeight, isKeyboardVisible } = useMobileKeyboard()
 *
 * return (
 *   <div style={{ paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0' }}>
 *     <ChatInput />
 *   </div>
 * )
 * ```
 */
export function useMobileKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // iOS Safari: Use visualViewport API (most reliable)
    if (window.visualViewport) {
      const handleResize = () => {
        const viewport = window.visualViewport
        if (!viewport) return

        // Calculate keyboard height (difference between window and viewport)
        const keyboardHeight = window.innerHeight - viewport.height

        setKeyboardHeight(keyboardHeight)
        setIsKeyboardVisible(keyboardHeight > 100) // Threshold: 100px
      }

      // Initial check
      handleResize()

      // Listen for viewport changes
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)

      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
        window.visualViewport?.removeEventListener('scroll', handleResize)
      }
    }

    // Fallback for older browsers (Android Chrome < 61)
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const baseHeight = document.documentElement.clientHeight

      const keyboardHeight = baseHeight - currentHeight
      setKeyboardHeight(Math.max(0, keyboardHeight))
      setIsKeyboardVisible(keyboardHeight > 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    keyboardHeight,
    isKeyboardVisible,
  }
}
