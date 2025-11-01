# Testing Guide

---

**Documento**: Guia de Testes
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-30 12:50:56 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Guide / Testing
**Última Atualização**: 2025-10-04 (Sprint 5 - Testing & QA)

---

## Overview

This guide covers testing strategies, patterns, and best practices for the Cidadão.AI frontend application.

## Testing Stack

- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **jest-axe**: Accessibility testing
- **MSW**: API mocking

## Testing Philosophy

### Testing Pyramid

```
         /\
        /E2E\      (5%) - Critical user journeys
       /------\
      /  Integ  \   (15%) - API integrations
     /------------\
    / Component    \ (30%) - UI components
   /----------------\
  /   Unit Tests     \ (50%) - Pure functions
 /____________________\
```

## Unit Testing

### Basic Test Structure

```tsx
import { describe, it, expect, vi } from 'vitest'

describe('functionName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionName(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Testing Utilities

```tsx
// utils/format.test.ts
describe('formatCurrency', () => {
  it('formats BRL currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })

  it('handles zero values', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-100)).toBe('-R$ 100,00')
  })
})
```

### Testing Async Functions

```tsx
describe('fetchData', () => {
  it('fetches data successfully', async () => {
    const data = await fetchData('test-id')
    expect(data).toEqual({ id: 'test-id', name: 'Test' })
  })

  it('handles errors gracefully', async () => {
    await expect(fetchData('invalid')).rejects.toThrow('Not found')
  })
})
```

## Component Testing

### Basic Component Test

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```tsx
import userEvent from '@testing-library/user-event'

describe('Form', () => {
  it('submits with correct data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<Form onSubmit={onSubmit} />)

    // Type in input
    await user.type(screen.getByLabelText('Name'), 'John Doe')

    // Click submit
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})
```

### Testing with Context

```tsx
// Test utilities
export function renderWithProviders(
  ui: React.ReactElement,
  { locale = 'pt', ...options }: RenderOptions = {}
) {
  return render(
    <IntlProvider locale={locale}>
      <ThemeProvider>{ui}</ThemeProvider>
    </IntlProvider>,
    options
  )
}

// In tests
describe('LocalizedComponent', () => {
  it('renders in Portuguese', () => {
    renderWithProviders(<LocalizedComponent />, { locale: 'pt' })
    expect(screen.getByText('Olá')).toBeInTheDocument()
  })
})
```

### Testing Hooks

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/use-counter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter())

    expect(result.current.count).toBe(0)

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

## Store Testing

### Testing Zustand Stores

```tsx
import { renderHook, act } from '@testing-library/react'
import { useChatStore } from '@/store/chat-store'

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      sessions: [],
      currentSessionId: null,
    })
  })

  it('adds a message', () => {
    const { result } = renderHook(() => useChatStore())

    act(() => {
      result.current.addMessage({
        content: 'Hello',
        role: 'user',
      })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toBe('Hello')
  })
})
```

## API Testing

### Mocking with MSW

```tsx
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/investigations', () => {
    return HttpResponse.json([
      { id: '1', title: 'Investigation 1' },
      { id: '2', title: 'Investigation 2' },
    ])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('InvestigationList', () => {
  it('loads and displays investigations', async () => {
    render(<InvestigationList />)

    await waitFor(() => {
      expect(screen.getByText('Investigation 1')).toBeInTheDocument()
    })
  })
})
```

### Testing Error States

```tsx
it('handles API errors', async () => {
  server.use(
    http.get('/api/investigations', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    })
  )

  render(<InvestigationList />)

  await waitFor(() => {
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
```

## Accessibility Testing

### Using jest-axe

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Modal', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Modal isOpen title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Testing Keyboard Navigation

```tsx
describe('Navigation', () => {
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    // Tab to first link
    await user.tab()
    expect(screen.getByText('Home')).toHaveFocus()

    // Tab to next link
    await user.tab()
    expect(screen.getByText('About')).toHaveFocus()

    // Activate with Enter
    await user.keyboard('{Enter}')
    expect(window.location.pathname).toBe('/about')
  })
})
```

### Testing Screen Reader Support

```tsx
describe('Form', () => {
  it('has proper ARIA labels', () => {
    render(<Form />)

    const input = screen.getByLabelText('Email address')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })
})
```

## E2E Testing with Playwright

### Basic E2E Test

```ts
import { test, expect } from '@playwright/test'

test('user can complete investigation flow', async ({ page }) => {
  // Navigate to app
  await page.goto('/')

  // Login
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Login' }).click()

  // Start investigation
  await page.getByRole('button', { name: 'New Investigation' }).click()
  await page.getByLabel('Title').fill('Test Investigation')
  await page.getByRole('button', { name: 'Start' }).click()

  // Verify navigation
  await expect(page).toHaveURL(/\/investigations\/\d+/)
  await expect(page.getByRole('heading')).toContainText('Test Investigation')
})
```

### Testing Different Viewports

```ts
test.describe('Responsive Design', () => {
  test('works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu should be visible
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
  })

  test('works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Desktop navigation should be visible
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
```

## Testing Best Practices

### 1. Write Descriptive Test Names

```tsx
// ❌ Bad
it('test 1', () => {})

// ✅ Good
it('displays error message when email is invalid', () => {})
```

### 2. Follow AAA Pattern

```tsx
it('calculates total correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(35)
})
```

### 3. Test User Behavior, Not Implementation

```tsx
// ❌ Bad - Testing implementation
expect(component.state.isOpen).toBe(true)

// ✅ Good - Testing behavior
expect(screen.getByRole('dialog')).toBeVisible()
```

### 4. Use Data Attributes for Test Selection

```tsx
// Component
;<button data-testid="submit-button">Submit</button>

// Test
const button = screen.getByTestId('submit-button')
```

### 5. Mock External Dependencies

```tsx
// Mock module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked' }),
}))

// In test
import { fetchData } from '@/lib/api'

it('uses mocked data', async () => {
  const result = await fetchData()
  expect(result).toEqual({ data: 'mocked' })
})
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

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
```

### CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## Coverage Goals

- **Overall**: 80% minimum
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Common Testing Patterns

### Testing Loading States

```tsx
it('shows loading state', () => {
  render(<DataComponent loading />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Testing Error States

```tsx
it('displays error message', () => {
  render(<DataComponent error="Failed to load" />)
  expect(screen.getByText('Failed to load')).toBeInTheDocument()
})
```

### Testing Empty States

```tsx
it('shows empty state when no data', () => {
  render(<DataList items={[]} />)
  expect(screen.getByText('No items found')).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```tsx
it('renders premium features for premium users', () => {
  render(<Dashboard user={{ isPremium: true }} />)
  expect(screen.getByText('Premium Features')).toBeInTheDocument()
})
```

## Debugging Tests

### Using screen.debug()

```tsx
it('debug test', () => {
  render(<Component />)
  screen.debug() // Prints DOM to console
})
```

### Using Testing Playground

```tsx
// Temporarily add this to find the best query
screen.logTestingPlaygroundURL()
```

### Debugging Async Issues

```tsx
it('waits for async operation', async () => {
  render(<AsyncComponent />)

  // Wait for specific element
  await waitFor(
    () => {
      expect(screen.getByText('Loaded')).toBeInTheDocument()
    },
    {
      timeout: 3000, // Increase timeout if needed
    }
  )
})
```
