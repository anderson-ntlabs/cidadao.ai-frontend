/**
 * Tests for HeaderLogo component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeaderLogo } from '../header-logo'

// Mock dependencies
vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="logo-image"
    />
  ),
}))

describe('HeaderLogo', () => {
  describe('Rendering', () => {
    it('renders logo image', () => {
      render(<HeaderLogo href="/pt" />)

      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
    })

    it('renders brand name', () => {
      render(<HeaderLogo href="/pt" />)

      expect(screen.getByText('Cidadao.AI')).toBeInTheDocument()
    })

    it('uses forum-icon.png as logo source', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('src', '/forum-icon.png')
    })

    it('has correct alt text for logo', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('alt', 'Greek Forum')
    })
  })

  describe('Navigation', () => {
    it('renders link with correct href', () => {
      render(<HeaderLogo href="/pt" />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/pt')
    })

    it('supports different href values', () => {
      render(<HeaderLogo href="/en/app" />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/en/app')
    })
  })

  describe('Accessibility', () => {
    it('has aria-label for home navigation', () => {
      render(<HeaderLogo href="/pt" />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-label', 'Cidadao.AI Home')
    })
  })

  describe('Styling', () => {
    it('has flex layout for link', () => {
      render(<HeaderLogo href="/pt" />)

      const link = screen.getByRole('link')
      expect(link.className).toContain('flex')
      expect(link.className).toContain('items-center')
    })

    it('has group class for hover effects', () => {
      render(<HeaderLogo href="/pt" />)

      const link = screen.getByRole('link')
      expect(link.className).toContain('group')
    })

    it('logo image has rounded corners', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo.className).toContain('rounded-lg')
    })

    it('logo image has shadow', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo.className).toContain('shadow-md')
    })

    it('brand name has gradient styling', () => {
      render(<HeaderLogo href="/pt" />)

      const brandName = screen.getByText('Cidadao.AI')
      expect(brandName.className).toContain('bg-gradient-to-r')
      expect(brandName.className).toContain('bg-clip-text')
    })
  })

  describe('Image Dimensions', () => {
    it('logo has correct width', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('width', '40')
    })

    it('logo has correct height', () => {
      render(<HeaderLogo href="/pt" />)

      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('height', '40')
    })
  })
})
