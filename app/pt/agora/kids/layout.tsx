/**
 * Kids Area Layout
 *
 * Layout for the Kids mode area in Ágora Academy.
 * Uses KidsHeader with exit option and Kids theme.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Added KidsHeader with exit functionality
 */

import { ReactNode } from 'react'
import { KidsThemeProvider, KidsHeader } from '@/components/kids'

interface KidsLayoutProps {
  children: ReactNode
}

export default function KidsLayout({ children }: KidsLayoutProps) {
  return (
    <KidsThemeProvider forceKidsTheme>
      <KidsHeader />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </KidsThemeProvider>
  )
}
