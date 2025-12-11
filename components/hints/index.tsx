/**
 * Hints Components - Lazy Loaded
 *
 * Exports hint components with dynamic imports to reduce initial bundle.
 * framer-motion (~50KB) is only loaded when hints are displayed.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11
 */

'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Lazy load adaptive hints provider
export const AdaptiveHintsProvider = dynamic(
  () => import('./adaptive-hints-provider').then((mod) => mod.AdaptiveHintsProvider),
  {
    ssr: false,
    loading: () => null,
  }
)

// Re-export hook (hooks can't be dynamically imported)
export { useAdaptiveHints, useReportUXIssue } from './adaptive-hints-provider'
