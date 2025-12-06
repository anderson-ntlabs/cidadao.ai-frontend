'use client'

import { AcademyDemoProvider } from '@/hooks/use-academy-demo'

/**
 * Academy Layout - Demo Mode
 *
 * MVP: Using demo mode without real authentication
 * All data persisted in localStorage
 */
export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <AcademyDemoProvider>{children}</AcademyDemoProvider>
}
