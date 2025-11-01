# Component Development Guide

---

**Documento**: Guia de Desenvolvimento de Componentes
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-30 12:48:47 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Guide / Component Development
**Última Atualização**: 2025-10-04

---

## Overview

This guide covers best practices for developing components in the Cidadão.AI frontend application.

## Component Structure

### Basic Component Template

````tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ComponentNameProps {
  className?: string
  children?: React.ReactNode
  // Add other props here
}

/**
 * ComponentName - Brief description of the component
 *
 * @component
 * @example
 * ```tsx
 * <ComponentName>Content</ComponentName>
 * ```
 */
export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-classes', className)} {...props}>
        {children}
      </div>
    )
  }
)

ComponentName.displayName = 'ComponentName'
````

## Design Patterns

### 1. Compound Components

For complex components with multiple parts:

```tsx
// Card compound component
export const Card = ({ children, className, ...props }) => (
  <div className={cn('card', className)} {...props}>
    {children}
  </div>
)

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('card-header', className)} {...props}>
    {children}
  </div>
)

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('card-content', className)} {...props}>
    {children}
  </div>
)

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 2. Variants with cva

Use `class-variance-authority` for component variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('base-button-classes', {
  variants: {
    variant: {
      primary: 'primary-classes',
      secondary: 'secondary-classes',
      ghost: 'ghost-classes',
    },
    size: {
      sm: 'small-classes',
      md: 'medium-classes',
      lg: 'large-classes',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
)
```

### 3. Accessibility First

Always include proper ARIA attributes:

```tsx
export const Modal = ({ isOpen, onClose, title, children }) => {
  const titleId = useId()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      aria-labelledby={titleId}
      aria-describedby={`${titleId}-description`}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle id={titleId}>{title}</DialogTitle>
        </DialogHeader>
        <div id={`${titleId}-description`}>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
```

## Styling Guidelines

### 1. Use Tailwind Classes

- Prefer Tailwind utility classes over custom CSS
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design

```tsx
// Good
<div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900">

// Avoid
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### 2. Dark Mode Support

Always include dark mode variants:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-gray-800 dark:text-gray-200">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### 3. Glass Morphism Effects

For glassmorphic designs:

```tsx
<div className="backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20">
  {/* Content */}
</div>
```

## State Management

### 1. Local State

For simple component state:

```tsx
const [isOpen, setIsOpen] = useState(false)
const [search, setSearch] = useState('')
```

### 2. Global State (Zustand)

For shared state across components:

```tsx
// In store
export const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// In component
const { user, setUser } = useAppStore()
```

### 3. Server State

For data fetching:

```tsx
// Using custom hooks
const { data, isLoading, error } = useInvestigation(id)

// Using async components (App Router)
async function InvestigationDetails({ id }) {
  const data = await fetchInvestigation(id)
  return <div>{/* Render data */}</div>
}
```

## Testing Components

### 1. Unit Tests with Vitest

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### 2. Accessibility Tests

```tsx
import { axe } from 'jest-axe'

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Accessible button</Button>)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 3. Storybook Stories

Create stories for visual testing:

```tsx
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
}
```

## Performance Optimization

### 1. Lazy Loading

For heavy components:

```tsx
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### 2. Memoization

Prevent unnecessary re-renders:

```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// Memoize components
export const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Render */}</div>
})
```

### 3. Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

;<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

## Common Patterns

### 1. Loading States

```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}
```

### 2. Error States

```tsx
if (error) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <p>Error: {error.message}</p>
      </div>
    </Card>
  )
}
```

### 3. Empty States

```tsx
if (!data || data.length === 0) {
  return (
    <Card className="p-12 text-center">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">No data found</h3>
      <p className="text-gray-600">Start by creating your first item</p>
      <Button className="mt-4">Create Item</Button>
    </Card>
  )
}
```

## File Organization

```
components/
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── button.test.tsx
│   └── button.stories.tsx
├── chat/                  # Feature-specific components
│   ├── chat-window.tsx
│   ├── chat-sidebar.tsx
│   └── index.ts          # Barrel export
└── shared/               # Shared components
    ├── layout/
    ├── navigation/
    └── feedback/
```

## Documentation

### 1. JSDoc Comments

````tsx
/**
 * Button component with multiple variants and sizes
 *
 * @component
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 *
 * // Loading state
 * <Button disabled>
 *   <Loader2 className="animate-spin mr-2" />
 *   Loading...
 * </Button>
 * ```
 *
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Button component
 */
````

### 2. TypeScript Types

Always export component prop types:

```tsx
export interface ComponentProps {
  /** Optional CSS class name */
  className?: string
  /** Child elements */
  children: React.ReactNode
  /** Whether the component is disabled */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
}
```

## Checklist

Before submitting a component:

- [ ] Component follows naming conventions
- [ ] Props are properly typed with TypeScript
- [ ] Component has JSDoc documentation
- [ ] Dark mode styles are included
- [ ] Accessibility attributes are present
- [ ] Component is tested (unit + a11y)
- [ ] Storybook story is created
- [ ] Component is responsive
- [ ] Performance is optimized (memoization, lazy loading)
- [ ] Error and loading states are handled
