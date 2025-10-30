/**
 * useKeyboardShortcuts Hook
 *
 * Provides a declarative API for registering global keyboard shortcuts.
 * Handles common patterns like Ctrl/Cmd key detection, preventing defaults,
 * and cleaning up event listeners.
 *
 * Features:
 * - Cross-platform (Ctrl on Windows/Linux, Cmd on Mac)
 * - Automatic cleanup
 * - Modifier key support (ctrl, alt, shift, meta)
 * - Prevents default browser behavior
 * - Disabled state support
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  /**
   * The key to listen for (e.g., 'k', 'Enter', 'Escape')
   */
  key: string
  /**
   * Callback function when shortcut is triggered
   */
  callback: (event: KeyboardEvent) => void
  /**
   * Optional description for accessibility/documentation
   */
  description?: string
  /**
   * Modifier keys
   */
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  /**
   * Prevent default browser behavior
   * @default true
   */
  preventDefault?: boolean
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean
}

/**
 * Register a single keyboard shortcut
 *
 * @example
 * ```tsx
 * useKeyboardShortcut({
 *   key: 'k',
 *   ctrl: true,
 *   callback: () => openSearch(),
 *   description: 'Open search'
 * })
 * ```
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  const {
    key,
    callback,
    ctrl = false,
    alt = false,
    shift = false,
    meta = false,
    preventDefault = true,
    disabled = false
  } = shortcut

  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if all modifiers match
      const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const altMatch = alt ? event.altKey : !event.altKey
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey
      const metaMatch = meta ? event.metaKey : !event.metaKey

      // Check if key matches (case insensitive)
      const keyMatch = event.key.toLowerCase() === key.toLowerCase()

      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        if (preventDefault) {
          event.preventDefault()
        }
        callbackRef.current(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, ctrl, alt, shift, meta, preventDefault, disabled])
}

/**
 * Register multiple keyboard shortcuts at once
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'k', ctrl: true, callback: openSearch },
 *   { key: 'n', ctrl: true, callback: createNew },
 *   { key: 'Escape', callback: closeModal }
 * ])
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts)

  // Keep shortcuts ref up to date
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        if (shortcut.disabled) continue

        const {
          key,
          callback,
          ctrl = false,
          alt = false,
          shift = false,
          meta = false,
          preventDefault = true
        } = shortcut

        // Check if all modifiers match
        const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
        const altMatch = alt ? event.altKey : !event.altKey
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey
        const metaMatch = meta ? event.metaKey : !event.metaKey

        // Check if key matches (case insensitive)
        const keyMatch = event.key.toLowerCase() === key.toLowerCase()

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (preventDefault) {
            event.preventDefault()
          }
          callback(event)
          break // Only trigger first matching shortcut
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

/**
 * Common keyboard shortcuts as constants
 */
export const COMMON_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  NEW: { key: 'n', ctrl: true, description: 'Create new' },
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  CLOSE: { key: 'Escape', description: 'Close/Cancel' },
  HELP: { key: '?', shift: true, description: 'Show help' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
} as const

/**
 * Hook for common shortcuts with predefined callbacks
 *
 * @example
 * ```tsx
 * useCommonShortcuts({
 *   onSearch: () => setSearchOpen(true),
 *   onNew: () => createNewItem(),
 *   onClose: () => closeModal()
 * })
 * ```
 */
export function useCommonShortcuts(config: {
  onSearch?: () => void
  onNew?: () => void
  onSave?: () => void
  onClose?: () => void
  onHelp?: () => void
  onUndo?: () => void
  onRedo?: () => void
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (config.onSearch) {
    shortcuts.push({ ...COMMON_SHORTCUTS.SEARCH, callback: config.onSearch })
  }
  if (config.onNew) {
    shortcuts.push({ ...COMMON_SHORTCUTS.NEW, callback: config.onNew })
  }
  if (config.onSave) {
    shortcuts.push({ ...COMMON_SHORTCUTS.SAVE, callback: config.onSave })
  }
  if (config.onClose) {
    shortcuts.push({ ...COMMON_SHORTCUTS.CLOSE, callback: config.onClose })
  }
  if (config.onHelp) {
    shortcuts.push({ ...COMMON_SHORTCUTS.HELP, callback: config.onHelp })
  }
  if (config.onUndo) {
    shortcuts.push({ ...COMMON_SHORTCUTS.UNDO, callback: config.onUndo })
  }
  if (config.onRedo) {
    shortcuts.push({ ...COMMON_SHORTCUTS.REDO, callback: config.onRedo })
  }

  useKeyboardShortcuts(shortcuts)
}

/**
 * Format shortcut for display (e.g., "Ctrl+K" or "⌘K" on Mac)
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'callback'>): string {
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
  const parts: string[] = []

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  if (shortcut.meta) {
    parts.push('⌘')
  }

  // Capitalize first letter of key
  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1)

  parts.push(key)

  return parts.join(isMac ? '' : '+')
}
