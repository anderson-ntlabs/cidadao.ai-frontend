import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
  CardStat
} from '@/components/ui/card'

describe('Card Component', () => {
  describe('Card - Rendering', () => {
    it('renders card element', () => {
      render(<Card data-testid="card">Card content</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(<Card>Test content</Card>)
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })
  })

  describe('Card - Variants', () => {
    it('applies elevated variant classes (default)', () => {
      render(<Card variant="elevated" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/90', 'shadow-xl')
    })

    it('applies outlined variant classes', () => {
      render(<Card variant="outlined" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/80', 'border')
    })

    it('applies ghost variant classes', () => {
      render(<Card variant="ghost" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-transparent')
    })

    it('applies filled variant classes', () => {
      render(<Card variant="filled" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-gray-50/90')
    })
  })

  describe('Card - Padding', () => {
    it('applies medium padding (default)', () => {
      render(<Card padding="md" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('p-card')
    })

    it('applies small padding', () => {
      render(<Card padding="sm" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('p-card-sm')
    })

    it('applies large padding', () => {
      render(<Card padding="lg" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('p-card-lg')
    })

    it('applies no padding', () => {
      render(<Card padding="none" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('p-card')
    })

    it('applies responsive padding', () => {
      render(<Card padding="responsive" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('p-card-sm')
    })
  })

  describe('Card - Interactive', () => {
    it('applies interactive classes when interactive is true', () => {
      render(<Card interactive data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('cursor-pointer', 'hover-lift')
    })

    it('does not apply interactive classes by default', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Card - Custom Classes', () => {
    it('merges custom className with default classes', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('rounded-2xl') // default class
    })
  })

  describe('CardHeader', () => {
    it('renders header with children', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies default header classes', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'mb-4')
    })

    it('merges custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex')
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Card Title</CardTitle>)
      const title = screen.getByText('Card Title')
      expect(title.tagName).toBe('H3')
    })

    it('applies default title classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('font-semibold')
    })

    it('merges custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
      expect(title).toHaveClass('font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('renders as paragraph element', () => {
      render(<CardDescription>Description text</CardDescription>)
      const desc = screen.getByText('Description text')
      expect(desc.tagName).toBe('P')
    })

    it('applies default description classes', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('text-sm', 'leading-relaxed')
    })

    it('merges custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('custom-desc')
      expect(desc).toHaveClass('text-sm')
    })
  })

  describe('CardContent', () => {
    it('renders content with children', () => {
      render(<CardContent>Content text</CardContent>)
      expect(screen.getByText('Content text')).toBeInTheDocument()
    })

    it('applies default content classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('text-gray-700')
    })

    it('merges custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('text-gray-700')
    })
  })

  describe('CardFooter', () => {
    it('renders footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies default footer classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex', 'items-center', 'justify-between', 'border-t', 'pt-4', 'mt-6')
    })

    it('merges custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
      expect(footer).toHaveClass('flex')
    })
  })

  describe('CardBadge', () => {
    it('renders badge with children', () => {
      render(<CardBadge>Badge text</CardBadge>)
      expect(screen.getByText('Badge text')).toBeInTheDocument()
    })

    it('applies info variant classes (default)', () => {
      render(<CardBadge variant="info" data-testid="badge">Info</CardBadge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('applies success variant classes', () => {
      render(<CardBadge variant="success" data-testid="badge">Success</CardBadge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('applies warning variant classes', () => {
      render(<CardBadge variant="warning" data-testid="badge">Warning</CardBadge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('applies danger variant classes', () => {
      render(<CardBadge variant="danger" data-testid="badge">Danger</CardBadge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('applies base badge styling', () => {
      render(<CardBadge data-testid="badge">Badge</CardBadge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'text-xs', 'font-medium')
    })
  })

  describe('CardStat', () => {
    it('renders stat with title and value', () => {
      render(<CardStat title="Total Users" value={1234} />)
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1234')).toBeInTheDocument()
    })

    it('renders stat with string value', () => {
      render(<CardStat title="Revenue" value="R$ 10.000" />)
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('R$ 10.000')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      render(<CardStat title="Sales" value={500} description="Last 30 days" />)
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    it('renders positive trend indicator', () => {
      render(
        <CardStat
          title="Growth"
          value={100}
          trend={{ value: 12.5, isPositive: true }}
        />
      )
      expect(screen.getByText('↑')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()
    })

    it('renders negative trend indicator', () => {
      render(
        <CardStat
          title="Decline"
          value={50}
          trend={{ value: 8, isPositive: false }}
        />
      )
      expect(screen.getByText('↓')).toBeInTheDocument()
      expect(screen.getByText('8%')).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      render(
        <CardStat
          title="Users"
          value={100}
          icon={<span data-testid="icon">👤</span>}
        />
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('applies value styling', () => {
      render(<CardStat title="Metric" value={999} />)
      const value = screen.getByText('999')
      expect(value).toHaveClass('text-3xl', 'font-bold')
    })

    it('applies title styling', () => {
      render(<CardStat title="Test Metric" value={1} />)
      const title = screen.getByText('Test Metric')
      expect(title).toHaveClass('text-sm', 'font-medium')
    })
  })

  describe('Compound Card Usage', () => {
    it('renders complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
      expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to card element', () => {
      const ref = vi.fn()
      render(<Card ref={ref}>Content</Card>)
      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to CardHeader', () => {
      const ref = vi.fn()
      render(<CardHeader ref={ref}>Header</CardHeader>)
      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to CardTitle', () => {
      const ref = vi.fn()
      render(<CardTitle ref={ref}>Title</CardTitle>)
      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to CardContent', () => {
      const ref = vi.fn()
      render(<CardContent ref={ref}>Content</CardContent>)
      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to CardFooter', () => {
      const ref = vi.fn()
      render(<CardFooter ref={ref}>Footer</CardFooter>)
      expect(ref).toHaveBeenCalled()
    })
  })
})
