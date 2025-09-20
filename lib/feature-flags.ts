/**
 * Feature Flags for Cidadão.AI
 * Sprint 1 - Épico 1.3
 */

export interface FeatureFlags {
  // Chat features
  chatV3Enabled: boolean;
  chatWebSocketEnabled: boolean;
  chatSSEEnabled: boolean;
  chatRetryEnabled: boolean;
  chatDemoMode: boolean;
  
  // Other features
  exportPDFEnabled: boolean;
  advancedFiltersEnabled: boolean;
  multiAgentViewEnabled: boolean;
}

// Default feature flags
const defaultFlags: FeatureFlags = {
  // Chat features - Sprint 1
  chatV3Enabled: true,           // Use new v3 adapter with demo support
  chatWebSocketEnabled: false,   // WebSocket disabled until Sprint 3
  chatSSEEnabled: false,         // SSE disabled until Sprint 4
  chatRetryEnabled: true,        // Enable retry logic
  chatDemoMode: false,           // DESATIVADO TEMPORARIAMENTE para debug
  
  // Other features
  exportPDFEnabled: false,
  advancedFiltersEnabled: true,
  multiAgentViewEnabled: true,
};

// Feature flags from environment
const envFlags: Partial<FeatureFlags> = {
  chatV3Enabled: process.env.NEXT_PUBLIC_FEATURE_CHAT_V3 === 'true',
  chatWebSocketEnabled: process.env.NEXT_PUBLIC_FEATURE_CHAT_WS === 'true',
  chatSSEEnabled: process.env.NEXT_PUBLIC_FEATURE_CHAT_SSE === 'true',
  chatRetryEnabled: process.env.NEXT_PUBLIC_FEATURE_CHAT_RETRY !== 'false',
  chatDemoMode: process.env.NEXT_PUBLIC_FEATURE_CHAT_DEMO !== 'false',
};

// Merge defaults with env overrides
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...Object.fromEntries(
    Object.entries(envFlags).filter(([_, value]) => value !== undefined)
  ),
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

// Helper to get all enabled features
export function getEnabledFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([flag, _]) => flag);
}

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🚩 Feature Flags:', featureFlags);
  console.log('✅ Enabled features:', getEnabledFeatures());
}