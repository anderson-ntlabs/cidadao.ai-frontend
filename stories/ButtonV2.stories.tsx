import type { Meta, StoryObj } from '@storybook/react'
import { ButtonV2 } from '@/components/ui/button-v2'
import { Search, ChevronRight, Download, Heart, AlertTriangle, Check } from 'lucide-react'

const meta: Meta<typeof ButtonV2> = {
  title: 'Design System v2/Button',
  component: ButtonV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'success', 'warning'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'icon'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Base story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
}

// All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonV2 variant="primary">Primary</ButtonV2>
      <ButtonV2 variant="secondary">Secondary</ButtonV2>
      <ButtonV2 variant="ghost">Ghost</ButtonV2>
      <ButtonV2 variant="destructive">Destructive</ButtonV2>
      <ButtonV2 variant="success">Success</ButtonV2>
      <ButtonV2 variant="warning">Warning</ButtonV2>
    </div>
  ),
}

// All sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ButtonV2 size="sm">Small</ButtonV2>
      <ButtonV2 size="md">Medium</ButtonV2>
      <ButtonV2 size="lg">Large</ButtonV2>
      <ButtonV2 size="xl">Extra Large</ButtonV2>
      <ButtonV2 size="icon">
        <Heart className="h-5 w-5" />
      </ButtonV2>
    </div>
  ),
}

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <ButtonV2 leftIcon={<Search className="h-4 w-4" />}>
          Search
        </ButtonV2>
        <ButtonV2 rightIcon={<ChevronRight className="h-4 w-4" />}>
          Continue
        </ButtonV2>
        <ButtonV2 
          leftIcon={<Download className="h-4 w-4" />} 
          rightIcon={<span className="text-xs font-normal">PDF</span>}
        >
          Download Report
        </ButtonV2>
      </div>
    </div>
  ),
}

// States
export const States: Story = {
  render: () => (
    <div className="flex gap-4">
      <ButtonV2>Normal</ButtonV2>
      <ButtonV2 loading>Loading</ButtonV2>
      <ButtonV2 disabled>Disabled</ButtonV2>
    </div>
  ),
}

// Real world examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Hero CTAs</h3>
        <div className="flex gap-4">
          <ButtonV2 variant="primary" size="lg">
            Portal do Cidadão
          </ButtonV2>
          <ButtonV2 variant="secondary" size="lg">
            Conhecer a Plataforma
          </ButtonV2>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Form Actions</h3>
        <div className="flex gap-4">
          <ButtonV2 variant="primary">
            Salvar Alterações
          </ButtonV2>
          <ButtonV2 variant="ghost">
            Cancelar
          </ButtonV2>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Status Actions</h3>
        <div className="flex gap-4">
          <ButtonV2 variant="success" leftIcon={<Check className="h-4 w-4" />}>
            Aprovado
          </ButtonV2>
          <ButtonV2 variant="warning" leftIcon={<AlertTriangle className="h-4 w-4" />}>
            Requer Atenção
          </ButtonV2>
          <ButtonV2 variant="destructive">
            Deletar
          </ButtonV2>
        </div>
      </div>
    </div>
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
    <div className="flex flex-wrap gap-4">
      <ButtonV2 variant="primary">Primary</ButtonV2>
      <ButtonV2 variant="secondary">Secondary</ButtonV2>
      <ButtonV2 variant="ghost">Ghost</ButtonV2>
    </div>
  ),
}

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Click me!',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
}