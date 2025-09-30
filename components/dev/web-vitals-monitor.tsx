'use client'

import { useState, useEffect } from 'react'
import { useWebVitalsMonitor, formatMetricValue } from '@/lib/web-vitals'
import { cn } from '@/lib/utils'
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WebVitalsMonitor() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const { score, metrics, recommendations } = useWebVitalsMonitor()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Auto-hide after 10 seconds
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMinimized])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500'
      case 'needs-improvement':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Open Web Vitals Monitor"
      >
        <TrendingUp className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-white dark:bg-gray-900 shadow-2xl rounded-lg transition-all duration-300',
        isMinimized
          ? 'bottom-4 right-4 w-32 h-32 cursor-pointer'
          : 'bottom-4 right-4 w-96 max-h-[600px]'
      )}
      onClick={() => isMinimized && setIsMinimized(false)}
    >
      {isMinimized ? (
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <div className={cn('text-2xl font-bold', getScoreColor(score))}>
            {score}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Performance</div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Web Vitals</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                >
                  <TrendingDown className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Score:</span>
                <span className={cn('text-2xl font-bold', getScoreColor(score))}>
                  {score}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {Object.entries(metrics).map(([name, metric]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatMetricValue(metric.name, metric.value)}
                    </span>
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getRatingColor(metric.rating)
                      )}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getMetricDescription(name)}
                </div>
              </div>
            ))}

            {recommendations.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Recommendations</span>
                </div>
                <ul className="space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    LCP: 'Largest Contentful Paint - Loading performance',
    FID: 'First Input Delay - Interactivity',
    CLS: 'Cumulative Layout Shift - Visual stability',
    FCP: 'First Contentful Paint - First render',
    TTFB: 'Time to First Byte - Server response',
    INP: 'Interaction to Next Paint - Overall responsiveness',
  }
  return descriptions[name] || ''
}