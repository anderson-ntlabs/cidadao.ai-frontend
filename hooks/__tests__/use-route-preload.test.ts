/**
 * Tests for useRoutePreload and useHoverPreload hooks
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoutePreload, useHoverPreload } from '../use-route-preload'

// Mock preloadRouteModules
const mockPreloadRouteModules = vi.fn()

vi.mock('@/lib/utils/code-splitting', () => ({
  preloadRouteModules: (type: string) => mockPreloadRouteModules(type),
}))

// Mock pathname
const mockPathname = vi.fn().mockReturnValue('/pt/app/chat')

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

describe('useRoutePreload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockPathname.mockReturnValue('/pt/app/chat')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Current Route Preload', () => {
    it('preloads modules for current route', () => {
      mockPathname.mockReturnValue('/pt/app/chat')

      renderHook(() => useRoutePreload())

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('chat')
    })

    it('preloads dashboard modules on dashboard route', () => {
      mockPathname.mockReturnValue('/pt/app/dashboard')

      renderHook(() => useRoutePreload())

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('dashboard')
    })

    it('preloads investigations modules on investigations route', () => {
      mockPathname.mockReturnValue('/pt/app/investigacoes')

      renderHook(() => useRoutePreload())

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('investigations')
    })

    it('preloads profile modules on profile route', () => {
      mockPathname.mockReturnValue('/pt/app/perfil')

      renderHook(() => useRoutePreload())

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('profile')
    })

    it('does not preload for unknown routes', () => {
      mockPathname.mockReturnValue('/pt/unknown')

      renderHook(() => useRoutePreload())

      expect(mockPreloadRouteModules).not.toHaveBeenCalled()
    })
  })

  describe('Adjacent Routes Prefetch', () => {
    it('prefetches adjacent routes after delay', () => {
      mockPathname.mockReturnValue('/pt/app/chat')

      renderHook(() => useRoutePreload())

      // Advance timers to trigger prefetch
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should have prefetched adjacent routes (investigations and dashboard)
      expect(mockPreloadRouteModules).toHaveBeenCalledWith('chat')
      expect(mockPreloadRouteModules).toHaveBeenCalledWith('investigations')
      expect(mockPreloadRouteModules).toHaveBeenCalledWith('dashboard')
    })

    it('does not duplicate preloads on same route', () => {
      mockPathname.mockReturnValue('/pt/app/dashboard')

      const { rerender } = renderHook(() => useRoutePreload())

      // First render
      expect(mockPreloadRouteModules).toHaveBeenCalledWith('dashboard')

      // Rerender with same path
      rerender()

      // Should not call again
      expect(mockPreloadRouteModules).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useHoverPreload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Chat Route', () => {
    it('preloads chat modules on hover', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/chat'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('chat')
    })
  })

  describe('Dashboard Route', () => {
    it('preloads dashboard modules on hover', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/dashboard'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('dashboard')
    })
  })

  describe('Investigations Route', () => {
    it('preloads investigations modules on hover', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/investigacoes'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('investigations')
    })
  })

  describe('Profile Route', () => {
    it('preloads profile modules on hover (perfil)', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/perfil'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('profile')
    })

    it('preloads profile modules on hover (profile)', () => {
      const { result } = renderHook(() => useHoverPreload('/en/app/profile'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledWith('profile')
    })
  })

  describe('Unknown Route', () => {
    it('does not preload for unknown routes', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/unknown'))

      act(() => {
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Hovers', () => {
    it('only preloads once', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/chat'))

      act(() => {
        result.current.onMouseEnter()
        result.current.onMouseEnter()
        result.current.onMouseEnter()
      })

      expect(mockPreloadRouteModules).toHaveBeenCalledTimes(1)
    })
  })

  describe('Return Value', () => {
    it('returns onMouseEnter handler', () => {
      const { result } = renderHook(() => useHoverPreload('/pt/app/chat'))

      expect(typeof result.current.onMouseEnter).toBe('function')
    })
  })
})
