import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('should render a skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should have default animation and styling classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('dark:bg-gray-700');
  });

  it('should merge custom className with default classes', () => {
    render(
      <Skeleton 
        className="h-4 w-full custom-class" 
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    // Should have custom classes
    expect(skeleton).toHaveClass('h-4', 'w-full', 'custom-class');
    // Should still have default classes
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-gray-200');
  });

  it('should pass through HTML attributes', () => {
    render(
      <Skeleton 
        id="loading-skeleton"
        role="status"
        aria-label="Loading content"
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'loading-skeleton');
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('should support style prop', () => {
    render(
      <Skeleton 
        style={{ width: '200px', height: '20px' }}
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '20px'
    });
  });

  it('should support event handlers', () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    
    render(
      <Skeleton 
        onClick={handleClick}
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    skeleton.click();
    
    expect(clicked).toBe(true);
  });

  describe('common use cases', () => {
    it('should render as text skeleton', () => {
      render(
        <div>
          <Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />
          <Skeleton className="h-4 w-[200px]" data-testid="text-skeleton-2" />
        </div>
      );
      
      const textSkeleton = screen.getByTestId('text-skeleton');
      expect(textSkeleton).toHaveClass('h-4', 'w-[250px]');
    });

    it('should render as card skeleton', () => {
      render(
        <div className="space-y-2">
          <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar" />
          <Skeleton className="h-4 w-[250px]" data-testid="title" />
          <Skeleton className="h-4 w-[200px]" data-testid="subtitle" />
        </div>
      );
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('should render as button skeleton', () => {
      render(
        <Skeleton 
          className="h-10 w-[100px] rounded-lg" 
          data-testid="button-skeleton"
        />
      );
      
      const button = screen.getByTestId('button-skeleton');
      expect(button).toHaveClass('h-10', 'w-[100px]', 'rounded-lg');
    });
  });

  describe('accessibility', () => {
    it('should support ARIA attributes for screen readers', () => {
      render(
        <Skeleton 
          role="status"
          aria-live="polite"
          data-testid="skeleton"
        >
          <span className="sr-only">Loading...</span>
        </Skeleton>
      );
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });

    it('should be keyboard accessible when needed', () => {
      render(
        <Skeleton 
          tabIndex={0}
          data-testid="skeleton"
        />
      );
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('tabindex', '0');
    });
  });

  describe('dark mode', () => {
    it('should have dark mode classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('dark:bg-gray-700');
    });
  });

  describe('children support', () => {
    it('should render children content', () => {
      render(
        <Skeleton data-testid="skeleton">
          <span>Loading content</span>
        </Skeleton>
      );
      
      const skeleton = screen.getByTestId('skeleton');
      const child = screen.getByText('Loading content');
      
      expect(skeleton).toContainElement(child);
    });
  });
});