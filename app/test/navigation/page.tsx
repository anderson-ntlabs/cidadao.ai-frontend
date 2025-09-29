'use client'

import { NavigationV2Demo } from '@/components/navigation-demo'

export default function TestNavigationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Design System v2 - Navigation Tests
        </h1>
        
        <NavigationV2Demo />
      </div>
    </div>
  )
}