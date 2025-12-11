/**
 * Voice Components - Lazy Loaded
 *
 * Exports voice components with dynamic imports to reduce initial bundle.
 * framer-motion (~50KB) is only loaded when voice input is used.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11
 */

'use client'

import dynamic from 'next/dynamic'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Loading placeholder for voice button
const VoiceButtonPlaceholder = () => (
  <Button size="icon" variant="secondary" disabled>
    <Mic className="h-4 w-4" />
  </Button>
)

// Lazy load voice input components
export const VoiceInputButton = dynamic(
  () => import('./voice-input-button').then((mod) => mod.VoiceInputButton),
  {
    ssr: false,
    loading: () => <VoiceButtonPlaceholder />,
  }
)

export const VoiceInputIndicator = dynamic(
  () => import('./voice-input-button').then((mod) => mod.VoiceInputIndicator),
  {
    ssr: false,
    loading: () => null,
  }
)

export const VoiceInputCard = dynamic(
  () => import('./voice-input-button').then((mod) => mod.VoiceInputCard),
  {
    ssr: false,
    loading: () => null,
  }
)
