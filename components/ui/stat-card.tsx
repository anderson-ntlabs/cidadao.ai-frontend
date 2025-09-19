'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from './card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
  description?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  description,
  className,
  onClick
}: StatCardProps) {
  // Auto-detect change type if not provided
  const type = changeType || (change ? (change > 0 ? 'positive' : 'negative') : 'neutral')
  
  const getTrendIcon = () => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />
      case 'negative':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getTrendColor = () => {
    switch (type) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <Card 
      className={`transition-all hover:shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {(change !== undefined || description) && (
              <div className="mt-2 flex items-center gap-2">
                {change !== undefined && (
                  <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                      {Math.abs(change)}%
                    </span>
                  </div>
                )}
                {description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}