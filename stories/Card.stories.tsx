import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  MoreVertical,
  ExternalLink,
  Download
} from 'lucide-react'

/**
 * Card component for containing content with consistent styling.
 * Supports header, content, and footer sections.
 */
const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component for grouping related content',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic card structure
 */
export const Basic: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          Card description with supporting text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card. You can place any content here.</p>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Footer content</p>
      </CardFooter>
    </Card>
  ),
}

/**
 * Card without sections
 */
export const Simple: Story = {
  render: () => (
    <Card className="w-[350px] p-6">
      <h3 className="font-semibold mb-2">Simple Card</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Cards don't require header/content/footer sections. 
        You can use them as simple containers.
      </p>
    </Card>
  ),
}

/**
 * Investigation card
 */
export const InvestigationCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contract Analysis 2024
            </CardTitle>
            <CardDescription>
              Healthcare emergency contracts
            </CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">78%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contracts Analyzed</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Anomalies Found</p>
              <p className="text-2xl font-bold text-red-500">23</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm">
          View Details
        </Button>
        <Button variant="primary" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardFooter>
    </Card>
  ),
}

/**
 * Agent card
 */
export const AgentCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
            Z
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Zumbi dos Palmares</CardTitle>
            <CardDescription>Anomaly Detection Specialist</CardDescription>
          </div>
          <Button size="icon" variant="ghost">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" size="sm">AI Agent</Badge>
            <Badge variant="success" size="sm">Online</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Specialized in detecting anomalies in public contracts, identifying suspicious patterns, 
            and analyzing price deviations.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              47 detections
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              94.5% accuracy
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          Start Investigation
        </Button>
      </CardFooter>
    </Card>
  ),
}

/**
 * Stats card
 */
export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Investigations
          </CardTitle>
          <FileText className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-green-500">+12%</span> from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Active Agents
          </CardTitle>
          <Users className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-gray-500 mt-1">
            All systems operational
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Anomalies Detected
          </CardTitle>
          <AlertCircle className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">47</div>
          <p className="text-xs text-gray-500 mt-1">
            Requires attention
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * Card with list
 */
export const ListCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Your investigation history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { title: 'Contract analysis completed', time: '2 hours ago', type: 'success' },
            { title: 'Anomaly detected in supplier data', time: '5 hours ago', type: 'warning' },
            { title: 'New investigation started', time: '1 day ago', type: 'info' },
            { title: 'Report exported successfully', time: '2 days ago', type: 'success' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 last:pb-0 border-b last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full">
          View All Activities
        </Button>
      </CardFooter>
    </Card>
  ),
}

/**
 * Clickable card
 */
export const ClickableCard: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Clickable Card</CardTitle>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
        <CardDescription>
          Click anywhere on this card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          This entire card is clickable and shows a hover effect. 
          Perfect for navigation items.
        </p>
      </CardContent>
    </Card>
  ),
}

/**
 * Card grid layout
 */
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      {[
        { title: 'Healthcare Contracts', count: 234, color: 'bg-blue-500' },
        { title: 'Education Budget', count: 189, color: 'bg-green-500' },
        { title: 'Infrastructure Projects', count: 156, color: 'bg-purple-500' },
        { title: 'Security Operations', count: 98, color: 'bg-red-500' },
        { title: 'Technology Services', count: 67, color: 'bg-yellow-500' },
        { title: 'Environmental Programs', count: 45, color: 'bg-indigo-500' },
      ].map((dept, idx) => (
        <Card key={idx} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${dept.color}`} />
              {dept.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dept.count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active investigations
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}

/**
 * Empty state card
 */
export const EmptyState: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No investigations yet</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
          Start your first investigation to analyze government contracts
        </p>
        <Button variant="primary">
          Start Investigation
        </Button>
      </CardContent>
    </Card>
  ),
}

/**
 * Loading state card
 */
export const LoadingState: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  ),
}