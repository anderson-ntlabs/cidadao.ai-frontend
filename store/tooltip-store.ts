import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TooltipStore {
  seenTooltips: Set<string>;
  hasSeenTooltip: (id: string) => boolean;
  markTooltipSeen: (id: string) => void;
  resetTooltips: () => void;
  tooltipPreferences: {
    enabled: boolean;
    level: 'minimal' | 'standard' | 'detailed';
  };
  setTooltipPreferences: (prefs: Partial<TooltipStore['tooltipPreferences']>) => void;
}

export const useTooltipStore = create<TooltipStore>()(
  persist(
    (set, get) => ({
      seenTooltips: new Set(),
      
      hasSeenTooltip: (id: string) => {
        const { seenTooltips, tooltipPreferences } = get();
        if (!tooltipPreferences.enabled) return true; // Se desabilitado, age como se já viu
        return seenTooltips.has(id);
      },
      
      markTooltipSeen: (id: string) => {
        set((state) => ({
          seenTooltips: new Set([...state.seenTooltips, id])
        }));
      },
      
      resetTooltips: () => {
        set({ seenTooltips: new Set() });
      },
      
      tooltipPreferences: {
        enabled: true,
        level: 'standard'
      },
      
      setTooltipPreferences: (prefs) => {
        set((state) => ({
          tooltipPreferences: { ...state.tooltipPreferences, ...prefs }
        }));
      }
    }),
    {
      name: 'tooltip-storage',
      partialize: (state) => ({
        seenTooltips: Array.from(state.seenTooltips),
        tooltipPreferences: state.tooltipPreferences
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.seenTooltips)) {
          state.seenTooltips = new Set(state.seenTooltips);
        }
      }
    }
  )
);