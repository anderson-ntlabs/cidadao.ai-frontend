import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('DIV')
    })

    it('renders children correctly', () => {
      render(
        <Badge>
          <span>Custom content</span>
        </Badge>
      )
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant classes', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies secondary variant classes', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('applies destructive variant classes', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('applies outline variant classes', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-foreground', 'border')
    })

    it('applies success variant classes', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('applies warning variant classes', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('applies info variant classes', () => {
      render(<Badge variant="info" data-testid="badge">Info</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })
  })

  describe('Sizes', () => {
    it('applies default size classes', () => {
      render(<Badge size="default" data-testid="badge">Default Size</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-xs')
    })

    it('applies small size classes', () => {
      render(<Badge size="sm" data-testid="badge">Small</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-2', 'text-[10px]')
    })

    it('applies large size classes', () => {
      render(<Badge size="lg" data-testid="badge">Large</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('px-3', 'text-sm')
    })
  })

  describe('Base Styling', () => {
    it('applies base badge classes', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'font-semibold',
        'transition-colors'
      )
    })

    it('applies focus styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('Removable Badge', () => {
    it('renders remove button when removable is true', () => {
      render(<Badge removable>Removable</Badge>)
      const removeButton = screen.getByLabelText('Remove badge')
      expect(removeButton).toBeInTheDocument()
    })

    it('does not render remove button by default', () => {
      render(<Badge>Not Removable</Badge>)
      const removeButton = screen.queryByLabelText('Remove badge')
      expect(removeButton).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', async () => {
      const handleRemove = vi.fn()
      const user = userEvent.setup()

      render(
        <Badge removable onRemove={handleRemove}>
          Remove Me
        </Badge>
      )

      const removeButton = screen.getByLabelText('Remove badge')
      await user.click(removeButton)

      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it('renders SVG close icon in remove button', () => {
      render(<Badge removable>Badge</Badge>)
      const removeButton = screen.getByLabelText('Remove badge')
      const svg = removeButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applies hover styles to remove button', () => {
      render(<Badge removable>Badge</Badge>)
      const removeButton = screen.getByLabelText('Remove badge')
      expect(removeButton).toHaveClass('hover:bg-black/10')
    })
  })

  describe('Custom Classes', () => {
    it('merges custom className with default classes', () => {
      render(
        <Badge className="custom-badge" data-testid="badge">
          Custom
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-badge')
      expect(badge).toHaveClass('inline-flex') // default class
    })
  })

  describe('Accessibility', () => {
    it('remove button has proper aria-label', () => {
      render(<Badge removable>Badge</Badge>)
      const removeButton = screen.getByLabelText('Remove badge')
      expect(removeButton).toHaveAttribute('aria-label', 'Remove badge')
    })

    it('remove button has correct type attribute', () => {
      render(<Badge removable>Badge</Badge>)
      const removeButton = screen.getByLabelText('Remove badge')
      expect(removeButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Variant and Size Combinations', () => {
    it('combines success variant with small size', () => {
      render(
        <Badge variant="success" size="sm" data-testid="badge">
          Small Success
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'px-2')
    })

    it('combines warning variant with large size', () => {
      render(
        <Badge variant="warning" size="lg" data-testid="badge">
          Large Warning
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'px-3', 'text-sm')
    })

    it('combines outline variant with default size', () => {
      render(
        <Badge variant="outline" size="default" data-testid="badge">
          Outlined Default
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('border', 'text-foreground', 'px-2.5')
    })
  })

  describe('HTML Attributes', () => {
    it('supports data attributes', () => {
      render(<Badge data-testid="test-badge" data-value="123">Badge</Badge>)
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('data-value', '123')
    })

    it('supports onClick handler', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Badge onClick={handleClick}>Clickable</Badge>)
      await user.click(screen.getByText('Clickable'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports aria attributes', () => {
      render(
        <Badge aria-label="Status badge" data-testid="badge">
          Status
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })
  })
})
