'use client'

import { useEffect, useRef } from 'react'
import { ToastContainer } from '@/components/toast'
import { useToast } from '@/hooks/use-toast'
import { useLiveAnnouncer } from '@/components/a11y'

export function ToastProvider() {
  const { toasts, removeToast } = useToast()
  const { announce } = useLiveAnnouncer()
  const previousToastsRef = useRef<typeof toasts>([])

  // Announce new toasts to screen readers
  useEffect(() => {
    const newToasts = toasts.filter(
      toast => !previousToastsRef.current.some(prev => prev.id === toast.id)
    )

    newToasts.forEach(toast => {
      const priority = toast.type === 'error' ? 'assertive' : 'polite'
      const message = toast.description
        ? `${toast.title}: ${toast.description}`
        : toast.title

      announce(message, priority)
    })

    previousToastsRef.current = toasts
  }, [toasts, announce])

  return <ToastContainer toasts={toasts} onDismiss={removeToast} />
}