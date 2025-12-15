import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from '../form-field'

describe('FormField', () => {
  describe('rendering', () => {
    it('renders label', () => {
      render(<FormField label="Email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('renders default input when no children', () => {
      render(<FormField label="Email" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(
        <FormField label="Name">
          <input type="text" placeholder="Enter name" />
        </FormField>
      )
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
    })
  })

  describe('required field', () => {
    it('shows asterisk when required', () => {
      render(<FormField label="Username" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('asterisk has aria-label', () => {
      render(<FormField label="Username" required />)
      const asterisk = screen.getByText('*')
      expect(asterisk).toHaveAttribute('aria-label', 'required')
    })

    it('does not show asterisk when not required', () => {
      render(<FormField label="Optional" />)
      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('description', () => {
    it('renders description when provided', () => {
      render(<FormField label="Password" description="Must be at least 8 characters" />)
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
      const { container } = render(<FormField label="Email" />)
      const descriptions = container.querySelectorAll('p.text-gray-500')
      expect(descriptions).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('renders error message', () => {
      render(<FormField label="Email" error="Invalid email format" />)
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })

    it('error has alert role', () => {
      render(<FormField label="Email" error="Error" />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('error text has red styling', () => {
      render(<FormField label="Email" error="Error" />)
      const errorText = screen.getByText('Error')
      expect(errorText).toHaveClass('text-red-600')
    })

    it('does not render error when not provided', () => {
      render(<FormField label="Email" />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('label is associated with input', () => {
      render(<FormField label="Email" />)
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      expect(label).toHaveAttribute('for')
      expect(input).toHaveAttribute('id', label.getAttribute('for'))
    })

    it('input has aria-invalid when error exists', () => {
      render(<FormField label="Email" error="Invalid" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('input has aria-required when required', () => {
      render(<FormField label="Email" required />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('input has aria-describedby when description exists', () => {
      render(<FormField label="Email" description="Help text" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby')
    })

    it('input has aria-describedby when error exists', () => {
      render(<FormField label="Email" error="Error text" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby')
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<FormField label="Email" className="custom-field" />)
      expect(container.querySelector('.custom-field')).toBeInTheDocument()
    })

    it('has form-field class', () => {
      const { container } = render(<FormField label="Email" />)
      expect(container.querySelector('.form-field')).toBeInTheDocument()
    })
  })

  describe('error styling on input', () => {
    it('adds border-red-500 class to default input when error', () => {
      render(<FormField label="Email" error="Invalid" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })
  })
})
