import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'
import { Search, X } from 'lucide-react'

describe('Input', () => {
  it('should render a basic input', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('border-input')
  })

  it('should forward ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle text input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)

    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello world')

    expect(input).toHaveValue('Hello world')
  })

  it('should apply different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)

    let input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" placeholder="Password" />)
    input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" placeholder="Number" />)
    input = screen.getByPlaceholderText('Number')
    expect(input).toHaveAttribute('type', 'number')
  })

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Input placeholder="Default" />)
      const input = screen.getByPlaceholderText('Default')
      expect(input).toHaveClass('border-input')
    })

    it('should render error variant', () => {
      render(<Input error placeholder="Error input" />)
      const input = screen.getByPlaceholderText('Error input')
      expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive')
    })

    it('should render success variant', () => {
      render(<Input success placeholder="Success input" />)
      const input = screen.getByPlaceholderText('Success input')
      expect(input).toHaveClass('border-green-500', 'focus-visible:ring-green-500')
    })

    it('should prioritize error over success', () => {
      render(<Input error success placeholder="Priority test" />)
      const input = screen.getByPlaceholderText('Priority test')
      expect(input).toHaveClass('border-destructive')
      expect(input).not.toHaveClass('border-green-500')
    })

    it('should use custom variant when no error/success', () => {
      render(<Input variant="error" placeholder="Custom variant" />)
      const input = screen.getByPlaceholderText('Custom variant')
      expect(input).toHaveClass('border-destructive')
    })
  })

  describe('sizes', () => {
    it('should render default size', () => {
      render(<Input placeholder="Default size" />)
      const input = screen.getByPlaceholderText('Default size')
      expect(input).toHaveClass('h-11', 'px-4', 'py-3') // Mobile-optimized: 44px (WCAG AAA)
    })

    it('should render small size', () => {
      render(<Input inputSize="sm" placeholder="Small" />)
      const input = screen.getByPlaceholderText('Small')
      expect(input).toHaveClass('h-10', 'px-3', 'py-2', 'text-xs') // 40px (WCAG AA)
    })

    it('should render large size', () => {
      render(<Input inputSize="lg" placeholder="Large" />)
      const input = screen.getByPlaceholderText('Large')
      expect(input).toHaveClass('h-12', 'px-5', 'py-3.5') // 48px
    })

    it('should render extra large size', () => {
      render(<Input inputSize="xl" placeholder="Extra large" />)
      const input = screen.getByPlaceholderText('Extra large')
      expect(input).toHaveClass('h-14', 'px-6', 'py-4', 'text-base') // 56px
    })
  })

  describe('icons', () => {
    it('should render with left icon', () => {
      render(<Input leftIcon={<Search size={16} />} placeholder="Search" />)

      const input = screen.getByPlaceholderText('Search')
      const icon = input.parentElement?.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(input).toHaveClass('pl-10')
    })

    it('should render with right icon', () => {
      render(<Input rightIcon={<X size={16} />} placeholder="Clear" />)

      const input = screen.getByPlaceholderText('Clear')
      const icon = input.parentElement?.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(input).toHaveClass('pr-10')
    })

    it('should render with both icons', () => {
      render(
        <Input
          leftIcon={<Search size={16} />}
          rightIcon={<X size={16} />}
          placeholder="Search with clear"
        />
      )

      const input = screen.getByPlaceholderText('Search with clear')
      const icons = input.parentElement?.querySelectorAll('svg')

      expect(icons).toHaveLength(2)
      expect(input).toHaveClass('pl-10', 'pr-10')
    })

    it('should position icons correctly', () => {
      const { container } = render(
        <Input
          leftIcon={<Search data-testid="left-icon" />}
          rightIcon={<X data-testid="right-icon" />}
          placeholder="Icons"
        />
      )

      const leftContainer = container.querySelector('.left-3')
      const rightContainer = container.querySelector('.right-3')

      expect(leftContainer).toBeInTheDocument()
      expect(rightContainer).toBeInTheDocument()
      expect(leftContainer).toHaveClass('absolute', 'top-1/2', '-translate-y-1/2')
      expect(rightContainer).toHaveClass('absolute', 'top-1/2', '-translate-y-1/2')
    })
  })

  describe('helper text', () => {
    it('should render helper text', () => {
      render(<Input placeholder="Input" helperText="This is helper text" />)

      const helperText = screen.getByText('This is helper text')
      expect(helperText).toBeInTheDocument()
      expect(helperText).toHaveClass('text-xs', 'text-muted-foreground')
    })

    it('should render error helper text', () => {
      render(<Input error placeholder="Error" helperText="This field is required" />)

      const helperText = screen.getByText('This field is required')
      expect(helperText).toHaveClass('text-destructive')
    })

    it('should render success helper text', () => {
      render(<Input success placeholder="Success" helperText="Valid input" />)

      const helperText = screen.getByText('Valid input')
      expect(helperText).toHaveClass('text-green-600')
    })

    it('should not render helper text when not provided', () => {
      const { container } = render(<Input placeholder="No helper" />)

      const helperText = container.querySelector('p')
      expect(helperText).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should handle disabled state', () => {
      render(<Input disabled placeholder="Disabled" />)

      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled placeholder="Disabled" />)

      const input = screen.getByPlaceholderText('Disabled')
      await user.type(input, 'Test')

      expect(input).toHaveValue('')
    })
  })

  describe('custom props', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Input
          placeholder="Custom"
          maxLength={10}
          required
          autoComplete="off"
          data-testid="custom-input"
        />
      )

      const input = screen.getByPlaceholderText('Custom')
      expect(input).toHaveAttribute('maxlength', '10')
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('autocomplete', 'off')
      expect(input).toHaveAttribute('data-testid', 'custom-input')
    })

    it('should merge custom className', () => {
      render(<Input className="custom-class another-class" placeholder="Custom class" />)

      const input = screen.getByPlaceholderText('Custom class')
      expect(input).toHaveClass('custom-class', 'another-class')
      // Should still have default classes
      expect(input).toHaveClass('border', 'rounded-md')
    })
  })

  describe('controlled input', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      let value = ''
      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        value = e.target.value
      }

      const { rerender } = render(
        <Input value={value} onChange={onChange} placeholder="Controlled" />
      )

      const input = screen.getByPlaceholderText('Controlled')
      await user.type(input, 'Test')

      // Simulate controlled behavior
      rerender(<Input value="Test" onChange={onChange} placeholder="Controlled" />)
      expect(input).toHaveValue('Test')
    })
  })

  describe('accessibility', () => {
    it('should support aria attributes', () => {
      render(
        <Input
          placeholder="Accessible"
          aria-label="Search input"
          aria-describedby="search-help"
          aria-invalid={true}
        />
      )

      const input = screen.getByPlaceholderText('Accessible')
      expect(input).toHaveAttribute('aria-label', 'Search input')
      expect(input).toHaveAttribute('aria-describedby', 'search-help')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('display name', () => {
    it('should have correct display name', () => {
      expect(Input.displayName).toBe('Input')
    })
  })
})
