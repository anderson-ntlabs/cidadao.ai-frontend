/**
 * useFocusTrap Hook
 *
 * Traps keyboard focus within a container element, essential for accessible
 * modals, dialogs, and dropdown menus. Implements WCAG 2.1 requirements for
 * focus management in overlay components.
 *
 * Features:
 * - Automatic focus trapping when enabled
 * - Escape key to close (optional)
 * - Tab/Shift+Tab cycling through focusable elements
 * - Auto-focus first element on mount
 * - Return focus to trigger element on unmount
 * - Customizable focusable element selectors
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'

export interface FocusTrapOptions {
  /**
   * Whether the focus trap is active
   * @default true
   */
  enabled?: boolean
  /**
   * Whether pressing Escape closes the trap
   * @default true
   */
  escapeDeactivates?: boolean
  /**
   * Callback when Escape is pressed
   */
  onEscape?: () => void
  /**
   * Whether to focus first element on mount
   * @default true
   */
  autoFocus?: boolean
  /**
   * Whether to return focus to trigger element on unmount
   * @default true
   */
  returnFocus?: boolean
  /**
   * Element that triggered the trap (receives focus on unmount)
   */
  triggerElement?: HTMLElement | null
  /**
   * Custom selector for focusable elements
   * @default Default focusable elements selector
   */
  focusableSelector?: string
  /**
   * Initial element to focus (overrides autoFocus behavior)
   */
  initialFocusElement?: HTMLElement | null
}

/**
 * Default selector for focusable elements
 * Includes all interactive elements that can receive keyboard focus
 */
const DEFAULT_FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]'
].join(', ')

/**
 * Trap keyboard focus within a container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap<HTMLDivElement>({
 *     enabled: isOpen,
 *     onEscape: onClose,
 *     returnFocus: true
 *   })
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       <input type="text" />
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: FocusTrapOptions = {}
) {
  const {
    enabled = true,
    escapeDeactivates = true,
    onEscape,
    autoFocus = true,
    returnFocus = true,
    triggerElement,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    initialFocusElement
  } = options

  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  /**
   * Get all focusable elements within container
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    )

    // Filter out elements that are not actually focusable
    return elements.filter(el => {
      // Check if element is visible
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false
      }

      // Check if element or ancestor has inert attribute
      let current: HTMLElement | null = el
      while (current) {
        if (current.hasAttribute('inert') || current.hasAttribute('aria-hidden')) {
          return false
        }
        current = current.parentElement
      }

      return true
    })
  }, [focusableSelector])

  /**
   * Handle Tab key navigation
   */
  const handleTab = useCallback((event: KeyboardEvent) => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement

    // Shift + Tab: move focus backwards
    if (event.shiftKey) {
      if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
        event.preventDefault()
        lastElement.focus()
      }
    }
    // Tab: move focus forwards
    else {
      if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [getFocusableElements])

  /**
   * Handle Escape key
   */
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (escapeDeactivates && onEscape) {
      event.preventDefault()
      onEscape()
    }
  }, [escapeDeactivates, onEscape])

  /**
   * Handle keydown events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    switch (event.key) {
      case 'Tab':
        handleTab(event)
        break
      case 'Escape':
        handleEscape(event)
        break
    }
  }, [enabled, handleTab, handleEscape])

  /**
   * Setup focus trap
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus initial element
    if (autoFocus) {
      const elementToFocus = initialFocusElement || getFocusableElements()[0]
      if (elementToFocus) {
        // Use setTimeout to ensure element is rendered
        setTimeout(() => {
          elementToFocus.focus()
        }, 0)
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Return focus to previous element
      if (returnFocus && previousActiveElement.current) {
        const elementToFocus = triggerElement || previousActiveElement.current

        // Use setTimeout to ensure trap is deactivated
        setTimeout(() => {
          if (elementToFocus && document.body.contains(elementToFocus)) {
            elementToFocus.focus()
          }
        }, 0)
      }
    }
  }, [
    enabled,
    autoFocus,
    returnFocus,
    triggerElement,
    initialFocusElement,
    handleKeyDown,
    getFocusableElements
  ])

  return containerRef
}

/**
 * Hook for creating a focus trap with more control
 * Returns functions to manually control the trap
 *
 * @example
 * ```tsx
 * function CustomDialog() {
 *   const { containerRef, activate, deactivate } = useControlledFocusTrap()
 *
 *   return (
 *     <div ref={containerRef}>
 *       <button onClick={activate}>Open Dialog</button>
 *       <button onClick={deactivate}>Close Dialog</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useControlledFocusTrap<T extends HTMLElement = HTMLElement>(
  options: Omit<FocusTrapOptions, 'enabled'> = {}
) {
  const [isActive, setIsActive] = useState(false)

  const containerRef = useFocusTrap<T>({
    ...options,
    enabled: isActive
  })

  const activate = useCallback(() => setIsActive(true), [])
  const deactivate = useCallback(() => setIsActive(false), [])

  return {
    containerRef,
    isActive,
    activate,
    deactivate
  }
}
