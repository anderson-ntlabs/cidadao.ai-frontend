import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Providers } from '../providers'

// Mock next/navigation with configurable pathname
let mockPathname: string | null = null

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

// Mock the AuthProvider
vi.mock('@/hooks/use-supabase-auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}))

describe('Providers', () => {
  beforeEach(() => {
    mockPathname = null
  })

  it('renders children on public routes without AuthProvider', () => {
    mockPathname = '/pt'
    render(
      <Providers>
        <div>Child Content</div>
      </Providers>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-provider')).not.toBeInTheDocument()
  })

  it('wraps children with AuthProvider on auth routes', () => {
    mockPathname = '/pt/agora/dashboard'
    render(
      <Providers>
        <span>Test</span>
      </Providers>
    )
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('wraps children with AuthProvider on app routes', () => {
    mockPathname = '/pt/app/chat'
    render(
      <Providers>
        <span>App Content</span>
      </Providers>
    )
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('App Content')).toBeInTheDocument()
  })

  it('skips AuthProvider for about page', () => {
    mockPathname = '/pt/about'
    render(
      <Providers>
        <div>About Content</div>
      </Providers>
    )
    expect(screen.getByText('About Content')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-provider')).not.toBeInTheDocument()
  })

  it('renders multiple children', () => {
    mockPathname = '/pt/agora'
    render(
      <Providers>
        <div>First</div>
        <div>Second</div>
      </Providers>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
