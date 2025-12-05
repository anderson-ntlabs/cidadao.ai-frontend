'use client'

import { AcademyAuthProvider } from '@/hooks/use-academy-auth'

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <AcademyAuthProvider>{children}</AcademyAuthProvider>
}
