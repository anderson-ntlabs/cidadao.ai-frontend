import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders without type attribute when not specified', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('renders with custom type', () => {
      render(<Input type="email" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
    })

    it('renders with initial value', () => {
      render(<Input value="Initial value" onChange={() => {}} />)
      expect(screen.getByDisplayValue('Initial value')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant classes', () => {
      render(<Input variant="default" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('border-input')
    })

    it('applies error variant when error prop is true', () => {
      render(<Input error data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('border-destructive')
    })

    it('applies success variant when success prop is true', () => {
      render(<Input success data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('border-green-500')
    })

    it('error prop overrides variant', () => {
      render(<Input variant="success" error data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('border-destructive')
    })
  })

  describe('Sizes', () => {
    it('applies default size classes', () => {
      render(<Input inputSize="default" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('h-10')
    })

    it('applies small size classes', () => {
      render(<Input inputSize="sm" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('h-9')
    })

    it('applies large size classes', () => {
      render(<Input inputSize="lg" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('h-11')
    })

    it('applies extra large size classes', () => {
      render(<Input inputSize="xl" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('h-12')
    })
  })

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">🔍</span>}
          data-testid="input"
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toHaveClass('pl-10')
    })

    it('renders with right icon', () => {
      render(
        <Input
          rightIcon={<span data-testid="right-icon">✓</span>}
          data-testid="input"
        />
      )
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toHaveClass('pr-10')
    })

    it('renders with both left and right icons', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">🔍</span>}
          rightIcon={<span data-testid="right-icon">✓</span>}
          data-testid="input"
        />
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toHaveClass('pl-10', 'pr-10')
    })
  })

  describe('Helper Text', () => {
    it('renders helper text when provided', () => {
      render(<Input helperText="This is helper text" />)
      expect(screen.getByText('This is helper text')).toBeInTheDocument()
    })

    it('applies error styling to helper text when error is true', () => {
      render(<Input error helperText="Error message" />)
      const helperText = screen.getByText('Error message')
      expect(helperText).toHaveClass('text-destructive')
    })

    it('applies success styling to helper text when success is true', () => {
      render(<Input success helperText="Success message" />)
      const helperText = screen.getByText('Success message')
      expect(helperText).toHaveClass('text-green-600')
    })

    it('applies default styling to helper text', () => {
      render(<Input helperText="Normal helper text" />)
      const helperText = screen.getByText('Normal helper text')
      expect(helperText).toHaveClass('text-muted-foreground')
    })

    it('does not render helper text when not provided', () => {
      const { container } = render(<Input />)
      const helperTextElement = container.querySelector('p')
      expect(helperTextElement).not.toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />)
      expect(screen.getByTestId('input')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input disabled data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('shows placeholder text', () => {
      render(<Input placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('supports required attribute', () => {
      render(<Input required data-testid="input" />)
      expect(screen.getByTestId('input')).toBeRequired()
    })

    it('supports readonly attribute', () => {
      render(<Input readOnly data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('readonly')
    })
  })

  describe('Interactions', () => {
    it('calls onChange handler when value changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} data-testid="input" />)
      await user.type(screen.getByTestId('input'), 'Hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value on user input', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" />)

      const input = screen.getByTestId('input')
      await user.type(input, 'Test input')

      expect(input).toHaveValue('Test input')
    })

    it('calls onFocus handler when focused', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Input onFocus={handleFocus} data-testid="input" />)
      await user.click(screen.getByTestId('input'))

      expect(handleFocus).toHaveBeenCalled()
    })

    it('calls onBlur handler when blurred', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(<Input onBlur={handleBlur} data-testid="input" />)
      const input = screen.getByTestId('input')

      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalled()
    })

    it('does not allow input when disabled', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input disabled onChange={handleChange} data-testid="input" />)
      const input = screen.getByTestId('input')

      await user.type(input, 'Test')

      expect(handleChange).not.toHaveBeenCalled()
      expect(input).toHaveValue('')
    })
  })

  describe('Input Types', () => {
    it('supports email type', () => {
      render(<Input type="email" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
    })

    it('supports password type', () => {
      render(<Input type="password" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')
    })

    it('supports number type', () => {
      render(<Input type="number" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
    })

    it('supports search type', () => {
      render(<Input type="search" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'search')
    })

    it('supports tel type', () => {
      render(<Input type="tel" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel')
    })

    it('supports url type', () => {
      render(<Input type="url" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'url')
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Email address" data-testid="input" />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('supports aria-describedby for helper text', () => {
      render(
        <Input
          aria-describedby="helper"
          helperText="Helper text"
          data-testid="input"
        />
      )
      expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'helper')
    })

    it('supports aria-invalid for error state', () => {
      render(<Input error aria-invalid="true" data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Custom Classes', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('flex') // default class
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })
})
