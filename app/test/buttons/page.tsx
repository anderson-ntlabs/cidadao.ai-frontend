'use client'

import { ButtonV2Demo } from '@/components/ui/button-demo'

export default function TestButtonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Design System v2 - Button Tests
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card">
          <ButtonV2Demo />
        </div>
      </div>
    </div>
  )
}