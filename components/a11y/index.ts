/**
 * Accessibility (A11y) Components
 *
 * This module exports all accessibility-related components for the Cidadão.AI platform.
 * These components help ensure WCAG 2.1 Level AA compliance and provide inclusive
 * experiences for all users, including those with disabilities.
 *
 * Key Features:
 * - Screen reader support (ARIA live regions)
 * - Keyboard navigation (skip links)
 * - Visual accessibility (high contrast, font size)
 * - Sign language support (VLibras for LIBRAS)
 */

// Screen Reader Support
export { Announcer, useAnnouncer } from './announcer'
export {
  LiveAnnouncerProvider,
  useLiveAnnouncer,
  useAnnouncementHelpers
} from './live-announcer'
export type { Announcement, AnnouncementPriority } from './live-announcer'

// Visual Accessibility
export { HighContrastToggle } from './high-contrast-toggle'
export { FontSizeControl, useFontSize } from './font-size-control'
export type { FontSize } from './font-size-control'

// Sign Language Support (Brazilian LIBRAS)
export { VLibrasWidget, useVLibras } from './vlibras-widget'
export { VLibrasToggle } from './vlibras-toggle'

// Unified Accessibility Panel
export { AccessibilityPanel } from './accessibility-panel'

// Keyboard Navigation
export { SkipLinks, useSkipTo } from './skip-links'
export type { SkipLink } from './skip-links'

// Form Accessibility
export { FormField } from './form-field'
