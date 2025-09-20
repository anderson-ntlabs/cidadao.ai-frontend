'use client'

import { ReactNode, useId } from 'react'
import { Input } from '@/components/ui'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  children?: ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  required,
  description,
  children,
  className = ''
}: FormFieldProps) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {description}
        </p>
      )}
      
      <div>
        {children || (
          <Input
            id={id}
            aria-describedby={`${description ? descriptionId : ''} ${error ? errorId : ''}`}
            aria-invalid={!!error}
            aria-required={required}
            className={error ? 'border-red-500' : ''}
          />
        )}
      </div>
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}