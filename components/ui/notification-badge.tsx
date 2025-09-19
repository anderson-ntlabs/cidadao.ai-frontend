'use client'

import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  className?: string
  max?: number
}

export function NotificationBadge({ count, className, max = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null
  
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full",
        "animate-in zoom-in-50 duration-200",
        className
      )}
    >
      {displayCount}
    </span>
  )
}