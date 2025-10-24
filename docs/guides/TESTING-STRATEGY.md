# Testing Strategy Guide - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 14:00:00 -0300
**Última Atualização**: 2025-01-25 14:00:00 -0300

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Stack](#testing-stack)
4. [Vitest Unit Testing](#vitest-unit-testing)
5. [Playwright E2E Testing](#playwright-e2e-testing)
6. [Integration Testing](#integration-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Performance Testing](#performance-testing)
9. [Testing Best Practices](#testing-best-practices)
10. [Running Tests](#running-tests)
11. [CI/CD Integration](#cicd-integration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This comprehensive guide covers testing strategies, patterns, and best practices for the Cidadão.AI frontend application. The project uses a multi-layered testing approach to ensure quality, maintainability, and user experience.

### Testing Objectives

- **Quality Assurance**: Catch bugs before they reach production
- **Documentation**: Tests serve as living documentation of system behavior
- **Regression Prevention**: Ensure new changes don't break existing functionality
- **Confidence**: Enable safe refactoring and feature additions
- **Accessibility**: Guarantee WCAG 2.1 AA compliance
- **Performance**: Monitor and maintain performance budgets

### Current Test Coverage

```
Total test files: 22
Total test suites: ~150
Lines of test code: 1,648+
Coverage target: 80%
```

**Test Distribution**:
- Unit tests: 15 files (UI components, utilities, services)
- Store tests: 2 files (Zustand stores)
- Integration tests: Manual scripts in `scripts/` directory
- E2E tests: 5 files (Playwright)

---

## Testing Philosophy

### The Testing Pyramid

We follow the testing pyramid approach to optimize test coverage and execution speed:

```
              /\
             /E2E\         5% - Critical user journeys
            /------\       Focus: Complete workflows
           /  Integ  \     15% - API integrations
          /------------\   Focus: Service communication
         / Component    \  30% - UI components
        /----------------\ Focus: User interactions
       /   Unit Tests     \ 50% - Pure functions
      /____________________\ Focus: Business logic
```

### Test Types and Their Purpose

1. **Unit Tests (50%)**
   - Pure functions, utilities, helpers
   - Fast execution (< 1ms per test)
   - No external dependencies
   - High isolation, easy debugging

2. **Component Tests (30%)**
   - React components with Testing Library
   - User-centric queries and interactions
   - Accessibility validation
   - State management integration

3. **Integration Tests (15%)**
   - API service layer testing
   - Multi-component interactions
   - Store + service integration
   - Realistic data flows

4. **E2E Tests (5%)**
   - Complete user workflows
   - Cross-browser validation
   - Real backend integration
   - Critical path validation

### Test Quality Principles

✅ **DO**:
- Write tests that describe user behavior
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test accessibility in every component test
- Keep tests isolated and independent
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)

❌ **DON'T**:
- Test implementation details
- Use `querySelector` or class selectors
- Share state between tests
- Make tests dependent on execution order
- Test third-party libraries
- Write flaky or non-deterministic tests

---

## Testing Stack

### Core Testing Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | ^3.2.4 | Fast unit testing framework with hot reload |
| **React Testing Library** | ^16.3.0 | User-centric component testing |
| **Playwright** | ^1.56.0 | Cross-browser E2E testing |
| **jest-axe** | ^10.0.0 | Automated accessibility testing |
| **@testing-library/user-event** | ^14.6.1 | Realistic user interaction simulation |
| **happy-dom** | ^19.0.2 | Fast DOM implementation for tests |

### Supporting Libraries

- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@vitest/ui**: Interactive UI for test debugging
- **@vitest/coverage-v8**: Code coverage reporting with V8
- **@playwright/test**: Playwright test runner and assertions

### Configuration Files

```
vitest.config.mts       - Vitest configuration with coverage setup
playwright.config.ts    - Playwright E2E configuration
test/setup.tsx          - Global test setup and mocks
test/utils/render.tsx   - Custom render utilities
test/utils/test-helpers.ts - Test helper functions
```

---

## Vitest Unit Testing

### Configuration

**File**: `vitest.config.mts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*',
        '.next/**',
        'scripts/**'
      ]
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules/**', '.next/**', 'tests/e2e/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/store': path.resolve(__dirname, './store')
    }
  }
})
```

### Global Test Setup

**File**: `test/setup.tsx`

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn()
  }),
  usePathname: () => '/pt',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({})
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Testing UI Components

**Example**: `components/ui/button.test.tsx`

```typescript
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { setupUserEvent } from '@/test/utils/test-helpers'
import { Button } from './button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('from-green-600', 'to-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(button).toHaveClass('border-2', 'border-gray-300')
  })

  it('handles click events', async () => {
    const user = await setupUserEvent()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})
```

### Testing Zustand Stores

**Example**: `store/chat-store.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useChatStore } from './chat-store'
import { chatService } from '@/lib/api/chat.service'

// Mock dependencies
vi.mock('@/lib/api/chat.service')
vi.mock('@/lib/services/chat-session.service')

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      session: null,
      connectionStatus: 'disconnected',
      isTyping: false,
      error: null,
      isLoading: false
    })

    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState()
      expect(state.messages).toEqual([])
      expect(state.session).toBeNull()
      expect(state.connectionStatus).toBe('disconnected')
    })
  })

  describe('sendMessage', () => {
    it('should add user message optimistically', async () => {
      // Setup mock session
      useChatStore.setState({
        session: { session_id: 'test-session' }
      })

      // Mock successful response
      vi.mocked(chatService.sendMessage).mockResolvedValue({
        response: 'AI response',
        agent: 'Abaporu'
      })

      await useChatStore.getState().sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2) // User + assistant
      expect(state.messages[0].content).toBe('Hello')
      expect(state.messages[0].role).toBe('user')
    })

    it('should handle errors gracefully', async () => {
      useChatStore.setState({
        session: { session_id: 'test-session' }
      })

      vi.mocked(chatService.sendMessage).mockRejectedValue(
        new Error('Network error')
      )

      await useChatStore.getState().sendMessage('Hello')

      const state = useChatStore.getState()
      expect(state.error).toBe('Network error')
      expect(state.isLoading).toBe(false)
    })
  })
})
```

### Testing Services with Mocking

**Example**: `lib/services/chat-cache.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatCacheService } from './chat-cache.service'

describe('ChatCacheService', () => {
  let cacheService: ChatCacheService

  beforeEach(() => {
    vi.useFakeTimers()
    cacheService = new ChatCacheService()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('set and get', () => {
    it('should cache and retrieve values', () => {
      cacheService.set('key1', 'value1')
      expect(cacheService.get('key1')).toBe('value1')
    })

    it('should return undefined for non-existent keys', () => {
      expect(cacheService.get('nonexistent')).toBeUndefined()
    })

    it('should expire entries after TTL', () => {
      cacheService.set('key1', 'value1', 5000) // 5 second TTL

      expect(cacheService.get('key1')).toBe('value1')

      // Fast-forward 6 seconds
      vi.advanceTimersByTime(6000)

      expect(cacheService.get('key1')).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('should clear all cached entries', () => {
      cacheService.set('key1', 'value1')
      cacheService.set('key2', 'value2')

      cacheService.clear()

      expect(cacheService.get('key1')).toBeUndefined()
      expect(cacheService.get('key2')).toBeUndefined()
    })
  })
})
```

### Testing Security Functions

**Example**: `lib/security/sanitizer.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => `sanitized:${input}`)
  }
}))

import { Sanitizer } from './sanitizer'
import DOMPurify from 'dompurify'

describe('Sanitizer', () => {
  let sanitizer: Sanitizer

  beforeEach(() => {
    vi.clearAllMocks()
    sanitizer = new Sanitizer()
  })

  describe('sanitizeHtml', () => {
    it('should use DOMPurify when available', () => {
      global.window = {} as any
      const browserSanitizer = new Sanitizer()

      const result = browserSanitizer.sanitizeHtml('<p>Hello</p>')

      expect(DOMPurify.sanitize).toHaveBeenCalledWith('<p>Hello</p>', {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false
      })
      expect(result).toBe('sanitized:<p>Hello</p>')

      delete (global as any).window
    })

    it('should strip HTML when DOMPurify not available', () => {
      delete (global as any).window
      const serverSanitizer = new Sanitizer()

      const result = serverSanitizer.sanitizeHtml('<p>Hello <b>World</b></p>')

      expect(result).toBe('Hello World')
    })
  })
})
```

### Test Helper Utilities

**File**: `test/utils/test-helpers.ts`

```typescript
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

export const setupUserEvent = () => {
  return userEvent.setup()
}

export const waitForAsync = async (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockFetch = (response: any, options: { ok?: boolean; status?: number } = {}) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers({ 'content-type': 'application/json' })
  })
}

export const mockLocalStorage = () => {
  const storage: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    })
  }
}
```

---

## Playwright E2E Testing

### Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ],

  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

### Critical Path Testing

**Example**: `__tests__/e2e/chat.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Chat Interaction', () => {
  test('should display chat interface', async ({ page }) => {
    await page.goto('/pt/chat')

    await expect(page).toHaveTitle(/Chat.*Cidadão\.AI/i)

    const chatInput = page.getByPlaceholder(/digite.*mensagem/i)
    await expect(chatInput).toBeVisible()

    const sendButton = page.getByRole('button', { name: /enviar/i }).first()
    await expect(sendButton).toBeVisible()
  })

  test('should allow sending messages', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem/i)
    await chatInput.fill('Olá, Cidadão.AI!')

    const sendButton = page.getByRole('button', { name: /enviar/i }).first()
    await sendButton.click()

    // Wait for message to appear
    await expect(page.getByText('Olá, Cidadão.AI!')).toBeVisible()
  })

  test('should display typing indicator during response', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem/i)
    await chatInput.fill('Teste de mensagem')

    await page.keyboard.press('Enter')

    // Check for typing indicator or loading state
    const loadingIndicator = page.getByText(/digitando|processando/i)
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 })
  })
})
```

### Multi-Device Testing

**Example**: `__tests__/e2e/dark-mode.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Dark Mode', () => {
  test('should toggle dark mode on desktop', async ({ page }) => {
    await page.goto('/pt')

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /tema|theme/i })
    await themeToggle.click()

    // Check dark mode class applied
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/pt')

    // Toggle to dark mode
    const themeToggle = page.getByRole('button', { name: /tema/i })
    await themeToggle.click()

    // Reload page
    await page.reload()

    // Dark mode should still be active
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })
})
```

### Authentication Flow Testing

**Example**: `__tests__/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/pt/chat')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/pt\/login/)
  })

  test('should allow Google OAuth login', async ({ page }) => {
    await page.goto('/pt/login')

    const googleButton = page.getByRole('button', { name: /google/i })
    await expect(googleButton).toBeVisible()

    // Click would open OAuth popup (can't fully test without mocking)
    await expect(googleButton).toBeEnabled()
  })

  test('should show user menu when authenticated', async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token',
        domain: 'localhost',
        path: '/'
      }
    ])

    await page.goto('/pt/home')

    // User menu should be visible
    const userMenu = page.getByRole('button', { name: /perfil|profile/i })
    await expect(userMenu).toBeVisible()
  })
})
```

---

## Integration Testing

### Testing API Services

The project uses manual integration test scripts in the `scripts/` directory for comprehensive backend testing.

**Example**: `scripts/test-backend.js`

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

async function testBackendHealth() {
  console.log('Testing backend health...')

  const response = await fetch(`${API_URL}/health`)
  const data = await response.json()

  console.log('✓ Backend health:', data.status)
  return data.status === 'healthy'
}

async function testChatEndpoint() {
  console.log('Testing chat endpoint...')

  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Teste de integração',
      session_id: 'test-session'
    })
  })

  const data = await response.json()

  console.log('✓ Chat response received:', data.response.substring(0, 50))
  return response.ok
}

