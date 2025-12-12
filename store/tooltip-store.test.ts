/**
 * Tooltip Store Tests
 *
 * Tests for tooltip state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

// Mock localStorage
const mockStorage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key])
  }),
})

import { useTooltipStore } from './tooltip-store'

describe('Tooltip Store', () => {
  beforeEach(() => {
    // Reset store state
    useTooltipStore.setState({
      seenTooltips: new Set(),
      tooltipPreferences: {
        enabled: true,
        level: 'standard',
      },
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have empty seen tooltips set', () => {
      const state = useTooltipStore.getState()
      expect(state.seenTooltips.size).toBe(0)
    })

    it('should have tooltips enabled by default', () => {
      const state = useTooltipStore.getState()
      expect(state.tooltipPreferences.enabled).toBe(true)
    })

    it('should have standard level by default', () => {
      const state = useTooltipStore.getState()
      expect(state.tooltipPreferences.level).toBe('standard')
    })
  })

  describe('hasSeenTooltip', () => {
    it('should return false for unseen tooltip', () => {
      const result = useTooltipStore.getState().hasSeenTooltip('new-tooltip')
      expect(result).toBe(false)
    })

    it('should return true for seen tooltip', () => {
      useTooltipStore.setState({
        seenTooltips: new Set(['seen-tooltip']),
      })

      const result = useTooltipStore.getState().hasSeenTooltip('seen-tooltip')
      expect(result).toBe(true)
    })

    it('should return true when tooltips are disabled (acts as if seen)', () => {
      useTooltipStore.setState({
        seenTooltips: new Set(),
        tooltipPreferences: {
          enabled: false,
          level: 'standard',
        },
      })

      const result = useTooltipStore.getState().hasSeenTooltip('any-tooltip')
      expect(result).toBe(true)
    })
  })

  describe('markTooltipSeen', () => {
    it('should mark tooltip as seen', () => {
      act(() => {
        useTooltipStore.getState().markTooltipSeen('tooltip-1')
      })

      const state = useTooltipStore.getState()
      expect(state.seenTooltips.has('tooltip-1')).toBe(true)
    })

    it('should preserve existing seen tooltips', () => {
      useTooltipStore.setState({
        seenTooltips: new Set(['existing-tooltip']),
      })

      act(() => {
        useTooltipStore.getState().markTooltipSeen('new-tooltip')
      })

      const state = useTooltipStore.getState()
      expect(state.seenTooltips.has('existing-tooltip')).toBe(true)
      expect(state.seenTooltips.has('new-tooltip')).toBe(true)
    })

    it('should handle marking same tooltip multiple times', () => {
      act(() => {
        useTooltipStore.getState().markTooltipSeen('tooltip-1')
        useTooltipStore.getState().markTooltipSeen('tooltip-1')
        useTooltipStore.getState().markTooltipSeen('tooltip-1')
      })

      const state = useTooltipStore.getState()
      expect(state.seenTooltips.size).toBe(1)
    })
  })

  describe('resetTooltips', () => {
    it('should clear all seen tooltips', () => {
      useTooltipStore.setState({
        seenTooltips: new Set(['tooltip-1', 'tooltip-2', 'tooltip-3']),
      })

      act(() => {
        useTooltipStore.getState().resetTooltips()
      })

      const state = useTooltipStore.getState()
      expect(state.seenTooltips.size).toBe(0)
    })
  })

  describe('setTooltipPreferences', () => {
    it('should enable/disable tooltips', () => {
      act(() => {
        useTooltipStore.getState().setTooltipPreferences({ enabled: false })
      })

      expect(useTooltipStore.getState().tooltipPreferences.enabled).toBe(false)
    })

    it('should change tooltip level to minimal', () => {
      act(() => {
        useTooltipStore.getState().setTooltipPreferences({ level: 'minimal' })
      })

      expect(useTooltipStore.getState().tooltipPreferences.level).toBe('minimal')
    })

    it('should change tooltip level to detailed', () => {
      act(() => {
        useTooltipStore.getState().setTooltipPreferences({ level: 'detailed' })
      })

      expect(useTooltipStore.getState().tooltipPreferences.level).toBe('detailed')
    })

    it('should update multiple preferences at once', () => {
      act(() => {
        useTooltipStore.getState().setTooltipPreferences({
          enabled: false,
          level: 'detailed',
        })
      })

      const prefs = useTooltipStore.getState().tooltipPreferences
      expect(prefs.enabled).toBe(false)
      expect(prefs.level).toBe('detailed')
    })

    it('should preserve unmodified preferences', () => {
      useTooltipStore.setState({
        tooltipPreferences: {
          enabled: true,
          level: 'detailed',
        },
      })

      act(() => {
        useTooltipStore.getState().setTooltipPreferences({ enabled: false })
      })

      const prefs = useTooltipStore.getState().tooltipPreferences
      expect(prefs.enabled).toBe(false)
      expect(prefs.level).toBe('detailed') // Should be preserved
    })
  })

  describe('Integration scenarios', () => {
    it('should handle typical user flow', () => {
      // User sees first tooltip
      expect(useTooltipStore.getState().hasSeenTooltip('welcome')).toBe(false)

      act(() => {
        useTooltipStore.getState().markTooltipSeen('welcome')
      })
      expect(useTooltipStore.getState().hasSeenTooltip('welcome')).toBe(true)

      // User sees second tooltip
      expect(useTooltipStore.getState().hasSeenTooltip('feature-hint')).toBe(false)

      act(() => {
        useTooltipStore.getState().markTooltipSeen('feature-hint')
      })
      expect(useTooltipStore.getState().hasSeenTooltip('feature-hint')).toBe(true)

      // Both should be marked as seen
      expect(useTooltipStore.getState().seenTooltips.size).toBe(2)
    })

    it('should disable all tooltips for experienced users', () => {
      // User disables tooltips
      act(() => {
        useTooltipStore.getState().setTooltipPreferences({ enabled: false })
      })

      // All tooltips should be treated as seen
      expect(useTooltipStore.getState().hasSeenTooltip('any-new-tooltip')).toBe(true)
      expect(useTooltipStore.getState().hasSeenTooltip('another-tooltip')).toBe(true)
    })

    it('should reset and allow viewing tooltips again', () => {
      // Mark some tooltips as seen
      act(() => {
        useTooltipStore.getState().markTooltipSeen('tooltip-1')
        useTooltipStore.getState().markTooltipSeen('tooltip-2')
      })

      expect(useTooltipStore.getState().hasSeenTooltip('tooltip-1')).toBe(true)

      // Reset
      act(() => {
        useTooltipStore.getState().resetTooltips()
      })

      // Should be able to see tooltips again
      expect(useTooltipStore.getState().hasSeenTooltip('tooltip-1')).toBe(false)
      expect(useTooltipStore.getState().hasSeenTooltip('tooltip-2')).toBe(false)
    })
  })
})
