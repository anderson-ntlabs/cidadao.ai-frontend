import { AuthLayout } from '@/components/auth-layout'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <AuthLayout locale="pt">
        {children}
      </AuthLayout>
    </div>
  )
}