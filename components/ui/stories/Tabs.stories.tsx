import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Your dashboard overview and summary statistics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the overview tab content. You can add charts, metrics, or any other relevant information here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Detailed analytics and insights about your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analytics content would go here. Charts, graphs, and data visualizations.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and view detailed reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Report generation tools and historical reports would be displayed here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings and history would be shown here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

export const SimpleTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-4">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-4">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-4">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
}

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="home" className="w-[700px]">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="help">Help</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
      {['home', 'profile', 'messages', 'settings', 'help', 'about'].map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium capitalize">{tab} Content</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This is the content for the {tab} tab.
            </p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  ),
}