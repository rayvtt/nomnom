import { create } from 'zustand';
import type { Profile, SetupConfig, DayLogs } from '@/lib/api';

type Lang = 'vi' | 'en';

type State = {
  userId: string | null;
  setUserId: (id: string | null) => void;

  lang: Lang;
  setLang: (lang: Lang) => void;

  profile: Profile | null;
  setProfile: (p: Profile | null) => void;

  setupConfig: SetupConfig | null;
  setSetupConfig: (c: SetupConfig | null) => void;

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

// Stable default object — defined outside selector so reference never changes
const EMPTY_TOTALS = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

export const selectTdee = (s: State) => s.profile?.tdee ?? 2000;
export const selectGoal = (s: State) => s.profile?.goal ?? 'maintain';
export const selectTodayTotals = (s: State) => s.todayLogs?.totals ?? EMPTY_TOTALS;
