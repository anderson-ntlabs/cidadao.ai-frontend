import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cidadão.AI - Transparência Pública com Inteligência Artificial',
  description:
    '17 agentes de IA monitorando gastos públicos 24/7. Fiscalize o governo brasileiro com inteligência artificial de forma gratuita.',
  keywords:
    'transparência pública, governo brasileiro, inteligência artificial, fiscalização, dados públicos, controle social, portal transparência',
  authors: [{ name: 'Anderson Henrique da Silva' }],
  creator: 'Cidadão.AI',
  publisher: 'Cidadão.AI',
  openGraph: {
    title: 'Cidadão.AI - Transparência Pública com IA',
    description: '17 agentes de IA monitorando gastos públicos 24/7 para proteger seus direitos',
    url: 'https://cidadao-ai-frontend.vercel.app/pt',
    siteName: 'Cidadão.AI',
    images: [
      {
        url: '/forum-icon.png',
        width: 512,
        height: 512,
        alt: 'Cidadão.AI Logo',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cidadão.AI - Transparência Pública com IA',
    description: '17 agentes de IA monitorando gastos públicos 24/7',
    images: ['/forum-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}
