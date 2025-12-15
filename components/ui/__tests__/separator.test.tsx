import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from '../separator'

describe('Separator', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Separator className="custom-separator" data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveClass('custom-separator')
    })

    it('passes additional props', () => {
      render(<Separator data-testid="separator" id="my-separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('id', 'my-separator')
    })
  })

  describe('orientation', () => {
    it('renders horizontal by default', () => {
      render(<Separator data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-[1px]', 'w-full')
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('renders horizontal when specified', () => {
      render(<Separator orientation="horizontal" data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-[1px]', 'w-full')
    })

    it('renders vertical when specified', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('h-full', 'w-[1px]')
      expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    })
  })

  describe('accessibility', () => {
    it('has role none when decorative (default)', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('role', 'none')
    })

    it('has role separator when not decorative', () => {
      render(<Separator decorative={false} data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('role', 'separator')
    })

    it('has aria-orientation attribute', () => {
      render(<Separator orientation="vertical" data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('aria-orientation', 'vertical')
    })
  })

  describe('styling', () => {
    it('has background color class', () => {
      render(<Separator data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveClass('bg-gray-200')
    })

    it('has shrink-0 class', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveClass('shrink-0')
    })
  })
})
