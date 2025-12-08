import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cidadao-ai.vercel.app'),
  title: 'Cidadao.AI - Transparencia para Todos',
  description:
    'Plataforma de inteligencia artificial para transparencia e controle social do governo brasileiro',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Cidadao.AI',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  )
}
