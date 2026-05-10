# NomNom — Nutrition OS for Vietnamese Cuisine

## What This Is

NomNom is a nutrition tracking platform built for Vietnamese food first. The core insight: nobody has properly built a Vietnamese cuisine nutrition database — that's the moat. The product tracks what you eat vs what your body needs, then acts on it through auto-ordering, recommendations, and gamification.

**Stage:** Pre-seed, building. Landing page live + real mobile app + backend API in progress.

**Tagline:** Chuyên gia dinh dưỡng cho tất cả. (Nutrition expert for everyone.)

## File Structure

```
nomnom/
├── CLAUDE.md            ← You are here
├── index.html           ← Landing page (single-file HTML, hosted on GitHub Pages)
├── railway.json         ← Railway deployment config (points to api/Dockerfile)
├── .env.example         ← Root env var template
├── .gitignore
│
├── api/                 ← Backend: Fastify + Supabase (deployed on Railway)
│   ├── src/
│   │   ├── server.js            ← Fastify server entry point
│   │   ├── plugins/supabase.js  ← Supabase client (service role)
│   │   └── routes/
│   │       ├── auth.js          ← POST /auth/login, /auth/signup, /auth/refresh
│   │       ├── profile.js       ← GET/PUT /profile, meal logs, TDEE
│   │       └── nutrition.js     ← GET /nutrition/search, /nutrition/match
│   ├── migrations/
│   │   ├── 001_schema.sql       ← 6 tables: profiles, setup_config, nutrition_db, daily_logs, smart_order_queue, order_history
│   │   └── 002_seed_nutrition.sql ← 58 Vietnamese dishes seeded
│   ├── Dockerfile
│   ├── package.json             ← Fastify 4, @supabase/supabase-js, zod, @fastify/jwt
│   └── .env.example
│
└── mobile/              ← React Native app: Expo SDK 54 (dev via Expo Go)
    ├── app/
    │   ├── _layout.tsx          ← Root: auth listener, splash screen
    │   ├── (auth)/
    │   │   ├── login.tsx        ← Email/password login
    │   │   └── signup.tsx       ← Signup + goal selection
    │   └── (tabs)/
    │       ├── index.tsx        ← Home: today's calories + macro progress
    │       ├── order.tsx        ← Smart Order setup (meal times, budget, radius)
    │       ├── explore.tsx      ← Nutrition DB search by category + text
    │       └── profile.tsx      ← Body data, activity, language, TDEE preview
    ├── lib/
    │   ├── api.ts               ← Type-safe API client (profile, logs, nutrition)
    │   └── supabase.ts          ← Supabase client with SecureStore persistence
    ├── store/useStore.ts        ← Zustand: userId, lang, profile, setupConfig, todayLogs
    ├── constants/               ← Theme colors, shared constants
    ├── app.json                 ← Expo config (bundle IDs, permissions)
    ├── package.json             ← Expo 54, React Native 0.79, Zustand, expo-router
    └── .env.example
```

## Cloud Architecture

```
GitHub (rayvtt/nomnom) — single source of truth
  ├── main ──→ GitHub Pages    landing page (rayvtt.github.io/nomnom/)
  └── main ──→ Railway         backend API  (api/Dockerfile)
                                    └──→ Supabase  (DB + auth + RLS)

Expo Go (phone/simulator)
  └── npx expo start    ← reads mobile/
  └── API calls ──→ Railway URL (set EXPO_PUBLIC_API_URL in mobile/.env)
```

## Local Dev Setup

**Backend (api/):**
```bash
cd api
cp .env.example .env    # fill in Supabase + JWT secret
npm install
npm run dev             # Fastify on port 3000 with --watch
```

**Mobile (mobile/):**
```bash
cd mobile
cp .env.example .env    # set EXPO_PUBLIC_API_URL and Supabase keys
npm install
npx expo start          # scan QR with Expo Go app
```

**Railway env vars** (set in Railway dashboard → Variables):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `PORT` (Railway sets this automatically)

## Tech Stack

**Landing Page (`index.html`):**
- Single-file HTML + inline CSS + vanilla JS — no build tools
- Google Fonts: `Instrument Serif` (numbers/display) + `Outfit` (UI)
- Leaflet.js 1.9.4 + CartoCDN tiles (dark/light)
- Bilingual VN/EN via `data-vi`/`data-en` attributes + `setLang()`

**Backend (`api/`):**
- Node.js 22 + Fastify 4 (ESM)
- JWT auth via `@fastify/jwt` (uses Supabase JWT secret)
- Supabase JS client (service role for server-side ops)
- Zod for request validation
- Public routes: `/health`, `/auth/*`, `/nutrition/*`
- Protected routes: `/profile/*` (JWT required)
- Deployed via Dockerfile on Railway

**Mobile (`mobile/`):**
- Expo SDK 54, React Native 0.79, React 19
- expo-router (file-based routing, tab + auth layout)
- Zustand for global state
- Supabase JS client with `expo-secure-store` persistence
- TypeScript throughout

## Database Schema (Supabase)

Run `api/migrations/001_schema.sql` in Supabase SQL editor, then `002_seed_nutrition.sql`.

