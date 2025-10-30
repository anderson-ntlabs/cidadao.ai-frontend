'use client'

import { useMemo } from 'react'
import type { AnomalyResult } from '@/lib/api/investigation-adapter'

/**
 * Anomaly Chart Component
 *
 * Simple SVG-based charts for anomaly visualization
 * No external dependencies, pure CSS and SVG
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

interface AnomalyChartProps {
  anomalies: AnomalyResult[]
  type: 'severity' | 'type' | 'confidence'
}

export function AnomalyChart({ anomalies, type }: AnomalyChartProps) {
  const chartData = useMemo(() => {
    if (type === 'severity') {
      const high = anomalies.filter(a => a.severity === 'high').length
      const medium = anomalies.filter(a => a.severity === 'medium').length
      const low = anomalies.filter(a => a.severity === 'low').length
      const total = high + medium + low

      return [
        { label: 'Alta', value: high, percentage: (high / total) * 100, color: '#dc2626' },
        { label: 'Média', value: medium, percentage: (medium / total) * 100, color: '#f59e0b' },
        { label: 'Baixa', value: low, percentage: (low / total) * 100, color: '#3b82f6' }
      ]
    } else if (type === 'type') {
      const types = anomalies.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4']
      return Object.entries(types).map(([label, value], idx) => ({
        label,
        value,
        percentage: (value / anomalies.length) * 100,
        color: colors[idx % colors.length]
      }))
    } else {
      // Confidence ranges
      const veryHigh = anomalies.filter(a => a.confidence >= 0.9).length
      const high = anomalies.filter(a => a.confidence >= 0.7 && a.confidence < 0.9).length
      const medium = anomalies.filter(a => a.confidence >= 0.5 && a.confidence < 0.7).length
      const low = anomalies.filter(a => a.confidence < 0.5).length
      const total = veryHigh + high + medium + low

      return [
        { label: '90-100%', value: veryHigh, percentage: (veryHigh / total) * 100, color: '#10b981' },
        { label: '70-89%', value: high, percentage: (high / total) * 100, color: '#3b82f6' },
        { label: '50-69%', value: medium, percentage: (medium / total) * 100, color: '#f59e0b' },
        { label: '<50%', value: low, percentage: (low / total) * 100, color: '#dc2626' }
      ].filter(item => item.value > 0)
    }
  }, [anomalies, type])

  const title = type === 'severity' ? 'Por Severidade' : type === 'type' ? 'Por Tipo' : 'Por Confiança'

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>

      {/* Bar Chart */}
      <div className="space-y-3">
        {chartData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400 capitalize">{item.label}</span>
              <span className="font-medium">{item.value} ({Math.round(item.percentage)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart (SVG) */}
      <div className="flex justify-center pt-4">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {chartData.map((item, idx) => {
            // Calculate pie slice
            const startAngle = chartData.slice(0, idx).reduce((sum, d) => sum + (d.percentage / 100) * 360, 0)
            const endAngle = startAngle + (item.percentage / 100) * 360

            const startRad = (startAngle - 90) * (Math.PI / 180)
            const endRad = (endAngle - 90) * (Math.PI / 180)

            const x1 = 100 + 80 * Math.cos(startRad)
            const y1 = 100 + 80 * Math.sin(startRad)
            const x2 = 100 + 80 * Math.cos(endRad)
            const y2 = 100 + 80 * Math.sin(endRad)

            const largeArcFlag = item.percentage > 50 ? 1 : 0

            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ')

            return (
              <g key={idx}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              </g>
            )
          })}
          {/* Center circle for donut effect */}
          <circle cx="100" cy="100" r="50" fill="white" className="dark:fill-gray-800" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
