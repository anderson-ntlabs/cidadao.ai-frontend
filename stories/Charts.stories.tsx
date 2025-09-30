import type { Meta, StoryObj } from '@storybook/nextjs'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'

// Dynamically import charts to avoid SSR issues
const LineChart = dynamic(
  () => import('@/components/charts/line-chart').then(mod => ({ default: mod.LineChart })),
  { ssr: false }
)

const BarChart = dynamic(
  () => import('@/components/charts/bar-chart').then(mod => ({ default: mod.BarChart })),
  { ssr: false }
)

const PieChart = dynamic(
  () => import('@/components/charts/pie-chart').then(mod => ({ default: mod.PieChart })),
  { ssr: false }
)

const AreaChart = dynamic(
  () => import('@/components/charts/area-chart').then(mod => ({ default: mod.AreaChart })),
  { ssr: false }
)

/**
 * Chart components for data visualization.
 * Includes Line, Bar, Pie, and Area charts with responsive design.
 */
const meta = {
  title: 'UI/Charts',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Data visualization components built with Recharts',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// Sample data for demonstrations
const lineData = [
  { month: 'Jan', investigations: 45, anomalies: 12 },
  { month: 'Feb', investigations: 52, anomalies: 15 },
  { month: 'Mar', investigations: 48, anomalies: 10 },
  { month: 'Apr', investigations: 61, anomalies: 18 },
  { month: 'May', investigations: 55, anomalies: 14 },
  { month: 'Jun', investigations: 67, anomalies: 22 },
]

const barData = [
  { department: 'Health', contracts: 234, value: 45600000 },
  { department: 'Education', contracts: 189, value: 38900000 },
  { department: 'Infrastructure', contracts: 156, value: 67800000 },
  { department: 'Security', contracts: 98, value: 23400000 },
  { department: 'Technology', contracts: 67, value: 15600000 },
]

const pieData = [
  { name: 'Approved', value: 45, color: '#10b981' },
  { name: 'Rejected', value: 23, color: '#ef4444' },
  { name: 'Pending', value: 18, color: '#f59e0b' },
  { name: 'Under Review', value: 14, color: '#3b82f6' },
]

const areaData = [
  { date: '2024-01', spending: 4500000, budget: 5000000 },
  { date: '2024-02', spending: 4800000, budget: 5000000 },
  { date: '2024-03', spending: 4200000, budget: 5000000 },
  { date: '2024-04', spending: 5100000, budget: 5200000 },
  { date: '2024-05', spending: 4900000, budget: 5200000 },
  { date: '2024-06', spending: 5400000, budget: 5500000 },
]

/**
 * Line chart showing trends over time
 */
export const LineChartExample: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Investigation Trends</h3>
      <div className="h-[300px]">
        <LineChart
          data={lineData}
          lines={[
            { dataKey: 'investigations', name: 'Total Investigations', color: '#3b82f6' },
            { dataKey: 'anomalies', name: 'Anomalies Found', color: '#ef4444' },
          ]}
          xDataKey="month"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Monthly investigation activity and anomaly detection rates
      </p>
    </Card>
  ),
}

/**
 * Bar chart comparing values
 */
export const BarChartExample: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Department Contracts</h3>
      <div className="h-[300px]">
        <BarChart
          data={barData}
          bars={[
            { dataKey: 'contracts', name: 'Number of Contracts', color: '#8b5cf6' },
          ]}
          xDataKey="department"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Contract distribution across government departments
      </p>
    </Card>
  ),
}

/**
 * Pie chart showing distribution
 */
export const PieChartExample: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Investigation Status Distribution</h3>
      <div className="h-[300px]">
        <PieChart
          data={pieData}
          dataKey="value"
          nameKey="name"
          showLabels
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Current status of all ongoing investigations
      </p>
    </Card>
  ),
}

/**
 * Area chart with comparison
 */
export const AreaChartExample: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Budget vs Spending</h3>
      <div className="h-[300px]">
        <AreaChart
          data={areaData}
          areas={[
            { dataKey: 'budget', name: 'Budget', color: '#10b981', opacity: 0.3 },
            { dataKey: 'spending', name: 'Actual Spending', color: '#3b82f6', opacity: 0.6 },
          ]}
          xDataKey="date"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Monthly budget allocation vs actual spending trends
      </p>
    </Card>
  ),
}

/**
 * Multiple charts dashboard
 */
export const Dashboard: Story = {
  name: 'Dashboard Layout',
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Activity</h3>
          <div className="h-[250px]">
            <LineChart
              data={lineData}
              lines={[
                { dataKey: 'investigations', name: 'Investigations', color: '#3b82f6' },
                { dataKey: 'anomalies', name: 'Anomalies', color: '#ef4444' },
              ]}
              xDataKey="month"
            />
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
          <div className="h-[250px]">
            <PieChart
              data={pieData}
              dataKey="value"
              nameKey="name"
            />
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Department Analysis</h3>
        <div className="h-[300px]">
          <BarChart
            data={barData}
            bars={[
              { dataKey: 'contracts', name: 'Contracts', color: '#8b5cf6' },
            ]}
            xDataKey="department"
          />
        </div>
      </Card>
    </div>
  ),
}

/**
 * Real-time updating chart (simulated)
 */
export const RealTimeChart: Story = {
  render: () => {
    const [data, setData] = React.useState(lineData)
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setData(prevData => {
          const lastMonth = prevData[prevData.length - 1]
          const newMonth = {
            month: 'Jul',
            investigations: Math.floor(Math.random() * 20) + 50,
            anomalies: Math.floor(Math.random() * 10) + 10,
          }
          return [...prevData.slice(1), newMonth]
        })
      }, 2000)
      
      return () => clearInterval(interval)
    }, [])
    
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Real-Time Monitoring
          <span className="ml-2 inline-flex h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        </h3>
        <div className="h-[300px]">
          <LineChart
            data={data}
            lines={[
              { dataKey: 'investigations', name: 'Investigations', color: '#3b82f6' },
              { dataKey: 'anomalies', name: 'Anomalies', color: '#ef4444' },
            ]}
            xDataKey="month"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Live data updates every 2 seconds (simulated)
        </p>
      </Card>
    )
  },
}

/**
 * Empty state example
 */
export const EmptyState: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">No Data Available</h3>
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-6xl">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            No investigation data to display yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Start an investigation to see analytics
          </p>
        </div>
      </div>
    </Card>
  ),
}

/**
 * Chart with custom colors
 */
export const CustomColors: Story = {
  render: () => {
    const customData = [
      { agent: 'Zumbi', performance: 95 },
      { agent: 'Anita', performance: 88 },
      { agent: 'Tiradentes', performance: 92 },
      { agent: 'Machado', performance: 86 },
      { agent: 'Senna', performance: 90 },
    ]
    
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Performance Scores</h3>
        <div className="h-[300px]">
          <BarChart
            data={customData}
            bars={[
              { 
                dataKey: 'performance', 
                name: 'Performance %', 
                color: '#10b981',
                fill: (entry: any, index: number) => {
                  const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981']
                  return colors[index % colors.length]
                }
              },
            ]}
            xDataKey="agent"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Individual agent performance metrics
        </p>
      </Card>
    )
  },
}