/**
 * Survey Progress Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SurveyProgress } from '../survey-progress'

describe('SurveyProgress', () => {
  it('renders progress text correctly', () => {
    render(<SurveyProgress currentStep={2} totalSteps={9} />)

    expect(screen.getByText('Pergunta 3 de 9')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    const { container } = render(<SurveyProgress currentStep={4} totalSteps={10} />)

    const progressBar = container.querySelector('[style*="width: 50%"]')
    expect(progressBar).toBeInTheDocument()
  })

  it('renders correct number of step dots', () => {
    render(<SurveyProgress currentStep={0} totalSteps={5} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('calls onStepClick when navigation is allowed', () => {
    const onStepClick = vi.fn()
    render(
      <SurveyProgress
        currentStep={2}
        totalSteps={5}
        onStepClick={onStepClick}
        allowNavigation={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0]) // Click first step (completed)

    expect(onStepClick).toHaveBeenCalledWith(0)
  })

  it('does not call onStepClick when navigation is disabled', () => {
    const onStepClick = vi.fn()
    render(
      <SurveyProgress
        currentStep={2}
        totalSteps={5}
        onStepClick={onStepClick}
        allowNavigation={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('has correct accessibility attributes', () => {
    render(<SurveyProgress currentStep={1} totalSteps={5} />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '2')
    expect(progressBar).toHaveAttribute('aria-valuemin', '1')
    expect(progressBar).toHaveAttribute('aria-valuemax', '5')
  })

  it('marks current step correctly', () => {
    render(<SurveyProgress currentStep={2} totalSteps={5} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[2]).toHaveAttribute('aria-current', 'step')
    expect(buttons[0]).not.toHaveAttribute('aria-current')
  })
})
