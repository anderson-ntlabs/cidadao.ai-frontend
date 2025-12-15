import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingEffect } from '../use-typing-effect'

describe('useTypingEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with empty displayed text', () => {
      const { result } = renderHook(() => useTypingEffect('Hello'))
      expect(result.current.displayedText).toBe('')
    })

    it('starts in typing state', () => {
      const { result } = renderHook(() => useTypingEffect('Hello'))
      expect(result.current.isTyping).toBe(true)
    })

    it('handles empty string', () => {
      const { result } = renderHook(() => useTypingEffect(''))
      expect(result.current.displayedText).toBe('')
      expect(result.current.isTyping).toBe(false)
    })
  })

  describe('typing animation', () => {
    it('types characters one at a time', () => {
      const { result } = renderHook(() => useTypingEffect('Hi', { speed: 100 }))

      // Initially empty
      expect(result.current.displayedText).toBe('')

      // After first interval
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current.displayedText).toBe('H')

      // After second interval
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current.displayedText).toBe('Hi')
    })

    it('uses default speed of 30ms', () => {
      const { result } = renderHook(() => useTypingEffect('AB'))

      act(() => {
        vi.advanceTimersByTime(30)
      })
      expect(result.current.displayedText).toBe('A')

      act(() => {
        vi.advanceTimersByTime(30)
      })
      expect(result.current.displayedText).toBe('AB')
    })

    it('respects custom speed', () => {
      const { result } = renderHook(() => useTypingEffect('AB', { speed: 50 }))

      // At 30ms, should still be empty
      act(() => {
        vi.advanceTimersByTime(30)
      })
      expect(result.current.displayedText).toBe('')

      // At 50ms, should have first character
      act(() => {
        vi.advanceTimersByTime(20)
      })
      expect(result.current.displayedText).toBe('A')
    })
  })

  describe('typing completion', () => {
    it('sets isTyping to false when complete', () => {
      const { result } = renderHook(() => useTypingEffect('Hi', { speed: 50 }))

      expect(result.current.isTyping).toBe(true)

      // Type all characters
      act(() => {
        vi.advanceTimersByTime(100) // 2 characters * 50ms
      })

      // One more tick to detect completion
      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(result.current.isTyping).toBe(false)
      expect(result.current.displayedText).toBe('Hi')
    })

    it('calls onComplete callback', () => {
      const onComplete = vi.fn()
      renderHook(() => useTypingEffect('Hi', { speed: 50, onComplete }))

      // Type all characters + 1 tick
      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('text changes', () => {
    it('restarts animation when text changes', () => {
      const { result, rerender } = renderHook(({ text }) => useTypingEffect(text, { speed: 50 }), {
        initialProps: { text: 'Hi' },
      })

      // Type first text
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current.displayedText).toBe('Hi')

      // Change text
      rerender({ text: 'Bye' })

      // Should restart from empty
      expect(result.current.displayedText).toBe('')
      expect(result.current.isTyping).toBe(true)

      // Type new text
      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(result.current.displayedText).toBe('Bye')
    })

    it('handles change to empty string', () => {
      const { result, rerender } = renderHook(({ text }) => useTypingEffect(text, { speed: 50 }), {
        initialProps: { text: 'Hi' },
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      rerender({ text: '' })

      expect(result.current.displayedText).toBe('')
      expect(result.current.isTyping).toBe(false)
    })
  })

  describe('cleanup', () => {
    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const { unmount } = renderHook(() => useTypingEffect('Hello', { speed: 50 }))

      // Start typing
      act(() => {
        vi.advanceTimersByTime(50)
      })

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('handles single character', () => {
      const { result } = renderHook(() => useTypingEffect('X', { speed: 50 }))

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(result.current.displayedText).toBe('X')

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(result.current.isTyping).toBe(false)
    })

    it('handles special characters', () => {
      const { result } = renderHook(() => useTypingEffect('A!@#', { speed: 50 }))

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current.displayedText).toBe('A!@#')
    })

    it('handles unicode characters', () => {
      const { result } = renderHook(() => useTypingEffect('Olá', { speed: 50 }))

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(result.current.displayedText).toBe('Olá')
    })
  })
})
