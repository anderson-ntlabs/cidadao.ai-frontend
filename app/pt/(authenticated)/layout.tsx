import { AuthLayout } from '@/components/auth-layout'
import { AdaptiveHintsProvider } from '@/components/hints/adaptive-hints-provider'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdaptiveHintsProvider>
      <AuthLayout locale="pt">
        {children}
      </AuthLayout>
    </AdaptiveHintsProvider>
  )
}