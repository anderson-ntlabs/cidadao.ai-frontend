/**
 * Ágora Hooks - Barrel Export
 *
 * Exports all Ágora-related hooks from a single entry point.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

// Gamification
export {
  AgoraGamificationProvider,
  useAgoraGamification,
  getStreakMultiplier,
  GAMIFICATION,
} from '../use-agora-gamification'

export type {
  AgoraBadge,
  DailyChallenge,
  WeeklyChallenge,
  XpTransaction,
  GamificationUser,
  UseAgoraGamificationReturn,
} from '../use-agora-gamification'

// Sessions
export { AgoraSessionsProvider, useAgoraSessions } from '../use-agora-sessions'

export type {
  StudySession,
  DiaryEntry,
  DiaryEntryInput,
  UseAgoraSessionsReturn,
} from '../use-agora-sessions'

// Onboarding
export { AgoraOnboardingProvider, useAgoraOnboarding } from '../use-agora-onboarding'

export type {
  AgoraTrack,
  GitHubContribution,
  OnboardingData,
  OnboardingUser,
  UseAgoraOnboardingReturn,
} from '../use-agora-onboarding'
