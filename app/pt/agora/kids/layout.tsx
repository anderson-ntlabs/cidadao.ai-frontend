/**
 * Kids Area Layout
 *
 * Layout for the Kids mode area in Ágora Academy.
 * Applies Kids theme and simplified navigation.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { ReactNode } from 'react'
import { KidsHeader, KidsThemeProvider } from '@/components/kids'

interface KidsLayoutProps {
  children: ReactNode
}

export default function KidsLayout({ children }: KidsLayoutProps) {
  return (
    <KidsThemeProvider forceKidsTheme>
      <div className="min-h-screen bg-background">
        <KidsHeader lang="pt" />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </KidsThemeProvider>
  )
}
