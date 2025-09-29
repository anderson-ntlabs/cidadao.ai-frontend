import type { Meta, StoryObj } from '@storybook/react'
import { 
  CardV2, 
  CardV2Header, 
  CardV2Title, 
  CardV2Description, 
  CardV2Content, 
  CardV2Footer,
  CardV2Badge,
  CardV2Stat
} from '@/components/ui/card'
import { ButtonV2 } from '@/components/ui/button'
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react'

const meta: Meta<typeof CardV2> = {
  title: 'Design System v2/Card',
  component: CardV2,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'ghost', 'filled'],
      description: 'Visual style variant of the card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'responsive'],
      description: 'Padding size of the card',
    },
    interactive: {
      control: 'boolean',
      description: 'Makes the card interactive with hover effects',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic card
export const Default: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <>
        <CardV2Header>
          <CardV2Title>Card Title</CardV2Title>
          <CardV2Description>This is a description of the card content.</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This is the main content area of the card. It can contain any type of content including text, images, or other components.
        </CardV2Content>
      </>
    ),
  },
}

// All variants
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardV2 variant="elevated">
        <CardV2Header>
          <CardV2Title>Elevated</CardV2Title>
          <CardV2Description>Default card with shadow</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This variant has a subtle shadow that increases on hover.
        </CardV2Content>
      </CardV2>

      <CardV2 variant="outlined">
        <CardV2Header>
          <CardV2Title>Outlined</CardV2Title>
          <CardV2Description>Card with border</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This variant has a border that changes color on hover.
        </CardV2Content>
      </CardV2>

      <CardV2 variant="ghost">
        <CardV2Header>
          <CardV2Title>Ghost</CardV2Title>
          <CardV2Description>Minimal card style</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This variant has no background or border.
        </CardV2Content>
      </CardV2>

      <CardV2 variant="filled">
        <CardV2Header>
          <CardV2Title>Filled</CardV2Title>
          <CardV2Description>Card with background</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This variant has a gray background.
        </CardV2Content>
      </CardV2>
    </div>
  ),
}

// Interactive cards
export const Interactive: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CardV2 interactive variant="elevated">
        <CardV2Header>
          <CardV2Title>Clickable Card</CardV2Title>
          <CardV2Description>This card lifts on hover</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          Hover over this card to see the lift effect. Perfect for clickable items.
        </CardV2Content>
      </CardV2>

      <CardV2 interactive variant="outlined">
        <CardV2Header>
          <CardV2Title>Investigation #1234</CardV2Title>
          <CardV2Description>Analysis in progress</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          Click to view investigation details.
        </CardV2Content>
      </CardV2>

      <CardV2 interactive>
        <CardV2Header>
          <CardV2Title>New Report</CardV2Title>
          <CardV2Description>Generated 5 minutes ago</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          Complete transparency report available.
        </CardV2Content>
      </CardV2>
    </div>
  ),
}

// Cards with badges
export const WithBadges: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardV2>
        <CardV2Header>
          <div className="flex items-center justify-between mb-2">
            <CardV2Badge variant="success">Active</CardV2Badge>
            <span className="text-sm text-gray-500">2h ago</span>
          </div>
          <CardV2Title>Success State</CardV2Title>
          <CardV2Description>Everything is working correctly</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This card shows a success state with a green badge.
        </CardV2Content>
      </CardV2>

      <CardV2>
        <CardV2Header>
          <div className="flex items-center justify-between mb-2">
            <CardV2Badge variant="warning">Pending Review</CardV2Badge>
            <span className="text-sm text-gray-500">1d ago</span>
          </div>
          <CardV2Title>Warning State</CardV2Title>
          <CardV2Description>Requires attention</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This card shows a warning state that needs review.
        </CardV2Content>
      </CardV2>

      <CardV2>
        <CardV2Header>
          <div className="flex items-center gap-2 mb-2">
            <CardV2Badge variant="info">New</CardV2Badge>
            <CardV2Badge variant="info">Beta</CardV2Badge>
          </div>
          <CardV2Title>Information State</CardV2Title>
          <CardV2Description>New feature available</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This card shows multiple informational badges.
        </CardV2Content>
      </CardV2>

      <CardV2>
        <CardV2Header>
          <CardV2Badge variant="danger">Critical</CardV2Badge>
          <CardV2Title>Error State</CardV2Title>
          <CardV2Description>Immediate action required</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This card shows a critical error state.
        </CardV2Content>
      </CardV2>
    </div>
  ),
}

// Cards with footer
export const WithFooter: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardV2>
        <CardV2Header>
          <CardV2Title>Investigation Report</CardV2Title>
          <CardV2Description>Detailed analysis of public spending</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          <p>1,234 public contracts analyzed from January to March 2025.</p>
          <p className="mt-2">
            <strong className="text-brand-green-600">23 anomalies</strong> detected and under investigation.
          </p>
        </CardV2Content>
        <CardV2Footer>
          <span className="text-sm text-gray-500">Updated 2h ago</span>
          <div className="flex gap-2">
            <ButtonV2 size="sm" variant="ghost">Share</ButtonV2>
            <ButtonV2 size="sm">View Details</ButtonV2>
          </div>
        </CardV2Footer>
      </CardV2>

      <CardV2>
        <CardV2Header>
          <CardV2Title>Monthly Summary</CardV2Title>
          <CardV2Description>Executive transparency report</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          <ul className="space-y-2">
            <li>• Total analyzed: R$ 45.3M</li>
            <li>• Alerts generated: 127</li>
            <li>• Compliance rate: 87%</li>
          </ul>
        </CardV2Content>
        <CardV2Footer>
          <ButtonV2 variant="primary" size="sm">Download PDF</ButtonV2>
        </CardV2Footer>
      </CardV2>
    </div>
  ),
}

