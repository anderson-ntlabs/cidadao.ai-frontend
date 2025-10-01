import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Info, XCircle, Clock, User } from 'lucide-react'

/**
 * Badge component for displaying status indicators, labels, and counts.
 * Supports multiple variants and sizes with optional icons.
 */
const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile badge component for status indicators, labels, and counts',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    children: {
      control: 'text',
      description: 'Badge content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default badge with various variants
 */
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

/**
 * Different badge sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge>Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

/**
 * Badges with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
      <Badge variant="warning">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
      <Badge variant="default">
        <Info className="w-3 h-3 mr-1" />
        Info
      </Badge>
    </div>
  ),
}

/**
 * Status badges commonly used in applications
 */
export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Investigation Status:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Agent Status:</span>
        <Badge variant="warning">
          <Clock className="w-3 h-3 mr-1" />
          Thinking
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Connection:</span>
        <Badge variant="destructive">Offline</Badge>
      </div>
    </div>
  ),
}

/**
 * Number/count badges
 */
export const CountBadges: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="relative">
        <User className="w-8 h-8" />
        <Badge 
          variant="destructive" 
          size="sm" 
          className="absolute -top-1 -right-1"
        >
          3
        </Badge>
      </div>
      <div className="relative">
        <User className="w-8 h-8" />
        <Badge 
          variant="default" 
          size="sm" 
          className="absolute -top-1 -right-1"
        >
          99+
        </Badge>
      </div>
    </div>
  ),
}

/**
 * Agent role badges
 */
export const AgentBadges: Story = {
  name: 'Agent Roles',
  render: () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">Orchestrator</Badge>
        <Badge variant="secondary">Investigator</Badge>
        <Badge variant="success">Analyst</Badge>
        <Badge variant="warning">Reporter</Badge>
        <Badge variant="destructive">Monitor</Badge>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Agent role badges used throughout the Cidadão.AI platform
      </div>
    </div>
  ),
}

/**
 * Interactive badge example
 */
export const Interactive: Story = {
  render: () => {
    const [clicked, setClicked] = React.useState(false)
    
    return (
      <div className="space-y-4">
        <button
          onClick={() => setClicked(!clicked)}
          className="focus:outline-none"
        >
          <Badge 
            variant={clicked ? "success" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
          >
            {clicked ? "Clicked!" : "Click me"}
          </Badge>
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Badges can be made interactive when wrapped in buttons
        </div>
      </div>
    )
  },
}

/**
 * Badge groups
 */
export const BadgeGroups: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Skills</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" size="sm">React</Badge>
          <Badge variant="outline" size="sm">TypeScript</Badge>
          <Badge variant="outline" size="sm">Next.js</Badge>
          <Badge variant="outline" size="sm">Tailwind CSS</Badge>
          <Badge variant="outline" size="sm">Node.js</Badge>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" size="sm">Transparency</Badge>
          <Badge variant="secondary" size="sm">Government</Badge>
          <Badge variant="secondary" size="sm">AI Analysis</Badge>
          <Badge variant="secondary" size="sm">Public Data</Badge>
        </div>
      </div>
    </div>
  ),
}