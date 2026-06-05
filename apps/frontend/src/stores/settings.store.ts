import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

export type AccentColor = 'chartreuse' | 'blue' | 'purple' | 'green' | 'orange' | 'pink';
export type FontSize = 'small' | 'default' | 'large';
export type Theme = 'dark' | 'light';
export type Language = 'vi' | 'en';

export interface SettingsState {
  theme: Theme;
  accentColor: AccentColor;
  fontSize: FontSize;
  language: Language;

  emailNotifications: boolean;
  streakReminder: boolean;
  reviewAlerts: boolean;
  achievementAlerts: boolean;

  dailyGoal: number;
  autoPlayPronunciation: boolean;
  showRomanization: boolean;
  cardsPerSession: number;

  publicProfile: boolean;
  showStreakLeaderboard: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (lang: Language) => void;
  updateSettings: (settings: Partial<Omit<SettingsState, 'setTheme' | 'setAccentColor' | 'setFontSize' | 'setLanguage' | 'updateSettings' | 'fetchSettings' | 'saveSettingsToServer'>>) => void;
  fetchSettings: () => Promise<void>;
  saveSettingsToServer: () => Promise<void>;
}

const ACCENT_PRESETS = {
  chartreuse: { color: '#E8FF57', dim: 'rgba(232, 255, 87, 0.12)', fg: '#0D0D0F', hover: '#D2EC3B' },
  blue: { color: '#3B82F6', dim: 'rgba(59, 130, 246, 0.12)', fg: '#FFFFFF', hover: '#2563EB' },
  purple: { color: '#A78BFA', dim: 'rgba(167, 139, 250, 0.12)', fg: '#0D0D0F', hover: '#8B5CF6' },
  green: { color: '#3ECF8E', dim: 'rgba(62, 207, 142, 0.12)', fg: '#0D0D0F', hover: '#059669' },
  orange: { color: '#F97316', dim: 'rgba(249, 115, 22, 0.12)', fg: '#FFFFFF', hover: '#EA580C' },
  pink: { color: '#EC4899', dim: 'rgba(236, 72, 153, 0.12)', fg: '#FFFFFF', hover: '#DB2777' },
};

export const applyAppearance = (theme: Theme, color: AccentColor, size: FontSize) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Apply Theme
  root.setAttribute('data-theme', theme);

  // 2. Apply Accent Color
  const preset = ACCENT_PRESETS[color] || ACCENT_PRESETS.chartreuse;
  root.style.setProperty('--accent', preset.color);
  root.style.setProperty('--accent-dim', preset.dim);
  root.style.setProperty('--accent-fg', preset.fg);
  root.style.setProperty('--accent-hover', preset.hover);

  // 3. Apply Font Size
  let fontSizePx = '14px';
  if (size === 'small') fontSizePx = '13px';
  if (size === 'large') fontSizePx = '15px';
  root.style.setProperty('--font-size-base', fontSizePx);
};

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedSync = (get: () => SettingsState) => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      await get().saveSettingsToServer();
    } catch (err) {
      console.error('Failed to sync settings with server:', err);
    }
  }, 1000);
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accentColor: 'chartreuse',
      fontSize: 'default',
      language: 'vi',

      emailNotifications: true,
      streakReminder: true,
      reviewAlerts: true,
      achievementAlerts: true,

      dailyGoal: 20,
      autoPlayPronunciation: false,
      showRomanization: true,
      cardsPerSession: 20,

      publicProfile: true,
      showStreakLeaderboard: true,

      setTheme: (theme) => {
        set({ theme });
        applyAppearance(theme, get().accentColor, get().fontSize);
        debouncedSync(get);
      },

      setAccentColor: (accentColor) => {
        set({ accentColor });
        applyAppearance(get().theme, accentColor, get().fontSize);
        debouncedSync(get);
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        applyAppearance(get().theme, get().accentColor, fontSize);
        debouncedSync(get);
      },

      setLanguage: (language) => {
        set({ language });
        debouncedSync(get);
      },

      updateSettings: (newSettings) => {
        set(newSettings as any);
        debouncedSync(get);
      },

      fetchSettings: async () => {
        try {
          const { data } = await api.get('/users/settings');
          if (data && Object.keys(data).length > 0) {
            set(data);
            applyAppearance(data.theme || 'dark', data.accentColor || 'chartreuse', data.fontSize || 'default');
          } else {
            // Apply current default local styles
            applyAppearance(get().theme, get().accentColor, get().fontSize);
          }
        } catch {
          // Fallback to local styles
          applyAppearance(get().theme, get().accentColor, get().fontSize);
        }
      },

      saveSettingsToServer: async () => {
        const state = get();
        const settingsPayload = {
          theme: state.theme,
          accentColor: state.accentColor,
          fontSize: state.fontSize,
          language: state.language,
          emailNotifications: state.emailNotifications,
          streakReminder: state.streakReminder,
          reviewAlerts: state.reviewAlerts,
          achievementAlerts: state.achievementAlerts,
          dailyGoal: state.dailyGoal,
          autoPlayPronunciation: state.autoPlayPronunciation,
          showRomanization: state.showRomanization,
          cardsPerSession: state.cardsPerSession,
          publicProfile: state.publicProfile,
          showStreakLeaderboard: state.showStreakLeaderboard,
        };
        await api.put('/users/settings', settingsPayload);
      },
    }),
    {
      name: 'elp-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyAppearance(state.theme, state.accentColor, state.fontSize);
        }
      },
    },
  ),
);
