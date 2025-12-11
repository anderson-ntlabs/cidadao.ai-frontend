/**
 * Privacy Components - Lazy Loaded
 *
 * Heavy privacy modals are loaded on demand to reduce initial bundle.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-11
 */

'use client'

import dynamic from 'next/dynamic'

// Lazy load heavy privacy modals
export const DeleteAccountModal = dynamic(
  () => import('./delete-account-modal').then((mod) => mod.DeleteAccountModal),
  {
    ssr: false,
    loading: () => null,
  }
)

export const LGPDTermsModal = dynamic(
  () => import('./lgpd-terms-modal').then((mod) => mod.LGPDTermsModal),
  {
    ssr: false,
    loading: () => null,
  }
)
