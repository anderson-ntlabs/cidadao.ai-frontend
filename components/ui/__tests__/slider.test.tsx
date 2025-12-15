import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from '../slider'

describe('Slider', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('renders with custom value', () => {
      render(<Slider value={[50]} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('50')
    })

    it('renders with custom min and max', () => {
      render(<Slider min={10} max={200} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '10')
      expect(slider).toHaveAttribute('max', '200')
    })

    it('renders with custom step', () => {
      render(<Slider step={5} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('step', '5')
    })

    it('applies custom className', () => {
      render(<Slider className="custom-slider" />)
      const container = screen.getByRole('slider').parentElement
      expect(container).toHaveClass('custom-slider')
    })
  })

  describe('interactions', () => {
    it('calls onValueChange when value changes', () => {
      const handleChange = vi.fn()
      render(<Slider value={[0]} onValueChange={handleChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '50' } })

      expect(handleChange).toHaveBeenCalledWith([50])
    })

    it('handles decimal values', () => {
      const handleChange = vi.fn()
      render(<Slider value={[0]} step={0.1} onValueChange={handleChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5.5' } })

      expect(handleChange).toHaveBeenCalledWith([5.5])
    })

    it('works without onValueChange callback', () => {
      render(<Slider value={[0]} />)
      const slider = screen.getByRole('slider')

      // Should not throw
      expect(() => {
        fireEvent.change(slider, { target: { value: '50' } })
      }).not.toThrow()
    })
  })

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Slider disabled={true} />)
      const slider = screen.getByRole('slider')
      expect(slider).toBeDisabled()
    })

    it('is not disabled by default', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).not.toBeDisabled()
    })
  })

  describe('default values', () => {
    it('has default min of 0', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '0')
    })

    it('has default max of 100', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('max', '100')
    })

    it('has default step of 1', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('step', '1')
    })

    it('has default value of 0', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('0')
    })
  })

  describe('percentage calculation', () => {
    it('calculates correct percentage for value at min', () => {
      render(<Slider value={[0]} min={0} max={100} />)
      const slider = screen.getByRole('slider')
      // At 0%, the background gradient should include 0%
      const style = slider.getAttribute('style')
      expect(style).toContain('0%')
    })

    it('calculates correct percentage for value at max', () => {
      render(<Slider value={[100]} min={0} max={100} />)
      const slider = screen.getByRole('slider')
      // At 100%, the background gradient should include 100%
      const style = slider.getAttribute('style')
      expect(style).toContain('100%')
    })

    it('calculates correct percentage for mid value', () => {
      render(<Slider value={[50]} min={0} max={100} />)
      const slider = screen.getByRole('slider')
      // At 50%, the background should include 50%
      const style = slider.getAttribute('style')
      expect(style).toContain('50%')
    })
  })

  describe('edge cases', () => {
    it('handles empty value array', () => {
      render(<Slider value={[]} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('0')
    })

    it('handles undefined value', () => {
      render(<Slider />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('0')
    })

    it('handles custom range', () => {
      render(<Slider value={[50]} min={-100} max={100} />)
      const slider = screen.getByRole('slider')
      expect(slider).toHaveValue('50')
    })
  })
})
