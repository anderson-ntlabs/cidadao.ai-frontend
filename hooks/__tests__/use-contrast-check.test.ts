/**
 * Tests for useContrastCheck hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useContrastCheck } from '../use-contrast-check'

// Mock useReportUXIssue
const mockReportContrastIssue = vi.fn()

vi.mock('@/components/hints', () => ({
  useReportUXIssue: () => ({
    reportContrastIssue: mockReportContrastIssue,
  }),
}))

describe('useContrastCheck', () => {
  let mockObserve: ReturnType<typeof vi.fn>
  let mockDisconnect: ReturnType<typeof vi.fn>
  let observerCallback: MutationCallback

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock MutationObserver
    mockObserve = vi.fn()
    mockDisconnect = vi.fn()

    global.MutationObserver = vi.fn().mockImplementation((callback: MutationCallback) => {
      observerCallback = callback
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
      }
    })

    // Mock document.querySelector
    vi.spyOn(document, 'querySelector').mockReturnValue(null)

    // Mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
    } as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('creates a MutationObserver', () => {
      renderHook(() => useContrastCheck())

      expect(global.MutationObserver).toHaveBeenCalled()
    })

    it('observes document.documentElement', () => {
      renderHook(() => useContrastCheck())

      expect(mockObserve).toHaveBeenCalledWith(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    })

    it('disconnects observer on unmount', () => {
      const { unmount } = renderHook(() => useContrastCheck())

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Contrast Checking', () => {
    it('checks contrast for green text elements', () => {
      const mockElement = document.createElement('span')

      vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
        if (selector === '.text-green-600') return mockElement
        return null
      })

      renderHook(() => useContrastCheck())

      // Since we mock getComputedStyle to return high contrast colors,
      // no issue should be reported
      expect(mockReportContrastIssue).not.toHaveBeenCalledWith('green-text', expect.any(Number))
    })

    it('reports low contrast issues', () => {
      const mockElement = document.createElement('span')

      vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
        if (selector === '.text-gray-500') return mockElement
        return null
      })

      // Mock low contrast colors
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        color: 'rgb(128, 128, 128)',
        backgroundColor: 'rgb(200, 200, 200)',
      } as CSSStyleDeclaration)

      renderHook(() => useContrastCheck())

      // Should report low contrast for gray text
      expect(mockReportContrastIssue).toHaveBeenCalled()
    })

    it('handles missing elements gracefully', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null)

      expect(() => {
        renderHook(() => useContrastCheck())
      }).not.toThrow()
    })
  })

  describe('Theme Changes', () => {
    it('re-checks contrast when theme changes to dark', () => {
      const mockElement = document.createElement('span')
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)

      renderHook(() => useContrastCheck())

      // Clear mocks from initial call
      vi.clearAllMocks()

      // Simulate dark theme class
      document.documentElement.classList.add('dark')

      // Trigger mutation observer callback
      observerCallback([], {} as MutationObserver)

      // Should have checked contrast again
      expect(window.getComputedStyle).toHaveBeenCalled()
    })

    it('re-checks contrast when theme changes to light', () => {
      const mockElement = document.createElement('span')
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement)

      renderHook(() => useContrastCheck())

      // Clear mocks from initial call
      vi.clearAllMocks()

      // Simulate light theme class
      document.documentElement.classList.add('light')

      // Trigger mutation observer callback
      observerCallback([], {} as MutationObserver)

      // Should have checked contrast again
      expect(window.getComputedStyle).toHaveBeenCalled()
    })
  })
})