async function runTests() {
  const results = []

  results.push(await testBackendHealth())
  results.push(await testChatEndpoint())

  const passed = results.filter(Boolean).length
  console.log(`\n${passed}/${results.length} tests passed`)
}

runTests()
```

### Testing Chat Adapters

**Example**: Manual adapter testing pattern

```javascript
// scripts/test-chat-adapters.js
const adapters = [
  './lib/api/chat-adapter-v1',
  './lib/api/chat-adapter-v2',
  './lib/api/chat-adapter-v3',
  './lib/api/chat-adapter-simple'
]

async function testAdapter(adapterPath) {
  const adapter = require(adapterPath)

  try {
    const response = await adapter.sendMessage({
      message: 'Teste',
      sessionId: 'test'
    })

    console.log(`✓ ${adapterPath}: Success`)
    return true
  } catch (error) {
    console.error(`✗ ${adapterPath}: ${error.message}`)
    return false
  }
}

async function testAllAdapters() {
  for (const adapter of adapters) {
    await testAdapter(adapter)
  }
}

testAllAdapters()
```

### Store + Service Integration

```typescript
// Example integration test pattern
describe('Chat Flow Integration', () => {
  it('should handle complete chat flow', async () => {
    // Initialize store
    await useChatStore.getState().initializeChat()

    // Send message
    await useChatStore.getState().sendMessage('Olá')

    // Verify state updates
    const state = useChatStore.getState()
    expect(state.messages).toHaveLength(2) // User + assistant
    expect(state.messages[1].role).toBe('assistant')

    // Verify persistence
    const sessions = await chatSessionService.getSessions()
    expect(sessions).toHaveLength(1)
  })
})
```

---

## Accessibility Testing

### Automated Accessibility Testing with jest-axe

**Setup**: Add to test files

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('AccessibilityPanel', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<AccessibilityPanel locale="pt" />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Testing Keyboard Navigation

```typescript
describe('Navigation Menu', () => {
  it('supports full keyboard navigation', async () => {
    const user = await setupUserEvent()
    render(<NavigationMenu />)

    // Tab to first item
    await user.tab()
    expect(screen.getByText('Home')).toHaveFocus()

    // Arrow down to next item
    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Chat')).toHaveFocus()

    // Enter to activate
    await user.keyboard('{Enter}')
    expect(window.location.pathname).toBe('/pt/chat')
  })

  it('supports escape key to close menu', async () => {
    const user = await setupUserEvent()
    render(<NavigationMenu isOpen />)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
```

### Testing ARIA Attributes

```typescript
describe('Form Field', () => {
  it('has proper ARIA labels and descriptions', () => {
    render(
      <FormField
        label="Email"
        error="Invalid email format"
        required
      />
    )

    const input = screen.getByLabelText('Email')

    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby')

    const errorId = input.getAttribute('aria-describedby')
    expect(screen.getByText('Invalid email format')).toHaveAttribute('id', errorId)
  })
})
```

### Testing Screen Reader Support

```typescript
describe('Live Regions', () => {
  it('announces status updates to screen readers', () => {
    render(<StatusMessage />)

    const liveRegion = screen.getByRole('status')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
  })

  it('announces errors assertively', () => {
    render(<ErrorMessage message="Network error" />)

    const alertRegion = screen.getByRole('alert')
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive')
    expect(alertRegion).toHaveTextContent('Network error')
  })
})
```

### VLibras Accessibility Testing

```typescript
describe('VLibras Widget', () => {
  it('loads VLibras on Portuguese pages', () => {
    render(<VLibrasWidget locale="pt" forceOnload />)

    // Check widget container exists
    const widget = document.querySelector('[vw]')
    expect(widget).toBeInTheDocument()
  })

  it('does not load on English pages', () => {
    render(<VLibrasWidget locale="en" />)

    const widget = document.querySelector('[vw]')
    expect(widget).not.toBeInTheDocument()
  })
})
```

---

## Performance Testing

### Testing Web Vitals

```typescript
import { getCLS, getFID, getLCP } from 'web-vitals'

describe('Web Vitals', () => {
  it('should have good LCP', (done) => {
    getLCP((metric) => {
      expect(metric.value).toBeLessThan(2500) // Good LCP < 2.5s
      done()
    })
  })

  it('should have good FID', (done) => {
    getFID((metric) => {
      expect(metric.value).toBeLessThan(100) // Good FID < 100ms
      done()
    })
  })
})
```

### Testing Bundle Size

```bash
# Analyze bundle size
npm run analyze

# Check bundle budget
npm run build -- --profile
```

### Lighthouse CI (Not yet configured)

**Recommended setup**: `.lighthouserc.js`

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/pt', 'http://localhost:3000/pt/chat'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    }
  }
}
```

---

## Testing Best Practices

### 1. Write Descriptive Test Names

```typescript
// ❌ Bad
it('test 1', () => {})
it('works', () => {})

// ✅ Good
it('displays error message when email format is invalid', () => {})
it('clears input field after successful form submission', () => {})
```

### 2. Follow AAA Pattern

```typescript
it('calculates total with tax correctly', () => {
  // Arrange
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ]
  const taxRate = 0.1

  // Act
  const total = calculateTotalWithTax(items, taxRate)

  // Assert
  expect(total).toBe(275) // (200 + 50) * 1.1
})
```

### 3. Test User Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation
expect(component.state.isOpen).toBe(true)
expect(wrapper.find('.modal').exists()).toBe(true)

// ✅ Good - Testing behavior
expect(screen.getByRole('dialog')).toBeVisible()
expect(screen.getByText('Modal Title')).toBeInTheDocument()
```

### 4. Use Semantic Queries

```typescript
// ❌ Bad
const button = container.querySelector('.btn-primary')
const input = container.querySelector('#email-input')

// ✅ Good
const button = screen.getByRole('button', { name: 'Submit' })
const input = screen.getByLabelText('Email address')
```

### 5. Keep Tests Isolated

```typescript
// ❌ Bad - Shared state
let user: User

beforeAll(() => {
  user = createUser()
})

it('test 1', () => {
  user.name = 'John'
  // ...
})

it('test 2', () => {
  // Depends on test 1's mutation
  expect(user.name).toBe('John')
})

// ✅ Good - Isolated tests
it('test 1', () => {
  const user = createUser()
  user.name = 'John'
  // ...
})

it('test 2', () => {
  const user = createUser()
  // Fresh state
})
```

### 6. Mock External Dependencies

```typescript
// Mock API calls
vi.mock('@/lib/api/chat.service', () => ({
  sendMessage: vi.fn().mockResolvedValue({ response: 'Mocked response' })
}))

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://test-api.com')

// Mock date/time
vi.useFakeTimers()
vi.setSystemTime(new Date('2025-01-25'))
```

### 7. Test Edge Cases

```typescript
describe('formatCurrency', () => {
  it('handles normal values', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-100)).toBe('-R$ 100,00')
  })

  it('handles very large numbers', () => {
    expect(formatCurrency(1234567890)).toBe('R$ 1.234.567.890,00')
  })

  it('handles floating point precision', () => {
    expect(formatCurrency(0.1 + 0.2)).toBe('R$ 0,30')
  })
})
```

---

## Running Tests

### Local Development

```bash
# Run all unit tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with UI (interactive debugging)
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test button.test.tsx

# Run tests matching pattern
npm test -- --grep "chat"

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests for specific browser
npm run test:playwright -- --project=chromium

# Run design system tests
npm run test:design-system
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Coverage thresholds (configured in vitest.config.mts)
# - Statements: 80%
# - Branches: 70%
# - Functions: 80%
# - Lines: 80%
```

### Manual Integration Tests

```bash
# Test backend connectivity
node scripts/test-backend.js

# Test chat adapters
node scripts/test-chat-adapters.js

# Test VLibras integration
node scripts/test-vlibras.js

# Test transparency map
node scripts/test-transparency-map.js

# Monitor backend performance
node scripts/monitor-backend.js
```

---

## CI/CD Integration

### GitHub Actions (Recommended Setup)

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Pre-commit Hooks (Recommended)

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test -- --run --reporter=dot
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

```typescript
// Increase timeout for slow tests
it('slow operation', async () => {
  // ...
}, 10000) // 10 second timeout

// Or in Playwright
test('slow E2E test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // ...
})
```

#### 2. Flaky Tests

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
}, { timeout: 5000 })

// Use Playwright auto-waiting
await expect(page.getByText('Loaded')).toBeVisible()
```

