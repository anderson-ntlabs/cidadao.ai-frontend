/**
 * Mobile Components
 *
 * Specialized components for mobile-optimized UX
 * Sprint 4 additions: ActionSheet, VirtualKeyboardSpacer, SafeAreaView, HapticButton
 */

// Sprint 1 & 2 components
export { OfflineBanner, OfflineIndicator } from './offline-banner'
export { PullToRefresh, SimplePullToRefresh } from './pull-to-refresh'
export { BottomSheet } from './bottom-sheet'
export { SwipeableCard, SwipeActions } from './swipeable-card'

// Sprint 4 components
export { ActionSheet, useActionSheet } from './action-sheet'
export type { ActionSheetAction, ActionSheetProps } from './action-sheet'

export {
  VirtualKeyboardSpacer,
  VirtualKeyboardSpacerSafe,
  useVirtualKeyboard,
} from './virtual-keyboard-spacer'
export type { VirtualKeyboardSpacerProps } from './virtual-keyboard-spacer'

export {
  SafeAreaView,
  SafeAreaTop,
  SafeAreaBottom,
  SafeAreaHorizontal,
  useSafeAreaInsets,
} from './safe-area-view'
export type { SafeAreaViewProps } from './safe-area-view'

export { HapticButton, HapticIconButton, HapticFAB } from './haptic-button'
export type { HapticButtonProps } from './haptic-button'

// Sprint 5 components - Mobile Chat & Navigation
export {
  MobileChatContainer,
  MobileChatMessageList,
  MobileChatHeader,
} from './mobile-chat-container'
export type {
  MobileChatContainerProps,
  MobileChatMessageListProps,
  MobileChatHeaderProps,
} from './mobile-chat-container'

export { MobileChatInput, MobileChatSuggestions, MobileChatActionBar } from './mobile-chat-input'
export type {
  MobileChatInputProps,
  MobileChatSuggestionsProps,
  MobileChatActionBarProps,
} from './mobile-chat-input'

export { BottomNavigation, CompactBottomNavigation } from './bottom-navigation'
export type { BottomNavigationProps, BottomNavItem } from './bottom-navigation'

export { MobileAgentSelector } from './mobile-agent-selector'
export type { MobileAgentSelectorProps } from './mobile-agent-selector'
