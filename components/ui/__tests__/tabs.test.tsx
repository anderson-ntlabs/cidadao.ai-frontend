import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs', () => {
  const renderTabs = (props = {}) => {
    return render(
      <Tabs defaultValue="tab1" {...props}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    )
  }

  describe('rendering', () => {
    it('renders all tab triggers', () => {
      renderTabs()
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Tab 3')).toBeInTheDocument()
    })

    it('renders default tab content', () => {
      renderTabs()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('does not render other tab contents initially', () => {
      renderTabs()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('switches content when tab is clicked', () => {
      renderTabs()

      fireEvent.click(screen.getByText('Tab 2'))

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('calls onValueChange when tab is clicked', () => {
      const handleChange = vi.fn()
      renderTabs({ onValueChange: handleChange })

      fireEvent.click(screen.getByText('Tab 2'))

      expect(handleChange).toHaveBeenCalledWith('tab2')
    })

    it('switches between all tabs', () => {
      renderTabs()

      // Start with Tab 1
      expect(screen.getByText('Content 1')).toBeInTheDocument()

      // Switch to Tab 2
      fireEvent.click(screen.getByText('Tab 2'))
      expect(screen.getByText('Content 2')).toBeInTheDocument()

      // Switch to Tab 3
      fireEvent.click(screen.getByText('Tab 3'))
      expect(screen.getByText('Content 3')).toBeInTheDocument()

      // Switch back to Tab 1
      fireEvent.click(screen.getByText('Tab 1'))
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })
  })

  describe('controlled mode', () => {
    it('uses controlled value', () => {
      renderTabs({ value: 'tab2' })
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('updates when value prop changes', () => {
      const { rerender } = render(
        <Tabs value="tab1" defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()

      rerender(
        <Tabs value="tab2" defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('applies custom className to Tabs container', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      expect(container.firstChild).toHaveClass('custom-tabs')
    })
  })
})

describe('TabsList', () => {
  it('renders children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <span>Custom Child</span>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByText('Custom Child')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list" data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByTestId('tabs-list')).toHaveClass('custom-list')
  })

  it('has default styling', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const list = screen.getByTestId('tabs-list')
    expect(list).toHaveClass('inline-flex', 'h-10', 'items-center')
  })
})

describe('TabsTrigger', () => {
  it('renders as button', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab Button</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const trigger = screen.getByRole('tab')
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
  })

  it('has correct role', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tab')).toBeInTheDocument()
  })

  it('has aria-selected true when selected', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'false')
  })

  it('applies selected styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByText('Tab 1')).toHaveClass('bg-background', 'shadow-sm')
  })

  it('applies custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole('tab')).toHaveClass('custom-trigger')
  })

  it('throws error when used outside Tabs', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TabsTrigger value="tab1">Tab</TabsTrigger>)
    }).toThrow('TabsTrigger must be used within Tabs')

    consoleError.mockRestore()
  })
})

describe('TabsContent', () => {
  it('renders content when selected', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content Here</TabsContent>
      </Tabs>
    )
    expect(screen.getByText('Content Here')).toBeInTheDocument()
  })

  it('does not render when not selected', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('has correct role', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content
        </TabsContent>
      </Tabs>
    )
    expect(screen.getByRole('tabpanel')).toHaveClass('custom-content')
  })

  it('throws error when used outside Tabs', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TabsContent value="tab1">Content</TabsContent>)
    }).toThrow('TabsContent must be used within Tabs')

    consoleError.mockRestore()
  })
})
