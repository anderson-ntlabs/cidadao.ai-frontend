import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cidadão.AI - Transparência para Todos',
  description: 'Plataforma de inteligência artificial para transparência e controle social do governo brasileiro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}