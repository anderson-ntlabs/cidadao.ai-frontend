import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cidadão.AI',
  description: 'Multi-agent artificial intelligence system to democratize access to public data and strengthen Brazilian government transparency.',
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
import { Providers } from '@/components/providers'
import { PTLayoutWrapper } from '@/components/pt-layout-wrapper'
import { ToastProvider } from '@/components/toast-provider'
import { SkipLinks } from '@/components/skip-link'

export default function ENLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen font-sans">
        <Providers>
          {/* Fixed background layer with image */}
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: 'url(/operarios.png)',
            }}
          />
          
          {/* Semi-transparent overlay */}
          <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-[5]" />
          
          {/* Main content */}
          <div className="relative z-20 min-h-screen flex flex-col">
            <SkipLinks />
            <PTLayoutWrapper locale="en">
              {children}
            </PTLayoutWrapper>
            <CookieConsent locale="en" />
            <ToastProvider />
          </div>
        </Providers>
      </body>
    </html>
  )
}