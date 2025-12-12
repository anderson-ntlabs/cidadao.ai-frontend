import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils/render'
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from './glass-card'

describe('GlassCard', () => {
  it('renders glass card with content', () => {
    render(<GlassCard>Glass card content</GlassCard>)
    expect(screen.getByText('Glass card content')).toBeInTheDocument()
  })

  it('applies glass morphism styles', () => {
    render(<GlassCard>Styled card</GlassCard>)
    const card = screen.getByText('Styled card')

    expect(card).toHaveClass('glass-card')
    expect(card).toHaveClass('backdrop-blur-md')
    expect(card).toHaveClass('bg-white/95')
    expect(card).toHaveClass('dark:bg-gray-800/95')
    expect(card).toHaveClass('shadow-lg')
    expect(card).toHaveClass('rounded-xl')
  })

  it('applies custom className', () => {
    render(<GlassCard className="custom-glass">Custom</GlassCard>)
    const card = screen.getByText('Custom')
    expect(card).toHaveClass('custom-glass')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<GlassCard ref={ref}>With Ref</GlassCard>)

    expect(ref).toHaveBeenCalled()
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
  })
})

describe('GlassCard Components', () => {
  it('renders complete glass card structure', () => {
    render(
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Glass Title</GlassCardTitle>
          <GlassCardDescription>Glass description</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent>Glass content here</GlassCardContent>
        <GlassCardFooter>Glass footer</GlassCardFooter>
      </GlassCard>
    )

    expect(screen.getByText('Glass Title')).toBeInTheDocument()
    expect(screen.getByText('Glass Title').tagName).toBe('H3')
    expect(screen.getByText('Glass description')).toBeInTheDocument()
    expect(screen.getByText('Glass content here')).toBeInTheDocument()
    expect(screen.getByText('Glass footer')).toBeInTheDocument()
  })

  it('GlassCardHeader has proper spacing', () => {
    render(
      <GlassCardHeader>
        <GlassCardTitle>Header Title</GlassCardTitle>
      </GlassCardHeader>
    )

    const header = screen.getByText('Header Title').parentElement
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
  })

  it('GlassCardTitle has correct styling', () => {
    render(<GlassCardTitle>Title Text</GlassCardTitle>)

    const title = screen.getByText('Title Text')
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'tracking-tight')
  })

  it('GlassCardDescription has muted styling', () => {
    render(<GlassCardDescription>Description text</GlassCardDescription>)

    const description = screen.getByText('Description text')
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('GlassCardContent has correct padding', () => {
    render(<GlassCardContent>Content area</GlassCardContent>)

    const content = screen.getByText('Content area')
    expect(content).toHaveClass('p-6', 'pt-0')
  })

  it('GlassCardFooter is flex container with padding', () => {
    render(<GlassCardFooter>Footer area</GlassCardFooter>)

    const footer = screen.getByText('Footer area')
    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
  })

  it('all components accept custom className', () => {
    render(
      <>
        <GlassCardHeader className="custom-header">Header</GlassCardHeader>
        <GlassCardTitle className="custom-title">Title</GlassCardTitle>
        <GlassCardDescription className="custom-desc">Desc</GlassCardDescription>
        <GlassCardContent className="custom-content">Content</GlassCardContent>
        <GlassCardFooter className="custom-footer">Footer</GlassCardFooter>
      </>
    )

    expect(screen.getByText('Header')).toHaveClass('custom-header')
    expect(screen.getByText('Title')).toHaveClass('custom-title')
    expect(screen.getByText('Desc')).toHaveClass('custom-desc')
    expect(screen.getByText('Content')).toHaveClass('custom-content')
    expect(screen.getByText('Footer')).toHaveClass('custom-footer')
  })

  it('all components forward refs correctly', () => {
    const refs = {
      header: vi.fn(),
      title: vi.fn(),
      description: vi.fn(),
      content: vi.fn(),
      footer: vi.fn(),
    }

    render(
      <>
        <GlassCardHeader ref={refs.header}>H</GlassCardHeader>
        <GlassCardTitle ref={refs.title}>T</GlassCardTitle>
        <GlassCardDescription ref={refs.description}>D</GlassCardDescription>
        <GlassCardContent ref={refs.content}>C</GlassCardContent>
        <GlassCardFooter ref={refs.footer}>F</GlassCardFooter>
      </>
    )

    expect(refs.header).toHaveBeenCalled()
    expect(refs.header.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)

    expect(refs.title).toHaveBeenCalled()
    expect(refs.title.mock.calls[0][0]).toBeInstanceOf(HTMLHeadingElement)

    expect(refs.description).toHaveBeenCalled()
    expect(refs.description.mock.calls[0][0]).toBeInstanceOf(HTMLParagraphElement)

    expect(refs.content).toHaveBeenCalled()
    expect(refs.content.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)

    expect(refs.footer).toHaveBeenCalled()
    expect(refs.footer.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
  })
})
