import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextArea } from '../textarea'

describe('TextArea', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<TextArea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<TextArea placeholder="Enter text..." />)
      const textarea = screen.getByPlaceholderText('Enter text...')
      expect(textarea).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<TextArea label="Description" />)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('renders with helper text', () => {
      render(<TextArea helperText="Enter a brief description" />)
      expect(screen.getByText('Enter a brief description')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<TextArea defaultValue="Default text" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Default text')
    })
  })

  describe('interactions', () => {
    it('calls onChange when text changes', () => {
      const handleChange = vi.fn()
      render(<TextArea onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'New text' } })

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value on change', () => {
      render(<TextArea />)
      const textarea = screen.getByRole('textbox')

      fireEvent.change(textarea, { target: { value: 'Updated' } })
      expect(textarea).toHaveValue('Updated')
    })
  })

  describe('maxLength', () => {
    it('shows character count when showCount is true', () => {
      render(<TextArea showCount defaultValue="test" />)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('shows maxLength with count', () => {
      render(<TextArea showCount maxLength={100} defaultValue="test" />)
      expect(screen.getByText('4 / 100')).toBeInTheDocument()
    })

    it('prevents typing beyond maxLength', () => {
      render(<TextArea maxLength={5} />)
      const textarea = screen.getByRole('textbox')

      fireEvent.change(textarea, { target: { value: 'hello' } })
      expect(textarea).toHaveValue('hello')

      fireEvent.change(textarea, { target: { value: 'hello world' } })
      // Value should still be 'hello' due to maxLength check
      expect(textarea).toHaveValue('hello')
    })
  })

  describe('variants', () => {
    it('applies error variant', () => {
      render(<TextArea error={true} label="Error field" />)
      const label = screen.getByText('Error field')
      expect(label).toHaveClass('text-destructive')
    })

    it('applies success variant', () => {
      render(<TextArea success={true} label="Success field" />)
      const label = screen.getByText('Success field')
      expect(label).toHaveClass('text-green-600')
    })

    it('error helper text has destructive class', () => {
      render(<TextArea error={true} helperText="This field is required" />)
      const helper = screen.getByText('This field is required')
      expect(helper).toHaveClass('text-destructive')
    })
  })

  describe('sizes', () => {
    it('applies small size', () => {
      render(<TextArea textareaSize="sm" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[80px]')
    })

    it('applies default size', () => {
      render(<TextArea textareaSize="default" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[120px]')
    })

    it('applies large size', () => {
      render(<TextArea textareaSize="lg" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[160px]')
    })

    it('applies extra large size', () => {
      render(<TextArea textareaSize="xl" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[200px]')
    })
  })

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<TextArea disabled={true} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('is not disabled by default', () => {
      render(<TextArea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).not.toBeDisabled()
    })
  })

  describe('autoResize', () => {
    it('has overflow-hidden when autoResize is true', () => {
      render(<TextArea autoResize={true} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('overflow-hidden')
    })
  })

  describe('accessibility', () => {
    it('label is associated with textarea', () => {
      render(<TextArea label="Comments" id="my-textarea" />)
      const label = screen.getByText('Comments')
      expect(label).toHaveAttribute('for', 'my-textarea')
    })

    it('textarea has maxLength attribute', () => {
      render(<TextArea maxLength={500} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxLength', '500')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<TextArea className="custom-textarea" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('custom-textarea')
    })
  })
})
