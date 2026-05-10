import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function get<T>(path: string): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
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

export const profileApi = {
  get: () => get<Profile>('/profile'),
  update: (data: Partial<Omit<Profile, 'id'>>) => patch<Profile>('/profile', data),
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

export const setupApi = {
  get: () => get<SetupConfig>('/profile/setup'),
  update: (data: Partial<SetupConfig>) => put<SetupConfig>('/profile/setup', data),
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

export const logsApi = {
  getDay: (date?: string) => get<DayLogs>(`/profile/logs${date ? `?date=${date}` : ''}`),
  log: (entry: {
    mealSlot: LogEntry['meal_slot'];
    dishId?: number;
    dishName: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    source?: LogEntry['source'];
  }) => post<LogEntry>('/profile/logs', entry),
  remove: (id: string) => del(`/profile/logs/${id}`),
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
    return get<SearchResult>(`/nutrition/search?${qs}`);
  },
  getById: (id: number) => get<Dish>(`/nutrition/${id}`),
  match: (params: { kcal: number; protein: number; budgetVnd?: number; exclude?: number[] }) => {
    const qs = new URLSearchParams({
      kcal: String(params.kcal),
      protein: String(params.protein),
    });
    if (params.budgetVnd) qs.set('budgetVnd', String(params.budgetVnd));
    if (params.exclude?.length) qs.set('exclude', params.exclude.join(','));
    return get<Dish[]>(`/nutrition/match?${qs}`);
  },
};
