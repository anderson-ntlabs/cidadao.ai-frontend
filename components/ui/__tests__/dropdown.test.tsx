import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown, DropdownMenu, DropdownItem, DropdownLabel, DropdownSeparator } from '../dropdown'

describe('Dropdown', () => {
  const renderDropdown = (props = {}) => {
    return render(
      <Dropdown trigger={<button>Open Menu</button>} {...props}>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }

  describe('rendering', () => {
    it('renders trigger', () => {
      renderDropdown()
      expect(screen.getByText('Open Menu')).toBeInTheDocument()
    })

    it('does not show content initially', () => {
      renderDropdown()
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('opens dropdown when trigger is clicked', () => {
      renderDropdown()
      fireEvent.click(screen.getByText('Open Menu'))
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('closes dropdown when clicked again', () => {
      renderDropdown()
      const trigger = screen.getByText('Open Menu')

      fireEvent.click(trigger)
      expect(screen.getByText('Item 1')).toBeInTheDocument()

      fireEvent.click(trigger)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', () => {
      renderDropdown()
      fireEvent.click(screen.getByText('Open Menu'))
      expect(screen.getByText('Item 1')).toBeInTheDocument()

      fireEvent.mouseDown(document.body)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('closes dropdown when item is clicked', () => {
      renderDropdown()
      fireEvent.click(screen.getByText('Open Menu'))

      const item = screen.getByText('Item 1')
      fireEvent.click(item)

      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('alignment', () => {
    it('aligns to start by default', () => {
      renderDropdown()
      fireEvent.click(screen.getByText('Open Menu'))

      const content = screen.getByText('Item 1').closest('.absolute')
      expect(content).toHaveClass('left-0')
    })

    it('aligns to center when specified', () => {
      renderDropdown({ align: 'center' })
      fireEvent.click(screen.getByText('Open Menu'))

      const content = screen.getByText('Item 1').closest('.absolute')
      expect(content).toHaveClass('left-1/2', '-translate-x-1/2')
    })

    it('aligns to end when specified', () => {
      renderDropdown({ align: 'end' })
      fireEvent.click(screen.getByText('Open Menu'))

      const content = screen.getByText('Item 1').closest('.absolute')
      expect(content).toHaveClass('right-0')
    })
  })

  describe('sideOffset', () => {
    it('applies default sideOffset', () => {
      renderDropdown()
      fireEvent.click(screen.getByText('Open Menu'))

      const content = screen.getByText('Item 1').closest('.absolute')
      expect(content).toHaveStyle({ top: 'calc(100% + 4px)' })
    })

    it('applies custom sideOffset', () => {
      renderDropdown({ sideOffset: 10 })
      fireEvent.click(screen.getByText('Open Menu'))

      const content = screen.getByText('Item 1').closest('.absolute')
      expect(content).toHaveStyle({ top: 'calc(100% + 10px)' })
    })
  })
})

describe('DropdownMenu', () => {
  it('renders children', () => {
    render(
      <DropdownMenu>
        <div>Menu Content</div>
      </DropdownMenu>
    )
    expect(screen.getByText('Menu Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <DropdownMenu className="custom-menu">
        <div>Content</div>
      </DropdownMenu>
    )
    expect(screen.getByText('Content').parentElement).toHaveClass('custom-menu')
  })

  it('has default padding class', () => {
    render(
      <DropdownMenu>
        <div>Content</div>
      </DropdownMenu>
    )
    expect(screen.getByText('Content').parentElement).toHaveClass('py-1')
  })
})

describe('DropdownItem', () => {
  it('renders children', () => {
    render(<DropdownItem>Item Text</DropdownItem>)
    expect(screen.getByText('Item Text')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DropdownItem className="custom-item">Item</DropdownItem>)
    expect(screen.getByText('Item').closest('div')).toHaveClass('custom-item')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<DropdownItem onClick={handleClick}>Clickable Item</DropdownItem>)

    fireEvent.click(screen.getByText('Clickable Item'))
    expect(handleClick).toHaveBeenCalled()
  })

  describe('disabled state', () => {
    it('has disabled styles when disabled', () => {
      render(<DropdownItem disabled>Disabled Item</DropdownItem>)
      const item = screen.getByText('Disabled Item').closest('div')
      expect(item).toHaveClass('pointer-events-none', 'opacity-50')
    })

    it('does not have hover styles when disabled', () => {
      render(<DropdownItem disabled>Disabled Item</DropdownItem>)
      const item = screen.getByText('Disabled Item').closest('div')
      expect(item).not.toHaveClass('hover:bg-accent')
    })
  })

  describe('selected state', () => {
    it('shows check icon when selected', () => {
      render(<DropdownItem selected>Selected Item</DropdownItem>)
      const item = screen.getByText('Selected Item').closest('div')
      expect(item?.querySelector('svg')).toBeInTheDocument()
    })

    it('has accent background when selected', () => {
      render(<DropdownItem selected>Selected Item</DropdownItem>)
      const item = screen.getByText('Selected Item').closest('div')
      expect(item).toHaveClass('bg-accent')
    })

    it('has padding for check icon when selected', () => {
      render(<DropdownItem selected>Selected Item</DropdownItem>)
      const span = screen.getByText('Selected Item')
      expect(span).toHaveClass('pl-6')
    })

    it('does not have padding when not selected', () => {
      render(<DropdownItem>Unselected Item</DropdownItem>)
      const span = screen.getByText('Unselected Item')
      expect(span).not.toHaveClass('pl-6')
    })
  })
})

describe('DropdownLabel', () => {
  it('renders children', () => {
    render(<DropdownLabel>Label Text</DropdownLabel>)
    expect(screen.getByText('Label Text')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DropdownLabel className="custom-label">Label</DropdownLabel>)
    expect(screen.getByText('Label')).toHaveClass('custom-label')
  })

  it('has font-semibold class', () => {
    render(<DropdownLabel>Label</DropdownLabel>)
    expect(screen.getByText('Label')).toHaveClass('font-semibold')
  })
})

describe('DropdownSeparator', () => {
  it('renders', () => {
    render(<DropdownSeparator data-testid="separator" />)
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<DropdownSeparator data-testid="separator" className="custom-sep" />)
    expect(screen.getByTestId('separator')).toHaveClass('custom-sep')
  })

  it('has correct height', () => {
    render(<DropdownSeparator data-testid="separator" />)
    expect(screen.getByTestId('separator')).toHaveClass('h-px')
  })

  it('has background color class', () => {
    render(<DropdownSeparator data-testid="separator" />)
    expect(screen.getByTestId('separator')).toHaveClass('bg-muted')
  })
})
