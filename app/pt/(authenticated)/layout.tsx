import { AuthLayout } from '@/components/auth-layout'
import { AuthLayoutV2 } from '@/components/layouts/auth-layout-v2'

// Use the new design system if feature flag is enabled
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (useNewDesign) {
    return (
      <AuthLayoutV2 locale="pt" showMobileNav={true}>
        {children}
      </AuthLayoutV2>
    )
  }

  return (
    <AuthLayout locale="pt">
      {children}
    </AuthLayout>
  )
}