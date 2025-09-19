import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'
import { ArrowRight, Download, Heart, Loader2 } from 'lucide-react'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning'],
      description: 'The visual style variant of the button'
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
      description: 'The size of the button'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button'
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={<Download className="w-4 h-4" />}>
        Download
      </Button>
      <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
        Continue
      </Button>
      <Button leftIcon={<Heart className="w-4 h-4" />} variant="destructive">
        Like
      </Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="icon">
        <Heart className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Download className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}