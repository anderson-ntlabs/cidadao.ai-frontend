'use client'

import { AuthProvider } from '@/hooks/use-supabase-auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}