# Testing Guide for Contributors

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-25 14:47:03 -0300

---

## 🎯 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test path/to/file.test.ts

# Run E2E tests
npm run test:e2e
```

### Writing Your First Test

1. **Create test file** next to your source file:
   ```
   components/my-component.tsx
   components/my-component.test.tsx  ← Create this
   ```

2. **Basic test structure**:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import { MyComponent } from './my-component'

   describe('MyComponent', () => {
     it('should render correctly', () => {
       render(<MyComponent />)
       expect(screen.getByText('Hello')).toBeInTheDocument()
     })
   })
   ```

3. **Run your test**:
   ```bash
   npm test my-component.test.tsx
   ```

---

## 📚 Common Testing Scenarios

### Testing a React Component

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Testing a Custom Hook

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './use-counter'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter())

    expect(result.current.count).toBe(0)

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

### Testing Async Operations

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFetchData } from './use-fetch-data'

describe('useFetchData', () => {
  it('should fetch data successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useFetchData())

    await act(async () => {
      await result.current.fetchData()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'test' })
    })
  })
})
```

### Testing with Mocks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessage } from './api'
import { api } from './client'

// Mock the client module
vi.mock('./client', () => ({
  api: {
    post: vi.fn()
  }
}))

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send message via API', async () => {
    vi.mocked(api.post).mockResolvedValue({
      success: true,
      data: { message: 'sent' }
    })

    await sendMessage('Hello')

    expect(api.post).toHaveBeenCalledWith('/messages', {
      text: 'Hello'
    })
  })
})
```

---

## 🎨 Testing Best Practices

### 1. Test User Behavior, Not Implementation

```typescript
// ✅ GOOD - Tests what user sees
it('should show error message when form is invalid', () => {
  render(<LoginForm />)

  const submitButton = screen.getByRole('button', { name: 'Login' })
  fireEvent.click(submitButton)

  expect(screen.getByText('Email is required')).toBeInTheDocument()
})

// ❌ BAD - Tests internal state
it('should set error state', () => {
  const { result } = renderHook(() => useLoginForm())

  act(() => {
    result.current.submit()
  })

  expect(result.current.errors.email).toBe('Email is required')
})
```

### 2. Use Accessible Queries

Priority order (from Testing Library docs):
1. `getByRole` ✅ Best
2. `getByLabelText` ✅ Good
3. `getByPlaceholderText` ⚠️ OK
4. `getByText` ⚠️ OK
5. `getByTestId` ❌ Last resort

```typescript
// ✅ BEST - Accessible query
const button = screen.getByRole('button', { name: 'Submit' })

// ⚠️ OK - Text query
const heading = screen.getByText('Welcome')

// ❌ AVOID - Test ID (use only when no better option)
const element = screen.getByTestId('submit-button')
```

### 3. Isolate Tests

```typescript
describe('Counter', () => {
  // ✅ GOOD - Each test is independent
  it('should start at 0', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('should increment', () => {
    const { result } = renderHook(() => useCounter())
    act(() => result.current.increment())
    expect(result.current.count).toBe(1)
  })
})
```

### 4. Clear Test Names

```typescript
// ✅ GOOD - Descriptive
it('should display error message when email is invalid', () => {})

// ❌ BAD - Vague
it('should work', () => {})
it('test email', () => {})
```

### 5. Arrange-Act-Assert Pattern

```typescript
it('should calculate total price with tax', () => {
  // Arrange - Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ]
  const taxRate = 0.1

  // Act - Execute the code being tested
  const total = calculateTotal(items, taxRate)

  // Assert - Verify the result
  expect(total).toBe(38.5) // (20 + 15) * 1.1
})
```

---

## 🐛 Common Pitfalls

### Pitfall #1: Not Waiting for Async Updates

```typescript
// ❌ BAD - Will fail because state hasn't updated yet
it('should load data', () => {
  const { result } = renderHook(() => useFetchData())

  act(() => {
    result.current.fetchData()
  })

  expect(result.current.data).toBeDefined() // FAILS!
})

// ✅ GOOD - Wait for async operation
it('should load data', async () => {
  const { result } = renderHook(() => useFetchData())

  await act(async () => {
    await result.current.fetchData()
  })

  await waitFor(() => {
    expect(result.current.data).toBeDefined()
  })
})
```

### Pitfall #2: Shared State Between Tests

```typescript
// ❌ BAD - Tests share state
let user = { name: 'John' }

it('should update name', () => {
  user.name = 'Jane'
  expect(user.name).toBe('Jane')
})

it('should have original name', () => {
  expect(user.name).toBe('John') // FAILS! Still 'Jane'
})

// ✅ GOOD - Each test has its own state
it('should update name', () => {
  const user = { name: 'John' }
  user.name = 'Jane'
  expect(user.name).toBe('Jane')
})

it('should have original name', () => {
  const user = { name: 'John' }
  expect(user.name).toBe('John')
})
```

### Pitfall #3: Not Cleaning Up Mocks

```typescript
// ❌ BAD - Mocks persist between tests
describe('API tests', () => {
  it('test 1', () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'test1' })
    // ...
  })

  it('test 2', () => {
    // Still has mock from test 1!
  })
})

// ✅ GOOD - Clean up after each test
describe('API tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test 1', () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'test1' })
    // ...
  })

  it('test 2', () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'test2' })
    // Fresh mock!
  })
})
```

---

## 🔍 Debugging Tests

### Running Tests in Debug Mode

```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run single test file with debugging
npm test -- my-component.test.tsx --reporter=verbose

# Run with UI
npm run test:ui
```

### Using console.log in Tests

```typescript
it('should debug component', () => {
  const { container } = render(<MyComponent />)

  // Print component HTML
  console.log(container.innerHTML)

  // Print specific element
  const button = screen.getByRole('button')
  console.log(button.outerHTML)
})
```

### Using screen.debug()

```typescript
import { render, screen } from '@testing-library/react'

it('should debug with screen.debug', () => {
  render(<MyComponent />)

  // Print entire document
  screen.debug()

  // Print specific element
  const button = screen.getByRole('button')
  screen.debug(button)
})
```

---

## 📝 Test Checklist

Before submitting your PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Coverage doesn't decrease
- [ ] Tests are isolated (no shared state)
- [ ] Async operations use `act()` and `waitFor()`
- [ ] Mocks are cleaned up in `beforeEach()`
- [ ] Test names are descriptive
- [ ] Tests focus on user behavior, not implementation

---

## 🆘 Getting Help

### Resources

1. **Project Documentation**
   - [Testing Architecture](./testing-architecture.md)
   - [Contributing Guide](../CONTRIBUTING.md)

2. **External Resources**
   - [Vitest Docs](https://vitest.dev/)
   - [Testing Library Docs](https://testing-library.com/)
   - [Common Testing Library Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

3. **Ask the Team**
   - Check existing tests for examples
   - Ask in PR comments
   - Consult with maintainers

### Common Questions

**Q: When should I write a test?**
A: Always! Write tests for:
- New features
- Bug fixes
- Refactoring
- Any code that affects user behavior

**Q: What should I test?**
A: Test user behavior and outputs, not implementation details:
- ✅ "When user clicks button, modal opens"
- ❌ "When user clicks button, state.isOpen becomes true"

**Q: How much coverage is enough?**
A: Minimum 80%, target 95%. But focus on quality, not just numbers.

**Q: My test is flaky. What do I do?**
A: Common causes:
1. Missing `await` on async operations
2. Race conditions
3. Shared state between tests
4. Insufficient `waitFor` timeout

---

**Happy Testing!** 🎉

If you have questions or suggestions for this guide, please contribute!
