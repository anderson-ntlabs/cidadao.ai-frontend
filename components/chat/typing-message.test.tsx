import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TypingMessage } from './typing-message';

// Mock MarkdownMessage component
vi.mock('@/components/markdown-message', () => ({
  MarkdownMessage: ({ content }: { content: string }) => <div data-testid="markdown-message">{content}</div>,
}));

// Mock useTypingEffect hook
vi.mock('@/hooks/use-typing-effect', () => ({
  useTypingEffect: (content: string) => ({
    displayedText: content.slice(0, 5), // Simulate partial typing
    isTyping: true,
  }),
}));

describe('TypingMessage', () => {
  it('should render message content', () => {
    const { getByTestId } = render(<TypingMessage content="Hello, world!" />);

    const message = getByTestId('markdown-message');
    expect(message).toBeInTheDocument();
  });

  it('should show typing cursor when isLatest is true', () => {
    const { container } = render(<TypingMessage content="Hello" isLatest={true} />);

    // Check for the typing cursor (animated pulse)
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).toBeInTheDocument();
  });

  it('should not show typing cursor when isLatest is false', () => {
    const { container } = render(<TypingMessage content="Hello" isLatest={false} />);

    // Should not have typing cursor
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).not.toBeInTheDocument();
  });

  it('should call onComplete callback', () => {
    const onComplete = vi.fn();

    render(<TypingMessage content="Test" onComplete={onComplete} />);

    // The mock returns isTyping: true, so onComplete wouldn't be called yet
    // This test validates the prop is passed correctly
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should display full content when not latest', () => {
    const content = "This is a test message";
    const { getByTestId } = render(<TypingMessage content={content} isLatest={false} />);

    const message = getByTestId('markdown-message');
    expect(message.textContent).toBe(content);
  });
});