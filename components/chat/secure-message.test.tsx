import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecureMessage } from './secure-message';
import type { ChatMessage } from '@/types/chat';

// Mock the sanitizer hook
vi.mock('@/hooks/use-sanitizer', () => ({
  useSanitizer: () => ({
    sanitize: vi.fn((content: string) => content),
  }),
}));

// Mock the markdown renderer
vi.mock('@/components/markdown/markdown-renderer', () => ({
  MarkdownRenderer: ({ content }: any) => <div>{content}</div>,
}));

// Mock agents data
vi.mock('@/data/agents', () => ({
  agents: [
    {
      id: 'zumbi',
      name: 'Zumbi dos Palmares',
      avatar: '/agents/zumbi.png',
    },
  ],
}));

describe('SecureMessage', () => {
  const mockUserMessage: ChatMessage = {
    id: 'msg1',
    session_id: 'session1',
    role: 'user',
    content: 'Hello, can you help me?',
    timestamp: '2024-01-01T10:00:00Z',
  };

  const mockAssistantMessage: ChatMessage = {
    id: 'msg2',
    session_id: 'session1',
    role: 'assistant',
    content: 'Of course! I can help you.',
    agent_id: 'zumbi',
    agent_name: 'Zumbi dos Palmares',
    timestamp: '2024-01-01T10:01:00Z',
  };

  it('should render user message', () => {
    render(<SecureMessage message={mockUserMessage} />);
    expect(screen.getByText('Hello, can you help me?')).toBeInTheDocument();
    expect(screen.getByText('Você')).toBeInTheDocument();
  });

  it('should render assistant message', () => {
    render(<SecureMessage message={mockAssistantMessage} />);
    expect(screen.getByText('Of course! I can help you.')).toBeInTheDocument();
    expect(screen.getByText('Zumbi dos Palmares')).toBeInTheDocument();
  });

  it('should render system message', () => {
    const systemMessage: ChatMessage = {
      id: 'msg3',
      session_id: 'session1',
      role: 'system',
      content: 'System notification',
      timestamp: '2024-01-01T10:02:00Z',
    };

    render(<SecureMessage message={systemMessage} />);
    expect(screen.getByText('System notification')).toBeInTheDocument();
  });
});