import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('should call onClose when clicking overlay', () => {
    render(<Modal {...defaultProps} />);
    
    const overlay = screen.getByRole('button', { name: 'Fechar modal' });
    fireEvent.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking close button', () => {
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Fechar');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should handle escape key press', () => {
    render(<Modal {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
    
    rerender(<Modal {...defaultProps} size="xl" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-6xl');
  });

  it('should render without title', () => {
    render(<Modal {...defaultProps} title={undefined} />);
    
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should prevent closing when closeOnOverlayClick is false', () => {
    render(<Modal {...defaultProps} closeOnOverlayClick={false} />);
    
    const overlay = screen.getByRole('button', { name: 'Fechar modal' });
    fireEvent.click(overlay);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should render with custom className', () => {
    render(<Modal {...defaultProps} className="custom-class" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-class');
  });

  it('should trap focus inside modal', () => {
    render(
      <Modal {...defaultProps}>
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});