#### 3. Mock Not Working

```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Reset mocks completely
afterEach(() => {
  vi.resetAllMocks()
})
```

#### 4. Store State Leaking Between Tests

```typescript
beforeEach(() => {
  // Reset store to initial state
  useChatStore.setState({
    messages: [],
    session: null,
    // ... all initial state
  })
})
```

### Debugging Tests

```typescript
// Print DOM to console
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Use Testing Playground
screen.logTestingPlaygroundURL()

// Pause test execution (Playwright)
await page.pause()

// Step through test (Vitest UI)
npm run test:ui
```

### Performance Issues

```bash
# Run tests in parallel
npm test -- --pool=threads --poolOptions.threads.maxThreads=4

# Run only changed tests
npm test -- --changed

# Skip heavy E2E tests locally
npm test -- --exclude="**/*.spec.ts"
```

---

## Additional Resources

### Official Documentation

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

### Project-Specific Docs

- [Component API Reference](../technical/component-api-reference.md)
- [State Management Architecture](../technical/state-management-architecture.md)
- [Chat Architecture Deep Dive](../technical/chat-architecture-deep-dive.md)

### Testing Philosophy

- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing Guide](https://www.a11y-101.com/development/testing)

---

**Last Updated**: 2025-01-25
**Maintainer**: Frontend Team
**Review Cycle**: Quarterly
