/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useFocusTrap, useControlledFocusTrap } from '../use-focus-trap'
import React from 'react'

// Test component that uses the focus trap
function TestDialog({
  isOpen,
  onClose,
  options = {}
}: {
  isOpen: boolean
  onClose: () => void
  options?: Parameters<typeof useFocusTrap>[0]
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    onEscape: onClose,
    ...options
  })

  if (!isOpen) return null

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" data-testid="dialog">
      <button data-testid="button-1">Button 1</button>
      <button data-testid="button-2">Button 2</button>
      <button data-testid="button-3" onClick={onClose}>Close</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  let onClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onClose = vi.fn()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders with focus trap enabled', () => {
      const { getByTestId } = render(
        <TestDialog isOpen={true} onClose={onClose} />
      )

      expect(getByTestId('dialog')).toBeInTheDocument()
    })

    it('does not render when disabled', () => {
      const { queryByTestId } = render(
        <TestDialog isOpen={false} onClose={onClose} />
      )

      expect(queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Auto Focus', () => {
    it('focuses first button by default', async () => {
      const { getByTestId } = render(
        <TestDialog isOpen={true} onClose={onClose} />
      )

      // Wait for focus to be applied
      await waitFor(() => {
        expect(document.activeElement).toBe(getByTestId('button-1'))
      })
    })

    it('does not auto focus when autoFocus is false', async () => {
      const previousActiveElement = document.activeElement

      render(
        <TestDialog
          isOpen={true}
          onClose={onClose}
          options={{ autoFocus: false }}
        />
      )

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 20))

      // Focus should not have changed
      expect(document.activeElement).toBe(previousActiveElement)
    })
  })

  describe('Escape Key Handling', () => {
    it('calls onClose when Escape is pressed', async () => {
      const { getByTestId } = render(
        <TestDialog isOpen={true} onClose={onClose} />
      )

      await waitFor(() => {
        expect(getByTestId('dialog')).toBeInTheDocument()
      })

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      })
      document.dispatchEvent(escapeEvent)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when escapeDeactivates is false', async () => {
      const { getByTestId } = render(
        <TestDialog
          isOpen={true}
          onClose={onClose}
          options={{ escapeDeactivates: false }}
        />
      )

      await waitFor(() => {
        expect(getByTestId('dialog')).toBeInTheDocument()
      })

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      })
      document.dispatchEvent(escapeEvent)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Tab Navigation', () => {
    it('prevents Tab from moving focus outside container', async () => {
      const { getByTestId } = render(
        <>
          <button data-testid="external-button">External</button>
          <TestDialog isOpen={true} onClose={onClose} />
        </>
      )

      await waitFor(() => {
        expect(getByTestId('dialog')).toBeInTheDocument()
      })

      // Focus last button in dialog
      getByTestId('button-3').focus()
      expect(document.activeElement).toBe(getByTestId('button-3'))

      // Press Tab (should cycle to first button)
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      })
      const preventDefaultSpy = vi.spyOn(tabEvent, 'preventDefault')
      document.dispatchEvent(tabEvent)

      // preventDefault should be called to prevent leaving the dialog
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Return Focus', () => {
    it('returns focus to previous element on unmount', async () => {
      // Create and focus an external button
      const triggerButton = document.createElement('button')
      triggerButton.setAttribute('data-testid', 'trigger')
      document.body.appendChild(triggerButton)
      triggerButton.focus()

      expect(document.activeElement).toBe(triggerButton)

      const { unmount, getByTestId } = render(
        <TestDialog isOpen={true} onClose={onClose} />
      )

      // Wait for dialog to focus first button
      await waitFor(() => {
        expect(document.activeElement).toBe(getByTestId('button-1'))
      })

      // Unmount the dialog
      unmount()

      // Wait for focus return
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton)
      })
    })
  })
})

describe('useControlledFocusTrap', () => {
  function ControlledTestDialog() {
    const { containerRef, isActive, activate, deactivate } = useControlledFocusTrap()

    return (
      <div>
        <button onClick={activate} data-testid="activate-button">
          Open Dialog
        </button>
        {isActive && (
          <div ref={containerRef} role="dialog" data-testid="dialog">
            <button data-testid="dialog-button">Dialog Button</button>
            <button onClick={deactivate} data-testid="close-button">
              Close
            </button>
          </div>
        )}
      </div>
    )
  }

  it('starts with dialog closed', () => {
    const { queryByTestId } = render(<ControlledTestDialog />)

    expect(queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('opens dialog when activate button is clicked', async () => {
    const { getByTestId, queryByTestId } = render(<ControlledTestDialog />)

    expect(queryByTestId('dialog')).not.toBeInTheDocument()

    // Click activate button
    getByTestId('activate-button').click()

    // Dialog should appear
    await waitFor(() => {
      expect(getByTestId('dialog')).toBeInTheDocument()
    })
  })

  it('closes dialog when close button is clicked', async () => {
    const { getByTestId, queryByTestId } = render(<ControlledTestDialog />)

    // Open dialog
    getByTestId('activate-button').click()

    await waitFor(() => {
      expect(getByTestId('dialog')).toBeInTheDocument()
    })

    // Close dialog
    getByTestId('close-button').click()

    await waitFor(() => {
      expect(queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('useFocusTrap - Edge Cases', () => {
  it('handles container with no focusable elements', () => {
    function EmptyDialog() {
      const dialogRef = useFocusTrap({ enabled: true })

      return (
        <div ref={dialogRef} role="dialog" data-testid="empty-dialog">
          <div>No focusable elements here</div>
        </div>
      )
    }

    const { getByTestId } = render(<EmptyDialog />)

    expect(getByTestId('empty-dialog')).toBeInTheDocument()
    // Should not crash or throw errors
  })

  it('handles disabled elements correctly', () => {
    function DialogWithDisabled() {
      const dialogRef = useFocusTrap({ enabled: true })

      return (
        <div ref={dialogRef} role="dialog" data-testid="dialog">
          <button disabled data-testid="disabled-button">Disabled</button>
          <button data-testid="enabled-button">Enabled</button>
        </div>
      )
    }

    const { getByTestId } = render(<DialogWithDisabled />)

    // Should skip disabled button and focus enabled one
    waitFor(() => {
      expect(document.activeElement).toBe(getByTestId('enabled-button'))
    })
  })

  it('handles hidden elements correctly', () => {
    function DialogWithHidden() {
      const dialogRef = useFocusTrap({ enabled: true })

      return (
        <div ref={dialogRef} role="dialog" data-testid="dialog">
          <button style={{ display: 'none' }} data-testid="hidden-button">Hidden</button>
          <button data-testid="visible-button">Visible</button>
        </div>
      )
    }

    const { getByTestId } = render(<DialogWithHidden />)

    // Should skip hidden button and focus visible one
    waitFor(() => {
      expect(document.activeElement).toBe(getByTestId('visible-button'))
    })
  })
})
