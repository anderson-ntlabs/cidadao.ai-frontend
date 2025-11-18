/**
 * LandingModal Component
 *
 * Wrapper around the existing Modal component with optimizations for
 * landing page content display. Includes automatic scroll handling,
 * ESC key listener, and proper content padding.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-06
 */

'use client'

import { useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

interface LandingModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'default' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  className?: string
}

export function LandingModal({
  isOpen,
  onClose,
  title,
  size = 'xl',
  children,
  className,
}: LandingModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Listen for modal close event from ModalContent
  useEffect(() => {
    const handleModalClose = () => {
      onClose()
    }

    window.addEventListener('modal-close', handleModalClose)
    return () => {
      window.removeEventListener('modal-close', handleModalClose)
    }
  }, [onClose])

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent
        size={size}
        className={cn(
          // Remove conflicting classes - let parent handle positioning
          'mx-4 sm:mx-auto',
          className
        )}
      >
        {/* Fixed header */}
        <ModalHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-800">
          <ModalTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent pr-8 sm:pr-12">
            {title}
          </ModalTitle>
        </ModalHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto mt-4 sm:mt-6 space-y-4 sm:space-y-6 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-900">
          {children}
        </div>
      </ModalContent>
    </Modal>
  )
}
