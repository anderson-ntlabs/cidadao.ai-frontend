/**
 * VLibras Widget - Lazy Loaded Version
 *
 * Loads VLibras (Brazilian Sign Language widget) dynamically to reduce initial bundle size.
 * VLibras is a ~200KB library that's not needed for initial page render.
 */

'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Dynamic import with no SSR (VLibras requires browser APIs)
const VLibrasWidget = dynamic(
  () => import('./vlibras-widget').then(mod => mod.VLibrasWidget),
  {
    ssr: false,
    loading: () => null, // No loading state needed for accessibility widget
  }
)

export function VLibrasLazy(props: ComponentProps<typeof VLibrasWidget>) {
  return <VLibrasWidget {...props} />
}
