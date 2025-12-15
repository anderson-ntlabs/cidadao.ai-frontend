import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Checkbox label="Accept terms" />)
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(<Checkbox label="Newsletter" description="Receive updates" />)
      expect(screen.getByText('Receive updates')).toBeInTheDocument()
    })

    it('renders without label or description', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('checked state', () => {
    it('is unchecked by default', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('is checked when checked prop is true', () => {
      render(<Checkbox checked={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('is unchecked when checked prop is false', () => {
      render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('shows check icon when checked', () => {
      render(<Checkbox checked={true} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })

    it('does not show check icon when unchecked', () => {
      render(<Checkbox checked={false} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      expect(container?.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onChange when clicked', () => {
      const handleChange = vi.fn()
      render(<Checkbox onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalled()
    })

    it('toggles checked state on click', () => {
      const handleChange = vi.fn()
      render(<Checkbox checked={false} onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).toHaveBeenCalled()
    })

    it('does not call onChange when disabled', () => {
      const handleChange = vi.fn()
      render(<Checkbox disabled={true} onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Checkbox disabled={true} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('is not disabled by default', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeDisabled()
    })

    it('has disabled styles on visual checkbox', () => {
      render(<Checkbox disabled={true} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toHaveClass('opacity-50')
    })
  })

  describe('variants', () => {
    it('applies error variant', () => {
      render(<Checkbox error={true} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toBeInTheDocument()
    })

    it('applies success variant', () => {
      render(<Checkbox success={true} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toBeInTheDocument()
    })

    it('error label has destructive class', () => {
      render(<Checkbox label="Error field" error={true} />)
      const label = screen.getByText('Error field')
      expect(label).toHaveClass('text-destructive')
    })
  })

  describe('sizes', () => {
    it('applies small size', () => {
      render(<Checkbox size="sm" />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toHaveClass('h-4', 'w-4')
    })

    it('applies default size', () => {
      render(<Checkbox size="default" />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toHaveClass('h-5', 'w-5')
    })

    it('applies large size', () => {
      render(<Checkbox size="lg" />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toHaveClass('h-6', 'w-6')
    })
  })

  describe('accessibility', () => {
    it('checkbox is hidden but accessible', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('sr-only')
    })

    it('label is associated with checkbox', () => {
      render(<Checkbox label="My Label" id="my-checkbox" />)
      const label = screen.getByText('My Label')
      expect(label).toHaveAttribute('for', 'my-checkbox')
    })

    it('visual checkbox shows correct data-state', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      const container = screen.getByRole('checkbox').parentElement?.parentElement
      const visualCheckbox = container?.querySelector('[data-state]')
      expect(visualCheckbox).toHaveAttribute('data-state', 'unchecked')

      rerender(<Checkbox checked={true} />)
      expect(visualCheckbox).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('controlled vs uncontrolled', () => {
    it('works as uncontrolled component', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')

      expect(checkbox).not.toBeChecked()
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('updates when checked prop changes', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      rerender(<Checkbox checked={true} />)
      expect(checkbox).toBeChecked()
    })
  })
})
