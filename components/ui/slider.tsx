/**
 * Slider Component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

export function Slider({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onValueChange?.([newValue])
  }

  const currentValue = value[0] || 0
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all',
          '[&::-webkit-slider-thumb]:hover:bg-green-700 [&::-webkit-slider-thumb]:focus:ring-2 [&::-webkit-slider-thumb]:focus:ring-green-500',
          '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:bg-green-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all',
          '[&::-moz-range-thumb]:hover:bg-green-700'
        )}
        style={{
          background: `linear-gradient(to right, rgb(22 163 74) 0%, rgb(22 163 74) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`
        }}
      />
    </div>
  )
}
