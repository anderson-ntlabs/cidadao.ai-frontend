import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BreadcrumbsV2, BreadcrumbsV2Mobile, BreadcrumbsV2Schema } from '../breadcrumbs'
import { FileText, Settings } from 'lucide-react'

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return {
    ...actual,
    ChevronRight: () => <svg data-testid="chevron-icon" />,
    Home: () => <svg data-testid="home-icon" />,
  }
})

describe('BreadcrumbsV2', () => {
  const defaultItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ]

  describe('rendering', () => {
    it('renders navigation element', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders all items', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders home link by default', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    })

    it('hides home link when showHome is false', () => {
      render(<BreadcrumbsV2 items={defaultItems} showHome={false} />)
      expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument()
    })
  })

  describe('links', () => {
    it('renders links for items with href', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard')
    })

    it('renders span for current item', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      const profile = screen.getByText('Profile')
      expect(profile.closest('span')).toBeInTheDocument()
      expect(profile.closest('a')).toBeNull()
    })

    it('marks current page with aria-current', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      // aria-current is on the outer span wrapper
      const profileText = screen.getByText('Profile')
      const currentItem = profileText.parentElement
      expect(currentItem).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('separators', () => {
    it('renders chevron separator by default', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      expect(screen.getAllByTestId('chevron-icon').length).toBeGreaterThan(0)
    })

    it('renders slash separator', () => {
      render(<BreadcrumbsV2 items={defaultItems} separator="slash" />)
      expect(screen.getAllByText('/').length).toBeGreaterThan(0)
    })

    it('renders arrow separator', () => {
      render(<BreadcrumbsV2 items={defaultItems} separator="arrow" />)
      expect(screen.getAllByText('→').length).toBeGreaterThan(0)
    })

    it('renders dot separator', () => {
      render(<BreadcrumbsV2 items={defaultItems} separator="dot" />)
      expect(screen.getAllByText('•').length).toBeGreaterThan(0)
    })
  })

  describe('variants', () => {
    it('applies variant styles', () => {
      const { container } = render(<BreadcrumbsV2 items={defaultItems} variant="prominent" />)
      expect(container.querySelector('nav')).toHaveClass('text-gray-700')
    })

    it('applies spacing styles', () => {
      const { container } = render(<BreadcrumbsV2 items={defaultItems} spacing="relaxed" />)
      expect(container.querySelector('nav')).toHaveClass('gap-3')
    })
  })

  describe('maxItems', () => {
    it('collapses items when exceeding maxItems', () => {
      const manyItems = [
        { label: 'One', href: '/one' },
        { label: 'Two', href: '/two' },
        { label: 'Three', href: '/three' },
        { label: 'Four', href: '/four' },
        { label: 'Five' },
      ]

      render(<BreadcrumbsV2 items={manyItems} maxItems={3} />)
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  describe('custom home', () => {
    it('uses custom home href', () => {
      render(<BreadcrumbsV2 items={defaultItems} homeHref="/en/app" />)
      const homeLink = screen.getByLabelText('Início')
      expect(homeLink).toHaveAttribute('href', '/en/app')
    })

    it('uses custom home label', () => {
      render(<BreadcrumbsV2 items={defaultItems} homeLabel="Home" />)
      expect(screen.getByLabelText('Home')).toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('renders item icons', () => {
      const itemsWithIcons = [
        { label: 'Files', href: '/files', icon: FileText },
        { label: 'Config', icon: Settings },
      ]

      const { container } = render(<BreadcrumbsV2 items={itemsWithIcons} showHome={false} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('callbacks', () => {
    it('calls onItemClick when item clicked', () => {
      const onItemClick = vi.fn()
      render(<BreadcrumbsV2 items={defaultItems} onItemClick={onItemClick} />)

      fireEvent.click(screen.getByText('Dashboard'))
      expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ label: 'Dashboard' }))
    })

    it('calls onItemClick for home link', () => {
      const onItemClick = vi.fn()
      render(<BreadcrumbsV2 items={defaultItems} onItemClick={onItemClick} />)

      fireEvent.click(screen.getByLabelText('Início'))
      expect(onItemClick).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has aria-label on navigation', () => {
      render(<BreadcrumbsV2 items={defaultItems} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('marks separators as aria-hidden', () => {
      const { container } = render(<BreadcrumbsV2 items={defaultItems} />)
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]')
      expect(hiddenElements.length).toBeGreaterThan(0)
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<BreadcrumbsV2 items={defaultItems} className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })
})

describe('BreadcrumbsV2Mobile', () => {
  const defaultItems = [
    { label: 'Home', href: '/home' },
    { label: 'Category', href: '/category' },
    { label: 'Current Page' },
  ]

  describe('rendering', () => {
    it('renders current page as heading', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      expect(screen.getByRole('heading')).toHaveTextContent('Current Page')
    })

    it('renders back link to previous page', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      expect(screen.getByText('Category')).toBeInTheDocument()
    })
  })

  describe('expand/collapse', () => {
    it('shows expand button when more than 2 levels', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('expands to show full path on click', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Caminho completo:')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('collapses on second click', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)

      fireEvent.click(screen.getByRole('button'))
      fireEvent.click(screen.getByRole('button'))

      expect(screen.queryByText('Caminho completo:')).not.toBeInTheDocument()
    })

    it('hides expand button with only 2 items', () => {
      const twoItems = [{ label: 'Home', href: '/home' }, { label: 'Page' }]

      render(<BreadcrumbsV2Mobile items={twoItems} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('onBack callback', () => {
    it('calls onBack when back link clicked', () => {
      const onBack = vi.fn()
      render(<BreadcrumbsV2Mobile items={defaultItems} onBack={onBack} />)

      fireEvent.click(screen.getByText('Category'))
      expect(onBack).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('expand button has aria-expanded attribute', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('has accessible labels', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      expect(screen.getByLabelText('Mostrar caminho completo')).toBeInTheDocument()
    })

    it('has WCAG compliant touch targets', () => {
      render(<BreadcrumbsV2Mobile items={defaultItems} />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    })
  })
})

describe('BreadcrumbsV2Schema', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Shoes' },
  ]

  it('renders script element', () => {
    const { container } = render(
      <BreadcrumbsV2Schema items={items} baseUrl="https://example.com" />
    )
    expect(container.querySelector('script')).toBeInTheDocument()
  })

  it('has correct schema type', () => {
    const { container } = render(
      <BreadcrumbsV2Schema items={items} baseUrl="https://example.com" />
    )
    const script = container.querySelector('script')
    const schema = JSON.parse(script?.innerHTML || '{}')

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('BreadcrumbList')
  })

  it('includes items with href', () => {
    const { container } = render(
      <BreadcrumbsV2Schema items={items} baseUrl="https://example.com" />
    )
    const script = container.querySelector('script')
    const schema = JSON.parse(script?.innerHTML || '{}')

    expect(schema.itemListElement).toHaveLength(2) // Only items with href
    expect(schema.itemListElement[0].name).toBe('Home')
    expect(schema.itemListElement[0].item).toBe('https://example.com/')
  })

  it('uses correct positions', () => {
    const { container } = render(
      <BreadcrumbsV2Schema items={items} baseUrl="https://example.com" />
    )
    const script = container.querySelector('script')
    const schema = JSON.parse(script?.innerHTML || '{}')

    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].position).toBe(2)
  })

  it('excludes items without href', () => {
    const { container } = render(
      <BreadcrumbsV2Schema items={items} baseUrl="https://example.com" />
    )
    const script = container.querySelector('script')
    const schema = JSON.parse(script?.innerHTML || '{}')

    const names = schema.itemListElement.map((item: any) => item.name)
    expect(names).not.toContain('Shoes')
  })
})
