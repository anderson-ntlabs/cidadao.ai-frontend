import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-900');
  });

  it('should render with primary variant', () => {
    render(<Badge variant="primary">Primary Badge</Badge>);
    
    const badge = screen.getByText('Primary Badge');
    expect(badge).toHaveClass('bg-green-100', 'text-green-900');
  });

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-900');
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success Badge</Badge>);
    
    const badge = screen.getByText('Success Badge');
    expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-900');
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning Badge</Badge>);
    
    const badge = screen.getByText('Warning Badge');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-900');
  });

  it('should render with danger variant', () => {
    render(<Badge variant="danger">Danger Badge</Badge>);
    
    const badge = screen.getByText('Danger Badge');
    expect(badge).toHaveClass('bg-red-100', 'text-red-900');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small Badge</Badge>);
    expect(screen.getByText('Small Badge')).toHaveClass('text-xs', 'px-2', 'py-0.5');
    
    rerender(<Badge size="md">Medium Badge</Badge>);
    expect(screen.getByText('Medium Badge')).toHaveClass('text-sm', 'px-2.5', 'py-0.5');
    
    rerender(<Badge size="lg">Large Badge</Badge>);
    expect(screen.getByText('Large Badge')).toHaveClass('text-base', 'px-3', 'py-1');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    
    expect(screen.getByText('Custom Badge')).toHaveClass('custom-class');
  });

  it('should render with number content', () => {
    render(<Badge>{42}</Badge>);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle dark mode classes', () => {
    render(<Badge variant="primary">Dark Mode Badge</Badge>);
    
    const badge = screen.getByText('Dark Mode Badge');
    expect(badge).toHaveClass('dark:bg-green-800', 'dark:text-green-100');
  });
});