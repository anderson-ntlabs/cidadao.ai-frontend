import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'
import { Button } from '../button'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'ghost'],
      description: 'The visual style variant of the card'
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'default', 'lg', 'xl'],
      description: 'The padding size of the card'
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the card content. You can put any content here including forms, 
          lists, images, or other components.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="mr-2">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard card with shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">This is the default card variant.</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>Enhanced shadow on hover</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Hover to see the elevation effect.</p>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined Card</CardTitle>
          <CardDescription>Stronger border emphasis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">This card has a more prominent border.</p>
        </CardContent>
      </Card>

      <Card variant="ghost">
        <CardHeader>
          <CardTitle>Ghost Card</CardTitle>
          <CardDescription>No border or shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Minimal styling for subtle content.</p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const PaddingSizes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Card padding="sm">
        <p>Small padding</p>
      </Card>
      <Card padding="default">
        <p>Default padding</p>
      </Card>
      <Card padding="lg">
        <p>Large padding</p>
      </Card>
      <Card padding="xl">
        <p>Extra large padding</p>
      </Card>
    </div>
  ),
}

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-6">
        <p>Simple card with just content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
}

export const InteractiveCard: Story = {
  render: () => (
    <Card variant="elevated" className="w-96 cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>Click anywhere on this card</CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">New</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This entire card is clickable and shows elevation on hover.
        </p>
      </CardContent>
    </Card>
  ),
}