/**
 * Kids Area Layout
 *
 * Layout for the Kids mode area in Ágora Academy.
 * Uses parent layout header with isKidsMode flag.
 * Only applies Kids theme (colorful CSS variables).
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Simplified to reuse parent Agora layout header
 */

import { ReactNode } from 'react'
import { KidsThemeProvider } from '@/components/kids'

interface KidsLayoutProps {
  children: ReactNode
}

export default function KidsLayout({ children }: KidsLayoutProps) {
  return (
    <KidsThemeProvider forceKidsTheme>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </KidsThemeProvider>
  )
}
