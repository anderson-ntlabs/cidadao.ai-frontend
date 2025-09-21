'use client'

import { BreadcrumbsV2Demo } from '@/components/breadcrumbs-v2-demo'

export default function TestBreadcrumbsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Design System v2 - Breadcrumbs Tests
        </h1>
        
        <BreadcrumbsV2Demo />
      </div>
    </div>
  )
}