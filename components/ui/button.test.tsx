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

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(button).toHaveClass('hover:bg-gray-100/50')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(button).toHaveClass('from-red-600', 'to-red-700')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8', 'px-3', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(button).toHaveClass('h-12', 'px-6', 'text-lg')

    rerender(<Button size="icon">Icon</Button>)
    expect(button).toHaveClass('h-10', 'w-10', 'p-0')
  })

  it('handles click events', async () => {
    const user = await setupUserEvent()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Loading')).toBeInTheDocument()
    
    // Check for spinner
    const spinner = button.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('renders with left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">←</span>
    const rightIcon = <span data-testid="right-icon">→</span>
    
    render(
      <Button leftIcon={leftIcon} rightIcon={rightIcon}>
        With Icons
      </Button>
    )
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icons')).toBeInTheDocument()
  })

  it('does not show left icon when loading', () => {
    const leftIcon = <span data-testid="left-icon">←</span>
    
    render(
      <Button loading leftIcon={leftIcon}>
        Loading
      </Button>
    )
    
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>With Ref</Button>)
    
    expect(ref).toHaveBeenCalled()
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement)
  })

  it('defaults to type="button"', () => {
    render(<Button>Default Type</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveAttribute('type', 'button')
  })

  it('can set custom type', () => {
    render(<Button type="submit">Submit</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveAttribute('type', 'submit')
  })
})