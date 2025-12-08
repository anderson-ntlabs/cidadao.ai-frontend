'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success:
          'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const toastIcons = {
  default: null,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastIconColors = {
  default: '',
  destructive: 'text-destructive-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
}

type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants> & {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    onDismiss?: () => void
    showIcon?: boolean
  }

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      action,
      onDismiss,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const Icon = variant ? toastIcons[variant] : null
    const iconColor = variant ? toastIconColors[variant] : ''

    return (
      <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
        <div className="flex items-start gap-3">
          {showIcon && Icon && (
            <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', iconColor)} aria-hidden="true" />
          )}
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
        </div>
        {action}
        {onDismiss && (
          <button
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            onClick={onDismiss}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

interface ToastContextValue {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback(
    (toast: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { ...toast, id }

      setToasts((prev) => [...prev, newToast])

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeToast(id)
      }, 5000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={() => removeToast(toast.id)}
            className="mb-2 animate-slide-in-right"
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { Toast, toastVariants }
