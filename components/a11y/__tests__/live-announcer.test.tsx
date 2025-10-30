/**
 * Tests for LiveAnnouncer Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-01-30
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import {
  LiveAnnouncerProvider,
  useLiveAnnouncer,
  useAnnouncementHelpers
} from '../live-announcer'

describe('LiveAnnouncerProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <LiveAnnouncerProvider>
          <div>Test Content</div>
        </LiveAnnouncerProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders ARIA live regions', () => {
      const { container } = render(
        <LiveAnnouncerProvider>
          <div>Content</div>
        </LiveAnnouncerProvider>
      )

      // Check for polite live region
      const politeRegion = container.querySelector('[aria-live="polite"]')
      expect(politeRegion).toBeInTheDocument()
      expect(politeRegion).toHaveAttribute('role', 'status')

      // Check for assertive live region
      const assertiveRegion = container.querySelector('[aria-live="assertive"]')
      expect(assertiveRegion).toBeInTheDocument()
      expect(assertiveRegion).toHaveAttribute('role', 'alert')
    })

    it('applies sr-only class to live regions', () => {
      const { container } = render(
        <LiveAnnouncerProvider>
          <div>Content</div>
        </LiveAnnouncerProvider>
      )

      const srOnlyDiv = container.querySelector('.sr-only')
      expect(srOnlyDiv).toBeInTheDocument()
    })
  })

  describe('useLiveAnnouncer Hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useLiveAnnouncer())
      }).toThrow('useLiveAnnouncer must be used within LiveAnnouncerProvider')

      consoleSpy.mockRestore()
    })

    it('provides announce and clear functions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LiveAnnouncerProvider>{children}</LiveAnnouncerProvider>
      )

      const { result } = renderHook(() => useLiveAnnouncer(), { wrapper })

      expect(result.current.announce).toBeInstanceOf(Function)
      expect(result.current.clear).toBeInstanceOf(Function)
    })
  })

  describe('Announcements', () => {
    it('announces polite messages by default', () => {
      function TestComponent() {
        const { announce } = useLiveAnnouncer()

        return (
          <button onClick={() => announce('Test message')}>
            Announce
          </button>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      const button = screen.getByText('Announce')
      button.click()

      const politeRegion = container.querySelector('[aria-live="polite"]')
      expect(politeRegion?.textContent).toContain('Test message')
    })

    it('announces assertive messages when specified', () => {
      function TestComponent() {
        const { announce } = useLiveAnnouncer()

        return (
          <button onClick={() => announce('Error message', 'assertive')}>
            Announce Error
          </button>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      const button = screen.getByText('Announce Error')
      button.click()

      const assertiveRegion = container.querySelector('[aria-live="assertive"]')
      expect(assertiveRegion?.textContent).toContain('Error message')
    })

    it('handles multiple announcements', () => {
      function TestComponent() {
        const { announce } = useLiveAnnouncer()

        return (
          <div>
            <button onClick={() => announce('Message 1')}>
              Announce 1
            </button>
            <button onClick={() => announce('Message 2')}>
              Announce 2
            </button>
            <button onClick={() => announce('Message 3')}>
              Announce 3
            </button>
          </div>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      screen.getByText('Announce 1').click()
      screen.getByText('Announce 2').click()
      screen.getByText('Announce 3').click()

      const politeRegion = container.querySelector('[aria-live="polite"]')
      expect(politeRegion?.textContent).toContain('Message 1')
      expect(politeRegion?.textContent).toContain('Message 2')
      expect(politeRegion?.textContent).toContain('Message 3')
    })

    it('respects maxAnnouncements limit', () => {
      function TestComponent() {
        const { announce } = useLiveAnnouncer()

        return (
          <button onClick={() => {
            announce('Message 1')
            announce('Message 2')
            announce('Message 3')
            announce('Message 4')
          }}>
            Announce Many
          </button>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider maxAnnouncements={3}>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      screen.getByText('Announce Many').click()

      const politeRegion = container.querySelector('[aria-live="polite"]')
      const announcements = politeRegion?.querySelectorAll('div')

      // Should keep only last 3 announcements
      expect(announcements?.length).toBe(3)
      expect(politeRegion?.textContent).not.toContain('Message 1')
      expect(politeRegion?.textContent).toContain('Message 2')
      expect(politeRegion?.textContent).toContain('Message 3')
      expect(politeRegion?.textContent).toContain('Message 4')
    })

    it('auto-clears announcements after lifetime', async () => {
      function TestComponent() {
        const { announce } = useLiveAnnouncer()

        return (
          <button onClick={() => announce('Temporary message')}>
            Announce
          </button>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider announcementLifetime={1000}>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      screen.getByText('Announce').click()

      let politeRegion = container.querySelector('[aria-live="polite"]')
      expect(politeRegion?.textContent).toContain('Temporary message')

      // Fast-forward past announcement lifetime
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      await waitFor(() => {
        politeRegion = container.querySelector('[aria-live="polite"]')
        expect(politeRegion?.textContent).not.toContain('Temporary message')
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears all announcements when clear is called', () => {
      function TestComponent() {
        const { announce, clear } = useLiveAnnouncer()

        return (
          <div>
            <button onClick={() => {
              announce('Message 1')
              announce('Message 2', 'assertive')
            }}>
              Announce
            </button>
            <button onClick={clear}>
              Clear
            </button>
          </div>
        )
      }

      const { container } = render(
        <LiveAnnouncerProvider>
          <TestComponent />
        </LiveAnnouncerProvider>
      )

      screen.getByText('Announce').click()

      let politeRegion = container.querySelector('[aria-live="polite"]')
      let assertiveRegion = container.querySelector('[aria-live="assertive"]')

      expect(politeRegion?.textContent).toContain('Message 1')
      expect(assertiveRegion?.textContent).toContain('Message 2')

      screen.getByText('Clear').click()

      politeRegion = container.querySelector('[aria-live="polite"]')
      assertiveRegion = container.querySelector('[aria-live="assertive"]')

      expect(politeRegion?.textContent).toBe('')
      expect(assertiveRegion?.textContent).toBe('')
    })
  })
})

describe('useAnnouncementHelpers', () => {
  it('provides convenience methods', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LiveAnnouncerProvider>{children}</LiveAnnouncerProvider>
    )

    const { result } = renderHook(() => useAnnouncementHelpers(), { wrapper })

    expect(result.current.announceLoading).toBeInstanceOf(Function)
    expect(result.current.announceSuccess).toBeInstanceOf(Function)
    expect(result.current.announceError).toBeInstanceOf(Function)
    expect(result.current.announceNavigation).toBeInstanceOf(Function)
    expect(result.current.announceCount).toBeInstanceOf(Function)
  })

  it('announceLoading creates correct message', () => {
    function TestComponent() {
      const { announceLoading } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceLoading('data')}>
          Load Data
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Load Data').click()

    const politeRegion = container.querySelector('[aria-live="polite"]')
    expect(politeRegion?.textContent).toContain('Loading data...')
  })

  it('announceSuccess creates correct message', () => {
    function TestComponent() {
      const { announceSuccess } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceSuccess('Data upload')}>
          Success
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Success').click()

    const politeRegion = container.querySelector('[aria-live="polite"]')
    expect(politeRegion?.textContent).toContain('Data upload completed successfully')
  })

  it('announceError creates assertive message', () => {
    function TestComponent() {
      const { announceError } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceError('Network timeout')}>
          Error
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Error').click()

    const assertiveRegion = container.querySelector('[aria-live="assertive"]')
    expect(assertiveRegion?.textContent).toContain('Error: Network timeout')
  })

  it('announceNavigation creates correct message', () => {
    function TestComponent() {
      const { announceNavigation } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceNavigation('Dashboard')}>
          Navigate
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Navigate').click()

    const politeRegion = container.querySelector('[aria-live="polite"]')
    expect(politeRegion?.textContent).toContain('Navigated to Dashboard')
  })

  it('announceCount handles singular correctly', () => {
    function TestComponent() {
      const { announceCount } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceCount(1, 'result')}>
          Count
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Count').click()

    const politeRegion = container.querySelector('[aria-live="polite"]')
    expect(politeRegion?.textContent).toContain('1 result found')
  })

  it('announceCount handles plural correctly', () => {
    function TestComponent() {
      const { announceCount } = useAnnouncementHelpers()

      return (
        <button onClick={() => announceCount(5, 'result')}>
          Count
        </button>
      )
    }

    const { container } = render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    )

    screen.getByText('Count').click()

    const politeRegion = container.querySelector('[aria-live="polite"]')
    expect(politeRegion?.textContent).toContain('5 results found')
  })
})
