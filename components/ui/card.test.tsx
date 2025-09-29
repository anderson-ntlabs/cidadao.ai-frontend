import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { setupUserEvent } from '@/test/utils/test-helpers'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardBadge,
  CardStat 
} from './card'

describe('Card', () => {
  it('renders card with content', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { container, rerender } = render(<Card variant="elevated">Elevated</Card>)
    let card = container.firstElementChild
    expect(card).toHaveClass('shadow-xl', 'backdrop-blur-lg')

    rerender(<Card variant="outlined">Outlined</Card>)
    card = container.firstElementChild
    expect(card).toHaveClass('backdrop-blur-sm', 'border')

    rerender(<Card variant="ghost">Ghost</Card>)
    card = container.firstElementChild
    expect(card).toHaveClass('bg-transparent')

    rerender(<Card variant="filled">Filled</Card>)
    card = container.firstElementChild
    expect(card).toHaveClass('backdrop-blur-sm')
  })

  it('renders with different padding sizes', () => {
    const { container, rerender } = render(<Card padding="sm">Small padding</Card>)
    let card = container.firstElementChild
    expect(card).toHaveClass('p-card-sm')

    rerender(<Card padding="lg">Large padding</Card>)
    card = container.firstElementChild
    expect(card).toHaveClass('p-card-lg')

    rerender(<Card padding="none">No padding</Card>)
    card = container.firstElementChild
    expect(card).not.toHaveClass('p-card')
  })

  it('handles interactive state', async () => {
    const user = await setupUserEvent()
    const handleClick = vi.fn()
    
    const { container } = render(
      <Card interactive onClick={handleClick}>
        Interactive card
      </Card>
    )
    
    const card = container.firstElementChild as HTMLElement
    expect(card).toHaveClass('cursor-pointer', 'hover-lift')
    
    await user.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom</Card>)
    const card = container.firstElementChild
    expect(card).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Card ref={ref}>With Ref</Card>)
    
    expect(ref).toHaveBeenCalled()
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
  })
})

describe('Card Components', () => {
  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>
          Content goes here
        </CardContent>
        <CardFooter>
          Footer content
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card Title').tagName).toBe('H3')
    expect(screen.getByText('Card description text')).toBeInTheDocument()
    expect(screen.getByText('Content goes here')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('CardHeader has proper spacing', () => {
    render(
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
    )
    
    const header = screen.getByText('Title').parentElement
    expect(header).toHaveClass('flex', 'flex-col', 'gap-2', 'mb-4')
  })

  it('CardFooter has border and spacing', () => {
    render(<CardFooter>Footer</CardFooter>)
    
    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('border-t', 'pt-4', 'mt-6')
  })
})

describe('CardBadge', () => {
  it('renders with different variants', () => {
    const { rerender } = render(
      <CardBadge variant="success">Success</CardBadge>
    )
    let badge = screen.getByText('Success')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')

    rerender(<CardBadge variant="warning">Warning</CardBadge>)
    badge = screen.getByText('Warning')
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')

    rerender(<CardBadge variant="danger">Danger</CardBadge>)
    badge = screen.getByText('Danger')
    expect(badge).toHaveClass('bg-red-100', 'text-red-800')

    rerender(<CardBadge variant="info">Info</CardBadge>)
    badge = screen.getByText('Info')
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('renders as inline element with proper styling', () => {
    render(<CardBadge>Badge</CardBadge>)
    
    const badge = screen.getByText('Badge')
    expect(badge.tagName).toBe('SPAN')
    expect(badge).toHaveClass('inline-flex', 'rounded-full', 'text-xs')
  })
})

describe('CardStat', () => {
  it('renders basic stat card', () => {
    render(
      <CardStat
        title="Total Users"
        value="1,234"
        description="All time"
      />
    )
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('renders with trend indicator', () => {
    render(
      <CardStat
        title="Revenue"
        value="$10,000"
        trend={{ value: 15, isPositive: true }}
      />
    )
    
    expect(screen.getByText('↑')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
    const trendElement = screen.getByText('↑').parentElement
    expect(trendElement).toHaveClass('text-green-600')
  })

  it('renders negative trend', () => {
    render(
      <CardStat
        title="Costs"
        value="$5,000"
        trend={{ value: 10, isPositive: false }}
      />
    )
    
    expect(screen.getByText('↓')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    const trendElement = screen.getByText('↓').parentElement
    expect(trendElement).toHaveClass('text-red-600')
  })

  it('renders with icon', () => {
    const icon = <span data-testid="stat-icon">📊</span>
    render(
      <CardStat
        title="Analytics"
        value="42"
        icon={icon}
      />
    )
    
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
  })

  it('has decorative gradient', () => {
    const { container } = render(
      <CardStat title="Test" value="100" />
    )
    
    const gradient = container.querySelector('.bg-gradient-to-r')
    expect(gradient).toBeInTheDocument()
    expect(gradient).toHaveClass('from-green-600', 'via-yellow-500', 'to-blue-600')
  })
})