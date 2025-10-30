import { AuthLayout } from '@/components/auth-layout'
import { InvestigationNotificationsProvider } from '@/components/providers/investigation-notifications-provider'
import { BackendStatusBanner } from '@/components/backend-status-banner'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InvestigationNotificationsProvider>
      <AuthLayout locale="pt">
        <BackendStatusBanner />
        {children}
      </AuthLayout>
    </InvestigationNotificationsProvider>
  )
}
