import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  compactMode: boolean

  // Notifications
  notifications: {
    investigations: boolean
    anomalies: boolean
    reports: boolean
    system: boolean
    sound: boolean
    desktop: boolean
    email: boolean
    frequency: 'immediate' | 'hourly' | 'daily'
  }

  // Privacy
  privacy: {
    publicProfile: boolean
    activityHistory: boolean
    analyticsOptOut: boolean
    shareUsageData: boolean
  }

  // Performance
  performance: {
    enableAnimations: boolean
    enableSounds: boolean
    autoSave: boolean
    cacheSize: 'small' | 'medium' | 'large'
  }

  // Advanced
  advanced: {
    betaFeatures: boolean
    developerMode: boolean
    debugMode: boolean
    experimentalUI: boolean
  }
}

interface SettingsStore {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: UserSettings = {
  theme: 'system',
  fontSize: 'medium',
  reducedMotion: false,
  compactMode: false,
  notifications: {
    investigations: true,
    anomalies: true,
    reports: true,
    system: true,
    sound: true,
    desktop: true,
    email: false,
    frequency: 'immediate'
  },
  privacy: {
    publicProfile: false,
    activityHistory: true,
    analyticsOptOut: false,
    shareUsageData: true
  },
  performance: {
    enableAnimations: true,
    enableSounds: true,
    autoSave: true,
    cacheSize: 'medium'
  },
  advanced: {
    betaFeatures: false,
    developerMode: false,
    debugMode: false,
    experimentalUI: false
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
            notifications: {
              ...state.settings.notifications,
              ...(updates.notifications || {})
            },
            privacy: {
              ...state.settings.privacy,
              ...(updates.privacy || {})
            },
            performance: {
              ...state.settings.performance,
              ...(updates.performance || {})
            },
            advanced: {
              ...state.settings.advanced,
              ...(updates.advanced || {})
            }
          }
        }))
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2)
      },

      importSettings: (settingsJson: string) => {
        try {
          const parsed = JSON.parse(settingsJson)
          // Validate the structure
          if (parsed && typeof parsed === 'object') {
            set({ settings: { ...defaultSettings, ...parsed } })
            return true
          }
          return false
        } catch {
          return false
        }
      }
    }),
    {
      name: 'cidadao-ai-settings',
      version: 1
    }
  )
)