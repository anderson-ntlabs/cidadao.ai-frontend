/**
 * useFocusReturn Hook
 *
 * Saves the currently focused element and returns focus to it when the component
 * unmounts or when manually triggered. Essential for accessible modals, dropdowns,
 * and overlay components that temporarily take focus.
 *
 * Features:
 * - Automatic focus save on mount
 * - Focus return on unmount
 * - Manual focus return trigger
 * - Element validation before focusing
 * - Fallback to body if element no longer exists
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface FocusReturnOptions {
  /**
   * Whether to return focus on unmount
   * @default true
   */
  returnOnUnmount?: boolean
  /**
   * Element to return focus to (overrides saved element)
   */
  elementToFocus?: HTMLElement | null
  /**
   * Delay before returning focus (in milliseconds)
   * Useful for allowing transitions to complete
   * @default 0
   */
  returnDelay?: number
  /**
   * Callback when focus is returned
   */
  onFocusReturn?: (element: HTMLElement) => void
}

/**
 * Save currently focused element and return focus when component unmounts
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const returnFocus = useFocusReturn({
 *     returnOnUnmount: true
 *   })
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div role="dialog">
 *       <button onClick={() => {
 *         onClose()
 *         returnFocus() // Manually return focus before closing
 *       }}>
 *         Close
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusReturn(options: FocusReturnOptions = {}) {
  const {
    returnOnUnmount = true,
    elementToFocus,
    returnDelay = 0,
    onFocusReturn
  } = options

  const savedElement = useRef<HTMLElement | null>(null)
  const onFocusReturnRef = useRef(onFocusReturn)

  // Keep callback ref up to date
  useEffect(() => {
    onFocusReturnRef.current = onFocusReturn
  }, [onFocusReturn])

  /**
   * Check if element is still in DOM and focusable
   */
  const isElementFocusable = useCallback((element: HTMLElement | null): element is HTMLElement => {
    if (!element) return false
    if (!document.body.contains(element)) return false

    // Check if element or ancestor is inert or hidden
    let current: HTMLElement | null = element
    while (current) {
      const style = window.getComputedStyle(current)
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false
      }
      if (current.hasAttribute('inert') || current.hasAttribute('aria-hidden')) {
        return false
      }
      current = current.parentElement
    }

    return true
  }, [])

  /**
   * Return focus to saved element or provided element
   */
  const returnFocus = useCallback(() => {
    const elementToReturn = elementToFocus || savedElement.current

    const doFocus = () => {
      if (elementToReturn && isElementFocusable(elementToReturn)) {
        elementToReturn.focus()
        onFocusReturnRef.current?.(elementToReturn)
      } else if (document.body) {
        // Fallback to body if saved element is no longer available
        document.body.focus()
      }
    }

    if (returnDelay > 0) {
      setTimeout(doFocus, returnDelay)
    } else {
      doFocus()
    }
  }, [elementToFocus, isElementFocusable, returnDelay])

  /**
   * Save currently focused element on mount
   */
  useEffect(() => {
    if (!elementToFocus) {
      savedElement.current = document.activeElement as HTMLElement
    }

    // Return focus on unmount if enabled
    return () => {
      if (returnOnUnmount) {
        returnFocus()
      }
    }
  }, [returnOnUnmount, returnFocus, elementToFocus])

  return returnFocus
}

/**
 * Hook for managing focus return with more control
 * Provides separate save and return functions
 *
 * @example
 * ```tsx
 * function Popover({ trigger }) {
 *   const { save, restore, savedElement } = useControlledFocusReturn()
 *
 *   const handleOpen = () => {
 *     save() // Save focus before opening
 *     // ... open popover
 *   }
 *
 *   const handleClose = () => {
 *     // ... close popover
 *     restore() // Return focus after closing
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleOpen}>Open Popover</button>
 *       {/* popover content *\/}
 *     </div>
 *   )
 * }
 * ```
 */
export function useControlledFocusReturn(options: Omit<FocusReturnOptions, 'returnOnUnmount'> = {}) {
  const {
    elementToFocus,
    returnDelay = 0,
    onFocusReturn
  } = options

  const savedElement = useRef<HTMLElement | null>(null)
  const onFocusReturnRef = useRef(onFocusReturn)

  // Keep callback ref up to date
  useEffect(() => {
    onFocusReturnRef.current = onFocusReturn
  }, [onFocusReturn])

  /**
   * Check if element is still in DOM and focusable
   */
  const isElementFocusable = useCallback((element: HTMLElement | null): element is HTMLElement => {
    if (!element) return false
    if (!document.body.contains(element)) return false

    let current: HTMLElement | null = element
    while (current) {
      const style = window.getComputedStyle(current)
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false
      }
      if (current.hasAttribute('inert') || current.hasAttribute('aria-hidden')) {
        return false
      }
      current = current.parentElement
    }

    return true
  }, [])

  /**
   * Manually save the currently focused element
   */
  const save = useCallback(() => {
    savedElement.current = document.activeElement as HTMLElement
  }, [])

  /**
   * Restore focus to saved element
   */
  const restore = useCallback(() => {
    const elementToReturn = elementToFocus || savedElement.current

    const doFocus = () => {
      if (elementToReturn && isElementFocusable(elementToReturn)) {
        elementToReturn.focus()
        onFocusReturnRef.current?.(elementToReturn)
      } else if (document.body) {
        document.body.focus()
      }
    }

    if (returnDelay > 0) {
      setTimeout(doFocus, returnDelay)
    } else {
      doFocus()
    }
  }, [elementToFocus, isElementFocusable, returnDelay])

  return {
    save,
    restore,
    savedElement: savedElement.current
  }
}

/**
 * Hook for managing focus within a specific container
 * Useful for roving tabindex implementations
 *
 * @example
 * ```tsx
 * function Toolbar() {
 *   const { focusFirst, focusLast, focusNext, focusPrevious } = useFocusManagement()
 *
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     switch (e.key) {
 *       case 'Home':
 *         focusFirst()
 *         break
 *       case 'End':
 *         focusLast()
 *         break
 *       case 'ArrowRight':
 *         focusNext()
 *         break
 *       case 'ArrowLeft':
 *         focusPrevious()
 *         break
 *     }
 *   }
 *
 *   return (
 *     <div role="toolbar" onKeyDown={handleKeyDown}>
 *       <button>Button 1</button>
 *       <button>Button 2</button>
 *       <button>Button 3</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusManagement(containerRef: React.RefObject<HTMLElement>) {
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(focusableSelector))
  }, [containerRef, focusableSelector])

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    }
  }, [getFocusableElements])

  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  const focusNext = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex === -1) {
      focusFirst()
    } else if (currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus()
    } else {
      // Wrap around to first element
      elements[0].focus()
    }
  }, [getFocusableElements, focusFirst])

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements()
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex === -1) {
      focusLast()
    } else if (currentIndex > 0) {
      elements[currentIndex - 1].focus()
    } else {
      // Wrap around to last element
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements, focusLast])

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements
  }
}
