import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Use || (not ??) so empty-string env var still falls back to Railway
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://nomnom-production.up.railway.app';

async function sessionToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await sessionToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ── Guest mode (no session) ────────────────────────────────────
// Profile / setup / logs live in AsyncStorage so the whole app works
// without an account. Signing in later switches back to the backend.
const GUEST_KEY = {
  profile: 'nomnom.guest.profile',
  setup:   'nomnom.guest.setup',
  logs:    'nomnom.guest.logs',
};

async function readLocal<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeLocal(key: string, value: unknown): Promise<void> {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function get<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function getPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function del(path: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error(await res.text());
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Profile ────────────────────────────────────────────────────
export type Profile = {
  id: string;
  display_name: string | null;
  lang: 'vi' | 'en';
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'maintain' | 'lose' | 'gain';
  tdee: number | null;
};

const GUEST_PROFILE: Profile = {
  id: 'guest', display_name: null, lang: 'vi',
  weight_kg: null, height_cm: null, age: null,
  activity_level: 'moderate', goal: 'maintain', tdee: null,
};

const ACTIVITY_MULT: Record<Profile['activity_level'], number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

function guestTdee(p: Profile): number | null {
  if (!p.weight_kg || !p.height_cm || !p.age) return null;
  const bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + 5;
  return Math.round(bmr * ACTIVITY_MULT[p.activity_level]);
}

// Profile screen sends camelCase (backend schema); normalize both shapes
function normalizeProfilePatch(data: Record<string, unknown>): Partial<Profile> {
  const out: Partial<Profile> = {};
  const map: Record<string, keyof Profile> = {
    weightKg: 'weight_kg', heightCm: 'height_cm', activityLevel: 'activity_level', displayName: 'display_name',
    weight_kg: 'weight_kg', height_cm: 'height_cm', activity_level: 'activity_level', display_name: 'display_name',
    age: 'age', goal: 'goal', lang: 'lang',
  };
  for (const [k, v] of Object.entries(data)) {
    const key = map[k];
    if (key && v !== undefined) (out as any)[key] = v;
  }
  return out;
}

export const profileApi = {
  get: async () => {
    if (!(await sessionToken())) {
      return { ...GUEST_PROFILE, ...(await readLocal<Partial<Profile>>(GUEST_KEY.profile)) };
    }
    return get<Profile>('/profile');
  },
  update: async (data: Partial<Omit<Profile, 'id'>>) => {
    if (!(await sessionToken())) {
      const current = { ...GUEST_PROFILE, ...(await readLocal<Partial<Profile>>(GUEST_KEY.profile)) };
      const next: Profile = { ...current, ...normalizeProfilePatch(data as Record<string, unknown>) };
      next.tdee = guestTdee(next);
      await writeLocal(GUEST_KEY.profile, next);
      return next;
    }
    return patch<Profile>('/profile', data);
  },
};

// ── Setup Config ───────────────────────────────────────────────
export type MealTime = { slot: string; time: string; icon: string };
export type SetupConfig = {
  meal_times: MealTime[];
  meals_per_day: number;
  budget_vnd: number;
  delivery_max_min: number;
  goal: 'maintain' | 'lose' | 'gain';
  notify_phone: boolean;
  notify_desktop: boolean;
  active: boolean;
};

const GUEST_SETUP: SetupConfig = {
  meal_times: [
    { slot: 'breakfast', time: '07:30', icon: '🌅' },
    { slot: 'lunch',     time: '12:30', icon: '☀️' },
    { slot: 'dinner',    time: '19:00', icon: '🌙' },
  ],
  meals_per_day: 3,
  budget_vnd: 85000,
  delivery_max_min: 25,
  goal: 'maintain',
  notify_phone: false,
  notify_desktop: false,
  active: false,
};

export const setupApi = {
  get: async () => {
    if (!(await sessionToken())) {
      return { ...GUEST_SETUP, ...(await readLocal<Partial<SetupConfig>>(GUEST_KEY.setup)) };
    }
    return get<SetupConfig>('/profile/setup');
  },

  // Backend expects camelCase; transform from snake_case SetupConfig before sending
  update: async (data: Partial<SetupConfig>) => {
    if (!(await sessionToken())) {
      const next = { ...GUEST_SETUP, ...(await readLocal<Partial<SetupConfig>>(GUEST_KEY.setup)), ...data };
      await writeLocal(GUEST_KEY.setup, next);
      return next;
    }
    return put<SetupConfig>('/profile/setup', {
    ...(data.meal_times      !== undefined && { mealTimes:      data.meal_times }),
    ...(data.meals_per_day   !== undefined && { mealsPerDay:    data.meals_per_day }),
    ...(data.budget_vnd      !== undefined && { budgetVnd:      data.budget_vnd }),
    ...(data.delivery_max_min !== undefined && { deliveryMaxMin: data.delivery_max_min }),
    ...(data.goal            !== undefined && { goal:           data.goal }),
    ...(data.notify_phone    !== undefined && { notifyPhone:    data.notify_phone }),
    ...(data.notify_desktop  !== undefined && { notifyDesktop:  data.notify_desktop }),
    ...(data.active          !== undefined && { active:         data.active }),
  });
  },
};

// ── Daily Logs ─────────────────────────────────────────────────
export type LogEntry = {
  id: string;
  meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dish_name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: 'manual' | 'smart_order' | 'voice';
  logged_at: string;
};

export type DayLogs = {
  date: string;
  meals: LogEntry[];
  totals: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
};

function guestDay(all: LogEntry[], date: string): DayLogs {
  const meals = all.filter((m) => m.logged_at.slice(0, 10) === date);
  const totals = meals.reduce(
    (t, m) => ({
      kcal: t.kcal + m.kcal, protein_g: t.protein_g + m.protein_g,
      carbs_g: t.carbs_g + m.carbs_g, fat_g: t.fat_g + m.fat_g,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
  return { date, meals, totals };
}

export const logsApi = {
  getDay: async (date?: string) => {
    if (!(await sessionToken())) {
      const all = (await readLocal<LogEntry[]>(GUEST_KEY.logs)) ?? [];
      return guestDay(all, date ?? todayISO());
    }
    return get<DayLogs>(`/profile/logs${date ? `?date=${date}` : ''}`);
  },

  log: async (entry: {
    mealSlot: LogEntry['meal_slot'];
    dishId?: number;
    dishName: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    source?: LogEntry['source'];
  }) => {
    if (!(await sessionToken())) {
      const all = (await readLocal<LogEntry[]>(GUEST_KEY.logs)) ?? [];
      const row: LogEntry = {
        id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        meal_slot: entry.mealSlot,
        dish_name: entry.dishName,
        kcal: entry.kcal,
        protein_g: entry.proteinG,
        carbs_g: entry.carbsG,
        fat_g: entry.fatG,
        source: entry.source ?? 'manual',
        logged_at: new Date().toISOString(),
      };
      await writeLocal(GUEST_KEY.logs, [...all, row]);
      return row;
    }
    return post<LogEntry>('/profile/logs', entry);
  },

  remove: async (id: string) => {
    if (!(await sessionToken())) {
      const all = (await readLocal<LogEntry[]>(GUEST_KEY.logs)) ?? [];
      await writeLocal(GUEST_KEY.logs, all.filter((m) => m.id !== id));
      return;
    }
    return del(`/profile/logs/${id}`);
  },
};

// ── Nutrition DB ───────────────────────────────────────────────
export type Dish = {
  id: number;
  slug: string;
  emoji: string;
  name_vi: string;
  name_en: string;
  category: string;
  region_vi: string;
  region_en: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  good_carbs_g: number;
  bad_carbs_g: number;
  health_score: number;
  warn_vi: string;
  warn_en: string;
  warn_type: 'good' | 'sugar' | 'sodium' | 'neutral';
  avg_price_vnd: number;
  ingredients_vi: string[];
  ingredients_en: string[];
};

export type SearchResult = { total: number; limit: number; offset: number; dishes: Dish[] };

export const nutritionApi = {
  search: (params: {
    q?: string;
    cat?: string;
    limit?: number;
    offset?: number;
    minScore?: number;
    maxKcal?: number;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
    // Nutrition search is public — no auth required
    return getPublic<SearchResult>(`/nutrition/search?${qs}`);
  },

  getById: (id: number) => getPublic<Dish>(`/nutrition/${id}`),

  match: (params: { kcal: number; protein: number; budgetVnd?: number; exclude?: number[] }) => {
    const qs = new URLSearchParams({
      kcal: String(params.kcal),
      protein: String(params.protein),
    });
    if (params.budgetVnd) qs.set('budgetVnd', String(params.budgetVnd));
    if (params.exclude?.length) qs.set('exclude', params.exclude.join(','));
    // match is also public
    return getPublic<Dish[]>(`/nutrition/match?${qs}`);
  },
};
