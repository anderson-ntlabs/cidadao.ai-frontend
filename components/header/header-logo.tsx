'use client'

import Link from 'next/link'
import Image from 'next/image'

interface HeaderLogoProps {
  href: string
}

export function HeaderLogo({ href }: HeaderLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3 group" aria-label="Cidadao.AI Home">
      <Image
        src="/forum-icon.png"
        alt="Greek Forum"
        width={40}
        height={40}
        className="rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110"
      />
      <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
        Cidadao.AI
      </span>
    </Link>
  )
}
