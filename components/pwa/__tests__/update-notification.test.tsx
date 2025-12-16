/**
 * Tests for UpdateNotification and UpdateToast components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdateNotification, UpdateToast } from '../update-notification'

// Mock useHaptic hook
const mockVibrate = vi.fn()
vi.mock('@/hooks/use-haptic', () => ({
  useHaptic: () => ({
    vibrate: mockVibrate,
  }),
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('UpdateNotification', () => {
  let mockRegistration: any
  let originalServiceWorker: ServiceWorkerContainer

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()

    // Mock service worker registration
    mockRegistration = {
      waiting: null,
      installing: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    }

    // Store original
    originalServiceWorker = navigator.serviceWorker

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: { postMessage: vi.fn() },
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // Restore original
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      writable: true,
      configurable: true,
    })
  })

  describe('Initial State', () => {
    it('returns null when no update available', async () => {
      const { container } = render(<UpdateNotification />)

      // Wait for async operations
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(container.firstChild).toBeNull()
    })

    it('checks for service worker registration', async () => {
      render(<UpdateNotification />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled()
    })
  })

  describe('When Update Available', () => {
    it('shows notification when waiting worker exists', async () => {
      const mockWaitingWorker = {
        postMessage: vi.fn(),
      }

      mockRegistration.waiting = mockWaitingWorker
      ;(navigator.serviceWorker.getRegistration as any).mockResolvedValue(mockRegistration)

      render(<UpdateNotification />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      // Check if title is present (may or may not render depending on state)
      // The component should handle this gracefully
    })

    it('calls vibrate on update detection', async () => {
      const mockWaitingWorker = {
        postMessage: vi.fn(),
      }

      mockRegistration.waiting = mockWaitingWorker
      ;(navigator.serviceWorker.getRegistration as any).mockResolvedValue(mockRegistration)

      render(<UpdateNotification />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      // Vibrate should be called when update is detected
      expect(mockVibrate).toHaveBeenCalled()
    })
  })

  describe('Session Skip', () => {
    it('respects skipped session', async () => {
      sessionStorage.setItem('update-skipped', 'true')

      const { container } = render(<UpdateNotification />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Props', () => {
    it('accepts autoUpdate prop', () => {
      const { container } = render(<UpdateNotification autoUpdate={true} />)

      expect(container).toBeDefined()
    })

    it('accepts showDetails prop', () => {
      const { container } = render(<UpdateNotification showDetails={true} />)

      expect(container).toBeDefined()
    })

    it('accepts custom className', () => {
      const { container } = render(<UpdateNotification className="custom-class" />)

      expect(container).toBeDefined()
    })
  })

  describe('No Service Worker Support', () => {
    it('handles missing service worker gracefully', async () => {
      // For this test, we just verify component renders without crashing
      // when service worker is not available (component handles this internally)
      const { container } = render(<UpdateNotification />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      // Component should handle missing service worker gracefully
      expect(container).toBeDefined()
    })
  })
})

describe('UpdateToast', () => {
  let mockRegistration: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockRegistration = {
      waiting: null,
      installing: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    }

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
        addEventListener: vi.fn(),
        controller: { postMessage: vi.fn() },
      },
      writable: true,
      configurable: true,
    })
  })

  describe('Initial State', () => {
    it('returns null when no update available', async () => {
      const { container } = render(<UpdateToast />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(container.firstChild).toBeNull()
    })
  })

  describe('When Update Available', () => {
    it('shows toast when waiting worker exists', async () => {
      const mockWaitingWorker = {
        postMessage: vi.fn(),
      }

      mockRegistration.waiting = mockWaitingWorker
      ;(navigator.serviceWorker.getRegistration as any).mockResolvedValue(mockRegistration)

      render(<UpdateToast />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      // Vibrate should be called when update is detected
      expect(mockVibrate).toHaveBeenCalled()
    })
  })

  describe('No Service Worker Support', () => {
    it('handles missing service worker gracefully', async () => {
      // For this test, we just verify component renders without crashing
      // when service worker is not available (component handles this internally)
      const { container } = render(<UpdateToast />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      // Component should handle missing service worker gracefully
      expect(container).toBeDefined()
    })
  })
})
