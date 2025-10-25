import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  prefetchComponent,
  loadComponents,
  routeModules,
  preloadRouteModules,
  createRouteComponent
} from './code-splitting'

// Mock console.error to test error handling
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('code-splitting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('prefetchComponent', () => {
    it('should successfully prefetch a component', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: () => 'Component' })

      await prefetchComponent(mockImport)

      expect(mockImport).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should handle prefetch errors gracefully', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Network error'))

      await prefetchComponent(mockImport)

      expect(mockImport).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to prefetch component:',
        expect.any(Error)
      )
    })

    it('should not throw when import fails', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'))

      // Should not throw
      await expect(prefetchComponent(mockImport)).resolves.toBeUndefined()
    })
  })

  describe('loadComponents', () => {
    it('should load multiple components in parallel', async () => {
      const import1 = vi.fn().mockResolvedValue({ default: () => 'Component1' })
      const import2 = vi.fn().mockResolvedValue({ default: () => 'Component2' })
      const import3 = vi.fn().mockResolvedValue({ default: () => 'Component3' })

      await loadComponents([import1, import2, import3])

      expect(import1).toHaveBeenCalled()
      expect(import2).toHaveBeenCalled()
      expect(import3).toHaveBeenCalled()
    })

    it('should handle empty array', async () => {
      await expect(loadComponents([])).resolves.toBeUndefined()
    })

    it('should continue loading even if one component fails', async () => {
      const import1 = vi.fn().mockResolvedValue({ default: () => 'Component1' })
      const import2 = vi.fn().mockRejectedValue(new Error('Failed'))
      const import3 = vi.fn().mockResolvedValue({ default: () => 'Component3' })

      await loadComponents([import1, import2, import3])

      expect(import1).toHaveBeenCalled()
      expect(import2).toHaveBeenCalled()
      expect(import3).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })

    it('should load all components even if multiple fail', async () => {
      const import1 = vi.fn().mockRejectedValue(new Error('Failed 1'))
      const import2 = vi.fn().mockRejectedValue(new Error('Failed 2'))

      await loadComponents([import1, import2])

      expect(import1).toHaveBeenCalled()
      expect(import2).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('routeModules', () => {
    it('should have dashboard modules defined', () => {
      expect(routeModules.dashboard).toBeDefined()
      expect(routeModules.dashboard.charts).toBeTypeOf('function')
      expect(routeModules.dashboard.stats).toBeTypeOf('function')
    })

    it('should have chat modules defined', () => {
      expect(routeModules.chat).toBeDefined()
      expect(routeModules.chat.tour).toBeTypeOf('function')
      expect(routeModules.chat.history).toBeTypeOf('function')
    })

    it('should have investigations modules defined', () => {
      expect(routeModules.investigations).toBeDefined()
      expect(routeModules.investigations.export).toBeTypeOf('function')
    })

    it('should have profile modules defined', () => {
      expect(routeModules.profile).toBeDefined()
      expect(routeModules.profile.avatar).toBeTypeOf('function')
      expect(routeModules.profile.forms).toBeTypeOf('function')
    })

    it('should have all expected routes', () => {
      const routes = Object.keys(routeModules)
      expect(routes).toContain('dashboard')
      expect(routes).toContain('chat')
      expect(routes).toContain('investigations')
      expect(routes).toContain('profile')
    })
  })

  describe('preloadRouteModules', () => {
    it('should preload dashboard modules', async () => {
      // This test verifies the function runs without errors
      // Actual module loading is mocked by the build system
      await expect(preloadRouteModules('dashboard')).resolves.toBeUndefined()
    })

    it('should preload chat modules', async () => {
      await expect(preloadRouteModules('chat')).resolves.toBeUndefined()
    })

    it('should preload investigations modules', async () => {
      await expect(preloadRouteModules('investigations')).resolves.toBeUndefined()
    })

    it('should preload profile modules', async () => {
      await expect(preloadRouteModules('profile')).resolves.toBeUndefined()
    })

    it('should handle invalid route gracefully', async () => {
      // @ts-expect-error Testing runtime behavior with invalid input
      await expect(preloadRouteModules('nonexistent')).resolves.toBeUndefined()
    })
  })

  describe('createRouteComponent', () => {
    it('should throw error for nonexistent component', () => {
      expect(() => {
        createRouteComponent('dashboard', 'nonexistent')
      }).toThrow('Component nonexistent not found in route dashboard')
    })

    it('should throw error for component in wrong route', () => {
      expect(() => {
        createRouteComponent('dashboard', 'tour')
      }).toThrow('Component tour not found in route dashboard')
    })

    it('should not throw for valid route and component combinations', () => {
      // These should not throw during component creation
      // Actual rendering is tested in integration tests
      expect(() => {
        createRouteComponent('dashboard', 'charts')
      }).not.toThrow()

      expect(() => {
        createRouteComponent('chat', 'tour')
      }).not.toThrow()

      expect(() => {
        createRouteComponent('profile', 'avatar')
      }).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should support full workflow: preload then create component', async () => {
      // 1. Preload route modules
      await preloadRouteModules('dashboard')

      // 2. Create dynamic component (should not throw)
      expect(() => {
        createRouteComponent('dashboard', 'charts')
      }).not.toThrow()
    })

    it('should handle loading multiple routes sequentially', async () => {
      // Clear previous calls before test
      consoleErrorSpy.mockClear()

      await preloadRouteModules('dashboard')
      await preloadRouteModules('chat')
      await preloadRouteModules('profile')

      // Note: Module loading may fail in test environment, which is expected
      // The important thing is that the function completes without throwing
    })
  })
})
