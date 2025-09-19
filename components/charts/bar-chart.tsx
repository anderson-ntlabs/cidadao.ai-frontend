'use client'

import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell
} from 'recharts'

interface BarChartProps {
  data: Array<Record<string, any>>
  bars: Array<{
    dataKey: string
    name: string
    color: string
    stackId?: string
  }>
  xAxisKey: string
  yAxisFormatter?: (value: any) => string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  orientation?: 'vertical' | 'horizontal'
  className?: string
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

export function BarChart({
  data,
  bars,
  xAxisKey,
  yAxisFormatter,
  height = 300,
  showGrid = true,
  showLegend = true,
  orientation = 'vertical',
  className
}: BarChartProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          layout={isHorizontal ? 'horizontal' : 'vertical'}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              className="dark:opacity-20" 
            />
          )}
          {isHorizontal ? (
            <>
              <XAxis 
                type="number"
                tickFormatter={yAxisFormatter}
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                dataKey={xAxisKey}
                type="category"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey={xAxisKey} 
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
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          )}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}