import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SafeAreaView,
  SafeAreaTop,
  SafeAreaBottom,
  SafeAreaHorizontal,
  useSafeAreaInsets,
} from '../safe-area-view'
import { renderHook } from '@testing-library/react'

describe('SafeAreaView', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<SafeAreaView>Test content</SafeAreaView>)
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders as div by default', () => {
      render(<SafeAreaView>Content</SafeAreaView>)
      expect(screen.getByText('Content').tagName).toBe('DIV')
    })

    it('renders as section when specified', () => {
      render(<SafeAreaView as="section">Content</SafeAreaView>)
      expect(screen.getByText('Content').tagName).toBe('SECTION')
    })

    it('renders as main when specified', () => {
      render(<SafeAreaView as="main">Content</SafeAreaView>)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('renders as header when specified', () => {
      render(<SafeAreaView as="header">Content</SafeAreaView>)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders as footer when specified', () => {
      render(<SafeAreaView as="footer">Content</SafeAreaView>)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders as article when specified', () => {
      render(<SafeAreaView as="article">Content</SafeAreaView>)
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('safe area styles with padding (default)', () => {
    it('applies all safe area padding by default', () => {
      render(<SafeAreaView>Content</SafeAreaView>)
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      })
    })

    it('applies only top padding when specified', () => {
      render(
        <SafeAreaView top bottom={false} left={false} right={false}>
          Content
        </SafeAreaView>
      )
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({ paddingTop: 'env(safe-area-inset-top)' })
      expect(element.style.paddingBottom).toBe('')
      expect(element.style.paddingLeft).toBe('')
      expect(element.style.paddingRight).toBe('')
    })

    it('applies only bottom padding when specified', () => {
      render(
        <SafeAreaView bottom top={false} left={false} right={false}>
          Content
        </SafeAreaView>
      )
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' })
      expect(element.style.paddingTop).toBe('')
    })

    it('applies horizontal padding only', () => {
      render(
        <SafeAreaView left right top={false} bottom={false}>
          Content
        </SafeAreaView>
      )
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      })
      expect(element.style.paddingTop).toBe('')
      expect(element.style.paddingBottom).toBe('')
    })
  })

  describe('safe area styles with margin', () => {
    it('applies all safe area margin when usePadding is false', () => {
      render(<SafeAreaView usePadding={false}>Content</SafeAreaView>)
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({
        marginTop: 'env(safe-area-inset-top)',
        marginBottom: 'env(safe-area-inset-bottom)',
        marginLeft: 'env(safe-area-inset-left)',
        marginRight: 'env(safe-area-inset-right)',
      })
    })

    it('applies only top margin when specified', () => {
      render(
        <SafeAreaView usePadding={false} top bottom={false} left={false} right={false}>
          Content
        </SafeAreaView>
      )
      const element = screen.getByText('Content')

      expect(element).toHaveStyle({ marginTop: 'env(safe-area-inset-top)' })
      expect(element.style.marginBottom).toBe('')
    })
  })

  describe('className prop', () => {
    it('applies custom className', () => {
      render(<SafeAreaView className="custom-class">Content</SafeAreaView>)
      expect(screen.getByText('Content')).toHaveClass('custom-class')
    })

    it('combines multiple class names', () => {
      render(<SafeAreaView className="class-a class-b">Content</SafeAreaView>)
      const element = screen.getByText('Content')
      expect(element).toHaveClass('class-a', 'class-b')
    })
  })
})

describe('SafeAreaTop', () => {
  it('renders children', () => {
    render(<SafeAreaTop>Header content</SafeAreaTop>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies only top padding', () => {
    render(<SafeAreaTop>Header</SafeAreaTop>)
    const element = screen.getByText('Header')

    expect(element).toHaveStyle({ paddingTop: 'env(safe-area-inset-top)' })
    expect(element.style.paddingBottom).toBe('')
    expect(element.style.paddingLeft).toBe('')
    expect(element.style.paddingRight).toBe('')
  })

  it('applies custom className', () => {
    render(<SafeAreaTop className="header-class">Header</SafeAreaTop>)
    expect(screen.getByText('Header')).toHaveClass('header-class')
  })

  it('supports as prop', () => {
    render(<SafeAreaTop as="header">Header</SafeAreaTop>)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

describe('SafeAreaBottom', () => {
  it('renders children', () => {
    render(<SafeAreaBottom>Footer content</SafeAreaBottom>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies only bottom padding', () => {
    render(<SafeAreaBottom>Footer</SafeAreaBottom>)
    const element = screen.getByText('Footer')

    expect(element).toHaveStyle({ paddingBottom: 'env(safe-area-inset-bottom)' })
    expect(element.style.paddingTop).toBe('')
    expect(element.style.paddingLeft).toBe('')
    expect(element.style.paddingRight).toBe('')
  })

  it('applies custom className', () => {
    render(<SafeAreaBottom className="footer-class">Footer</SafeAreaBottom>)
    expect(screen.getByText('Footer')).toHaveClass('footer-class')
  })

  it('supports as prop', () => {
    render(<SafeAreaBottom as="footer">Footer</SafeAreaBottom>)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('SafeAreaHorizontal', () => {
  it('renders children', () => {
    render(<SafeAreaHorizontal>Content</SafeAreaHorizontal>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies only horizontal padding', () => {
    render(<SafeAreaHorizontal>Content</SafeAreaHorizontal>)
    const element = screen.getByText('Content')

    expect(element).toHaveStyle({
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    })
    expect(element.style.paddingTop).toBe('')
    expect(element.style.paddingBottom).toBe('')
  })

  it('applies custom className', () => {
    render(<SafeAreaHorizontal className="horizontal-class">Content</SafeAreaHorizontal>)
    expect(screen.getByText('Content')).toHaveClass('horizontal-class')
  })
})

describe('useSafeAreaInsets', () => {
  it('returns inset values', () => {
    const { result } = renderHook(() => useSafeAreaInsets())

    expect(result.current).toHaveProperty('top')
    expect(result.current).toHaveProperty('bottom')
    expect(result.current).toHaveProperty('left')
    expect(result.current).toHaveProperty('right')
  })

  it('returns numbers', () => {
    const { result } = renderHook(() => useSafeAreaInsets())

    expect(typeof result.current.top).toBe('number')
    expect(typeof result.current.bottom).toBe('number')
    expect(typeof result.current.left).toBe('number')
    expect(typeof result.current.right).toBe('number')
  })

  it('returns 0 for unset insets', () => {
    const { result } = renderHook(() => useSafeAreaInsets())

    // In JSDOM, CSS env variables are not supported, so all should be 0
    expect(result.current.top).toBe(0)
    expect(result.current.bottom).toBe(0)
    expect(result.current.left).toBe(0)
    expect(result.current.right).toBe(0)
  })
})
