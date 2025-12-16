/**
 * Tests for ChartSkeleton components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartSkeleton, PieChartSkeleton, MetricCardSkeleton } from '../chart-skeleton'

describe('ChartSkeleton', () => {
  describe('Rendering', () => {
    it('renders with default height', () => {
      const { container } = render(<ChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '300px' })
    })

    it('renders with custom height', () => {
      const { container } = render(<ChartSkeleton height={400} />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '400px' })
    })

    it('has animate-pulse class for loading animation', () => {
      const { container } = render(<ChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('renders 7 chart bars', () => {
      const { container } = render(<ChartSkeleton />)

      // Count bar elements (flex-1 divs inside the chart area)
      const bars = container.querySelectorAll('.flex-1.bg-gray-200')
      expect(bars.length).toBe(7)
    })

    it('renders 7 x-axis labels', () => {
      const { container } = render(<ChartSkeleton />)

      // Count x-axis label divs (w-8 class)
      const labels = container.querySelectorAll('.w-8')
      expect(labels.length).toBe(7)
    })

    it('renders title skeleton', () => {
      const { container } = render(<ChartSkeleton />)

      // Title skeleton has w-1/3 class
      const title = container.querySelector('.w-1\\/3')
      expect(title).toBeInTheDocument()
    })

    it('applies rounded-lg class', () => {
      const { container } = render(<ChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('rounded-lg')
    })
  })

  describe('Styling', () => {
    it('has proper background colors for light mode', () => {
      const { container } = render(<ChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('bg-gray-100')
    })

    it('has proper dark mode classes', () => {
      const { container } = render(<ChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('dark:bg-gray-800')
    })
  })
})

describe('PieChartSkeleton', () => {
  describe('Rendering', () => {
    it('renders with default height', () => {
      const { container } = render(<PieChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '300px' })
    })

    it('renders with custom height', () => {
      const { container } = render(<PieChartSkeleton height={250} />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '250px' })
    })

    it('has animate-pulse class for loading animation', () => {
      const { container } = render(<PieChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('renders pie chart circle', () => {
      const { container } = render(<PieChartSkeleton />)

      // Outer circle has w-48 h-48
      const circle = container.querySelector('.w-48.h-48')
      expect(circle).toBeInTheDocument()
    })

    it('renders inner circle for donut effect', () => {
      const { container } = render(<PieChartSkeleton />)

      // Inner circle has inset-4
      const innerCircle = container.querySelector('.inset-4')
      expect(innerCircle).toBeInTheDocument()
    })

    it('renders 4 legend items', () => {
      const { container } = render(<PieChartSkeleton />)

      // Legend items have w-3 h-3 rounded squares
      const legendDots = container.querySelectorAll('.w-3.h-3')
      expect(legendDots.length).toBe(4)
    })

    it('renders legend text placeholders', () => {
      const { container } = render(<PieChartSkeleton />)

      // Legend text has w-20 class
      const legendTexts = container.querySelectorAll('.w-20')
      expect(legendTexts.length).toBe(4)
    })
  })

  describe('Styling', () => {
    it('has proper background colors', () => {
      const { container } = render(<PieChartSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('bg-gray-100')
      expect(skeleton).toHaveClass('dark:bg-gray-800')
    })

    it('centers the pie chart', () => {
      const { container } = render(<PieChartSkeleton />)

      const innerWrapper = container.querySelector('.flex.items-center.justify-center')
      expect(innerWrapper).toBeInTheDocument()
    })
  })
})

describe('MetricCardSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<MetricCardSkeleton />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('has animate-pulse class for loading animation', () => {
      const { container } = render(<MetricCardSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('renders icon placeholder', () => {
      const { container } = render(<MetricCardSkeleton />)

      // Icon placeholder has w-10 h-10 rounded-full
      const icon = container.querySelector('.w-10.h-10')
      expect(icon).toBeInTheDocument()
    })

    it('renders trend indicator placeholder', () => {
      const { container } = render(<MetricCardSkeleton />)

      // Trend indicator has w-12 class
      const trend = container.querySelector('.w-12')
      expect(trend).toBeInTheDocument()
    })

    it('renders label placeholder', () => {
      const { container } = render(<MetricCardSkeleton />)

      // Label has w-24 class
      const label = container.querySelector('.w-24')
      expect(label).toBeInTheDocument()
    })

    it('renders value placeholder', () => {
      const { container } = render(<MetricCardSkeleton />)

      // Value has w-32 class
      const value = container.querySelector('.w-32')
      expect(value).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has rounded corners', () => {
      const { container } = render(<MetricCardSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('rounded-lg')
    })

    it('has proper background colors', () => {
      const { container } = render(<MetricCardSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('bg-white')
      expect(skeleton).toHaveClass('dark:bg-gray-800')
    })

    it('has proper padding', () => {
      const { container } = render(<MetricCardSkeleton />)

      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('p-6')
    })
  })
})
