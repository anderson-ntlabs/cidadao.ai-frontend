import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from './modal';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">X</span>,
}));

describe('Modal', () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  it('should render when open is true', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Test Modal</ModalTitle>
          </ModalHeader>
          <div>Modal content</div>
        </ModalContent>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    render(
      <Modal open={false} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalTitle>Test Modal</ModalTitle>
        </ModalContent>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when clicking overlay', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent>
          <div>Content</div>
        </ModalContent>
      </Modal>
    );

    // Click the backdrop/overlay (first child div with bg-black/50)
    const overlay = document.querySelector('.bg-black\\/50');
    fireEvent.click(overlay!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render close button by default', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent>
          <div>Content</div>
        </ModalContent>
      </Modal>
    );

    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent showCloseButton={false}>
          <div>Content</div>
        </ModalContent>
      </Modal>
    );

    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent size="sm">
          <div>Content</div>
        </ModalContent>
      </Modal>
    );
    expect(document.querySelector('.max-w-md')).toBeInTheDocument();

    rerender(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent size="lg">
          <div>Content</div>
        </ModalContent>
      </Modal>
    );
    expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();

    rerender(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent size="xl">
          <div>Content</div>
        </ModalContent>
      </Modal>
    );
    expect(document.querySelector('.max-w-4xl')).toBeInTheDocument();
  });

  it('should render with custom className on ModalContent', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent className="custom-class">
          <div>Content</div>
        </ModalContent>
      </Modal>
    );

    const modalContent = document.querySelector('.custom-class');
    expect(modalContent).toBeInTheDocument();
  });

  it('should set body overflow to hidden when open', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent>
          <div>Content</div>
        </ModalContent>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should render ModalDescription', () => {
    render(
      <Modal open={true} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Title</ModalTitle>
            <ModalDescription>This is a description</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });
});