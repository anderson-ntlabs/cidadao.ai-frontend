/**
 * Finding Notice
 *
 * Small, consistent notice rendered next to AI-generated findings,
 * investigation results and agent answers. It reminds readers that an
 * automated finding is a signal to verify, not an accusation.
 */

import Link from 'next/link'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FindingNoticeProps {
  locale?: 'pt' | 'en'
  className?: string
}

const COPY = {
  pt: {
    label: 'Um achado não é uma acusação',
    hint: 'Resultado gerado por IA: confira a fonte oficial antes de tirar conclusões.',
    link: 'Saiba mais',
    href: '/pt/responsible-ai',
  },
  en: {
    label: 'A finding is not an accusation',
    hint: 'AI-generated result: check the official source before drawing conclusions.',
    link: 'Learn more',
    href: '/en/responsible-ai',
  },
} as const

export function FindingNotice({ locale = 'pt', className }: FindingNoticeProps): JSX.Element {
  const copy = COPY[locale]

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 text-xs', className)}
      data-testid="finding-notice"
    >
      <Badge variant="warning" size="sm" title={copy.hint}>
        <Info className="w-3 h-3 mr-1" aria-hidden="true" />
        {copy.label}
      </Badge>
      <span className="text-gray-500 dark:text-gray-400">
        {copy.hint}{' '}
        <Link href={copy.href} className="underline hover:text-gray-700 dark:hover:text-gray-200">
          {copy.link}
        </Link>
      </span>
    </div>
  )
}
