import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '../switch'

describe('Switch', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Switch />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeInTheDocument()
      expect(switchEl).toHaveAttribute('aria-checked', 'false')
    })

    it('renders with custom id', () => {
      render(<Switch id="test-switch" />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('id', 'test-switch')
    })

    it('renders in checked state', () => {
      render(<Switch checked={true} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-checked', 'true')
    })

    it('renders in unchecked state', () => {
      render(<Switch checked={false} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveAttribute('aria-checked', 'false')
    })

    it('applies custom className', () => {
      render(<Switch className="custom-class" />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveClass('custom-class')
    })
  })

  describe('interactions', () => {
    it('calls onCheckedChange when clicked', () => {
      const handleChange = vi.fn()
      render(<Switch checked={false} onCheckedChange={handleChange} />)

      const switchEl = screen.getByRole('switch')
      fireEvent.click(switchEl)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('toggles from true to false', () => {
      const handleChange = vi.fn()
      render(<Switch checked={true} onCheckedChange={handleChange} />)

      const switchEl = screen.getByRole('switch')
      fireEvent.click(switchEl)

      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('does not call onCheckedChange when disabled', () => {
      const handleChange = vi.fn()
      render(<Switch disabled={true} onCheckedChange={handleChange} />)

      const switchEl = screen.getByRole('switch')
      fireEvent.click(switchEl)

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('works without onCheckedChange callback', () => {
      render(<Switch checked={false} />)
      const switchEl = screen.getByRole('switch')

      // Should not throw
      expect(() => fireEvent.click(switchEl)).not.toThrow()
    })
  })

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Switch disabled={true} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeDisabled()
    })

    it('is not disabled by default', () => {
      render(<Switch />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).not.toBeDisabled()
    })

    it('has correct cursor style when disabled', () => {
      render(<Switch disabled={true} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('accessibility', () => {
    it('has correct role', () => {
      render(<Switch />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('has correct aria-checked attribute', () => {
      const { rerender } = render(<Switch checked={false} />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')

      rerender(<Switch checked={true} />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    })

    it('is a button element', () => {
      render(<Switch />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl.tagName).toBe('BUTTON')
      expect(switchEl).toHaveAttribute('type', 'button')
    })
  })

  describe('styling', () => {
    it('has green background when checked', () => {
      render(<Switch checked={true} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveClass('bg-green-600')
    })

    it('has gray background when unchecked', () => {
      render(<Switch checked={false} />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toHaveClass('bg-gray-200')
    })
  })
})
