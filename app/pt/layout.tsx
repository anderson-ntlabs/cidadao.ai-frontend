import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import '../../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevent FOIT, show fallback immediately
  preload: true, // Preload font for better performance
  adjustFontFallback: true, // Adjusts fallback font to reduce CLS
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
})

export const metadata: Metadata = {
  title: 'Cidadão.AI',
  description:
    'Sistema multi-agente de inteligência artificial para democratizar o acesso aos dados públicos e fortalecer a transparência governamental brasileira.',
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
    // Users must be able to zoom up to 200% without loss of content
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
import { VLibrasLazy } from '@/components/a11y/vlibras-lazy'
import { WebVitalsProvider } from '@/components/web-vitals-provider'
import { AnalyticsProvider } from '@/components/providers/analytics-provider'
import { LiveAnnouncerProvider } from '@/components/a11y'
import { OfflineBanner } from '@/components/mobile'
import { SurveyProvider } from '@/components/survey'
import { ConditionalBackground } from '@/components/conditional-background'

export default function PTLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="pt" className={inter.variable} suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://o4510132364574720.ingest.us.sentry.io" />
        <link rel="dns-prefetch" href="https://vlibras.gov.br" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Prefetch assets for future navigation (non-blocking) */}
        <link rel="prefetch" href="/operarios.png" as="image" />
        <link rel="prefetch" href="/images/Tarsila_Antropofagia.jpg" as="image" />

        {/* Prefetch agent avatars for quick display in modals/chat */}
        <link rel="prefetch" href="/agents/optimized/abaporu-128.webp" as="image" />
        <link rel="prefetch" href="/agents/optimized/zumbi-128.webp" as="image" />
        <link rel="prefetch" href="/agents/optimized/anita-128.webp" as="image" />
      </head>
      <body className="min-h-screen font-sans overflow-x-hidden">
        <WebVitalsProvider>
          <LiveAnnouncerProvider>
            <Providers>
              <AnalyticsProvider>
                {/* Note: Sentry is automatically initialized by @sentry/nextjs via instrumentation-client.ts */}
                {/* Conditional background - not applied on Agora routes */}
                <ConditionalBackground />

                {/* Conteúdo principal */}
                <div className="relative z-20 min-h-screen flex flex-col">
                  <SkipLinks />
                  <OfflineBanner />
                  <SurveyProvider locale="pt" showFab={true} fabDelay={5000}>
                    <PTLayoutWrapper locale="pt">{children}</PTLayoutWrapper>
                  </SurveyProvider>
                  <CookieConsent locale="pt" />
                  <ToastProvider />

                  {/* VLibras - Brazilian Sign Language (Official Widget) - Lazy Loaded */}
                  <VLibrasLazy locale="pt" />
                </div>
              </AnalyticsProvider>
            </Providers>
          </LiveAnnouncerProvider>
        </WebVitalsProvider>
      </body>
    </html>
  )
}
