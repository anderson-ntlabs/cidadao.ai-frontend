'use client'

import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Tooltip, 
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  colors?: string[]
  height?: number
  innerRadius?: number
  outerRadius?: number
  showLabel?: boolean
  showLegend?: boolean
  className?: string
}

const RADIAN = Math.PI / 180
const defaultColors = [
  '#10b981', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
]

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {data.name}
        </p>
        <p className="text-sm font-semibold" style={{ color: data.payload.fill }}>
          {data.value} ({data.payload.percent}%)
        </p>
      </div>
    )
  }
  return null
}

export function PieChart({
  data,
  colors = defaultColors,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLabel = true,
  showLegend = true,
  className
}: PieChartProps) {
  // Add percentage to data
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercent = data.map((item, index) => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(1),
    fill: item.color || colors[index % colors.length]
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabel ? renderCustomizedLabel : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercent.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-xs">
                  {value} ({entry.payload.percent}%)
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}