import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '../modal'
import { Button } from '../button'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Modal Title</ModalTitle>
              <ModalDescription>
                This is a modal description that provides context about the modal's purpose.
              </ModalDescription>
            </ModalHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Modal content goes here. You can add forms, lists, or any other content.
              </p>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [smallOpen, setSmallOpen] = useState(false)
    const [defaultOpen, setDefaultOpen] = useState(false)
    const [largeOpen, setLargeOpen] = useState(false)
    const [xlOpen, setXlOpen] = useState(false)
    
    return (
      <div className="flex gap-4">
        <Button onClick={() => setSmallOpen(true)}>Small Modal</Button>
        <Button onClick={() => setDefaultOpen(true)}>Default Modal</Button>
        <Button onClick={() => setLargeOpen(true)}>Large Modal</Button>
        <Button onClick={() => setXlOpen(true)}>XL Modal</Button>
        
        <Modal open={smallOpen} onOpenChange={setSmallOpen}>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Small Modal</ModalTitle>
            </ModalHeader>
            <div className="py-4">
              <p>This is a small modal.</p>
            </div>
          </ModalContent>
        </Modal>
        
        <Modal open={defaultOpen} onOpenChange={setDefaultOpen}>
          <ModalContent size="default">
            <ModalHeader>
              <ModalTitle>Default Modal</ModalTitle>
            </ModalHeader>
            <div className="py-4">
              <p>This is a default sized modal.</p>
            </div>
          </ModalContent>
        </Modal>
        
        <Modal open={largeOpen} onOpenChange={setLargeOpen}>
          <ModalContent size="lg">
            <ModalHeader>
              <ModalTitle>Large Modal</ModalTitle>
            </ModalHeader>
            <div className="py-4">
              <p>This is a large modal with more space for content.</p>
            </div>
          </ModalContent>
        </Modal>
        
        <Modal open={xlOpen} onOpenChange={setXlOpen}>
          <ModalContent size="xl">
            <ModalHeader>
              <ModalTitle>Extra Large Modal</ModalTitle>
            </ModalHeader>
            <div className="py-4">
              <p>This is an extra large modal for complex content.</p>
            </div>
          </ModalContent>
        </Modal>
      </div>
    )
  },
}

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent showCloseButton={false}>
            <ModalHeader>
              <ModalTitle>No Close Button</ModalTitle>
              <ModalDescription>
                This modal can only be closed by the action buttons.
              </ModalDescription>
            </ModalHeader>
            <div className="py-4">
              <p className="text-sm">
                Users must use the action buttons to close this modal.
              </p>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>
                OK
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  },
}