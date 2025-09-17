import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cidadão.AI — Hub de Documentação',
  description: 'Sistema multi-agente de inteligência artificial para democratizar o acesso aos dados públicos e fortalecer a transparência governamental brasileira.',
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

export default function PTLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header locale="pt" />
        <main className="pt-16 flex-1">
          {children}
        </main>
        <Footer locale="pt" />
        <CookieConsent locale="pt" />
      </body>
    </html>
  )
}