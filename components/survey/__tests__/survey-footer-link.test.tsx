/**
 * Survey Footer Link Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurveyFooterLink } from '../survey-footer-link'

// Mock variables
let mockCanTakeSurvey = true
let mockHasCompleted = false
const mockOpenFromFooter = vi.fn()

vi.mock('@/hooks/use-survey', () => ({
  useSurvey: () => ({
    canTakeSurvey: mockCanTakeSurvey,
    hasCompleted: mockHasCompleted,
    openFromFooter: mockOpenFromFooter,
  }),
}))

describe('SurveyFooterLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCanTakeSurvey = true
    mockHasCompleted = false
  })

  describe('when survey can be taken', () => {
    it('renders call-to-action button in Portuguese', () => {
      render(<SurveyFooterLink locale="pt" />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Avalie sua experiência')).toBeInTheDocument()
    })

    it('renders call-to-action button in English', () => {
      render(<SurveyFooterLink locale="en" />)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Rate your experience')).toBeInTheDocument()
    })

    it('calls openFromFooter when clicked', () => {
      render(<SurveyFooterLink />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOpenFromFooter).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(<SurveyFooterLink className="custom-class" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('when survey is completed', () => {
    beforeEach(() => {
      mockHasCompleted = true
      mockCanTakeSurvey = false
    })

    it('shows badge earned message in Portuguese', () => {
      render(<SurveyFooterLink locale="pt" />)

      expect(screen.getByText('Badge Conquistado!')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows badge earned message in English', () => {
      render(<SurveyFooterLink locale="en" />)

      expect(screen.getByText('Badge Earned!')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('applies custom className to badge message', () => {
      const { container } = render(<SurveyFooterLink className="custom-class" />)

      const messageDiv = container.firstChild
      expect(messageDiv).toHaveClass('custom-class')
    })
  })

  describe('when survey cannot be taken', () => {
    beforeEach(() => {
      mockCanTakeSurvey = false
      mockHasCompleted = false
    })

    it('renders nothing', () => {
      const { container } = render(<SurveyFooterLink />)

      expect(container.firstChild).toBeNull()
    })
  })
})
