/**
 * Survey FAB Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurveyFAB } from '../survey-fab'

// Mock the survey store
const mockOpenSurvey = vi.fn()
let mockHasCompleted = false
let mockIsOpen = false

vi.mock('@/store/survey-store', () => ({
  useSurveyStore: () => ({
    hasCompleted: mockHasCompleted,
    isOpen: mockIsOpen,
    openSurvey: mockOpenSurvey,
  }),
}))

describe('SurveyFAB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasCompleted = false
    mockIsOpen = false
  })

  it('renders main button with correct aria-label in Portuguese', () => {
    render(<SurveyFAB delay={0} />)

    const button = screen.getByRole('button', { name: /abrir pesquisa de experiência/i })
    expect(button).toBeInTheDocument()
  })

  it('renders main button with correct aria-label in English', () => {
    render(<SurveyFAB delay={0} locale="en" />)

    const button = screen.getByRole('button', { name: /open experience survey/i })
    expect(button).toBeInTheDocument()
  })

  it('calls openSurvey with "fab" when clicked', () => {
    render(<SurveyFAB delay={0} />)

    const button = screen.getByRole('button', { name: /abrir pesquisa/i })
    fireEvent.click(button)

    expect(mockOpenSurvey).toHaveBeenCalledWith('fab')
  })

  it('renders dismiss button', () => {
    render(<SurveyFAB delay={0} />)

    const dismissButton = screen.getByRole('button', { name: /dispensar pesquisa/i })
    expect(dismissButton).toBeInTheDocument()
  })

  it('renders dismiss button in English', () => {
    render(<SurveyFAB delay={0} locale="en" />)

    const dismissButton = screen.getByRole('button', { name: /dismiss survey/i })
    expect(dismissButton).toBeInTheDocument()
  })

  it('hides FAB when dismiss is clicked', () => {
    const { container } = render(<SurveyFAB delay={0} />)

    const dismissButton = screen.getByRole('button', { name: /dispensar pesquisa/i })
    fireEvent.click(dismissButton)

    // After dismiss, the component should return null
    expect(container.querySelector('button[aria-label*="Abrir"]')).not.toBeInTheDocument()
  })

  it('does not render when survey is completed', () => {
    mockHasCompleted = true
    const { container } = render(<SurveyFAB delay={0} />)

    expect(container.firstChild).toBeNull()
  })

  it('does not render when survey is open', () => {
    mockIsOpen = true
    const { container } = render(<SurveyFAB delay={0} />)

    expect(container.firstChild).toBeNull()
  })
})
