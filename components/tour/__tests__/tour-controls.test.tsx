/**
 * Tests for TourControls and TourFloatingButton components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TourControls, TourFloatingButton } from '../tour-controls'

// Mock dependencies
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, className, role, ...props }: any) => (
      <div className={className} role={role} {...props}>
        {children}
      </div>
    ),
    button: ({ children, className, onClick, onMouseEnter, onMouseLeave, ...props }: any) => (
      <button
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </button>
    ),
    span: ({ children, className }: any) => <span className={className}>{children}</span>,
  },
}))

vi.mock('@/components/ui/button', () => ({
  ButtonV2: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

describe('TourControls', () => {
  const defaultProps = {
    currentStep: 0,
    totalSteps: 5,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSkip: vi.fn(),
    isFirstStep: true,
    isLastStep: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the controls container', () => {
      render(<TourControls {...defaultProps} />)

      const region = screen.getByRole('region', { name: 'Controles do tour' })
      expect(region).toBeInTheDocument()
    })

    it('displays step counter', () => {
      render(<TourControls {...defaultProps} />)

      expect(screen.getByText('1/5')).toBeInTheDocument()
    })

    it('displays step title when provided', () => {
      render(<TourControls {...defaultProps} stepTitle="Bem-vindo" />)

      expect(screen.getByText('Bem-vindo')).toBeInTheDocument()
    })

    it('displays step description when provided', () => {
      render(<TourControls {...defaultProps} stepDescription="Esta é a descrição" />)

      expect(screen.getByText('Esta é a descrição')).toBeInTheDocument()
    })

    it('renders step indicators for all steps', () => {
      render(<TourControls {...defaultProps} />)

      const indicators = screen.getAllByRole('button', { name: /Ir para passo/ })
      expect(indicators.length).toBe(5)
    })

    it('shows keyboard hints', () => {
      render(<TourControls {...defaultProps} />)

      expect(screen.getByText(/Use ← → para navegar, ESC para sair/)).toBeInTheDocument()
    })
  })

  describe('Navigation Buttons', () => {
    it('disables prev button on first step', () => {
      render(<TourControls {...defaultProps} isFirstStep={true} />)

      const prevButton = screen.getByRole('button', { name: /Passo anterior/i })
      expect(prevButton).toBeDisabled()
    })

    it('enables prev button when not on first step', () => {
      render(<TourControls {...defaultProps} isFirstStep={false} currentStep={2} />)

      const prevButton = screen.getByRole('button', { name: /Passo anterior/i })
      expect(prevButton).not.toBeDisabled()
    })

    it('disables next button on last step', () => {
      render(<TourControls {...defaultProps} isLastStep={true} currentStep={4} />)

      const nextButton = screen.getByRole('button', { name: /Concluir tour/i })
      expect(nextButton).toBeDisabled()
    })

    it('shows "Concluir" text on last step', () => {
      render(<TourControls {...defaultProps} isLastStep={true} currentStep={4} />)

      expect(screen.getByText('Concluir')).toBeInTheDocument()
    })

    it('shows "Próximo" text when not on last step', () => {
      render(<TourControls {...defaultProps} isLastStep={false} />)

      expect(screen.getByText('Próximo')).toBeInTheDocument()
    })

    it('calls onNext when next button is clicked', () => {
      render(<TourControls {...defaultProps} />)

      const nextButton = screen.getByRole('button', { name: /Próximo passo/i })
      fireEvent.click(nextButton)

      expect(defaultProps.onNext).toHaveBeenCalled()
    })

    it('calls onPrev when prev button is clicked', () => {
      const props = { ...defaultProps, isFirstStep: false, currentStep: 2 }
      render(<TourControls {...props} />)

      const prevButton = screen.getByRole('button', { name: /Passo anterior/i })
      fireEvent.click(prevButton)

      expect(props.onPrev).toHaveBeenCalled()
    })

    it('calls onSkip when skip button is clicked', () => {
      render(<TourControls {...defaultProps} />)

      const skipButton = screen.getByRole('button', { name: /Pular tour/i })
      fireEvent.click(skipButton)

      expect(defaultProps.onSkip).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('calls onNext when ArrowRight is pressed', () => {
      render(<TourControls {...defaultProps} />)

      fireEvent.keyDown(window, { key: 'ArrowRight' })

      expect(defaultProps.onNext).toHaveBeenCalled()
    })

    it('does not call onNext when ArrowRight is pressed on last step', () => {
      render(<TourControls {...defaultProps} isLastStep={true} />)

      fireEvent.keyDown(window, { key: 'ArrowRight' })

      expect(defaultProps.onNext).not.toHaveBeenCalled()
    })

    it('calls onPrev when ArrowLeft is pressed', () => {
      render(<TourControls {...defaultProps} isFirstStep={false} currentStep={2} />)

      fireEvent.keyDown(window, { key: 'ArrowLeft' })

      expect(defaultProps.onPrev).toHaveBeenCalled()
    })

    it('does not call onPrev when ArrowLeft is pressed on first step', () => {
      render(<TourControls {...defaultProps} isFirstStep={true} />)

      fireEvent.keyDown(window, { key: 'ArrowLeft' })

      expect(defaultProps.onPrev).not.toHaveBeenCalled()
    })

    it('calls onSkip when Escape is pressed', () => {
      render(<TourControls {...defaultProps} />)

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(defaultProps.onSkip).toHaveBeenCalled()
    })

    it('calls onRestart when Home is pressed', () => {
      const onRestart = vi.fn()
      render(
        <TourControls {...defaultProps} isFirstStep={false} currentStep={2} onRestart={onRestart} />
      )

      fireEvent.keyDown(window, { key: 'Home' })

      expect(onRestart).toHaveBeenCalled()
    })
  })

  describe('Expand/Collapse', () => {
    it('renders expand/collapse button', () => {
      render(<TourControls {...defaultProps} />)

      const expandButton = screen.getByRole('button', { name: /Minimizar controles/i })
      expect(expandButton).toBeInTheDocument()
    })

    it('toggles expand state on button click', () => {
      render(<TourControls {...defaultProps} />)

      const expandButton = screen.getByRole('button', { name: /Minimizar controles/i })
      fireEvent.click(expandButton)

      // After collapse, should show "Expandir controles"
      expect(screen.getByRole('button', { name: /Expandir controles/i })).toBeInTheDocument()
    })
  })

  describe('Screen Reader', () => {
    it('announces step changes', () => {
      render(<TourControls {...defaultProps} stepTitle="Passo 1" />)

      const announcement = screen.getByRole('status')
      expect(announcement).toHaveTextContent('Passo 1 de 5. Passo 1')
    })

    it('updates announcement when step changes', () => {
      const { rerender } = render(
        <TourControls {...defaultProps} currentStep={0} stepTitle="Primeiro" />
      )

      rerender(<TourControls {...defaultProps} currentStep={1} stepTitle="Segundo" />)

      const announcement = screen.getByRole('status')
      expect(announcement).toHaveTextContent('Passo 2 de 5. Segundo')
    })
  })

  describe('Progress Bar', () => {
    it('renders progress bar', () => {
      const { container } = render(<TourControls {...defaultProps} />)

      const progressBar = container.querySelector('.bg-green-500')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Custom Styles', () => {
    it('applies custom className', () => {
      render(<TourControls {...defaultProps} className="custom-class" />)

      const region = screen.getByRole('region')
      expect(region).toHaveClass('custom-class')
    })
  })
})

describe('TourFloatingButton', () => {
  const onClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the button', () => {
      render(<TourFloatingButton onClick={onClick} />)

      const button = screen.getByRole('button', { name: /Iniciar tour novamente/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onClick when button is clicked', () => {
      render(<TourFloatingButton onClick={onClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onClick).toHaveBeenCalled()
    })

    it('shows tooltip on hover', () => {
      render(<TourFloatingButton onClick={onClick} />)

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)

      expect(screen.getByText('Fazer tour novamente')).toBeInTheDocument()
    })

    it('hides tooltip when mouse leaves', () => {
      render(<TourFloatingButton onClick={onClick} />)

      const button = screen.getByRole('button')
      fireEvent.mouseEnter(button)
      expect(screen.getByText('Fazer tour novamente')).toBeInTheDocument()

      fireEvent.mouseLeave(button)
      expect(screen.queryByText('Fazer tour novamente')).not.toBeInTheDocument()
    })
  })
})
