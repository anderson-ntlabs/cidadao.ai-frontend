import type { Meta, StoryObj } from '@storybook/nextjs'
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Info, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * GlassCard provides a glassmorphic card design with backdrop blur
 * and semi-transparent background. Perfect for modern, elegant UIs.
 */
const meta = {
  title: 'UI/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modern glassmorphic card component with backdrop blur effects',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[600px] w-full max-w-4xl p-8 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'darker', 'lighter'],
      description: 'Visual style variant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof GlassCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default glass card with standard opacity
 */
export const Default: Story = {
  args: {
    className: 'w-[400px]',
  },
  render: (args) => (
    <GlassCard {...args}>
      <GlassCardHeader>
        <h3 className="text-2xl font-bold">Glass Card</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Beautiful glassmorphic design
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <p>
          This card features a modern glass effect with backdrop blur,
          creating an elegant semi-transparent appearance that works
          beautifully over colorful backgrounds.
        </p>
      </GlassCardContent>
      <GlassCardFooter className="flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </GlassCardFooter>
    </GlassCard>
  ),
}

/**
 * Darker variant for better contrast
 */
export const Darker: Story = {
  args: {
    variant: 'darker',
    className: 'w-[400px]',
  },
  render: (args) => (
    <GlassCard {...args}>
      <GlassCardHeader>
        <h3 className="text-2xl font-bold text-white">Dark Glass</h3>
        <p className="text-gray-300">
          Higher opacity for better readability
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <p className="text-gray-100">
          The darker variant provides better contrast and readability
          while maintaining the glass aesthetic.
        </p>
      </GlassCardContent>
    </GlassCard>
  ),
}

/**
 * Multiple cards in a grid layout
 */
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard>
        <GlassCardHeader>
          <Info className="w-8 h-8 text-blue-500 mb-2" />
          <h4 className="text-lg font-semibold">Information</h4>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm">
            Stay informed with real-time updates and insights.
          </p>
        </GlassCardContent>
      </GlassCard>
      
      <GlassCard>
        <GlassCardHeader>
          <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
          <h4 className="text-lg font-semibold">Warnings</h4>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm">
            Get alerted about important changes and updates.
          </p>
        </GlassCardContent>
      </GlassCard>
      
      <GlassCard>
        <GlassCardHeader>
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <h4 className="text-lg font-semibold">Success</h4>
        </GlassCardHeader>
        <GlassCardContent>
          <p className="text-sm">
            Track your achievements and completed tasks.
          </p>
        </GlassCardContent>
      </GlassCard>
    </div>
  ),
}

/**
 * Interactive card with hover effects
 */
export const Interactive: Story = {
  args: {
    className: 'w-[400px] cursor-pointer transition-all hover:scale-105 hover:shadow-2xl',
  },
  render: (args) => (
    <GlassCard {...args}>
      <GlassCardHeader>
        <h3 className="text-2xl font-bold">Interactive Card</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hover to see the effect
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <p>
          This card scales up slightly and increases shadow on hover,
          creating an engaging interactive experience.
        </p>
      </GlassCardContent>
      <GlassCardFooter>
        <Button variant="primary" className="w-full">
          Click Me
        </Button>
      </GlassCardFooter>
    </GlassCard>
  ),
}

/**
 * Card with custom gradient background
 */
export const WithCustomBackground: Story = {
  decorators: [
    (Story) => (
      <div className="relative min-h-[600px] w-full max-w-4xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500" />
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500 opacity-50" />
        <div className="relative z-10">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    className: 'w-[400px]',
  },
  render: (args) => (
    <GlassCard {...args}>
      <GlassCardHeader>
        <h3 className="text-2xl font-bold">Vibrant Background</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Glass effect over complex gradients
        </p>
      </GlassCardHeader>
      <GlassCardContent>
        <p>
          The glass effect adapts beautifully to any background,
          creating depth and visual interest while maintaining readability.
        </p>
      </GlassCardContent>
    </GlassCard>
  ),
}