'use client'

import { usePathname } from 'next/navigation'

/**
 * Conditional Background Component
 *
 * Applies the operarios.png background and overlay ONLY on non-Agora routes.
 * Agora has its own background system via useAgoraBackground hook.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

export function ConditionalBackground() {
  const pathname = usePathname()

  // Agora has its own background system - don't apply main site background
  const isAgoraRoute = pathname?.includes('/agora')

  if (isAgoraRoute) {
    return null
  }

  return (
    <>
      {/* Fixed background layer with operarios image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/operarios.png)',
        }}
        aria-hidden="true"
      />

      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-[5] pointer-events-none"
        aria-hidden="true"
      />
    </>
  )
}
