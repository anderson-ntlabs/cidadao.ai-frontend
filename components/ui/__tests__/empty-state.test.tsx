import { render, screen, fireEvent } from '@testing-library/react'
import { Search, FileX, AlertCircle } from 'lucide-react'
import { EmptyState, EmptyStateSearch, EmptyStateError } from '../empty-state'

describe('EmptyState', () => {
  it('should render with required props', () => {
    render(<EmptyState icon={Search} title="No results" />)

    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<EmptyState icon={Search} title="No results" description="Try adjusting your search" />)

    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        icon={Search}
        title="No results"
        action={{
          label: 'Clear filters',
          onClick: handleClick,
        }}
      />
    )

    const button = screen.getByRole('button', { name: 'Clear filters' })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render secondary action when provided', () => {
    const handlePrimary = vi.fn()
    const handleSecondary = vi.fn()

    render(
      <EmptyState
        icon={Search}
        title="No results"
        action={{
          label: 'Primary',
          onClick: handlePrimary,
        }}
        secondaryAction={{
          label: 'Secondary',
          onClick: handleSecondary,
        }}
      />
    )

    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    expect(handleSecondary).toHaveBeenCalledTimes(1)
  })

  it('should apply size variants correctly', () => {
    const { rerender, container } = render(<EmptyState icon={Search} title="Test" size="sm" />)

    // Small size should have py-6 padding
    expect(container.firstChild).toHaveClass('py-6')

    rerender(<EmptyState icon={Search} title="Test" size="md" />)
    expect(container.firstChild).toHaveClass('py-8')

    rerender(<EmptyState icon={Search} title="Test" size="lg" />)
    expect(container.firstChild).toHaveClass('py-12')
  })

  it('should apply variant styles correctly', () => {
    const { container } = render(<EmptyState icon={AlertCircle} title="Error" variant="error" />)

    // Error variant should have red background on icon container
    const iconContainer = container.querySelector('.bg-red-50')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<EmptyState icon={Search} title="Test" className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have accessible role and label', () => {
    render(<EmptyState icon={Search} title="No items found" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'No items found')
  })
})

describe('EmptyStateSearch', () => {
  it('should render with default props', () => {
    render(<EmptyStateSearch />)

    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
  })

  it('should display search term when provided', () => {
    render(<EmptyStateSearch searchTerm="test query" />)

    expect(screen.getByText(/test query/)).toBeInTheDocument()
  })

  it('should call onClear when clear button clicked', () => {
    const handleClear = vi.fn()
    render(<EmptyStateSearch onClear={handleClear} />)

    const button = screen.getByRole('button', { name: 'Limpar busca' })
    fireEvent.click(button)

    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('should not render clear button when onClear not provided', () => {
    render(<EmptyStateSearch />)

    expect(screen.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument()
  })
})

describe('EmptyStateError', () => {
  it('should render with default props', () => {
    render(<EmptyStateError />)

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(
      screen.getByText('Ocorreu um erro ao carregar os dados. Por favor, tente novamente.')
    ).toBeInTheDocument()
  })

  it('should display custom error message', () => {
    render(<EmptyStateError message="Custom error message" />)

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('should call onRetry when retry button clicked', () => {
    const handleRetry = vi.fn()
    render(<EmptyStateError onRetry={handleRetry} />)

    const button = screen.getByRole('button', { name: 'Tentar novamente' })
    fireEvent.click(button)

    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('should not render retry button when onRetry not provided', () => {
    render(<EmptyStateError />)

    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('should use error variant styling', () => {
    const { container } = render(<EmptyStateError />)

    // Should have error variant background
    const iconContainer = container.querySelector('.bg-red-50')
    expect(iconContainer).toBeInTheDocument()
  })
})
