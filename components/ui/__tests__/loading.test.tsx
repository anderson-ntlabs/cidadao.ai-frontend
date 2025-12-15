import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading, LoadingDots, LoadingBar, ButtonLoading } from '../loading'

describe('Loading', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Loading />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
    })

    it('has default aria-label', () => {
      render(<Loading />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Carregando...')
    })

    it('has screen reader text', () => {
      render(<Loading />)
      expect(screen.getByText('Carregando...')).toHaveClass('sr-only')
    })
  })

  describe('text prop', () => {
    it('renders loading text', () => {
      render(<Loading text="Processing..." />)
      // Text appears twice: in sr-only span and visible paragraph
      const texts = screen.getAllByText('Processing...')
      expect(texts).toHaveLength(2)
      // The visible text is in a <p> tag
      const visibleText = texts.find((el) => el.tagName === 'P')
      expect(visibleText).toBeInTheDocument()
    })

    it('uses text for aria-label', () => {
      render(<Loading text="Loading data" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading data')
    })
  })

  describe('sizes', () => {
    it('applies xs size', () => {
      render(<Loading size="xs" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-4', 'h-4')
    })

    it('applies sm size', () => {
      render(<Loading size="sm" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-5', 'h-5')
    })

    it('applies md size (default)', () => {
      render(<Loading size="md" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-8', 'h-8')
    })

    it('applies lg size', () => {
      render(<Loading size="lg" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-12', 'h-12')
    })

    it('applies xl size', () => {
      render(<Loading size="xl" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('w-16', 'h-16')
    })
  })

  describe('colors', () => {
    it('applies green color (default)', () => {
      render(<Loading color="green" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('border-t-green-600')
    })

    it('applies blue color', () => {
      render(<Loading color="blue" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('border-t-blue-600')
    })

    it('applies white color', () => {
      render(<Loading color="white" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('border-t-white')
    })
  })

  describe('fullScreen mode', () => {
    it('renders in fullScreen overlay', () => {
      render(<Loading fullScreen />)
      const overlay = screen.getByRole('status').closest('.fixed')
      expect(overlay).toHaveClass('inset-0', 'z-50')
    })

    it('has backdrop blur', () => {
      render(<Loading fullScreen />)
      const overlay = screen.getByRole('status').closest('.fixed')
      expect(overlay).toHaveClass('backdrop-blur-sm')
    })
  })

  describe('centered mode', () => {
    it('centers the loading indicator', () => {
      render(<Loading centered />)
      const wrapper = screen.getByRole('status').closest('.flex')
      expect(wrapper).toHaveClass('items-center', 'justify-center')
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      render(<Loading className="custom-spinner" />)
      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('custom-spinner')
    })
  })
})

describe('LoadingDots', () => {
  it('renders three dots', () => {
    const { container } = render(<LoadingDots />)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots).toHaveLength(3)
  })

  it('has bounce animation', () => {
    const { container } = render(<LoadingDots />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(3)
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingDots className="custom-dots" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-dots')
  })
})

describe('LoadingBar', () => {
  describe('indeterminate mode', () => {
    it('renders indeterminate bar when no progress', () => {
      const { container } = render(<LoadingBar />)
      const bar = container.querySelector(
        '.animate-\\[indeterminate_1\\.5s_ease-in-out_infinite\\]'
      )
      expect(bar).toBeInTheDocument()
    })
  })

  describe('determinate mode', () => {
    it('renders progress bar with width', () => {
      const { container } = render(<LoadingBar progress={50} />)
      const bar = container.querySelector('[style*="width"]')
      expect(bar).toHaveStyle({ width: '50%' })
    })

    it('clamps progress at 0', () => {
      const { container } = render(<LoadingBar progress={-10} />)
      const bar = container.querySelector('[style*="width"]')
      expect(bar).toHaveStyle({ width: '0%' })
    })

    it('clamps progress at 100', () => {
      const { container } = render(<LoadingBar progress={150} />)
      const bar = container.querySelector('[style*="width"]')
      expect(bar).toHaveStyle({ width: '100%' })
    })
  })

  describe('showPercent', () => {
    it('shows percentage when showPercent is true', () => {
      render(<LoadingBar progress={75} showPercent />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('does not show percentage by default', () => {
      render(<LoadingBar progress={75} />)
      expect(screen.queryByText('75%')).not.toBeInTheDocument()
    })

    it('rounds percentage to whole number', () => {
      render(<LoadingBar progress={33.7} showPercent />)
      expect(screen.getByText('34%')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(<LoadingBar className="custom-bar" />)
      expect(container.firstChild).toHaveClass('custom-bar')
    })
  })
})

describe('ButtonLoading', () => {
  it('renders xs size spinner', () => {
    render(<ButtonLoading />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-4', 'h-4')
  })

  it('renders white color', () => {
    render(<ButtonLoading />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('border-t-white')
  })

  it('applies custom className', () => {
    render(<ButtonLoading className="custom-button-loading" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-button-loading')
  })
})
