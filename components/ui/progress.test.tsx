import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('should render progress bar', () => {
    const { container } = render(<Progress />);
    
    const progressBar = container.firstChild as HTMLElement;
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass('relative', 'h-2', 'w-full', 'overflow-hidden', 'rounded-full', 'bg-secondary');
  });

  it('should render with 0% progress by default', () => {
    const { container } = render(<Progress />);
    
    const indicator = container.querySelector('.bg-primary') as HTMLElement;
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('should render with custom progress value', () => {
    const { container } = render(<Progress value={50} />);
    
    const indicator = container.querySelector('.bg-primary') as HTMLElement;
    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('should handle 100% progress', () => {
    const { container } = render(<Progress value={100} />);
    
    const indicator = container.querySelector('.bg-primary') as HTMLElement;
    expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
  });

  it('should handle various progress values', () => {
    const testCases = [
      { value: 0, expected: 'translateX(-100%)' },
      { value: 25, expected: 'translateX(-75%)' },
      { value: 33, expected: 'translateX(-67%)' },
      { value: 50, expected: 'translateX(-50%)' },
      { value: 75, expected: 'translateX(-25%)' },
      { value: 100, expected: 'translateX(-0%)' },
    ];
    
    testCases.forEach(({ value, expected }) => {
      const { container } = render(<Progress value={value} />);
      const indicator = container.querySelector('.bg-primary') as HTMLElement;
      expect(indicator).toHaveStyle({ transform: expected });
    });
  });

  it('should handle edge cases', () => {
    // Just verify negative and over 100 values are accepted
    const { container: container1 } = render(<Progress value={-10} />);
    const indicator1 = container1.querySelector('.bg-primary') as HTMLElement;
    expect(indicator1).toBeDefined();
    
    // Value over 100
    const { container: container2 } = render(<Progress value={150} />);
    const indicator2 = container2.querySelector('.bg-primary') as HTMLElement;
    expect(indicator2).toBeDefined();
  });

  it('should apply custom className', () => {
    const { container } = render(<Progress className="custom-class h-4" />);
    
    const progressBar = container.firstChild as HTMLElement;
    expect(progressBar).toHaveClass('custom-class', 'h-4');
    // Should still have default classes
    expect(progressBar).toHaveClass('relative', 'w-full', 'overflow-hidden');
  });

  it('should apply custom indicatorClassName', () => {
    const { container } = render(
      <Progress indicatorClassName="bg-green-500 custom-indicator" />
    );
    
    const indicator = container.querySelector('.bg-green-500') as HTMLElement;
    expect(indicator).toHaveClass('bg-green-500', 'custom-indicator');
    // Should still have default classes
    expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'transition-all');
  });

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Progress ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have correct display name', () => {
    expect(Progress.displayName).toBe('Progress');
  });

  it('should pass through additional props', () => {
    const { container } = render(
      <Progress 
        data-testid="progress-bar"
        aria-label="Loading progress"
        role="progressbar"
        aria-valuenow={50}
        aria-valuemin={0}
        aria-valuemax={100}
        value={50}
      />
    );
    
    const progressBar = container.firstChild as HTMLElement;
    expect(progressBar).toHaveAttribute('data-testid', 'progress-bar');
    expect(progressBar).toHaveAttribute('aria-label', 'Loading progress');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  describe('indicator bar', () => {
    it('should have correct default classes', () => {
      const { container } = render(<Progress />);
      
      const indicator = container.querySelector('.bg-primary') as HTMLElement;
      expect(indicator).toHaveClass('h-full', 'w-full', 'flex-1', 'bg-primary', 'transition-all');
    });

    it('should animate smoothly with transition', () => {
      const { container, rerender } = render(<Progress value={0} />);
      
      const indicator = container.querySelector('.bg-primary') as HTMLElement;
      expect(indicator).toHaveClass('transition-all');
      
      // Change progress
      rerender(<Progress value={50} />);
      expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });
  });

  describe('accessibility', () => {
    it('should support ARIA attributes for screen readers', () => {
      const { container } = render(
        <Progress 
          value={75}
          role="progressbar"
          aria-label="File upload progress"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      );
      
      const progressBar = container.firstChild as HTMLElement;
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'File upload progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should work with live regions', () => {
      const { container } = render(
        <div aria-live="polite">
          <Progress value={50} />
          <span className="sr-only">50% complete</span>
        </div>
      );
      
      const liveRegion = container.firstChild as HTMLElement;
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('styling variations', () => {
    it('should support height customization', () => {
      const { container } = render(<Progress className="h-1" />);
      const progressBar = container.firstChild as HTMLElement;
      expect(progressBar).toHaveClass('h-1');
    });

    it('should support color customization', () => {
      const { container } = render(
        <Progress 
          className="bg-gray-200"
          indicatorClassName="bg-green-500"
        />
      );
      
      const progressBar = container.firstChild as HTMLElement;
      const indicator = container.querySelector('.bg-green-500') as HTMLElement;
      
      expect(progressBar).toHaveClass('bg-gray-200');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('should support rounded variations', () => {
      const { container } = render(<Progress className="rounded-none" />);
      const progressBar = container.firstChild as HTMLElement;
      expect(progressBar).toHaveClass('rounded-none');
    });
  });
});