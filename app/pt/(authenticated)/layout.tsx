import { AuthLayout } from '@/components/auth-layout'
import { AuthLayoutV2 } from '@/components/auth-layout'
import { AdaptiveHintsProvider } from '@/components/hints/adaptive-hints-provider'

// Use the new design system if feature flag is enabled
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (useNewDesign) {
    return (
      <AdaptiveHintsProvider>
        <AuthLayoutV2 locale="pt">
          {children}
        </AuthLayoutV2>
      </AdaptiveHintsProvider>
    )
  }

  return (
    <AdaptiveHintsProvider>
      <AuthLayout locale="pt">
        {children}
      </AuthLayout>
    </AdaptiveHintsProvider>
  )
}