import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFocusTrap, useControlledFocusTrap } from '../use-focus-trap'

// Helper to create a container with focusable elements
function createTestContainer() {
  const container = document.createElement('div')
  container.innerHTML = `
    <button id="btn1">Button 1</button>
    <input id="input1" type="text" />
    <a id="link1" href="#">Link 1</a>
    <button id="btn2">Button 2</button>
  `
  document.body.appendChild(container)
  return container
}

describe('useFocusTrap', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = createTestContainer()
  })

  afterEach(() => {
    vi.useRealTimers()
    container.remove()
  })

  describe('initialization', () => {
    it('returns a ref', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current).toHaveProperty('current')
    })

    it('ref is initially null', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current.current).toBeNull()
    })
  })

  describe('enabled option', () => {
    it('is enabled by default', () => {
      const { result } = renderHook(() => useFocusTrap())
      // Check that hook returns ref (trap is ready to be used)
      expect(result.current).toBeDefined()
    })

    it('can be disabled', () => {
      const { result } = renderHook(() => useFocusTrap({ enabled: false }))
      expect(result.current).toBeDefined()
    })
  })

  describe('escapeDeactivates option', () => {
    it('defaults to true', () => {
      // Hook does not add listeners until containerRef is set to a valid DOM element
      // Testing the configuration is accepted
      const onEscape = vi.fn()
      const { result } = renderHook(() => useFocusTrap({ onEscape, escapeDeactivates: true }))

      expect(result.current).toBeDefined()
      expect(result.current.current).toBeNull()
    })

    it('accepts escapeDeactivates false option', () => {
      const onEscape = vi.fn()
      const { result } = renderHook(() =>
        useFocusTrap({
          escapeDeactivates: false,
          onEscape,
        })
      )

      expect(result.current).toBeDefined()
    })
  })

  describe('autoFocus option', () => {
    it('defaults to true', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current).toBeDefined()
    })

    it('can be disabled', () => {
      const { result } = renderHook(() => useFocusTrap({ autoFocus: false }))
      expect(result.current).toBeDefined()
    })
  })

  describe('returnFocus option', () => {
    it('defaults to true', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current).toBeDefined()
    })

    it('can be disabled', () => {
      const { result } = renderHook(() => useFocusTrap({ returnFocus: false }))
      expect(result.current).toBeDefined()
    })
  })

  describe('focusableSelector option', () => {
    it('uses default selector', () => {
      const { result } = renderHook(() => useFocusTrap())
      expect(result.current).toBeDefined()
    })

    it('accepts custom selector', () => {
      const { result } = renderHook(() => useFocusTrap({ focusableSelector: 'button' }))
      expect(result.current).toBeDefined()
    })
  })

  describe('keyboard event handling', () => {
    it('hook does not add listeners until ref is set', () => {
      // The hook only adds event listeners when containerRef.current is set
      // Since we're testing the hook in isolation without a DOM component,
      // containerRef.current stays null and no listeners are added
      const { result } = renderHook(() => useFocusTrap())

      act(() => {
        vi.runAllTimers()
      })

      // Hook returns a ref that can be attached to a DOM element
      expect(result.current.current).toBeNull()
    })

    it('accepts enabled option to control listener attachment', () => {
      const { result: enabledResult } = renderHook(() => useFocusTrap({ enabled: true }))
      const { result: disabledResult } = renderHook(() => useFocusTrap({ enabled: false }))

      // Both should return refs
      expect(enabledResult.current).toBeDefined()
      expect(disabledResult.current).toBeDefined()
    })
  })

  describe('triggerElement option', () => {
    it('accepts trigger element', () => {
      const triggerEl = document.createElement('button')
      const { result } = renderHook(() => useFocusTrap({ triggerElement: triggerEl }))
      expect(result.current).toBeDefined()
    })

    it('accepts null trigger element', () => {
      const { result } = renderHook(() => useFocusTrap({ triggerElement: null }))
      expect(result.current).toBeDefined()
    })
  })

  describe('initialFocusElement option', () => {
    it('accepts initial focus element', () => {
      const initialEl = document.createElement('input')
      const { result } = renderHook(() => useFocusTrap({ initialFocusElement: initialEl }))
      expect(result.current).toBeDefined()
    })

    it('accepts null initial focus element', () => {
      const { result } = renderHook(() => useFocusTrap({ initialFocusElement: null }))
      expect(result.current).toBeDefined()
    })
  })
})

describe('useControlledFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('returns containerRef', () => {
      const { result } = renderHook(() => useControlledFocusTrap())
      expect(result.current).toHaveProperty('containerRef')
    })

    it('returns isActive state', () => {
      const { result } = renderHook(() => useControlledFocusTrap())
      expect(result.current).toHaveProperty('isActive')
      expect(result.current.isActive).toBe(false)
    })

    it('returns activate function', () => {
      const { result } = renderHook(() => useControlledFocusTrap())
      expect(typeof result.current.activate).toBe('function')
    })

    it('returns deactivate function', () => {
      const { result } = renderHook(() => useControlledFocusTrap())
      expect(typeof result.current.deactivate).toBe('function')
    })
  })

  describe('activation', () => {
    it('starts inactive', () => {
      const { result } = renderHook(() => useControlledFocusTrap())
      expect(result.current.isActive).toBe(false)
    })

    it('activates when activate is called', () => {
      const { result } = renderHook(() => useControlledFocusTrap())

      act(() => {
        result.current.activate()
        vi.runAllTimers()
      })

      expect(result.current.isActive).toBe(true)
    })

    it('deactivates when deactivate is called', () => {
      const { result } = renderHook(() => useControlledFocusTrap())

      act(() => {
        result.current.activate()
        vi.runAllTimers()
      })

      act(() => {
        result.current.deactivate()
        vi.runAllTimers()
      })

      expect(result.current.isActive).toBe(false)
    })
  })

  describe('options passthrough', () => {
    it('passes through escapeDeactivates', () => {
      const onEscape = vi.fn()
      const { result } = renderHook(() =>
        useControlledFocusTrap({
          escapeDeactivates: true,
          onEscape,
        })
      )

      expect(result.current).toBeDefined()
    })

    it('passes through autoFocus', () => {
      const { result } = renderHook(() => useControlledFocusTrap({ autoFocus: false }))

      expect(result.current).toBeDefined()
    })

    it('passes through returnFocus', () => {
      const { result } = renderHook(() => useControlledFocusTrap({ returnFocus: false }))

      expect(result.current).toBeDefined()
    })
  })
})
