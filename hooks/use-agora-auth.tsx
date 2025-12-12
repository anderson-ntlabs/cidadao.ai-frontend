'use client'

/**
 * @deprecated This file is deprecated. Use `use-unified-auth.tsx` instead.
 *
 * Migration guide:
 * - Replace `AgoraAuthProvider` with `UnifiedAuthProvider`
 * - Replace `useAgoraAuth()` with `useUnifiedAuth()`
 * - Import from '@/hooks/use-unified-auth'
 *
 * This file is kept for backwards compatibility and will be removed in a future release.
 *
 * @see hooks/use-unified-auth.tsx
 * @see docs/adr/ADR-002-agora-state-management.md
 */

import { UnifiedAuthProvider, useUnifiedAuth } from './use-unified-auth'
import type { AgoraUser } from '@/types/agora'

// Re-export the old type for backwards compatibility
export type { AgoraUser }

/**
 * @deprecated Use `UnifiedAuthProvider` from `use-unified-auth.tsx` instead.
 */
export const AgoraAuthProvider = UnifiedAuthProvider

/**
 * @deprecated Use `useUnifiedAuth` from `use-unified-auth.tsx` instead.
 */
export const useAgoraAuth = useUnifiedAuth
