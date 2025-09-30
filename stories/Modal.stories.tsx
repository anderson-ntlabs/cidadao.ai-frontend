import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

/**
 * Modal component for displaying overlays, dialogs, and popup content.
 * Features backdrop blur, animations, and multiple size variants.
 */
const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal component with animations and backdrop blur',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
    title: {
      control: 'text',
      description: 'Modal header title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size variant',
    },
    closeOnBackdrop: {
      control: 'boolean',
      description: 'Close modal when clicking backdrop',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic modal example
 */
export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Basic Modal"
        >
          <p>This is a basic modal with default settings.</p>
          <p>Click the X button or press ESC to close.</p>
        </Modal>
      </>
    )
  },
}

/**
 * Different modal sizes
 */
export const Sizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null)
    
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpenModal('sm')}>Small</Button>
          <Button onClick={() => setOpenModal('md')}>Medium</Button>
          <Button onClick={() => setOpenModal('lg')}>Large</Button>
          <Button onClick={() => setOpenModal('xl')}>Extra Large</Button>
          <Button onClick={() => setOpenModal('full')}>Full Screen</Button>
        </div>
        
        <Modal
          isOpen={openModal === 'sm'}
          onClose={() => setOpenModal(null)}
          title="Small Modal"
          size="sm"
        >
          <p>This is a small modal, perfect for confirmations.</p>
        </Modal>
        
        <Modal
          isOpen={openModal === 'md'}
          onClose={() => setOpenModal(null)}
          title="Medium Modal"
          size="md"
        >
          <p>This is a medium modal, the default size.</p>
        </Modal>
        
        <Modal
          isOpen={openModal === 'lg'}
          onClose={() => setOpenModal(null)}
          title="Large Modal"
          size="lg"
        >
          <p>This is a large modal with more content space.</p>
        </Modal>
        
        <Modal
          isOpen={openModal === 'xl'}
          onClose={() => setOpenModal(null)}
          title="Extra Large Modal"
          size="xl"
        >
          <p>This is an extra large modal for complex content.</p>
        </Modal>
        
        <Modal
          isOpen={openModal === 'full'}
          onClose={() => setOpenModal(null)}
          title="Full Screen Modal"
          size="full"
        >
          <p>This modal takes up the entire screen.</p>
        </Modal>
      </>
    )
  },
}

/**
 * Modal with form content
 */
export const WithForm: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Open Form Modal
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Start New Investigation"
        >
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Investigation Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Enter investigation title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Describe what you want to investigate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Agent
              </label>
              <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary">
                <option>Zumbi dos Palmares - Anomaly Detection</option>
                <option>Anita Garibaldi - Pattern Analysis</option>
                <option>Tiradentes - Report Generation</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Start Investigation
              </Button>
            </div>
          </form>
        </Modal>
      </>
    )
  },
}

/**
 * Confirmation modal
 */
export const Confirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Investigation
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Are you sure you want to delete this investigation?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This action cannot be undone. All data will be permanently removed.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setIsOpen(false)}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Information modal with rich content
 */
export const RichContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          View Investigation Details
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Investigation Results"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Investigation Complete</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Anomalies Detected
                </h4>
                <p className="text-2xl font-bold mt-1">47</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Confidence Score
                </h4>
                <p className="text-2xl font-bold mt-1">94.5%</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Key Findings</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Multiple contracts awarded to the same vendor without competitive bidding
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Significant price variations for similar services across departments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Contract values exceeding budget allocations by 35%
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary">Export Report</Button>
                <Button variant="primary">View Full Analysis</Button>
              </div>
            </div>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Modal with custom close button disabled
 */
export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Open Modal (No X Button)
        </Button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Processing Investigation"
          closeOnBackdrop={false}
          showCloseButton={false}
        >
          <div className="space-y-4">
            <p>This modal cannot be closed by clicking outside or with the X button.</p>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span>Processing data...</span>
            </div>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Cancel Operation
            </Button>
          </div>
        </Modal>
      </>
    )
  },
}

/**
 * Stacked modals example
 */
export const StackedModals: Story = {
  render: () => {
    const [firstOpen, setFirstOpen] = useState(false)
    const [secondOpen, setSecondOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setFirstOpen(true)}>
          Open First Modal
        </Button>
        
        <Modal
          isOpen={firstOpen}
          onClose={() => setFirstOpen(false)}
          title="First Modal"
        >
          <p>This is the first modal. You can open another modal on top of this one.</p>
          <Button onClick={() => setSecondOpen(true)} className="mt-4">
            Open Second Modal
          </Button>
        </Modal>
        
        <Modal
          isOpen={secondOpen}
          onClose={() => setSecondOpen(false)}
          title="Second Modal"
          size="sm"
        >
          <p>This modal is stacked on top of the first one.</p>
          <p>Close this to go back to the first modal.</p>
        </Modal>
      </>
    )
  },
}