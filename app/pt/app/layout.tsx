import { AuthLayout } from '@/components/auth-layout'
import { InvestigationNotificationsProvider } from '@/components/providers/investigation-notifications-provider'
import { VoiceShortcutsProvider } from '@/components/providers/voice-shortcuts-provider'
import { BackendStatusBanner } from '@/components/backend-status-banner'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <InvestigationNotificationsProvider>
      <VoiceShortcutsProvider>
        <AuthLayout locale="pt">
          <BackendStatusBanner />
          {children}
        </AuthLayout>
      </VoiceShortcutsProvider>
    </InvestigationNotificationsProvider>
  )
}
