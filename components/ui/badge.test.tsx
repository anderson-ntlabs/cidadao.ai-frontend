import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText('Secondary Badge');
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);

    const badge = screen.getByText('Destructive Badge');
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground');
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success Badge</Badge>);

    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning Badge</Badge>);

    const badge = screen.getByText('Warning Badge');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should render with info variant', () => {
    render(<Badge variant="info">Info Badge</Badge>);

    const badge = screen.getByText('Info Badge');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);

    const badge = screen.getByText('Outline Badge');
    expect(badge).toHaveClass('text-foreground', 'border');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small Badge</Badge>);
    expect(screen.getByText('Small Badge')).toHaveClass('px-2', 'py-0.25', 'text-[10px]');

    rerender(<Badge size="default">Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toHaveClass('px-2.5', 'py-0.5', 'text-xs');

    rerender(<Badge size="lg">Large Badge</Badge>);
    expect(screen.getByText('Large Badge')).toHaveClass('px-3', 'py-0.75', 'text-sm');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    expect(screen.getByText('Custom Badge')).toHaveClass('custom-class');
  });

  it('should render with number content', () => {
    render(<Badge>{42}</Badge>);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle dark mode classes for success variant', () => {
    render(<Badge variant="success">Success Badge</Badge>);

    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('dark:bg-green-900', 'dark:text-green-200');
  });

  it('should render removable badge with close button', () => {
    const onRemove = vi.fn();
    render(
      <Badge removable onRemove={onRemove}>
        Removable Badge
      </Badge>
    );

    const closeButton = screen.getByLabelText('Remove badge');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should not render close button when not removable', () => {
    render(<Badge>Non-removable Badge</Badge>);

    const closeButton = screen.queryByLabelText('Remove badge');
    expect(closeButton).not.toBeInTheDocument();
  });
});