import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'Cidadão.AI - Transparência para Todos',
  description:
    'Plataforma de inteligência artificial para transparência e controle social do governo brasileiro',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  )
}