| Table | Purpose |
|---|---|
| `profiles` | User body data, language pref, TDEE — auto-created on signup via trigger |
| `setup_config` | Smart Order preferences: meal times, budget, delivery radius, goal |
| `nutrition_db` | 58 Vietnamese dishes with macros, health scores, carb quality |
| `daily_logs` | Meal log entries per user per day |
| `smart_order_queue` | Pending AI meal recommendations |
| `order_history` | Past delivery/takeout orders |

All user tables have Supabase RLS enabled — users can only read/write their own rows.

## API Routes

```
GET  /health                     → { status: 'ok' }

POST /auth/login                 → { access_token, refresh_token }
POST /auth/signup                → { access_token, refresh_token }
POST /auth/refresh               → { access_token }

GET  /profile                    → user profile + TDEE
PUT  /profile                    → update body data / language / goal
GET  /profile/setup              → smart order config
PUT  /profile/setup              → update smart order config
GET  /profile/logs?date=         → meal logs for a date
POST /profile/logs               → add meal log entry

GET  /nutrition/search?q=&category=  → search nutrition DB (public)
GET  /nutrition/:slug            → single dish detail (public)
POST /nutrition/match            → smart match: given kcal/protein targets + budget → ranked dishes
```

## Mobile Screens

| Screen | Route | Description |
|---|---|---|
| Login | `/(auth)/login` | Email + password |
| Signup | `/(auth)/signup` | Email + password + goal (lose/maintain/gain) |
| Home | `/(tabs)/` | Today's kcal ring, protein/carbs/fat bars, meal list |
| Smart Order | `/(tabs)/order` | Meal times, meals/day, budget, delivery radius, activate toggle |
| Explore | `/(tabs)/explore` | Category pills + search → dish cards with macros |
| Profile | `/(tabs)/profile` | Height, weight, age, activity level, language, TDEE preview |

## Design System

### Colors
```
--accent:   #FF6A28  (orange)  — protein, primary CTAs, brand
--accent-2: #FF9F1C  (amber)   — good carbs, secondary
--green:    #34D399             — fat, healthy scores, positive
--red:      #EF4444             — bad carbs, warnings
--purple:   #A78BFA             — AI / vendor features
--blue:     #60A5FA             — informational
```
Dark theme by default (bg `#050505`). Light mode via `body.light-mode` class.

### Typography
- Display/numbers: `Instrument Serif`
- Body/UI: `Outfit`

### Principles
- Slick and fun, not clinical — complex data behind secondary interactions
- Interactive demos over description cards
- Bilingual-first: every string needs `vi` + `en` variants
- CSS variables everywhere — never hardcode colors

## Bilingual System (Landing Page)

1. Inline: `data-vi` / `data-en` attributes → swapped by `setLang()`
2. Section titles: `sectionTitles` JS object with innerHTML
3. Select options: `<option data-vi data-en>`
4. Dynamic content (recipes, vendor menus): rebuilt on language change
5. Global state: `currentLang` = `'vi'` | `'en'`

## Delivery Platform API Status

**GrabFood** — Official Partner API (OAuth2, apply at developer.grab.com). Has menu sync + order management. No nutritional data — we match to our own DB.

**ShopeeFood** — No public API. Requires partnership or scraping.

**Strategy:** MVP = deep links → Beta = GrabFood Partner API → Scale = auto-ordering.

## What to Build Next

### Done ✅
- [x] Supabase project set up (migrations + 58-dish seed run)
- [x] Railway deployment live (Dockerfile build, all env vars set)
- [x] Cloud sync working: GitHub ⇄ Railway auto-deploy on every push
- [x] Repo consolidated onto `claude/setup-cloud-sync-6TBjC` (api/, mobile/, landing page all in one branch)

### In Progress
- [ ] Verify `/health` and `/nutrition/search` respond from Railway URL
- [ ] Test auth flow end-to-end (signup → login → profile)
- [ ] Wire Home tab to real API (`/profile/logs`)
- [ ] Push `mobile/` from local laptop → connect Expo Go to Railway URL

### Next
- [ ] Smart Order activation (auto-queue based on setup config)
- [ ] `/nutrition/match` integration in Smart Order tab
- [ ] Voice logging (speech-to-text → dish match)
- [ ] Group challenges (real multiplayer)
- [ ] Expand nutrition DB: 58 → 500+ dishes

### Long-term
- [ ] GrabFood Partner API integration
- [ ] B2B restaurant nutrition labeling SaaS
- [ ] ML-powered dish estimation for unknown menu items

## Deployment Notes (lessons from setup)

A few gotchas hit during initial Railway deploy — recorded here so they don't bite again:

1. **Use Dockerfile, not Railpack.** Railway's auto-detect (Railpack) failed with `secret NODE not found`. Solution: `api/railway.json` explicitly specifies `"builder": "DOCKERFILE"`.
2. **`dotenv` must be in `dependencies`, not `devDependencies`.** Production build runs `npm ci --omit=dev`, so dev-only packages aren't installed. Anything `import`ed at runtime must be a real dependency.
3. **No angle brackets in env values.** When copying from `.env.example`, strip the `< >` placeholder markers — paste the raw URL/key only.
4. **Don't manually set `PORT`.** Railway assigns it automatically; manually setting it can cause the proxy to look at the wrong internal port.
5. **Railway "Root Directory" matters.** Set to `api` so Railway looks inside `api/` for the Dockerfile and `railway.json` (root-level configs are ignored when a Root Directory is set).
