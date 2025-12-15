/**
 * Tests for Animation components
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  AnimatePresence,
  PulseAnimation,
  SpinAnimation,
} from '../animate'

describe('FadeIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <FadeIn>
        <div data-testid="child">Content</div>
      </FadeIn>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('starts with opacity-0 and transitions to opacity-100', () => {
    const { container } = render(
      <FadeIn>
        <div>Content</div>
      </FadeIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.className).toContain('opacity-100')
  })

  it('respects delay prop', () => {
    const { container } = render(
      <FadeIn delay={500}>
        <div>Content</div>
      </FadeIn>
    )

    const wrapper = container.firstChild as HTMLElement

    // Before delay
    expect(wrapper.className).toContain('opacity-0')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // After delay
    expect(wrapper.className).toContain('opacity-100')
  })

  it('applies custom duration', () => {
    const { container } = render(
      <FadeIn duration={500}>
        <div>Content</div>
      </FadeIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transitionDuration).toBe('500ms')
  })

  it('applies custom className', () => {
    const { container } = render(
      <FadeIn className="custom-class">
        <div>Content</div>
      </FadeIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('hides when show is false', () => {
    const { container, rerender } = render(
      <FadeIn show={true}>
        <div>Content</div>
      </FadeIn>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-100')

    rerender(
      <FadeIn show={false}>
        <div>Content</div>
      </FadeIn>
    )

    expect(wrapper.className).toContain('opacity-0')
  })

  it('clears timer on unmount', () => {
    const { unmount } = render(
      <FadeIn delay={1000}>
        <div>Content</div>
      </FadeIn>
    )

    unmount()

    // No error should occur
    act(() => {
      vi.advanceTimersByTime(1000)
    })
  })
})

describe('SlideIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <SlideIn>
        <div data-testid="child">Content</div>
      </SlideIn>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('slides up by default', () => {
    const { container } = render(
      <SlideIn>
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transform).toBe('translateY(20px)')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.style.transform).toBe('translateY(0)')
  })

  it('slides down when direction is down', () => {
    const { container } = render(
      <SlideIn direction="down">
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transform).toBe('translateY(-20px)')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.style.transform).toBe('translateY(0)')
  })

  it('slides left when direction is left', () => {
    const { container } = render(
      <SlideIn direction="left">
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transform).toBe('translateX(20px)')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.style.transform).toBe('translateX(0)')
  })

  it('slides right when direction is right', () => {
    const { container } = render(
      <SlideIn direction="right">
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transform).toBe('translateX(-20px)')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.style.transform).toBe('translateX(0)')
  })

  it('respects delay prop', () => {
    const { container } = render(
      <SlideIn delay={300}>
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(wrapper.className).toContain('opacity-100')
  })

  it('applies custom duration', () => {
    const { container } = render(
      <SlideIn duration={600}>
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transitionDuration).toBe('600ms')
  })

  it('hides when show is false', () => {
    const { container, rerender } = render(
      <SlideIn show={true}>
        <div>Content</div>
      </SlideIn>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    rerender(
      <SlideIn show={false}>
        <div>Content</div>
      </SlideIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')
  })
})

describe('ScaleIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <ScaleIn>
        <div data-testid="child">Content</div>
      </ScaleIn>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('starts with scale-95 and transitions to scale-100', () => {
    const { container } = render(
      <ScaleIn>
        <div>Content</div>
      </ScaleIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('scale-95')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(wrapper.className).toContain('scale-100')
  })

  it('applies custom duration', () => {
    const { container } = render(
      <ScaleIn duration={400}>
        <div>Content</div>
      </ScaleIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.transitionDuration).toBe('400ms')
  })

  it('respects delay prop', () => {
    const { container } = render(
      <ScaleIn delay={200}>
        <div>Content</div>
      </ScaleIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(wrapper.className).toContain('opacity-100')
  })

  it('hides when show is false', () => {
    const { container, rerender } = render(
      <ScaleIn show={true}>
        <div>Content</div>
      </ScaleIn>
    )

    act(() => {
      vi.advanceTimersByTime(0)
    })

    rerender(
      <ScaleIn show={false}>
        <div>Content</div>
      </ScaleIn>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')
    expect(wrapper.className).toContain('scale-95')
  })
})

describe('AnimatePresence', () => {
  it('renders children', () => {
    render(
      <AnimatePresence>
        <div data-testid="child">Content</div>
      </AnimatePresence>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('accepts mode prop (sync)', () => {
    render(
      <AnimatePresence mode="sync">
        <div>Content</div>
      </AnimatePresence>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('accepts mode prop (wait)', () => {
    render(
      <AnimatePresence mode="wait">
        <div>Content</div>
      </AnimatePresence>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('PulseAnimation', () => {
  it('renders children', () => {
    render(
      <PulseAnimation>
        <div data-testid="child">Content</div>
      </PulseAnimation>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('applies animate-pulse class', () => {
    const { container } = render(
      <PulseAnimation>
        <div>Content</div>
      </PulseAnimation>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('animate-pulse')
  })

  it('applies custom className', () => {
    const { container } = render(
      <PulseAnimation className="custom-pulse">
        <div>Content</div>
      </PulseAnimation>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-pulse')
  })
})

describe('SpinAnimation', () => {
  it('renders children', () => {
    render(
      <SpinAnimation>
        <div data-testid="child">Content</div>
      </SpinAnimation>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('applies animate-spin class', () => {
    const { container } = render(
      <SpinAnimation>
        <div>Content</div>
      </SpinAnimation>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('animate-spin')
  })

  it('applies custom className', () => {
    const { container } = render(
      <SpinAnimation className="custom-spin">
        <div>Content</div>
      </SpinAnimation>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-spin')
  })
})
