import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

/**
 * Input component for form fields with various states and configurations.
 * Supports icons, validation states, and different input types.
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with support for icons, validation, and various types',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
    error: {
      control: 'boolean',
      description: 'Show error state',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default input field
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

/**
 * Different input types
 */
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email address" />
      <Input type="password" placeholder="Password" />
      <Input type="search" placeholder="Search..." />
      <Input type="number" placeholder="Number" />
      <Input type="tel" placeholder="Phone number" />
      <Input type="url" placeholder="Website URL" />
    </div>
  ),
}

/**
 * Input with labels and helper text
 */
export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <Input id="name" placeholder="John Doe" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter your full name as it appears on official documents
        </p>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input id="email" type="email" placeholder="john@example.com" required />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          We'll never share your email with anyone
        </p>
      </div>
    </div>
  ),
}

/**
 * Input with icons
 */
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input className="pl-10" placeholder="Search investigations..." />
      </div>
      
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input className="pl-10" type="email" placeholder="Email address" />
      </div>
      
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input className="pl-10" placeholder="Username" />
      </div>
    </div>
  ),
}

/**
 * Password input with toggle visibility
 */
export const PasswordWithToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false)
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10 pr-10"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    )
  },
}

/**
 * Validation states
 */
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Default State
        </label>
        <Input placeholder="Normal input" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-green-600">
          Success State
        </label>
        <Input 
          className="border-green-500 focus:ring-green-500" 
          placeholder="Valid input"
          defaultValue="Valid data"
        />
        <p className="text-sm text-green-600 mt-1">✓ Looks good!</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-red-600">
          Error State
        </label>
        <div className="relative">
          <Input 
            className="border-red-500 focus:ring-red-500 pr-10" 
            placeholder="Invalid input"
            defaultValue="Invalid data"
            error
          />
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
        </div>
        <p className="text-sm text-red-600 mt-1">This field is required</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Disabled State
        </label>
        <Input 
          placeholder="Disabled input" 
          disabled
          defaultValue="Cannot edit"
        />
      </div>
    </div>
  ),
}

/**
 * Search input with live results
 */
export const LiveSearch: Story = {
  render: () => {
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    
    const mockResults = [
      'Contracts investigation 2024',
      'Healthcare emergency contracts',
      'Public works anomalies',
      'Supplier concentration analysis',
      'Budget execution report',
    ].filter(item => 
      item.toLowerCase().includes(search.toLowerCase())
    )
    
    const handleSearch = (value: string) => {
      setSearch(value)
      setLoading(true)
      setTimeout(() => setLoading(false), 300)
    }
    
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search investigations..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
        
        {search && !loading && (
          <div className="border rounded-lg p-2 space-y-1">
            {mockResults.length > 0 ? (
              mockResults.map((result, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-sm"
                >
                  {result}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
}

/**
 * Input group with addons
 */
export const InputGroup: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l-md">
          https://
        </span>
        <Input 
          className="rounded-l-none" 
          placeholder="example.com"
        />
      </div>
      
      <div className="flex">
        <Input 
          className="rounded-r-none" 
          placeholder="Search query"
        />
        <button className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors">
          Search
        </button>
      </div>
      
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm bg-gray-100 dark:bg-gray-800 border border-r-0 rounded-l-md">
          R$
        </span>
        <Input 
          className="rounded-none text-right" 
          type="number"
          placeholder="0.00"
        />
        <span className="inline-flex items-center px-3 text-sm bg-gray-100 dark:bg-gray-800 border border-l-0 rounded-r-md">
          BRL
        </span>
      </div>
    </div>
  ),
}

/**
 * Character count example
 */
export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const maxLength = 100
    
    return (
      <div>
        <label className="block text-sm font-medium mb-1">
          Investigation Description
        </label>
        <div className="relative">
          <Input
            placeholder="Describe your investigation..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Brief description of what you want to investigate
          </p>
          <span className={`text-sm ${value.length >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    )
  },
}