import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toast, Toaster } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '@/store/notification-store'

/**
 * Toast component for displaying temporary notifications.
 * Supports multiple variants, auto-dismiss, and actions.
 */
const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A notification toast component with animations and auto-dismiss functionality',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <div className="min-h-[400px] w-full max-w-4xl p-8">
          <Story />
        </div>
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Toast variants showcase
 */
export const Variants: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => addNotification({
            type: 'success',
            title: 'Success!',
            message: 'Investigation completed successfully.',
          })}
        >
          Success Toast
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to connect to the server.',
          })}
        >
          Error Toast
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'warning',
            title: 'Warning',
            message: 'Your session will expire in 5 minutes.',
          })}
        >
          Warning Toast
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'info',
            title: 'Information',
            message: 'New investigation data is available.',
          })}
        >
          Info Toast
        </Button>
      </div>
    )
  },
}

/**
 * Toast with actions
 */
export const WithActions: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    return (
      <div className="space-y-2">
        <Button
          onClick={() => addNotification({
            type: 'info',
            title: 'New Update Available',
            message: 'A new version of the app is available.',
            action: {
              label: 'Update Now',
              onClick: () => console.log('Update clicked'),
            },
          })}
        >
          Toast with Action
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'warning',
            title: 'Unsaved Changes',
            message: 'You have unsaved changes that will be lost.',
            action: {
              label: 'Save',
              onClick: () => console.log('Save clicked'),
            },
          })}
        >
          Warning with Save
        </Button>
      </div>
    )
  },
}

/**
 * Long content toast
 */
export const LongContent: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    return (
      <Button
        onClick={() => addNotification({
          type: 'info',
          title: 'Investigation Report Generated',
          message: 'Your comprehensive investigation report has been generated successfully. It includes analysis of 1,247 contracts, identified 23 anomalies, and provides detailed recommendations for further action.',
        })}
      >
        Long Content Toast
      </Button>
    )
  },
}

/**
 * Custom duration
 */
export const CustomDuration: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => addNotification({
            type: 'info',
            title: 'Quick Toast',
            message: 'This will disappear in 2 seconds.',
            duration: 2000,
          })}
        >
          2 Second Toast
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'warning',
            title: 'Important Notice',
            message: 'This will stay for 10 seconds.',
            duration: 10000,
          })}
        >
          10 Second Toast
        </Button>
        
        <Button
          onClick={() => addNotification({
            type: 'error',
            title: 'Persistent Error',
            message: 'This will not auto-dismiss.',
            duration: Infinity,
          })}
        >
          Persistent Toast
        </Button>
      </div>
    )
  },
}

/**
 * Multiple toasts
 */
export const MultipleToasts: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    const showMultipleToasts = () => {
      addNotification({
        type: 'success',
        title: 'Step 1 Complete',
        message: 'Data collection finished.',
      })
      
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Step 2 In Progress',
          message: 'Analyzing patterns...',
        })
      }, 500)
      
      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: 'Step 3 Warning',
          message: 'Some anomalies detected.',
        })
      }, 1000)
      
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Analysis Complete',
          message: 'All steps finished successfully!',
        })
      }, 1500)
    }
    
    return (
      <Button onClick={showMultipleToasts}>
        Show Multiple Toasts
      </Button>
    )
  },
}

/**
 * Investigation workflow toasts
 */
export const InvestigationWorkflow: Story = {
  name: 'Investigation Workflow',
  render: () => {
    const { addNotification } = useNotificationStore()
    
    const startInvestigation = () => {
      // Initial toast
      addNotification({
        type: 'info',
        title: 'Investigation Started',
        message: 'Zumbi dos Palmares is analyzing contracts...',
        duration: 3000,
      })
      
      // Progress update
      setTimeout(() => {
        addNotification({
          type: 'info',
          title: 'Analysis Progress',
          message: '500 contracts analyzed, 12 anomalies found.',
          duration: 3000,
        })
      }, 3000)
      
      // Warning
      setTimeout(() => {
        addNotification({
          type: 'warning',
          title: 'Potential Issue Found',
          message: 'Suspicious pattern detected in supplier contracts.',
          action: {
            label: 'View Details',
            onClick: () => console.log('View details'),
          },
          duration: 5000,
        })
      }, 6000)
      
      // Completion
      setTimeout(() => {
        addNotification({
          type: 'success',
          title: 'Investigation Complete',
          message: 'Analysis finished. Report ready for download.',
          action: {
            label: 'Download Report',
            onClick: () => console.log('Download report'),
          },
          duration: 10000,
        })
      }, 9000)
    }
    
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This demonstrates a typical investigation workflow with progressive notifications
        </p>
        <Button onClick={startInvestigation} variant="primary">
          Start Investigation Demo
        </Button>
      </div>
    )
  },
}

/**
 * Custom styled toasts
 */
export const CustomStyling: Story = {
  render: () => {
    const { addNotification } = useNotificationStore()
    
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            const id = Date.now().toString()
            addNotification({
              id,
              type: 'success',
              title: 'Achievement Unlocked! 🏆',
              message: 'You completed your first investigation.',
              className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
              duration: 5000,
            })
          }}
        >
          Gradient Toast
        </Button>
        
        <Button
          onClick={() => {
            const id = Date.now().toString()
            addNotification({
              id,
              type: 'info',
              title: 'AI Agent Active',
              message: 'Abaporu is coordinating the investigation.',
              className: 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950',
              duration: 5000,
            })
          }}
        >
          Bordered Toast
        </Button>
      </div>
    )
  },
}

/**
 * Toast positions (simulated)
 */
export const Positions: Story = {
  render: () => {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Toast position is controlled by the Toaster component placement.
          By default, toasts appear in the bottom-right corner.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 border-2 border-dashed rounded-lg">
            <p className="text-xs font-medium">Top Left</p>
            <code className="text-xs">top-4 left-4</code>
          </div>
          <div className="p-4 border-2 border-dashed rounded-lg">
            <p className="text-xs font-medium">Top Right</p>
            <code className="text-xs">top-4 right-4</code>
          </div>
          <div className="p-4 border-2 border-dashed rounded-lg">
            <p className="text-xs font-medium">Bottom Left</p>
            <code className="text-xs">bottom-4 left-4</code>
          </div>
          <div className="p-4 border-2 border-dashed rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-xs font-medium">Bottom Right (Default)</p>
            <code className="text-xs">bottom-4 right-4</code>
          </div>
        </div>
      </div>
    )
  },
}