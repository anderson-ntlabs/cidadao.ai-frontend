/**
 * Hooks Barrel Export
 *
 * Central export point for all custom React hooks in the Cidadão.AI platform.
 * Includes accessibility hooks, state management, utilities, and more.
 */

// ===== Accessibility Hooks =====

// Keyboard Shortcuts
export {
  useKeyboardShortcut,
  useKeyboardShortcuts,
  useCommonShortcuts,
  formatShortcut,
  COMMON_SHORTCUTS
} from './use-keyboard-shortcuts'
export type { KeyboardShortcut } from './use-keyboard-shortcuts'

// Focus Management
export {
  useFocusTrap,
  useControlledFocusTrap
} from './use-focus-trap'
export type { FocusTrapOptions } from './use-focus-trap'

export {
  useFocusReturn,
  useControlledFocusReturn,
  useFocusManagement
} from './use-focus-return'
export type { FocusReturnOptions } from './use-focus-return'

// ===== UI/UX Hooks =====
export { useToast } from './use-toast'
export { useTypingEffect } from './use-typing-effect'
export { useTour } from './use-tour'
export { useOnboarding } from './use-onboarding'
export { useContrastCheck } from './use-contrast-check'

// ===== Data & State Hooks =====
export { useAuth } from './use-auth'
export { useChat } from './use-chat'
export { useChat as useChatHook, useAgentStatus, useSuggestedActions } from './use-chat-store'
export { useInvestigations } from './use-investigations'
export { useBackendInvestigations } from './use-backend-investigations'
export { useInvestigationNotifications } from './use-investigation-notifications'
export { useSettingsStore } from './use-settings-store'

// ===== Utility Hooks =====
export { useExport } from './use-export'
export { useSanitizer } from './use-sanitizer'
export { useLogger } from './use-logger'
export { useRoutePreload } from './use-route-preload'