// Stat cards
export const StatCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardV2Stat
        title="Investigations"
        value="1,234"
        description="Total this month"
        trend={{ value: 12, isPositive: true }}
        icon={<FileText className="h-5 w-5 text-brand-green-600" />}
      />
      
      <CardV2Stat
        title="Anomalies"
        value="89"
        description="Detected today"
        trend={{ value: 5, isPositive: false }}
        icon={<AlertCircle className="h-5 w-5 text-brand-red-600" />}
      />
      
      <CardV2Stat
        title="Active Users"
        value="3.4K"
        description="Last 7 days"
        trend={{ value: 18, isPositive: true }}
        icon={<Users className="h-5 w-5 text-brand-blue-600" />}
      />
      
      <CardV2Stat
        title="Success Rate"
        value="94.2%"
        description="Case resolution"
        icon={<TrendingUp className="h-5 w-5 text-brand-green-600" />}
      />
    </div>
  ),
}

// Padding variations
export const PaddingVariations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardV2 padding="none">
        <CardV2Title className="px-4 pt-4">No Padding</CardV2Title>
        <CardV2Content className="px-4 pb-4">Content flush to edges</CardV2Content>
      </CardV2>

      <CardV2 padding="sm">
        <CardV2Title>Small</CardV2Title>
        <CardV2Content>Compact spacing</CardV2Content>
      </CardV2>

      <CardV2 padding="md">
        <CardV2Title>Medium</CardV2Title>
        <CardV2Content>Default spacing</CardV2Content>
      </CardV2>

      <CardV2 padding="lg">
        <CardV2Title>Large</CardV2Title>
        <CardV2Content>Generous spacing</CardV2Content>
      </CardV2>
    </div>
  ),
}

// Complex composition
export const ComplexComposition: Story = {
  render: () => (
    <CardV2 className="max-w-2xl">
      <CardV2Header>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CardV2Badge variant="success">Completed</CardV2Badge>
              <CardV2Badge variant="info">High Priority</CardV2Badge>
            </div>
            <CardV2Title>Complex Investigation Report</CardV2Title>
            <CardV2Description>
              Multi-agent analysis of government contracts in the healthcare sector
            </CardV2Description>
          </div>
          <ButtonV2 size="icon" variant="ghost">
            <FileText className="h-4 w-4" />
          </ButtonV2>
        </div>
      </CardV2Header>
      
      <CardV2Content>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Executive Summary</h4>
            <p className="text-sm">
              The multi-agent system analyzed 3,456 healthcare contracts totaling R$ 234.5M 
              across 12 states. The investigation revealed systematic patterns requiring 
              immediate attention.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-green-600">87%</p>
              <p className="text-sm text-gray-600">Compliance Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-yellow-600">234</p>
              <p className="text-sm text-gray-600">Alerts Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-blue-600">45</p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
          </div>
        </div>
      </CardV2Content>
      
      <CardV2Footer>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Generated by Zumbi dos Palmares</span>
          <span>•</span>
          <span>March 15, 2025</span>
        </div>
        <div className="flex gap-2">
          <ButtonV2 size="sm" variant="ghost">Export CSV</ButtonV2>
          <ButtonV2 size="sm" variant="ghost">Share</ButtonV2>
          <ButtonV2 size="sm" variant="primary">View Full Report</ButtonV2>
        </div>
      </CardV2Footer>
    </CardV2>
  ),
}

// Dark mode
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardV2 variant="elevated">
        <CardV2Header>
          <CardV2Badge variant="success">Active</CardV2Badge>
          <CardV2Title>Dark Mode Card</CardV2Title>
          <CardV2Description>Elevated variant in dark mode</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          This card adapts its colors and shadows for dark mode.
        </CardV2Content>
        <CardV2Footer>
          <span className="text-sm">Updated recently</span>
          <ButtonV2 size="sm">Action</ButtonV2>
        </CardV2Footer>
      </CardV2>

      <CardV2 variant="outlined">
        <CardV2Header>
          <CardV2Title>Outlined in Dark</CardV2Title>
          <CardV2Description>Border adapts to dark mode</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          The border color adjusts for proper contrast in dark mode.
        </CardV2Content>
      </CardV2>
    </div>
  ),
}

// Playground
export const Playground: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    interactive: false,
    children: (
      <>
        <CardV2Header>
          <CardV2Title>Playground Card</CardV2Title>
          <CardV2Description>Experiment with different props</CardV2Description>
        </CardV2Header>
        <CardV2Content>
          Use the controls to change the card variant, padding, and interactivity.
        </CardV2Content>
      </>
    ),
  },
}