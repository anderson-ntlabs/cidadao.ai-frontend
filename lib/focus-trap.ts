export class FocusTrap {
  private element: HTMLElement
  private focusableElements: HTMLElement[] = []
  private firstFocusableElement: HTMLElement | null = null
  private lastFocusableElement: HTMLElement | null = null
  private onEscape?: () => void

  constructor(element: HTMLElement, options: { onEscape?: () => void } = {}) {
    this.element = element
    this.onEscape = options.onEscape
    this.updateFocusableElements()
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ]

    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors.join(','))
    ) as HTMLElement[]

    this.firstFocusableElement = this.focusableElements[0] || null
    this.lastFocusableElement = 
      this.focusableElements[this.focusableElements.length - 1] || null
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      this.handleTab(e)
    } else if (e.key === 'Escape' && this.onEscape) {
      this.onEscape()
    }
  }

  private handleTab(e: KeyboardEvent) {
    if (!this.firstFocusableElement || !this.lastFocusableElement) return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault()
        this.lastFocusableElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault()
        this.firstFocusableElement.focus()
      }
    }
  }

  activate() {
    this.updateFocusableElements()
    
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus()
    }

    document.addEventListener('keydown', this.handleKeyDown)
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}

// Hook version
import { useEffect, useRef } from 'react'

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  options: { onEscape?: () => void } = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const trap = new FocusTrap(ref.current, options)
    trap.activate()

    return () => {
      trap.deactivate()
    }
  }, [active, options])

  return ref
}