'use client'

import { CardV2Demo } from '@/components/ui/card-demo'

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Design System v2 - Card Tests
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <CardV2Demo />
        </div>
      </div>
    </div>
  )
}