import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FindingNotice } from '../finding-notice'

describe('FindingNotice', () => {
  it('renders the Portuguese notice by default, linking to the responsible AI policy', () => {
    render(<FindingNotice />)
    expect(screen.getByText('Um achado não é uma acusação')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Saiba mais' })).toHaveAttribute(
      'href',
      '/pt/responsible-ai'
    )
  })

  it('renders the English notice', () => {
    render(<FindingNotice locale="en" />)
    expect(screen.getByText('A finding is not an accusation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      '/en/responsible-ai'
    )
  })
})
