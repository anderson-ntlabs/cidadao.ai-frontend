import { AuthLayout } from '@/components/auth-layout'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout locale="pt">
      {children}
    </AuthLayout>
  )
}