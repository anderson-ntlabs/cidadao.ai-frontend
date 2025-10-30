/**
 * Select Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (newValue: string) => {
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            value,
            handleSelect,
            disabled
          })
        }
        return child
      })}
    </div>
  )
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  disabled?: boolean
}

export function SelectTrigger({ children, className, isOpen, setIsOpen, disabled }: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen?.(!isOpen)}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-800 px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
    </button>
  )
}

export interface SelectValueProps {
  placeholder?: string
  value?: string
  children?: React.ReactNode
}

export function SelectValue({ placeholder, value, children }: SelectValueProps) {
  return <span>{value || placeholder || children}</span>
}

export interface SelectContentProps {
  children: React.ReactNode
  isOpen?: boolean
  className?: string
}

export function SelectContent({ children, isOpen, className }: SelectContentProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'absolute z-50 w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  handleSelect?: (value: string) => void
  className?: string
}

export function SelectItem({ value, children, handleSelect, className }: SelectItemProps) {
  return (
    <button
      type="button"
      onClick={() => handleSelect?.(value)}
      className={cn(
        'w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700',
        'focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none',
        className
      )}
    >
      {children}
    </button>
  )
}
