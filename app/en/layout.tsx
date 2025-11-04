import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cidadão.AI',
  description:
    'Multi-agent artificial intelligence system to democratize access to public data and strengthen Brazilian government transparency.',
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
    // Allow zoom for accessibility (WCAG 2.1 Level AA - 1.4.4 Resize Text)
    // maximumScale: 5 allows users to zoom up to 500% without restrictions
    maximumScale: 5,
    viewportFit: 'cover', // Support for iPhone notch and safe areas
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
import { WebVitalsProvider } from '@/components/web-vitals-provider'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { LiveAnnouncerProvider } from '@/components/a11y'
import { OfflineBanner } from '@/components/mobile'

export default function ENLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />

        {/* Resource Hints - Performance Optimization */}
        {/* Preconnect to critical origins */}
        <link
          rel="preconnect"
          href="https://cidadao-api-production.up.railway.app"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://pbsiyuattnwgohvkkkks.supabase.co"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://app.posthog.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://o4510132364574720.ingest.us.sentry.io" />

        {/* Preload critical assets */}
        <link rel="preload" href="/operarios.png" as="image" type="image/png" />
        <link rel="preload" href="/agents/abaporu.png" as="image" type="image/png" />
      </head>
      <body className="min-h-screen font-sans">
        <WebVitalsProvider>
          <LiveAnnouncerProvider>
            <Providers>
              <AnalyticsProvider>
                <SentryInit />
                {/* Fixed background layer with image */}
                <div
                  className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
                  style={{
                    backgroundImage: 'url(/operarios.png)',
                  }}
                />

                {/* Semi-transparent overlay */}
                <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-[5] pointer-events-none" />

                {/* Main content */}
                <div className="relative z-20 min-h-screen flex flex-col">
                  <SkipLinks />
                  <OfflineBanner />
                  <PTLayoutWrapper locale="en">{children}</PTLayoutWrapper>
                  <CookieConsent locale="en" />
                  <ToastProvider />
                </div>
              </AnalyticsProvider>
            </Providers>
          </LiveAnnouncerProvider>
        </WebVitalsProvider>
      </body>
    </html>
  )
}
