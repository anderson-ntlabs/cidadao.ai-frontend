/**
 * Agora Components Barrel Export
 *
 * Centralized exports for all Agora components.
 * Heavy modals are lazy loaded to reduce initial bundle size.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 * Updated: 2025-12-11 - Added lazy loading for heavy modals
 */

import dynamic from 'next/dynamic'

// Layout components
export { AgoraHeader } from './agora-header'
export { AgoraSidebar } from './agora-sidebar'

// Chat components
export { AgoraAgentSelector } from './agora-agent-selector'

// Card components
export { StatCard } from './stat-card'
export { AgentCard } from './agent-card'
export { QuickActionCard } from './quick-action-card'

// Feed components
export { ActivityFeed } from './activity-feed'
export { BadgeShowcase } from './badge-showcase'

// Modal components - Lazy loaded for better initial bundle
export const CertificateModal = dynamic(
  () => import('./certificate-modal').then((mod) => mod.CertificateModal),
  {
    ssr: false,
    loading: () => null,
  }
)

export const InternshipContractModal = dynamic(
  () => import('./internship-contract-modal').then((mod) => mod.InternshipContractModal),
  { ssr: false, loading: () => null }
)

export const LgpdConsentModal = dynamic(
  () => import('./lgpd-consent-modal').then((mod) => mod.LgpdConsentModal),
  {
    ssr: false,
    loading: () => null,
  }
)

export const TimelineModal = dynamic(
  () => import('./timeline-modal').then((mod) => mod.TimelineModal),
  {
    ssr: false,
    loading: () => null,
  }
)

export const CelebrationModal = dynamic(
  () => import('./celebration-modal').then((mod) => mod.CelebrationModal),
  {
    ssr: false,
    loading: () => null,
  }
)

// Non-lazy exports
export { BackgroundSelector } from './background-selector'

// Timeline components
export { TimelineCard } from './timeline-card'

// Gamification components
export { GamificationCard } from './gamification-card'
export { useCelebration } from './celebration-modal'
export type { CelebrationType } from './celebration-modal'

// Session management components
export { LogoutModal } from './logout-modal'
export { SessionManager } from './session-manager'
