import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../input'
import { Search, Mail, Lock, User } from 'lucide-react'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'The visual state of the input'
    },
    inputSize: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl'],
      description: 'The size of the input'
    },
    error: {
      control: 'boolean',
      description: 'Shows error state'
    },
    success: {
      control: 'boolean',
      description: 'Shows success state'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input'
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="email" className="text-sm font-medium">
        Email Address
      </label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="w-4 h-4" />}
      />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input placeholder="Default state" />
      <Input placeholder="Error state" error helperText="This field is required" />
      <Input placeholder="Success state" success helperText="Looking good!" />
      <Input placeholder="Disabled state" disabled />
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input
        placeholder="Search..."
        leftIcon={<Search className="w-4 h-4" />}
      />
      <Input
        placeholder="Email"
        leftIcon={<Mail className="w-4 h-4" />}
        type="email"
      />
      <Input
        placeholder="Password"
        leftIcon={<Lock className="w-4 h-4" />}
        type="password"
      />
      <Input
        placeholder="Username"
        rightIcon={<User className="w-4 h-4" />}
      />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input inputSize="sm" placeholder="Small input" />
      <Input inputSize="default" placeholder="Default input" />
      <Input inputSize="lg" placeholder="Large input" />
      <Input inputSize="xl" placeholder="Extra large input" />
    </div>
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input
        placeholder="Email"
        helperText="We'll never share your email"
        leftIcon={<Mail className="w-4 h-4" />}
      />
      <Input
        placeholder="Password"
        type="password"
        helperText="Must be at least 8 characters"
        leftIcon={<Lock className="w-4 h-4" />}
      />
    </div>
  ),
}