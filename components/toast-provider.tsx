'use client'

import { ToastContainer } from '@/components/toast'
import { useToast } from '@/hooks/use-toast'

export function ToastProvider() {
  const { toasts, removeToast } = useToast()
  
  return <ToastContainer toasts={toasts} onDismiss={removeToast} />
}