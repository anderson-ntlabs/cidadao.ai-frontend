import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChatHistorySidebar } from './chat-history-sidebar';

// Mock the chat session service
vi.mock('@/lib/services/chat-session.service', () => ({
  chatSessionService: {
    getUserSessions: vi.fn(() => Promise.resolve([])),
    deleteSession: vi.fn(() => Promise.resolve(true)),
  },
}));

describe('ChatHistorySidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectSession: vi.fn(),
    currentSessionId: 'session1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { container } = render(<ChatHistorySidebar {...defaultProps} />);
    // Check for loading skeleton divs
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no sessions', async () => {
    render(<ChatHistorySidebar {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma conversa anterior')).toBeInTheDocument();
    });
  });

  it('should hide sidebar when isOpen is false', () => {
    const { container } = render(<ChatHistorySidebar {...defaultProps} isOpen={false} />);
    const sidebar = container.querySelector('.translate-x-0');
    expect(sidebar).toBeNull();
    
    // Should have the closed state class
    const closedSidebar = container.querySelector('.-translate-x-full');
    expect(closedSidebar).toBeInTheDocument();
  });
});