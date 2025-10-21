import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import '../../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cidadão.AI',
  description: 'Sistema multi-agente de inteligência artificial para democratizar o acesso aos dados públicos e fortalecer a transparência governamental brasileira.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cidadão.AI',
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#10b981',
  }
}

import { CookieConsent } from '@/components/cookie-consent'
import { ThemeScript } from '../theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { SkipLinks } from '@/components/skip-link'
import { Providers } from '@/components/providers'
import { PTLayoutWrapper } from '@/components/pt-layout-wrapper'
import { SentryInit } from '@/components/sentry-init'
import { VLibrasWidget, AccessibilityPanel } from '@/components/a11y'

export default function PTLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen font-sans">
        <Providers>
          <SentryInit />
          {/* Camada de fundo fixo com a imagem */}
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: 'url(/operarios.png)',
            }}
          />

          {/* Overlay semi-transparente */}
          <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-[5] pointer-events-none" />

          {/* Conteúdo principal */}
          <div className="relative z-20 min-h-screen flex flex-col">
            <SkipLinks />
            <PTLayoutWrapper locale="pt">
              {children}
            </PTLayoutWrapper>
            <CookieConsent locale="pt" />
            <ToastProvider />

            {/* Accessibility Features */}
            <VLibrasWidget locale="pt" forceOnload />
            <AccessibilityPanel locale="pt" />
          </div>
        </Providers>
      </body>
    </html>
  )
}