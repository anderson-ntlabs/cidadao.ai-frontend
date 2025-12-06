import { AuthLayout } from '@/components/auth-layout'
import { InvestigationNotificationsProvider } from '@/components/providers/investigation-notifications-provider'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <InvestigationNotificationsProvider>
      <AuthLayout locale="pt">{children}</AuthLayout>
    </InvestigationNotificationsProvider>
  )
}
