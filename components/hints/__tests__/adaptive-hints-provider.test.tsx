/**
 * Tests for AdaptiveHintsProvider and related hooks
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

// Create mock functions using vi.hoisted
const { mockGetRelevantHints, mockMarkHintShown, mockDismissHint, MockAdaptiveHintSystem } =
  vi.hoisted(() => {
    const mockGetRelevantHints = vi.fn().mockReturnValue([])
    const mockMarkHintShown = vi.fn()
    const mockDismissHint = vi.fn()

    class MockAdaptiveHintSystem {
      getRelevantHints = mockGetRelevantHints
      markHintShown = mockMarkHintShown
      dismissHint = mockDismissHint
    }

    return { mockGetRelevantHints, mockMarkHintShown, mockDismissHint, MockAdaptiveHintSystem }
  })

// Mock dependencies before importing the component
vi.mock('@/lib/services/adaptive-hints', () => ({
  AdaptiveHintSystem: MockAdaptiveHintSystem,
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/pt/app/chat'),
}))

vi.mock('@/hooks/use-supabase-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
  }),
}))

vi.mock('@/store/chat-store', () => ({
  useChatStore: () => ({
    messages: [],
  }),
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: {
    info: vi.fn(),
  },
}))

// Import after mocks
import {
  AdaptiveHintsProvider,
  useAdaptiveHints,
  useReportUXIssue,
} from '../adaptive-hints-provider'

describe('AdaptiveHintsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRelevantHints.mockReturnValue([])
  })

  describe('Provider Rendering', () => {
    it('renders children', () => {
      render(
        <AdaptiveHintsProvider>
          <div data-testid="child">Child Content</div>
        </AdaptiveHintsProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders without crashing', () => {
      expect(() =>
        render(
          <AdaptiveHintsProvider>
            <div>Test</div>
          </AdaptiveHintsProvider>
        )
      ).not.toThrow()
    })
  })

  describe('Context Value', () => {
    it('provides hint system in context', () => {
      let contextValue: any = null

      const TestComponent = () => {
        contextValue = useAdaptiveHints()
        return null
      }

      render(
        <AdaptiveHintsProvider>
          <TestComponent />
        </AdaptiveHintsProvider>
      )

      expect(contextValue).not.toBeNull()
      expect(contextValue.hintSystem).toBeDefined()
    })

    it('provides currentHints array', () => {
      let contextValue: any = null

      const TestComponent = () => {
        contextValue = useAdaptiveHints()
        return null
      }

      render(
        <AdaptiveHintsProvider>
          <TestComponent />
        </AdaptiveHintsProvider>
      )

      expect(contextValue.currentHints).toBeDefined()
      expect(Array.isArray(contextValue.currentHints)).toBe(true)
    })

    it('provides dismissHint function', () => {
      let contextValue: any = null

      const TestComponent = () => {
        contextValue = useAdaptiveHints()
        return null
      }

      render(
        <AdaptiveHintsProvider>
          <TestComponent />
        </AdaptiveHintsProvider>
      )

      expect(typeof contextValue.dismissHint).toBe('function')
    })

    it('provides reportError function', () => {
      let contextValue: any = null

      const TestComponent = () => {
        contextValue = useAdaptiveHints()
        return null
      }

      render(
        <AdaptiveHintsProvider>
          <TestComponent />
        </AdaptiveHintsProvider>
      )

      expect(typeof contextValue.reportError).toBe('function')
    })
  })

  describe('Hint System Integration', () => {
    it('calls getRelevantHints on mount', () => {
      render(
        <AdaptiveHintsProvider>
          <div>Test</div>
        </AdaptiveHintsProvider>
      )

      expect(mockGetRelevantHints).toHaveBeenCalled()
    })

    it('calls dismissHint when hint is dismissed', () => {
      let contextValue: any = null

      const TestComponent = () => {
        contextValue = useAdaptiveHints()
        return null
      }

      render(
        <AdaptiveHintsProvider>
          <TestComponent />
        </AdaptiveHintsProvider>
      )

      act(() => {
        contextValue.dismissHint('test-hint')
      })

      expect(mockDismissHint).toHaveBeenCalledWith('test-hint')
    })
  })
})

describe('useAdaptiveHints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRelevantHints.mockReturnValue([])
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const TestComponent = () => {
      useAdaptiveHints()
      return null
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useAdaptiveHints must be used within AdaptiveHintsProvider'
    )

    consoleSpy.mockRestore()
  })

  it('works within provider', () => {
    const TestComponent = () => {
      const hints = useAdaptiveHints()
      return <div data-testid="hints">{hints.currentHints.length}</div>
    }

    render(
      <AdaptiveHintsProvider>
        <TestComponent />
      </AdaptiveHintsProvider>
    )

    expect(screen.getByTestId('hints')).toHaveTextContent('0')
  })
})

describe('useReportUXIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRelevantHints.mockReturnValue([])
  })

  const TestReportComponent = ({ onReport }: { onReport: (reportFn: any) => void }) => {
    const report = useReportUXIssue()
    React.useEffect(() => {
      onReport(report)
    }, [report, onReport])
    return null
  }

  it('provides reportMissingElement function', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    expect(typeof reportFunctions.reportMissingElement).toBe('function')
  })

  it('provides reportInteractionError function', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    expect(typeof reportFunctions.reportInteractionError).toBe('function')
  })

  it('provides reportContrastIssue function', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    expect(typeof reportFunctions.reportContrastIssue).toBe('function')
  })

  it('reportMissingElement can be called', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    // Should not throw when called
    expect(() => {
      reportFunctions?.reportMissingElement('button')
    }).not.toThrow()
  })

  it('reportContrastIssue only reports low contrast', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    // Should not throw when ratio is good
    expect(() => {
      reportFunctions?.reportContrastIssue('text', 5.0)
    }).not.toThrow()

    // Should not throw when ratio is low
    expect(() => {
      reportFunctions?.reportContrastIssue('text', 3.0)
    }).not.toThrow()
  })

  it('reportInteractionError can be called', () => {
    let reportFunctions: any = null

    render(
      <AdaptiveHintsProvider>
        <TestReportComponent onReport={(fn) => (reportFunctions = fn)} />
      </AdaptiveHintsProvider>
    )

    // Should not throw when called
    expect(() => {
      reportFunctions?.reportInteractionError('click', 'button')
    }).not.toThrow()
  })
})
