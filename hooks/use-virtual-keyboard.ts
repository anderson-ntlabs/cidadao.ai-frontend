/**
 * Virtual Keyboard Detection Hook
 *
 * Detects virtual keyboard open/close and provides keyboard height.
 * Works across iOS (visualViewport API) and Android (resize events).
 *
 * Usage:
 * ```tsx
 * function ChatInput() {
 *   const { isOpen, height } = useVirtualKeyboard()
 *
 *   return (
 *     <div style={{ paddingBottom: isOpen ? height : 0 }}>
 *       <input />
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { isIOS, isAndroid } from '@/lib/utils/mobile-detection'

export interface VirtualKeyboardState {
  /** Whether the virtual keyboard is currently open */
  isOpen: boolean

  /** Height of the virtual keyboard in pixels */
  height: number

  /** Scroll an element into view (useful when keyboard opens) */
  scrollIntoView: (element: HTMLElement | null) => void
}

/**
 * Threshold for keyboard detection (in pixels)
 * Height difference must be > this value to count as keyboard
 */
const KEYBOARD_THRESHOLD = 100

/**
 * Hook for detecting and managing virtual keyboard state
 *
 * @example
 * ```tsx
 * function MobileChat() {
 *   const { isOpen, height, scrollIntoView } = useVirtualKeyboard()
 *   const inputRef = useRef<HTMLInputElement>(null)
 *
 *   useEffect(() => {
 *     if (isOpen) {
 *       scrollIntoView(inputRef.current)
 *     }
 *   }, [isOpen, scrollIntoView])
 *
 *   return (
 *     <div style={{ paddingBottom: height }}>
 *       <input ref={inputRef} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useVirtualKeyboard(): VirtualKeyboardState {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(0)

  // Store initial viewport height for Android detection
  const initialHeightRef = useRef<number>(0)

  // Scroll element into view when keyboard opens
  const scrollIntoView = useCallback((element: HTMLElement | null) => {
    if (!element) return

    // Use scrollIntoView with smooth behavior
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })

    // For iOS, also try to adjust viewport
    if (isIOS() && 'visualViewport' in window) {
      const viewport = window.visualViewport as any
      const elementRect = element.getBoundingClientRect()
      const viewportTop = viewport.pageTop
      const targetScrollTop = viewportTop + elementRect.top - viewport.height / 2

      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    // Server-side: no keyboard
    if (typeof window === 'undefined') return

    // Store initial height for Android
    initialHeightRef.current = window.innerHeight

    // iOS: Use visualViewport API (more reliable)
    if (isIOS() && 'visualViewport' in window) {
      const viewport = window.visualViewport as any

      const handleResize = () => {
        const windowHeight = window.innerHeight
        const viewportHeight = viewport.height
        const keyboardHeight = windowHeight - viewportHeight

        setHeight(keyboardHeight)
        setIsOpen(keyboardHeight > KEYBOARD_THRESHOLD)
      }

      viewport.addEventListener('resize', handleResize)
      viewport.addEventListener('scroll', handleResize)

      // Initial check
      handleResize()

      return () => {
        viewport.removeEventListener('resize', handleResize)
        viewport.removeEventListener('scroll', handleResize)
      }
    }

    // Android: Use window resize events
    if (isAndroid()) {
      const handleResize = () => {
        const currentHeight = window.innerHeight
        const diff = initialHeightRef.current - currentHeight

        // Positive diff means keyboard is open
        if (diff > KEYBOARD_THRESHOLD) {
          setHeight(diff)
          setIsOpen(true)
        } else {
          setHeight(0)
          setIsOpen(false)

          // Update initial height when keyboard closes
          // (handles address bar auto-hide on Chrome Android)
          if (diff < 0) {
            initialHeightRef.current = currentHeight
          }
        }
      }

      window.addEventListener('resize', handleResize)

      // Initial check
      handleResize()

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    // Other platforms: Basic window resize detection
    const handleResize = () => {
      const currentHeight = window.innerHeight
      const diff = initialHeightRef.current - currentHeight

      if (diff > KEYBOARD_THRESHOLD) {
        setHeight(diff)
        setIsOpen(true)
      } else {
        setHeight(0)
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    isOpen,
    height,
    scrollIntoView,
  }
}

/**
 * Hook for managing input focus with keyboard handling
 *
 * Automatically scrolls input into view when focused and keyboard opens
 *
 * @example
 * ```tsx
 * function ChatInput() {
 *   const { ref, isFocused } = useKeyboardAwareInput<HTMLInputElement>()
 *
 *   return (
 *     <input
 *       ref={ref}
 *       className={isFocused ? 'focused' : ''}
 *     />
 *   )
 * }
 * ```
 */
export function useKeyboardAwareInput<T extends HTMLElement = HTMLInputElement>() {
  const [isFocused, setIsFocused] = useState(false)
  const ref = useRef<T>(null)
  const { scrollIntoView } = useVirtualKeyboard()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleFocus = () => {
      setIsFocused(true)

      // Delay to allow keyboard to start opening
      setTimeout(() => {
        scrollIntoView(element)
      }, 100)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [scrollIntoView])

  return {
    ref,
    isFocused,
  }
}

/**
 * Hook for preventing body scroll when keyboard is open
 *
 * Useful to prevent background scrolling while typing
 *
 * @example
 * ```tsx
 * function MobileChat() {
 *   usePreventScrollWhenKeyboardOpen()
 *
 *   return <ChatInterface />
 * }
 * ```
 */
export function usePreventScrollWhenKeyboardOpen() {
  const { isOpen } = useVirtualKeyboard()

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (isOpen) {
      // Prevent body scroll
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
      }
    }
  }, [isOpen])
}

/**
 * Calculate safe height for fixed positioned elements
 *
 * Returns height that accounts for keyboard and safe areas
 *
 * @param baseHeight Base height in viewport units or pixels
 * @returns Calculated height as CSS string
 *
 * @example
 * ```tsx
 * function ChatContainer() {
 *   const { isOpen, height } = useVirtualKeyboard()
 *   const safeHeight = useSafeHeight('100dvh', isOpen, height)
 *
 *   return (
 *     <div style={{ height: safeHeight }}>
 *       ...
 *     </div>
 *   )
 * }
 * ```
 */
export function useSafeHeight(
  baseHeight: string,
  keyboardOpen: boolean,
  keyboardHeight: number
): string {
  const [safeHeight, setSafeHeight] = useState(baseHeight)

  useEffect(() => {
    if (keyboardOpen && keyboardHeight > 0) {
      // Subtract keyboard height from viewport
      if (baseHeight.includes('dvh')) {
        setSafeHeight(`calc(100dvh - ${keyboardHeight}px)`)
      } else if (baseHeight.includes('vh')) {
        setSafeHeight(`calc(100vh - ${keyboardHeight}px)`)
      } else {
        setSafeHeight(`calc(${baseHeight} - ${keyboardHeight}px)`)
      }
    } else {
      setSafeHeight(baseHeight)
    }
  }, [baseHeight, keyboardOpen, keyboardHeight])

  return safeHeight
}
