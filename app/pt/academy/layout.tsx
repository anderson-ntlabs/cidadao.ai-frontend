'use client'

import { AcademyDemoProvider } from '@/hooks/use-academy-demo'

/**
 * Academy Layout
 *
 * Provides the demo context for all Academy pages.
 * Individual pages handle their own header/sidebar display.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-06
 */
export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AcademyDemoProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {children}
      </div>
    </AcademyDemoProvider>
  )
}
