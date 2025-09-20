'use client'

import { useState, useEffect } from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
    >
      {children}
    </a>
  )
}

export function SkipLinks() {
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <div className="skip-links">
      <SkipLink href="#main-content">Pular para o conteúdo principal</SkipLink>
      <SkipLink href="#main-navigation">Pular para a navegação</SkipLink>
      {currentPath.includes('dashboard') && (
        <SkipLink href="#dashboard-metrics">Pular para métricas</SkipLink>
      )}
      {currentPath.includes('chat') && (
        <SkipLink href="#chat-messages">Pular para mensagens</SkipLink>
      )}
      <SkipLink href="#footer">Pular para o rodapé</SkipLink>
    </div>
  )
}