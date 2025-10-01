import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, ButtonV2 } from '@/components/ui/button'
import { 
  ArrowRight, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react'

/**
 * Button components with multiple variants, sizes, and states.
 * Includes both Button and ButtonV2 with modern styling.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile button components with multiple variants and states',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'default'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child component',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * All button variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button>Default</Button>
    </div>
  ),
}

/**
 * Button sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Search">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  ),
}

/**
 * Buttons with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button variant="secondary">
          Download
          <Download className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button size="icon" variant="ghost" aria-label="Edit">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Delete">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Save">
          <Save className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ),
}

/**
 * Loading states
 */
export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
      <Button variant="primary" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Processing
      </Button>
      <Button variant="secondary" disabled>
        Saving
        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
      </Button>
    </div>
  ),
}

/**
 * Disabled states
 */
export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="outline" disabled>Outline</Button>
      <Button variant="ghost" disabled>Ghost</Button>
      <Button variant="danger" disabled>Danger</Button>
    </div>
  ),
}

/**
 * ButtonV2 showcase
 */
export const ButtonV2Showcase: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ButtonV2 Component</h3>
      <div className="flex flex-wrap gap-2">
        <ButtonV2 variant="primary">Primary V2</ButtonV2>
        <ButtonV2 variant="secondary">Secondary V2</ButtonV2>
        <ButtonV2 variant="outline">Outline V2</ButtonV2>
        <ButtonV2 variant="ghost">Ghost V2</ButtonV2>
        <ButtonV2 variant="danger">Danger V2</ButtonV2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        ButtonV2 includes enhanced animations and modern styling
      </p>
    </div>
  ),
}

/**
 * Button groups
 */
export const ButtonGroups: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg shadow-sm">
        <Button variant="outline" className="rounded-r-none">
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button variant="outline" className="rounded-none border-l-0">
          Current
        </Button>
        <Button variant="outline" className="rounded-l-none border-l-0">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="inline-flex rounded-lg shadow-sm">
        <Button variant="primary" size="sm" className="rounded-r-none">
          Day
        </Button>
        <Button variant="outline" size="sm" className="rounded-none border-l-0">
          Week
        </Button>
        <Button variant="outline" size="sm" className="rounded-none border-l-0">
          Month
        </Button>
        <Button variant="outline" size="sm" className="rounded-l-none border-l-0">
          Year
        </Button>
      </div>
    </div>
  ),
}

/**
 * Action buttons for Cidadão.AI
 */
export const CidadaoActions: Story = {
  name: 'Cidadão.AI Actions',
  render: () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Investigation Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">
            <Search className="w-4 h-4 mr-2" />
            Start Investigation
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            Share Results
          </Button>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Agent Commands</h4>
        <div className="flex flex-wrap gap-2">
          <ButtonV2 variant="primary" size="sm">
            Activate Zumbi
          </ButtonV2>
          <ButtonV2 variant="secondary" size="sm">
            Run Analysis
          </ButtonV2>
          <ButtonV2 variant="outline" size="sm">
            View Details
          </ButtonV2>
          <ButtonV2 variant="danger" size="sm">
            Stop Agent
          </ButtonV2>
        </div>
      </div>
    </div>
  ),
}

/**
 * Interactive state demo
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    
    const handleClick = () => {
      setIsLoading(true)
      setIsSuccess(false)
      
      setTimeout(() => {
        setIsLoading(false)
        setIsSuccess(true)
        
        setTimeout(() => {
          setIsSuccess(false)
        }, 2000)
      }, 2000)
    }
    
    return (
      <div className="space-y-4">
        <Button
          variant={isSuccess ? 'secondary' : 'primary'}
          disabled={isLoading}
          onClick={handleClick}
          className="min-w-[150px]"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSuccess && <Check className="w-4 h-4 mr-2" />}
          {isLoading ? 'Processing...' : isSuccess ? 'Success!' : 'Click Me'}
        </Button>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click the button to see loading and success states
        </p>
      </div>
    )
  },
}

/**
 * Full width buttons
 */
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-2">
      <Button variant="primary" className="w-full">
        Full Width Primary
      </Button>
      <Button variant="secondary" className="w-full">
        Full Width Secondary
      </Button>
      <Button variant="outline" className="w-full">
        Full Width Outline
      </Button>
    </div>
  ),
}

/**
 * Custom styled buttons
 */
export const CustomStyles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
        Gradient Button
      </Button>
      <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50">
        Shadow Button
      </Button>
      <Button className="border-2 border-dashed border-gray-400 hover:border-gray-600">
        Dashed Border
      </Button>
      <Button className="rounded-full px-6">
        Rounded Full
      </Button>
    </div>
  ),
}