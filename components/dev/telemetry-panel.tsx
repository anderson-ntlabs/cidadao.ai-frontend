'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { chatTelemetry } from '@/lib/telemetry/chat-telemetry'
import { BarChart3, RefreshCw, X } from 'lucide-react'

interface TelemetryPanelProps {
  onClose?: () => void
}

export function TelemetryPanel({ onClose }: TelemetryPanelProps) {
  const [metrics, setMetrics] = useState(chatTelemetry.getMetrics())
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      setMetrics(chatTelemetry.getMetrics())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null
  }

  const errorRate = chatTelemetry.getErrorRate()
  const successRate = chatTelemetry.getSuccessRate()

  return (
    <Card className="fixed bottom-4 right-4 w-96 p-4 shadow-lg z-50 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chat Telemetry</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => chatTelemetry.reset()}
            title="Reset telemetry"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Messages Sent</p>
            <p className="text-2xl font-semibold">{metrics.messagesSent}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Messages Received</p>
            <p className="text-2xl font-semibold">{metrics.messagesReceived}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-muted-foreground">Success Rate</p>
            <p className={`text-lg font-semibold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {successRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Avg Response Time</p>
            <p className="text-lg font-semibold">
              {metrics.averageResponseTime.toFixed(0)}ms
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Errors / Retries</p>
          <p className="text-lg">
            <span className="text-red-600 font-semibold">{metrics.errors}</span>
            {' / '}
            <span className="text-yellow-600 font-semibold">{metrics.retryCount}</span>
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Demo Mode Usage</p>
          <p className="text-lg font-semibold">{metrics.demoModeUsage}</p>
        </div>

        {Object.keys(metrics.intents).length > 0 && (
          <div className="space-y-1">
            <p className="text-muted-foreground">Intent Distribution</p>
            <div className="space-y-1">
              {Object.entries(metrics.intents)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([intent, count]) => (
                  <div key={intent} className="flex justify-between">
                    <span className="text-xs">{intent}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Active Sessions: {metrics.sessionCount}
          </p>
        </div>
      </div>
    </Card>
  )
}