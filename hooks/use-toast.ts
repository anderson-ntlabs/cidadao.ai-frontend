'use client'

import { create } from 'zustand'
import { Toast, ToastType } from '@/components/toast'

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString(),
      duration: toast.duration ?? 5000
    }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },
  
  clearToasts: () => {
    set({ toasts: [] })
  }
}))

// Helper functions for common toast types
export const toast = {
  success: (title: string, description?: string) => {
    useToast.getState().addToast({ type: 'success', title, description })
  },
  error: (title: string, description?: string) => {
    useToast.getState().addToast({ type: 'error', title, description })
  },
  info: (title: string, description?: string) => {
    useToast.getState().addToast({ type: 'info', title, description })
  },
  warning: (title: string, description?: string) => {
    useToast.getState().addToast({ type: 'warning', title, description })
  }
}