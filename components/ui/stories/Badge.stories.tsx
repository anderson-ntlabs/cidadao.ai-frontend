import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'],
      description: 'The visual style variant of the badge'
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'The size of the badge'
    },
    removable: {
      control: 'boolean',
      description: 'Shows remove button'
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const Removable: Story = {
  render: () => {
    const handleRemove = () => {
      console.log('Badge removed')
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        <Badge removable onRemove={handleRemove}>
          Removable
        </Badge>
        <Badge variant="success" removable onRemove={handleRemove}>
          Success
        </Badge>
        <Badge variant="warning" removable onRemove={handleRemove}>
          Warning
        </Badge>
        <Badge variant="info" removable onRemove={handleRemove}>
          Info
        </Badge>
      </div>
    )
  },
}

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Status:</span>
        <Badge variant="success">Active</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="destructive">Inactive</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Priority:</span>
        <Badge variant="destructive">High</Badge>
        <Badge variant="warning">Medium</Badge>
        <Badge variant="info">Low</Badge>
      </div>
    </div>
  ),
}

export const CountBadges: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex items-center gap-2">
        <span>Messages</span>
        <Badge variant="info" size="sm">12</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Notifications</span>
        <Badge variant="destructive" size="sm">3</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Updates</span>
        <Badge variant="success" size="sm">99+</Badge>
      </div>
    </div>
  ),
}