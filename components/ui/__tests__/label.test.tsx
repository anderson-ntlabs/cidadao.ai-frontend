import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label', () => {
  describe('rendering', () => {
    it('renders with text content', () => {
      render(<Label>Username</Label>)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('renders as a label element', () => {
      render(<Label>Email</Label>)
      const label = screen.getByText('Email')
      expect(label.tagName).toBe('LABEL')
    })

    it('renders children', () => {
      render(
        <Label>
          <span>Custom</span> Label
        </Label>
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('has default text styles', () => {
      render(<Label>Label</Label>)
      const label = screen.getByText('Label')
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
    })

    it('applies custom className', () => {
      render(<Label className="custom-label">Label</Label>)
      expect(screen.getByText('Label')).toHaveClass('custom-label')
    })

    it('has peer-disabled styles', () => {
      render(<Label>Label</Label>)
      const label = screen.getByText('Label')
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
    })
  })

  describe('props', () => {
    it('passes htmlFor attribute', () => {
      render(<Label htmlFor="email-input">Email</Label>)
      const label = screen.getByText('Email')
      expect(label).toHaveAttribute('for', 'email-input')
    })

    it('passes additional HTML attributes', () => {
      render(
        <Label data-testid="test-label" id="my-label">
          Label
        </Label>
      )
      const label = screen.getByTestId('test-label')
      expect(label).toHaveAttribute('id', 'my-label')
    })

    it('accepts ref', () => {
      const ref = { current: null }
      render(<Label ref={ref}>Label</Label>)
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    })
  })

  describe('accessibility', () => {
    it('works with form controls', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Input</Label>
          <input id="test-input" type="text" />
        </div>
      )
      const label = screen.getByText('Test Input')
      const input = screen.getByRole('textbox')

      expect(label).toHaveAttribute('for', 'test-input')
      expect(input).toHaveAttribute('id', 'test-input')
    })
  })
})
