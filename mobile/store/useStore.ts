import { create } from 'zustand';
import type { Profile, SetupConfig, DayLogs } from '@/lib/api';

type Lang = 'vi' | 'en';

type State = {
  // Auth
  userId: string | null;
  setUserId: (id: string | null) => void;

  // Language (mirrors landing page bilingual system)
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Profile
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;

  // Smart Order setup
  setupConfig: SetupConfig | null;
  setSetupConfig: (c: SetupConfig | null) => void;

  // Today's logs + totals (refreshed on app focus)
  todayLogs: DayLogs | null;
  setTodayLogs: (logs: DayLogs | null) => void;
};

export const useStore = create<State>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  lang: 'vi',
  setLang: (lang) => set({ lang }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  setupConfig: null,
  setSetupConfig: (setupConfig) => set({ setupConfig }),

  todayLogs: null,
  setTodayLogs: (todayLogs) => set({ todayLogs }),
}));

// Selectors
export const selectTdee = (s: State) => s.profile?.tdee ?? 2000;
export const selectGoal = (s: State) => s.profile?.goal ?? 'maintain';
export const selectTodayTotals = (s: State) =>
  s.todayLogs?.totals ?? { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
