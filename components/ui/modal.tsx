'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
}

// Store previously focused element to restore focus on close
const ModalContext = React.createContext<{
  onClose: () => void
  contentRef: React.RefObject<HTMLDivElement | null>
} | null>(null)

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  const previousActiveElement = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  // Handle body overflow and store previous focus
  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  // Handle ESC key to close modal
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  if (!open) return null

  return (
    <ModalContext.Provider value={{ onClose: handleClose, contentRef }}>
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleClose}
          aria-hidden="true"
        />
        {children}
      </div>
    </ModalContext.Provider>
  )
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, showCloseButton = true, size = 'default', ...props }, ref) => {
    const context = React.useContext(ModalContext)
    const internalRef = React.useRef<HTMLDivElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    const sizeClasses = {
      sm: 'max-w-md',
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] sm:max-w-[90vw]',
    }

    // Focus trap implementation
    React.useEffect(() => {
      const content = resolvedRef.current
      if (!content) return

      // Focus the first focusable element
      const focusableElements = content.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Focus first element on mount
      if (firstElement) {
        firstElement.focus()
      }

      // Handle tab key for focus trap
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          // Shift + Tab: go to last element if on first
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab: go to first element if on last
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)
      return () => document.removeEventListener('keydown', handleTabKey)
    }, [resolvedRef])

    const handleClose = () => {
      if (context?.onClose) {
        context.onClose()
      } else {
        // Fallback for backwards compatibility
        const event = new CustomEvent('modal-close')
        window.dispatchEvent(event)
      }
    }

    return (
      <div
        ref={resolvedRef}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]',
          'rounded-lg border bg-background shadow-lg',
          'p-4 sm:p-6',
          'animate-scale-in',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button
            className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  }
)
ModalContent.displayName = 'ModalContent'

const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
ModalHeader.displayName = 'ModalHeader'

const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
ModalFooter.displayName = 'ModalFooter'

const ModalTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
ModalDescription.displayName = 'ModalDescription'

export { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle }
