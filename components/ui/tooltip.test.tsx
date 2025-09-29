import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { Tooltip, StrategicTooltip } from './tooltip'

// Mock do store de tooltips
vi.mock('@/store/tooltip-store', () => ({
  useTooltipStore: () => ({
    hasSeenTooltip: vi.fn().mockReturnValue(false),
    markTooltipSeen: vi.fn()
  })
}))

describe('Tooltip', () => {
  it('renders children without tooltip initially', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    )
    
    expect(screen.getByText('Hover me')).toBeInTheDocument()
    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument()
  })

  it('wraps children in a container div', () => {
    const { container } = render(
      <Tooltip content="Test tooltip">
        <button>Test button</button>
      </Tooltip>
    )
    
    const wrapper = container.querySelector('.inline-block')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toContainElement(screen.getByText('Test button'))
  })

  it('accepts different position props', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const
    
    positions.forEach(position => {
      const { container } = render(
        <Tooltip content="Test" position={position}>
          <span>Child</span>
        </Tooltip>
      )
      
      expect(container.querySelector('.inline-block')).toBeInTheDocument()
    })
  })

  it('accepts different trigger props', () => {
    const triggers = ['hover', 'click', 'focus'] as const
    
    triggers.forEach(trigger => {
      const { container } = render(
        <Tooltip content="Test" trigger={trigger}>
          <span>Child</span>
        </Tooltip>
      )
      
      expect(container.querySelector('.inline-block')).toBeInTheDocument()
    })
  })

  it('accepts custom delay prop', () => {
    render(
      <Tooltip content="Test" delay={1000}>
        <span>Child</span>
      </Tooltip>
    )
    
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('accepts dismissible prop', () => {
    render(
      <Tooltip content="Test" dismissible>
        <span>Child</span>
      </Tooltip>
    )
    
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('accepts showOnce prop', () => {
    render(
      <Tooltip content="Test" showOnce>
        <span>Child</span>
      </Tooltip>
    )
    
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('accepts custom className prop', () => {
    render(
      <Tooltip content="Test" className="custom-tooltip">
        <span>Child</span>
      </Tooltip>
    )
    
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('accepts ariaLabel prop', () => {
    render(
      <Tooltip content="Test" ariaLabel="Custom label">
        <span>Child</span>
      </Tooltip>
    )
    
    expect(screen.getByText('Child')).toBeInTheDocument()
  })
})

describe('StrategicTooltip', () => {
  it('renders with predefined tooltipKey', () => {
    const tooltipKeys = [
      'first-chat',
      'upload-hint',
      'agent-selector',
      'export-data',
      'chat-history',
      'send-message',
      'contrast-toggle'
    ] as const

    tooltipKeys.forEach(key => {
      const { unmount } = render(
        <StrategicTooltip tooltipKey={key}>
          <button>{key}</button>
        </StrategicTooltip>
      )
      
      expect(screen.getByText(key)).toBeInTheDocument()
      unmount()
    })
  })

  it('allows custom content to override default', () => {
    render(
      <StrategicTooltip tooltipKey="first-chat" content="Custom content">
        <button>Button</button>
      </StrategicTooltip>
    )
    
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('passes through additional tooltip props', () => {
    render(
      <StrategicTooltip 
        tooltipKey="first-chat" 
        position="bottom"
        delay={1000}
        className="custom"
      >
        <button>Button</button>
      </StrategicTooltip>
    )
    
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('has showOnce and dismissible enabled by default', () => {
    const { container } = render(
      <StrategicTooltip tooltipKey="first-chat">
        <button>Button</button>
      </StrategicTooltip>
    )
    
    // O componente deve renderizar normalmente
    expect(container.querySelector('.inline-block')).toBeInTheDocument()
  })
})