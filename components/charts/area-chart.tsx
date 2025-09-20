'use client'

import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AreaChartProps {
  data: Array<Record<string, any>>
  areas: Array<{
    dataKey: string
    name: string
    color: string
    opacity?: number
    stackId?: string
  }>
  xAxisKey: string
  xAxisType?: 'date' | 'category'
  yAxisFormatter?: (value: any) => string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  className?: string
  gradient?: boolean
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AreaChart({
  data,
  areas,
  xAxisKey,
  xAxisType = 'category',
  yAxisFormatter,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
  gradient = true
}: AreaChartProps) {
  const formatXAxisTick = (value: any) => {
    if (xAxisType === 'date') {
      return format(new Date(value), 'dd/MM', { locale: ptBR })
    }
    return value
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart 
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {gradient && (
            <defs>
              {areas.map((area, index) => (
                <linearGradient 
                  key={`gradient-${index}`} 
                  id={`gradient-${area.dataKey}`} 
                  x1="0" 
                  y1="0" 
                  x2="0" 
                  y2="1"
                >
                  <stop offset="0%" stopColor={area.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
          )}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:opacity-20" 
            />
          )}
          <XAxis 
            dataKey={xAxisKey} 
            tickFormatter={formatXAxisTick}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={yAxisFormatter}
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          )}
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={2}
              fillOpacity={area.opacity || 0.6}
              fill={gradient ? `url(#gradient-${area.dataKey})` : area.color}
              stackId={area.stackId}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}