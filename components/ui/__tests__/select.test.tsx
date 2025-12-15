import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../select'

describe('Select', () => {
  const renderSelect = (props = {}) => {
    return render(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  describe('rendering', () => {
    it('renders trigger button', () => {
      renderSelect()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders placeholder when no value', () => {
      renderSelect()
      expect(screen.getByText('Select option')).toBeInTheDocument()
    })

    it('does not show content initially', () => {
      renderSelect()
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('opens dropdown when trigger is clicked', () => {
      renderSelect()
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('item clicks are handled when handleSelect is provided', () => {
      const handleSelect = vi.fn()
      render(
        <SelectItem value="test-value" handleSelect={handleSelect}>
          Option
        </SelectItem>
      )

      fireEvent.click(screen.getByText('Option'))
      expect(handleSelect).toHaveBeenCalledWith('test-value')
    })

    it('closes dropdown when clicking outside', () => {
      renderSelect()

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      expect(screen.getByText('Option 1')).toBeInTheDocument()

      fireEvent.mouseDown(document.body)
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })

    it('toggles dropdown on multiple clicks', () => {
      renderSelect()
      const trigger = screen.getByRole('button')

      // Open
      fireEvent.click(trigger)
      expect(screen.getByText('Option 1')).toBeInTheDocument()

      // Close
      fireEvent.click(trigger)
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()

      // Open again
      fireEvent.click(trigger)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('does not open when disabled', () => {
      renderSelect({ disabled: true })

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })

    it('trigger is disabled', () => {
      renderSelect({ disabled: true })
      const trigger = screen.getByRole('button')
      expect(trigger).toBeDisabled()
    })
  })

  describe('value display', () => {
    it('shows placeholder when no direct value on SelectValue', () => {
      render(
        <Select value="option2">
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      // SelectValue shows placeholder when value isn't passed directly
      expect(screen.getByText('Select option')).toBeInTheDocument()
    })
  })
})

describe('SelectTrigger', () => {
  it('renders children', () => {
    render(
      <SelectTrigger>
        <span>Custom Content</span>
      </SelectTrigger>
    )
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <SelectTrigger className="custom-trigger">
        <span>Content</span>
      </SelectTrigger>
    )
    expect(screen.getByRole('button')).toHaveClass('custom-trigger')
  })

  it('renders chevron icon', () => {
    render(
      <SelectTrigger>
        <span>Content</span>
      </SelectTrigger>
    )
    // ChevronDown icon should be present
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('rotates chevron when open', () => {
    render(
      <SelectTrigger isOpen={true}>
        <span>Content</span>
      </SelectTrigger>
    )
    const svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toHaveClass('rotate-180')
  })
})

describe('SelectValue', () => {
  it('shows placeholder when no value', () => {
    render(<SelectValue placeholder="Select..." />)
    expect(screen.getByText('Select...')).toBeInTheDocument()
  })

  it('shows value when provided', () => {
    render(<SelectValue value="selected-value" placeholder="Select..." />)
    expect(screen.getByText('selected-value')).toBeInTheDocument()
  })

  it('shows children when no value or placeholder', () => {
    render(<SelectValue>Default Text</SelectValue>)
    expect(screen.getByText('Default Text')).toBeInTheDocument()
  })

  it('prioritizes value over placeholder', () => {
    render(<SelectValue value="value" placeholder="placeholder" />)
    expect(screen.getByText('value')).toBeInTheDocument()
    expect(screen.queryByText('placeholder')).not.toBeInTheDocument()
  })
})

describe('SelectContent', () => {
  it('renders children when open', () => {
    render(
      <SelectContent isOpen={true}>
        <div>Content</div>
      </SelectContent>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <SelectContent isOpen={false}>
        <div>Content</div>
      </SelectContent>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <SelectContent isOpen={true} className="custom-content">
        <div>Content</div>
      </SelectContent>
    )
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-content')
  })
})

describe('SelectItem', () => {
  it('renders children', () => {
    render(<SelectItem value="test">Item Text</SelectItem>)
    expect(screen.getByText('Item Text')).toBeInTheDocument()
  })

  it('calls handleSelect with value when clicked', () => {
    const handleSelect = vi.fn()
    render(
      <SelectItem value="test-value" handleSelect={handleSelect}>
        Item
      </SelectItem>
    )

    fireEvent.click(screen.getByText('Item'))
    expect(handleSelect).toHaveBeenCalledWith('test-value')
  })

  it('applies custom className', () => {
    render(
      <SelectItem value="test" className="custom-item">
        Item
      </SelectItem>
    )
    expect(screen.getByText('Item')).toHaveClass('custom-item')
  })

  it('is a button element', () => {
    render(<SelectItem value="test">Item</SelectItem>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
