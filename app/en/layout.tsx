import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cidadão.AI — Documentation Hub',
  description: 'Multi-agent artificial intelligence system to democratize access to public data and strengthen Brazilian government transparency.',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cidadão.AI',
  },
}

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CookieConsent } from '@/components/cookie-consent'
import { ThemeScript } from '../theme-script'

export default function ENLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body 
        className={`${inter.className} min-h-screen bg-fixed bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: 'url(/operarios.png)',
        }}
      >
        <div className="min-h-screen flex flex-col bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm">
          <Header locale="en" />
          <main className="pt-16 flex-1">
            {children}
          </main>
          <Footer locale="en" />
          <CookieConsent locale="en" />
        </div>
      </body>
    </html>
  )
}