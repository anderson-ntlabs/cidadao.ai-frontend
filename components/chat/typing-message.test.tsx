import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingMessage } from './typing-message';

// Mock agents data
vi.mock('@/data/agents', () => ({
  agents: [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      avatar: '/agents/zumbi.png',
    },
    {
      id: 'anita',
      name: 'Anita Garibaldi', 
      avatar: '/agents/anita.png',
    },
  ],
}));

describe('TypingMessage', () => {
  it('should render typing indicator with agent name', () => {
    render(<TypingMessage agentId="zumbi" agentName="Zumbi dos Palmares" />);
    
    expect(screen.getByText('Zumbi dos Palmares')).toBeInTheDocument();
    expect(screen.getByText('está digitando...')).toBeInTheDocument();
  });

  it('should show avatar when agent is found', () => {
    render(<TypingMessage agentId="zumbi" agentName="Zumbi dos Palmares" />);
    
    const avatar = screen.getByAltText('Zumbi dos Palmares');
    expect(avatar).toHaveAttribute('src', '/agents/zumbi.png');
  });

  it('should render without agent info', () => {
    render(<TypingMessage />);
    
    expect(screen.getByText('Assistente')).toBeInTheDocument();
    expect(screen.getByText('está digitando...')).toBeInTheDocument();
  });

  it('should show typing dots animation', () => {
    const { container } = render(<TypingMessage />);
    
    // Check for the three dots
    const dots = container.querySelectorAll('.animate-pulse');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('should handle unknown agent gracefully', () => {
    render(<TypingMessage agentId="unknown" agentName="Unknown Agent" />);
    
    expect(screen.getByText('Unknown Agent')).toBeInTheDocument();
    expect(screen.getByAltText('Unknown Agent')).toBeInTheDocument();
  });
});