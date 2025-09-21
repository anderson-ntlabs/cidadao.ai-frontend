'use client'

import { NavigationV2Demo } from '@/components/navigation-v2-demo'

export default function TestNavigationPage() {
  // Force new design for this test page
  if (typeof window !== 'undefined') {
    process.env.NEXT_PUBLIC_USE_NEW_DESIGN = 'true'
  }

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