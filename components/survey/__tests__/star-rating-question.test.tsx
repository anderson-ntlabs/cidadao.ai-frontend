/**
 * Star Rating Question Component Tests
 *
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRatingQuestion } from '../questions/star-rating-question'

describe('StarRatingQuestion', () => {
  const defaultLabels = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']

  it('renders 5 star buttons by default', () => {
    render(<StarRatingQuestion value={undefined} onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(5)
  })

  it('calls onChange when a star is clicked', () => {
    const onChange = vi.fn()
    render(<StarRatingQuestion value={undefined} onChange={onChange} />)

    const buttons = screen.getAllByRole('radio')
    fireEvent.click(buttons[2]) // Click 3rd star

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('marks the selected star as checked', () => {
    render(<StarRatingQuestion value={4} onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons[3]).toHaveAttribute('aria-checked', 'true') // 4th star (index 3)
    expect(buttons[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('displays the current label when value is selected', () => {
    render(<StarRatingQuestion value={4} onChange={vi.fn()} labels={defaultLabels} />)

    expect(screen.getByText('Bom')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(
      <StarRatingQuestion value={undefined} onChange={vi.fn()} error="Please select a rating" />
    )

    expect(screen.getByText('Please select a rating')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders custom number of stars', () => {
    render(<StarRatingQuestion value={undefined} onChange={vi.fn()} maxStars={10} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(10)
  })

  it('disables buttons when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<StarRatingQuestion value={undefined} onChange={onChange} disabled={true} />)

    const buttons = screen.getAllByRole('radio')
    fireEvent.click(buttons[2])

    expect(onChange).not.toHaveBeenCalled()
    expect(buttons[2]).toBeDisabled()
  })

  it('has correct accessibility labels', () => {
    render(<StarRatingQuestion value={undefined} onChange={vi.fn()} labels={defaultLabels} />)

    // Check that each star has a proper aria-label
    const star3 = screen.getByRole('radio', { name: /3 de 5 estrelas - Regular/ })
    expect(star3).toBeInTheDocument()
  })

  it('has a radiogroup role', () => {
    render(<StarRatingQuestion value={undefined} onChange={vi.fn()} />)

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})
