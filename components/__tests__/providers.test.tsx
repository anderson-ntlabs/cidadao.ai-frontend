import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Providers } from '../providers'

// Mock the AuthProvider
vi.mock('@/hooks/use-supabase-auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}))

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <div>Child Content</div>
      </Providers>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('wraps children with AuthProvider', () => {
    render(
      <Providers>
        <span>Test</span>
      </Providers>
    )
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
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
