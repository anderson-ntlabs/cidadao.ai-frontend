/**
 * Survey Success Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurveySuccess } from '../survey-success'

// Mock variables
let mockShowSuccess = false
const mockDismissSuccess = vi.fn()
const mockLoadBadges = vi.fn()

vi.mock('@/store/survey-store', () => ({
  useSurveyStore: () => ({
    showSuccess: mockShowSuccess,
    dismissSuccess: mockDismissSuccess,
  }),
}))

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => ({
    loadBadges: mockLoadBadges,
  }),
}))

vi.mock('@/data/badges', () => ({
  BADGES: {
    colaborador: {
      type: 'colaborador',
      name_pt: 'Colaborador',
      name_en: 'Collaborator',
      description_pt: 'Participou da pesquisa de experiência',
      description_en: 'Participated in the experience survey',
      icon: 'medal',
      color: 'amber',
      rarity: 'common',
    },
  },
}))

describe('SurveySuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShowSuccess = false
  })

  it('does not render when showSuccess is false', () => {
    mockShowSuccess = false
    const { container } = render(<SurveySuccess />)

    expect(container.firstChild).toBeNull()
  })

  it('renders dialog when showSuccess is true', () => {
    mockShowSuccess = true
    render(<SurveySuccess />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays congratulations message in Portuguese', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="pt" />)

    expect(screen.getByText('Parabéns!')).toBeInTheDocument()
    expect(screen.getByText('Obrigado por compartilhar sua experiência!')).toBeInTheDocument()
  })

  it('displays congratulations message in English', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="en" />)

    expect(screen.getByText('Congratulations!')).toBeInTheDocument()
    expect(screen.getByText('Thank you for sharing your experience!')).toBeInTheDocument()
  })

  it('displays badge information in Portuguese', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="pt" />)

    expect(screen.getByText('Colaborador')).toBeInTheDocument()
    expect(screen.getByText('Participou da pesquisa de experiência')).toBeInTheDocument()
  })

  it('displays badge information in English', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="en" />)

    expect(screen.getByText('Collaborator')).toBeInTheDocument()
    expect(screen.getByText('Participated in the experience survey')).toBeInTheDocument()
  })

  it('calls dismissSuccess when close button is clicked', () => {
    mockShowSuccess = true
    render(<SurveySuccess />)

    const closeButton = screen.getByRole('button', { name: /fechar/i })
    fireEvent.click(closeButton)

    expect(mockDismissSuccess).toHaveBeenCalled()
  })

  it('calls dismissSuccess when Continue button is clicked', () => {
    mockShowSuccess = true
    render(<SurveySuccess />)

    const continueButton = screen.getByRole('button', { name: /continuar/i })
    fireEvent.click(continueButton)

    expect(mockDismissSuccess).toHaveBeenCalled()
  })

  it('calls dismissSuccess when backdrop is clicked', () => {
    mockShowSuccess = true
    render(<SurveySuccess />)

    // Find the backdrop (has aria-hidden="true")
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(mockDismissSuccess).toHaveBeenCalled()
  })

  it('has share button in Portuguese', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="pt" />)

    expect(screen.getByRole('button', { name: /compartilhar/i })).toBeInTheDocument()
  })

  it('has share button in English', () => {
    mockShowSuccess = true
    render(<SurveySuccess locale="en" />)

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
  })

  it('calls loadBadges when success is shown', () => {
    mockShowSuccess = true
    render(<SurveySuccess />)

    expect(mockLoadBadges).toHaveBeenCalled()
  })
})
